"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SafeImage as Image } from "@/components/ui/safe-image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  IconArrowUpRight,
  IconBolt,
  IconCalendarClock,
  IconChevronDown,
  IconDeviceFloppy,
  IconPhotoUp,
  IconSend,
  IconShare3,
  IconSparkles,
  IconStar,
  IconUserCheck,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { ReviewPanel } from "@/components/admin/news/review-panel";
import { MediaPickerDialog } from "@/components/admin/media/media-picker-dialog";
import { RichTextEditor } from "@/components/admin/news/rich-text-editor";
import { SocialLinksField } from "@/components/admin/news/social-links-field";
import { ReviewerPicker } from "@/components/admin/news/reviewer-picker";
import { useAdminSession } from "@/components/admin/admin-session";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { formatDateTime } from "@/lib/admin/format";
import { toStoryHtml } from "@/lib/story-html";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import { categoriesConfig } from "@/config/categories.config";
import type { NewsItem, SocialLink } from "@/types/admin";
import { cn } from "@/lib/cn";

function plainTextLength(html: string): number {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim().length;
}

const makeEditorSchema = (t: (hi: string, en: string) => string) =>
  z.object({
    title: z
      .string()
      .min(
        8,
        t(
          "हेडलाइन कम से कम 8 अक्षर की होनी चाहिए",
          "The headline needs at least 8 characters",
        ),
      ),
    slug: z
      .string()
      .min(3, t("स्लग बहुत छोटा है", "That slug is too short"))
      .regex(
        /^[a-z0-9-]+$/,
        t(
          "सिर्फ़ छोटे अक्षर, अंक और डैश चलेंगे",
          "Only lowercase letters, digits and dashes",
        ),
      ),
    excerpt: z
      .string()
      .min(
        20,
        t(
          "सार कम से कम 20 अक्षर का हो",
          "The summary needs at least 20 characters",
        ),
      )
      .max(
        300,
        t(
          "सार 300 अक्षर से ज़्यादा न हो",
          "Keep the summary under 300 characters",
        ),
      ),
    // The body is HTML now, so measure the text a reader would see — markup
    // must not be what gets a story past the minimum.
    body: z.string().refine((html) => plainTextLength(html) >= 50, {
      message: t(
        "खबर का मुख्य हिस्सा कम से कम 50 अक्षर का हो",
        "The story body needs at least 50 characters",
      ),
    }),
    coverImageUrl: z
      .string()
      .min(5, t("कवर इमेज ज़रूरी है", "A cover image is required")),
    categorySlug: z.string().min(1, t("कैटेगरी चुनें", "Pick a category")),
    topic: z.string().optional(),
    type: z.enum(["article", "video", "photo"]),
    tags: z.string().optional(),
    isBreaking: z.boolean(),
    isFeatured: z.boolean(),
    scheduledFor: z.string().optional(),
    reviewerIds: z.array(z.string()),
    socialLinks: z.array(
      z.object({
        platform: z.string(),
        url: z.string(),
        label: z.string().optional(),
      }),
    ),
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    keywords: z.string().optional(),
  });

type EditorValues = z.infer<ReturnType<typeof makeEditorSchema>>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function ArticleEditor({
  item,
  onSaved,
}: {
  item?: NewsItem;
  /** Lets the page refresh its copy after a save or a workflow change. */
  onSaved?: (item: NewsItem) => void;
}) {
  const { role, user, can } = useAdminSession();
  const { t, language } = useAdminLang();
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const isNew = !item;
  const isOwn = item ? item.authorId === user.id : true;
  const canEdit = isNew || can("news.edit.any") || isOwn;
  const canPublish = can("news.publish");

  const form = useForm<EditorValues>({
    resolver: zodResolver(makeEditorSchema(t)),
    defaultValues: {
      title: item?.title ?? "",
      slug: item?.slug ?? "",
      excerpt: item?.excerpt ?? "",
      body: toStoryHtml(item?.body ?? ""),
      coverImageUrl: item?.coverImageUrl ?? "",
      categorySlug: item?.categorySlug ?? "desh",
      topic: item?.topic ?? "",
      type: item?.type ?? "article",
      tags: item?.tags.join(", ") ?? "",
      isBreaking: item?.isBreaking ?? false,
      isFeatured: item?.isFeatured ?? false,
      scheduledFor: item?.scheduledFor?.slice(0, 16) ?? "",
      reviewerIds: item?.reviewers?.map((person) => person.id) ?? [],
      socialLinks: item?.socialLinks ?? [],
      metaTitle: item?.seo.metaTitle ?? "",
      metaDescription: item?.seo.metaDescription ?? "",
      keywords: item?.seo.keywords ?? "",
    },
  });

  const categorySlug = form.watch("categorySlug");
  const coverImageUrl = form.watch("coverImageUrl");
  const title = form.watch("title");
  // Topics are per category and live in the database, so the list refreshes
  // whenever the category changes.
  const [topicOptions, setTopicOptions] = useState<api.AdminTopic[]>([]);
  // Who can review. Any of them may act on the story; picking one says who is
  // expected to, and that person is the one the email is addressed to.
  const [reviewers, setReviewers] = useState<api.Reviewer[]>([]);
  useEffect(() => {
    let active = true;
    void (async () => {
      const listed = await api.listTopics(categorySlug).catch(() => ({ topics: [], counts: {} }));
      if (active) setTopicOptions(listed.topics.filter((topic) => topic.visible));
    })();
    return () => {
      active = false;
    };
  }, [categorySlug]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const list = await api.listReviewers().catch(() => []);
      if (active) setReviewers(list);
    })();
    return () => {
      active = false;
    };
  }, []);

  /** Saves the form, then optionally moves the story along the workflow.
   *
   *  A new story is created first and then published, so "Publish" is one
   *  click even for something that does not exist yet. */
  const submit = (message: string, nextStatus?: api.NewsStatus) =>
    form.handleSubmit(
      async (values) => {
        setSaving(true);
        try {
          const payload: api.NewsInput = {
            title: values.title,
            slug: values.slug,
            excerpt: values.excerpt,
            body: values.body,
            coverImageUrl: values.coverImageUrl,
            categorySlug: values.categorySlug,
            topic: values.topic === "none" ? "" : (values.topic ?? ""),
            type: values.type,
            tags: (values.tags ?? "")
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
            isBreaking: values.isBreaking,
            isFeatured: values.isFeatured,
            scheduledFor: values.scheduledFor || undefined,
            reviewerIds: values.reviewerIds ?? [],
            socialLinks: (values.socialLinks ?? []).filter((link) => link.url.trim() !== ""),
            seo: {
              metaTitle: values.metaTitle,
              metaDescription: values.metaDescription,
              keywords: values.keywords,
            },
          };

          let saved = item ? await api.updateNews(item.id, payload) : await api.createNews(payload);
          if (nextStatus && nextStatus !== saved.status) {
            saved = await api.changeNewsStatus(saved.id, nextStatus);
          }

          toast.success(message);
          onSaved?.(saved);
          if (!item) {
            router.replace(`/admin/news/${saved.id}`);
          }
        } catch (error) {
          if (error instanceof ApiError) {
            // Field errors from the API land on the matching inputs.
            for (const [field, text] of Object.entries(error.fields ?? {})) {
              form.setError(field as keyof EditorValues, { message: text });
            }
            toast.error(error.message);
          } else {
            toast.error(t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."));
          }
        } finally {
          setSaving(false);
        }
      },
      () =>
        toast.error(t("कुछ फ़ील्ड अधूरे हैं", "Some fields need attention"), {
          description: t(
            "लाल दिख रहे फ़ील्ड ठीक कीजिए।",
            "Fix the fields marked in red.",
          ),
        }),
    )();

  /** One button, two outcomes: an admin removes the story, a reporter files a
   *  request for an admin to approve. The API decides which — it knows the
   *  caller's role; the UI only reports what came back. */
  const runDelete = async () => {
    if (!item) return;
    setDeleting(true);
    try {
      const result = await api.deleteNews(item.id, deleteReason);
      setConfirmDelete(false);
      if (result.news) {
        toast.success(
          t("डिलीट रिक्वेस्ट एडमिन को भेज दी गई", "Delete request sent to an admin"),
          {
            description: t(
              "अप्रूव होने के बाद खबर हट जाएगी।",
              "The story goes once an admin approves.",
            ),
          },
        );
        onSaved?.(result.news);
      } else {
        toast.success(t("खबर डिलीट कर दी गई", "Story deleted"));
        router.replace("/admin/news");
      }
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => event.preventDefault()}
      >
        <PageHeader
          title={
            isNew ? t("नई खबर", "New story") : t("खबर एडिट करें", "Edit story")
          }
          description={
            isNew
              ? t(
                  "खबर लिखिए, कवर इमेज लगाइए और रिव्यू के लिए भेज दीजिए।",
                  "Write the story, add a cover image, and send it for review.",
                )
              : t(
                  "बदलाव सेव करने पर रिव्यू स्टेटस अपडेट हो जाएगा।",
                  "Saving changes updates the review status.",
                )
          }
          actions={
            <>
              {item ? (
                <StatusBadge status={item.status} className="mr-1 h-7 px-2.5" />
              ) : null}
              {item ? (
                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/${item.categorySlug}/${item.slug}`}
                    target="_blank"
                  >
                    <IconArrowUpRight className="size-4" />{" "}
                    {t("साइट पर", "On site")}
                  </Link>
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canEdit || saving}
                onClick={() => submit(t("सेव हो गया", "Saved"))}
              >
                <IconDeviceFloppy className="size-4" />{" "}
                {saving ? t("सेव हो रहा है…", "Saving…") : t("सेव करें", "Save")}
              </Button>
              {canPublish ? (
                <Button
                  type="button"
                  size="sm"
                  disabled={!canEdit || saving}
                  onClick={() =>
                    submit(t("खबर पब्लिश कर दी गई", "Story published"), "published")
                  }
                >
                  <IconSparkles className="size-4" />{" "}
                  {t("पब्लिश करें", "Publish")}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={!canEdit || saving}
                  onClick={() =>
                    submit(t("खबर रिव्यू के लिए भेज दी गई", "Sent for review"), "in_review")
                  }
                >
                  <IconSend className="size-4" />{" "}
                  {t("रिव्यू में भेजें", "Send for review")}
                </Button>
              )}
            </>
          }
        />

        {!canEdit ? (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-700 dark:text-amber-400">
            {t(
              "यह खबर किसी और रिपोर्टर की है — आप इसे सिर्फ़ पढ़ सकते हैं।",
              "This story belongs to another reporter — you can only read it.",
            )}
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-4">
            <Card>
              <CardContent className="flex flex-col gap-4 pt-0">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("हेडलाइन", "Headline")}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={!canEdit}
                          rows={2}
                          placeholder={t(
                            "खबर की हेडलाइन लिखिए…",
                            "Write the headline…",
                          )}
                          className="font-display resize-none text-lg leading-snug font-bold"
                          onBlur={() => {
                            if (!form.getValues("slug") && title) {
                              form.setValue("slug", slugify(title), {
                                shouldValidate: true,
                              });
                            }
                            field.onBlur();
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        {t(
                          `${title.length}/120 अक्षर — 70 के अंदर सबसे अच्छा दिखता है।`,
                          `${title.length}/120 characters — under 70 reads best.`,
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("URL स्लग", "URL slug")}</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-1.5">
                          <span className="hidden shrink-0 text-[12px] text-text-muted sm:inline">
                            /{categorySlug}/
                          </span>
                          <Input
                            {...field}
                            disabled={!canEdit}
                            placeholder="url-slug"
                            className="font-mono text-[13px]"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={!canEdit}
                            onClick={() =>
                              form.setValue("slug", slugify(title), {
                                shouldValidate: true,
                              })
                            }
                          >
                            {t("ऑटो", "Auto")}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("सार (कार्ड पर दिखेगा)", "Summary (shown on cards)")}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={!canEdit}
                          rows={3}
                          placeholder={t(
                            "दो-तीन लाइन में खबर का सार…",
                            "Two or three lines summarising the story…",
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("खबर", "Story")}</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          disabled={!canEdit}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card id="preview">
              <CardHeader>
                <CardTitle className="font-display text-base font-bold">
                  {t("कवर इमेज", "Cover image")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-surface-muted">
                  {coverImageUrl ? (
                    <Image
                      src={coverImageUrl}
                      alt="कवर"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1280px) 100vw, 720px"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-text-muted">
                      <IconPhotoUp className="size-8" stroke={1.4} />
                      <p className="text-sm">
                        {t(
                          "कोई कवर इमेज नहीं चुनी गई",
                          "No cover image selected",
                        )}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!canEdit}
                    onClick={() => setPickerOpen(true)}
                  >
                    <IconPhotoUp className="size-4" />{" "}
                    {t("मीडिया लाइब्रेरी से चुनें", "Pick from media library")}
                  </Button>
                  {coverImageUrl ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={!canEdit}
                      onClick={() => form.setValue("coverImageUrl", "")}
                    >
                      <IconX className="size-4" /> {t("हटाएं", "Remove")}
                    </Button>
                  ) : null}
                </div>
                <FormField
                  control={form.control}
                  name="coverImageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!canEdit}
                          placeholder={t(
                            "या इमेज का URL पेस्ट कीजिए",
                            "Or paste an image URL",
                          )}
                          className="text-[13px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {item ? <ReviewPanel item={item} onChanged={onSaved} /> : null}
          </div>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base font-bold">
                  {t("प्रकाशन", "Publishing")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 pt-0">
                <FormField
                  control={form.control}
                  name="categorySlug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("कैटेगरी", "Category")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!canEdit}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categoriesConfig.map((category) => (
                            <SelectItem
                              key={category.slug}
                              value={category.slug}
                            >
                              <span
                                className="size-2 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              {t(category.name, category.nameEn)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {topicOptions.length > 0 ? (
                  <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("टॉपिक / सब-सेक्शन", "Topic / sub-section")}
                        </FormLabel>
                        <Select
                          value={field.value || "none"}
                          onValueChange={field.onChange}
                          disabled={!canEdit}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={t("कोई नहीं", "None")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-72">
                            <SelectItem value="none">
                              {t("कोई नहीं", "None")}
                            </SelectItem>
                            {topicOptions.map((topic) => (
                              <SelectItem key={topic.slug} value={topic.slug}>
                                {t(topic.name, topic.nameEn)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                ) : null}

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("फ़ॉर्मैट", "Format")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={!canEdit}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="article">
                            {t("आर्टिकल", "Article")}
                          </SelectItem>
                          <SelectItem value="video">
                            {t("वीडियो", "Video")}
                          </SelectItem>
                          <SelectItem value="photo">
                            {t("फोटो स्टोरी", "Photo story")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("टैग", "Tags")}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!canEdit}
                          placeholder={t(
                            "कॉमा से अलग करें",
                            "Separate with commas",
                          )}
                        />
                      </FormControl>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {(field.value ?? "")
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean)
                          .map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] text-text-muted"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
                  <FormField
                    control={form.control}
                    name="isBreaking"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-1.5 text-[13px]">
                            <IconBolt className="size-3.5 text-live" />{" "}
                            {t("ब्रेकिंग न्यूज़", "Breaking news")}
                          </FormLabel>
                          <FormDescription className="text-[11px]">
                            {t(
                              "हेडर टिकर में सबसे ऊपर",
                              "Top of the header ticker",
                            )}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!canEdit || !canPublish}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center gap-1.5 text-[13px]">
                            <IconStar className="size-3.5 text-amber-500" />{" "}
                            {t("हीरो में दिखाएं", "Show in hero")}
                          </FormLabel>
                          <FormDescription className="text-[11px]">
                            {t(
                              "होमपेज के बड़े स्लाइडर में",
                              "In the big homepage slider",
                            )}
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={!canEdit || !canPublish}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {canPublish ? (
                  <FormField
                    control={form.control}
                    name="scheduledFor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <IconCalendarClock className="size-4" />{" "}
                          {t("शेड्यूल करें", "Schedule")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="datetime-local"
                            disabled={!canEdit}
                          />
                        </FormControl>
                        <FormDescription className="text-[11px]">
                          {t(
                            "खाली छोड़ेंगे तो तुरंत पब्लिश होगी।",
                            "Leave empty to publish right away.",
                          )}
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-1.5 text-base font-bold">
                  <IconUserCheck className="size-4" /> {t("रिव्यू", "Review")}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                <FormField
                  control={form.control}
                  name="reviewerIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("कौन-कौन रिव्यू करेगा", "Who should review this")}</FormLabel>
                      <FormControl>
                        <ReviewerPicker
                          reviewers={reviewers}
                          value={field.value ?? []}
                          onChange={field.onChange}
                          disabled={!canEdit}
                        />
                      </FormControl>
                      <FormDescription className="text-[11px]">
                        {t(
                          "एक से ज़्यादा लोग चुन सकते हैं — सबको मेल जाएगा और सबकी क्यू में दिखेगा। रिव्यू कोई भी एडमिन कर सकता है; जो करेगा, उसी का नाम खबर पर दिखेगा।",
                          "Pick as many as you need — each is emailed and sees it in their queue. Any admin can still review it; whoever does is the name credited on the story.",
                        )}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {item ? (
                  <dl className="flex flex-col gap-1.5 rounded-lg bg-surface-muted/60 p-3 text-[12px]">
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-muted">{t("रिपोर्टर", "Reporter")}</dt>
                      <dd className="font-medium text-text">{item.authorName}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-muted">{t("भेजा गया", "Assigned to")}</dt>
                      <dd className="font-medium text-text">
                        {item.reviewers?.length
                          ? item.reviewers.map((person) => person.name).join(", ")
                          : t("कोई भी एडमिन", "Any admin")}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-muted">{t("रिव्यू किया", "Reviewed by")}</dt>
                      <dd className="font-medium text-text">
                        {item.reviewedBy?.name ?? t("अभी नहीं", "Not yet")}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-muted">{t("पब्लिश किया", "Published by")}</dt>
                      <dd className="font-medium text-text">
                        {item.publishedByName ?? "—"}
                      </dd>
                    </div>
                    {item.publishedAt ? (
                      <div className="flex justify-between gap-2">
                        <dt className="text-text-muted">{t("पब्लिश समय", "Published at")}</dt>
                        <dd className="font-medium text-text">
                          {formatDateTime(item.publishedAt, language)}
                        </dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-muted">{t("आख़िरी बदलाव", "Last edited")}</dt>
                      <dd className="font-medium text-text">
                        {formatDateTime(item.updatedAt, language)}
                      </dd>
                    </div>
                  </dl>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-1.5 text-base font-bold">
                  <IconShare3 className="size-4" /> {t("सोशल मीडिया लिंक", "Social media links")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <FormField
                  control={form.control}
                  name="socialLinks"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <SocialLinksField
                          value={field.value as SocialLink[]}
                          onChange={field.onChange}
                          disabled={!canEdit}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="gap-0">
              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4 text-left">
                  <span className="font-display text-base font-bold">SEO</span>
                  <IconChevronDown className="size-4 text-text-muted transition-transform data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="flex flex-col gap-3 pt-0">
                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px]">
                            {t("मेटा टाइटल", "Meta title")}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!canEdit} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px]">
                            {t("मेटा डिस्क्रिप्शन", "Meta description")}
                          </FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={3} disabled={!canEdit} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="keywords"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[13px]">
                            {t("कीवर्ड्स", "Keywords")}
                          </FormLabel>
                          <FormControl>
                            <Input {...field} disabled={!canEdit} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {item && canEdit ? (
              <Card>
                <CardContent className="flex flex-col gap-2 pt-0">
                  <Label className="text-[13px] text-text-muted">
                    {t("खतरे का ज़ोन", "Danger zone")}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-destructive",
                      "hover:bg-destructive/10",
                    )}
                    disabled={deleting}
                    onClick={() => setConfirmDelete(true)}
                  >
                    <IconTrash className="size-4" />
                    {can("news.delete")
                      ? t("खबर डिलीट करें", "Delete story")
                      : t("डिलीट की रिक्वेस्ट भेजें", "Request delete")}
                  </Button>
                  {!can("news.delete") ? (
                    <p className="text-[11px] text-text-muted">
                      {t(
                        "रिपोर्टर सीधे डिलीट नहीं कर सकते — एडमिन के अप्रूवल के बाद ही खबर हटेगी।",
                        "Reporters can't delete directly — the story goes only after an admin approves.",
                      )}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>

        <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {can("news.delete")
                  ? t("यह खबर डिलीट करें?", "Delete this story?")
                  : t("डिलीट की रिक्वेस्ट भेजें?", "Request this story be deleted?")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {can("news.delete")
                  ? t(
                      "यह वापस नहीं आएगी। अगर खबर पब्लिश है तो साइट से भी तुरंत हट जाएगी।",
                      "This cannot be undone. A published story also disappears from the site at once.",
                    )
                  : t(
                      "खबर तभी हटेगी जब कोई एडमिन रिक्वेस्ट अप्रूव करेगा।",
                      "The story is removed only after an admin approves your request.",
                    )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {!can("news.delete") ? (
              <Textarea
                value={deleteReason}
                onChange={(event) => setDeleteReason(event.target.value)}
                rows={3}
                placeholder={t("वजह लिखिए (एडमिन को दिखेगी)", "Why? (the admin will see this)")}
              />
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>
                {t("रहने दें", "Cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                disabled={deleting}
                className="bg-destructive text-white hover:bg-destructive/90"
                onClick={(event) => {
                  // Keep the dialog open until the request comes back.
                  event.preventDefault();
                  void runDelete();
                }}
              >
                {deleting
                  ? t("हो रहा है…", "Working…")
                  : can("news.delete")
                    ? t("डिलीट करें", "Delete")
                    : t("रिक्वेस्ट भेजें", "Send request")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <MediaPickerDialog
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          kind="news"
          onSelect={(selected) => {
            form.setValue("coverImageUrl", selected.url, {
              shouldValidate: true,
            });
            setPickerOpen(false);
          }}
        />
        <p className="text-center text-[11px] text-text-muted">
          {t("लॉग इन", "Signed in")}: {user.name} · {t("रोल", "role")}: {role}
        </p>
      </form>
    </Form>
  );
}
