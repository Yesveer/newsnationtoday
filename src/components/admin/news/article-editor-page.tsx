"use client";

import { useCallback, useEffect, useState } from "react";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ArticleEditor } from "@/components/admin/news/article-editor";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import { mediaItems } from "@/data/admin/media";
import type { NewsItem } from "@/types/admin";

/** Loads one story from the API and hands it to the editor. Media is still the
 *  built-in sample library — uploads come with the storage backend. */
export function ArticleEditorPage({ id }: { id: string }) {
  const { t } = useAdminLang();
  const [item, setItem] = useState<NewsItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItem = useCallback(async () => {
    try {
      return { item: await api.getNews(id), error: null as string | null };
    } catch (apiError) {
      return {
        item: null,
        error:
          apiError instanceof ApiError
            ? apiError.message
            : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
      };
    }
  }, [id, t]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await fetchItem();
      if (!active) return;
      setItem(result.item);
      setError(result.error);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchItem]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <Skeleton className="h-[420px] w-full" />
          <Skeleton className="h-[420px] w-full" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
        <IconAlertTriangle className="size-4 shrink-0" />
        {error ?? t("यह खबर नहीं मिली।", "This story could not be found.")}
      </p>
    );
  }

  return <ArticleEditor item={item} media={mediaItems} onSaved={setItem} />;
}
