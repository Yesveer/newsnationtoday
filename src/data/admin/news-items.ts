import { articles } from "@/data/articles";
import { categories } from "@/data/categories";
import { adminUsers } from "@/data/admin/users";
import type { NewsItem, NewsStatus, NewsType, ReviewComment, StatusEvent } from "@/types/admin";

/** The workflow board is seeded from the same stories the public site renders,
 *  so "yeh website isi portal se manage hoti hai" holds even before the API. */
const reporters = adminUsers.filter((user) => user.role === "reporter");
const editors = adminUsers.filter((user) => user.role !== "reporter");

/** Deterministic pseudo-random so server and client always agree. */
function hash(seed: string): number {
  let value = 0;
  for (let index = 0; index < seed.length; index += 1) {
    value = (value * 31 + seed.charCodeAt(index)) % 100000;
  }
  return value;
}

const workflowByIndex: NewsStatus[] = [
  "published",
  "published",
  "in_review",
  "draft",
  "published",
  "scheduled",
  "changes_requested",
  "published",
  "in_review",
  "published",
  "rejected",
  "draft",
];

const reviewNotes: string[] = [
  "हेडलाइन थोड़ी लंबी है, 70 कैरेक्टर के अंदर लाइए। बाकी कॉपी ठीक है।",
  "सोर्स का नाम दूसरे पैराग्राफ में जोड़ दीजिए, वरना पब्लिश नहीं कर पाएंगे।",
  "फोटो क्रेडिट मिसिंग है और कवर इमेज का रेज़ोल्यूशन कम है।",
  "आंकड़े सरकारी रिलीज़ से क्रॉस-चेक कर लीजिए, फिर रिव्यू में वापस भेजें।",
  "अच्छी रिपोर्ट है — सिर्फ SEO डिस्क्रिप्शन भर दीजिए, फिर पब्लिश कर देंगे।",
];

function buildComments(id: string, status: NewsStatus, authorName: string): ReviewComment[] {
  if (status === "draft" || status === "published") return [];
  const editor = editors[hash(id) % editors.length];
  const note = reviewNotes[hash(id) % reviewNotes.length];
  const comments: ReviewComment[] = [
    {
      id: `${id}_cmt_1`,
      authorId: editor.id,
      authorName: editor.name,
      authorRole: editor.role,
      body: note,
      createdAt: "2026-09-24T11:20:00.000Z",
    },
  ];
  if (status === "changes_requested" || status === "rejected") {
    comments.push({
      id: `${id}_cmt_2`,
      authorId: "usr_reporter",
      authorName,
      authorRole: "reporter",
      body: "ठीक है, आज शाम तक अपडेट कर के दोबारा भेजता हूँ।",
      createdAt: "2026-09-24T13:05:00.000Z",
    });
  }
  return comments;
}

function buildHistory(id: string, status: NewsStatus, authorName: string): StatusEvent[] {
  const editor = editors[hash(id) % editors.length];
  const history: StatusEvent[] = [
    { id: `${id}_h1`, status: "draft", byName: authorName, byRole: "reporter", at: "2026-09-23T08:15:00.000Z" },
  ];
  if (status !== "draft") {
    history.push({
      id: `${id}_h2`,
      status: "in_review",
      byName: authorName,
      byRole: "reporter",
      at: "2026-09-23T17:40:00.000Z",
      note: "रिव्यू के लिए भेजा गया",
    });
  }
  if (["changes_requested", "rejected", "scheduled", "published"].includes(status)) {
    history.push({
      id: `${id}_h3`,
      status,
      byName: editor.name,
      byRole: editor.role,
      at: "2026-09-24T09:05:00.000Z",
      note:
        status === "published"
          ? "पब्लिश किया गया"
          : status === "scheduled"
            ? "शेड्यूल किया गया"
            : status === "rejected"
              ? "रिजेक्ट — खबर पहले से कवर हो चुकी है"
              : "बदलाव मांगे गए",
    });
  }
  return history;
}

export const newsItems: NewsItem[] = articles.map((article, index) => {
  const category = categories.find((item) => item.id === article.categoryId);
  const reporter = reporters[index % reporters.length];
  const status: NewsStatus = article.isFeatured
    ? "published"
    : workflowByIndex[index % workflowByIndex.length];
  const type: NewsType = article.isVideo ? "video" : index % 9 === 4 ? "photo" : "article";

  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt,
    body: article.bodyHtml.replace(/<[^>]+>/g, "").trim(),
    coverImageUrl: article.coverImageUrl,
    categorySlug: category?.slug ?? "desh",
    topic: article.topic,
    type,
    status,
    authorId: reporter.id,
    authorName: reporter.name,
    tags: article.tags,
    isBreaking: article.isBreaking,
    isFeatured: article.isFeatured,
    scheduledFor: status === "scheduled" ? "2026-09-26T07:30:00.000Z" : undefined,
    publishedAt: status === "published" ? article.publishedAt : undefined,
    createdAt: article.createdAt,
    updatedAt: article.updatedAt,
    views: 1200 + (hash(article.id) % 48000),
    deleteRequested: index % 17 === 3,
    comments: buildComments(article.id, status, reporter.name),
    history: buildHistory(article.id, status, reporter.name),
    seo: {
      metaTitle: article.seo?.metaTitle,
      metaDescription: article.seo?.metaDescription,
      keywords: article.tags.join(", "),
    },
  };
});

export const newsStatusLabels: Record<NewsStatus, { label: string; labelEn: string; tone: string }> = {
  draft: { label: "ड्राफ़्ट", labelEn: "Draft", tone: "#64748B" },
  in_review: { label: "रिव्यू में", labelEn: "In review", tone: "#F59E0B" },
  changes_requested: { label: "बदलाव मांगे", labelEn: "Changes asked", tone: "#EC4899" },
  scheduled: { label: "शेड्यूल्ड", labelEn: "Scheduled", tone: "#6366F1" },
  published: { label: "पब्लिश्ड", labelEn: "Published", tone: "#16A34A" },
  rejected: { label: "रिजेक्टेड", labelEn: "Rejected", tone: "#E11D2E" },
  archived: { label: "आर्काइव्ड", labelEn: "Archived", tone: "#94A3B8" },
};
