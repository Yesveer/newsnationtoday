import { IconCalendarTime, IconCheck, IconEdit, IconPencil } from "@tabler/icons-react";
import { formatDateTimeLong } from "@/lib/format-date";
import type { ArticleWithRelations } from "@/types/article";

/** Who stands behind the story.
 *
 *  A reader should be able to see the chain: who reported it, who checked it,
 *  who put it out, and exactly when. Published and last-updated are separate
 *  lines — a story edited after publication should say so rather than quietly
 *  change under a reader who already read it. */
export function ArticleCredits({ article }: { article: ArticleWithRelations }) {
  const published = article.publishedAt;
  // Only worth showing when the edit is meaningfully after publication.
  const edited =
    article.updatedAt &&
    published &&
    new Date(article.updatedAt).getTime() - new Date(published).getTime() > 60_000
      ? article.updatedAt
      : null;

  const rows: { icon: typeof IconPencil; label: string; value: string }[] = [
    { icon: IconPencil, label: "रिपोर्ट", value: article.author.name },
  ];
  if (article.reviewedByName) {
    rows.push({ icon: IconCheck, label: "समीक्षा", value: article.reviewedByName });
  }
  if (article.publishedByName && article.publishedByName !== article.reviewedByName) {
    rows.push({ icon: IconCheck, label: "प्रकाशित", value: article.publishedByName });
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted/40 px-3 py-2.5 text-[12.5px]">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {rows.map((row) => (
          <span key={row.label} className="flex items-center gap-1.5 text-text-muted">
            <row.icon className="size-3.5 shrink-0" />
            {row.label}:{" "}
            <span className="font-medium text-text">{row.value}</span>
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-text-muted">
        {published ? (
          <span className="flex items-center gap-1.5">
            <IconCalendarTime className="size-3.5 shrink-0" />
            प्रकाशित:{" "}
            <time dateTime={published} className="font-medium text-text">
              {formatDateTimeLong(published)}
            </time>
          </span>
        ) : null}
        {edited ? (
          <span className="flex items-center gap-1.5">
            <IconEdit className="size-3.5 shrink-0" />
            अपडेट:{" "}
            <time dateTime={edited} className="font-medium text-text">
              {formatDateTimeLong(edited)}
            </time>
          </span>
        ) : null}
        {article.readingTimeMinutes ? (
          <span>{article.readingTimeMinutes} मिनट का पाठ</span>
        ) : null}
      </div>
    </div>
  );
}
