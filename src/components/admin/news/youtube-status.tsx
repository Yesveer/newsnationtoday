"use client";

import { IconAlertTriangle, IconBrandYoutube, IconLoader2 } from "@tabler/icons-react";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import type { YouTubePost } from "@/types/admin";

/** Whether the story made it to the channel.
 *
 *  The upload runs after publishing, so this is the only place that can say
 *  what became of it — including, plainly, when it failed. */
export function YouTubeStatus({ post }: { post: YouTubePost }) {
  const { t } = useAdminLang();
  if (!post.status) return null;

  if (post.status === "queued" || post.status === "working") {
    return (
      <p className="flex items-center gap-2 rounded-lg bg-surface-muted px-3 py-2 text-[12px] text-text-muted">
        <IconLoader2 className="size-3.5 shrink-0 animate-spin" />
        {post.status === "queued"
          ? t("YouTube की कतार में…", "Queued for YouTube…")
          : t("YouTube पर जा रहा है…", "Uploading to YouTube…")}
      </p>
    );
  }

  if (post.status === "failed") {
    return (
      <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-700 dark:text-amber-400">
        <IconAlertTriangle className="mt-0.5 size-3.5 shrink-0" />
        <span>
          <span className="font-semibold">{t("YouTube पर नहीं गया।", "YouTube upload failed.")}</span>{" "}
          {post.error}
        </span>
      </p>
    );
  }

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-[12px] text-text transition-colors hover:border-accent hover:text-accent"
    >
      <IconBrandYoutube className="size-3.5 shrink-0 text-[#ff0000]" />
      {t("YouTube पर देखें", "Watch on YouTube")}
    </a>
  );
}
