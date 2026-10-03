"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { IconCloudUpload, IconSearch } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";

/** Pick a file from the newsroom's library, or upload a new one right here.
 *  Story images go to the news storage profile. */
export function MediaPickerDialog({
  open,
  onOpenChange,
  kind = "news",
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind?: api.AssetKind;
  onSelect: (asset: { url: string; name: string }) => void;
}) {
  const { t } = useAdminLang();
  const [assets, setAssets] = useState<api.MediaAsset[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const fetchAssets = useCallback(async () => {
    try {
      const page = await api.listMedia({ kind, search: query, limit: 60 });
      return page.items;
    } catch {
      return [] as api.MediaAsset[];
    }
  }, [kind, query]);

  useEffect(() => {
    if (!open) return;
    let active = true;
    const timer = setTimeout(() => {
      void (async () => {
        const items = await fetchAssets();
        if (!active) return;
        setAssets(items);
        setLoading(false);
      })();
    }, query ? 300 : 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [open, fetchAssets, query]);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const asset = await api.uploadMedia(file, kind);
      toast.success(t("अपलोड हो गया", "Uploaded"));
      onSelect({ url: asset.url, name: asset.name });
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : t("अपलोड नहीं हुआ", "The upload did not go through"),
        { duration: 8000 },
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("मीडिया लाइब्रेरी", "Media library")}</DialogTitle>
          <DialogDescription>
            {t(
              "कवर इमेज चुनिए या नई अपलोड कीजिए — यही वेबसाइट के कार्ड पर दिखेगी।",
              "Pick a cover image or upload a new one — it shows on the website's cards.",
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1">
            <IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("फ़ाइल का नाम खोजें…", "Search file names…")}
              className="pl-8"
            />
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = "";
            }}
          />
          <Button variant="outline" disabled={uploading} onClick={() => fileInput.current?.click()}>
            <IconCloudUpload className="size-4" />
            {uploading ? t("अपलोड हो रहा है…", "Uploading…") : t("नई अपलोड करें", "Upload new")}
          </Button>
        </div>

        <ScrollArea className="h-[380px] pr-3">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[4/3] w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {assets.map((asset) => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => onSelect({ url: asset.url, name: asset.name })}
                  className="group flex flex-col gap-1 overflow-hidden rounded-lg border border-border text-left transition-colors hover:border-accent"
                >
                  <span className="relative block aspect-[4/3] w-full overflow-hidden bg-surface-muted">
                    <Image
                      src={asset.url}
                      alt={asset.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="200px"
                      unoptimized
                    />
                  </span>
                  <span className="truncate px-2 pb-1.5 text-[11px] text-text-muted">{asset.name}</span>
                </button>
              ))}
            </div>
          )}

          {!loading && assets.length === 0 ? (
            <p className="py-12 text-center text-sm text-text-muted">
              {t(
                "लाइब्रेरी खाली है — ऊपर से अपलोड कीजिए।",
                "The library is empty — upload one from above.",
              )}
            </p>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
