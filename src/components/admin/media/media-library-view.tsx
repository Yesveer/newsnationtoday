"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SafeImage as Image } from "@/components/ui/safe-image";
import { toast } from "sonner";
import {
  IconAlertTriangle,
  IconCloudUpload,
  IconCopy,
  IconPhoto,
  IconRefresh,
  IconSearch,
  IconTrash,
  IconVideo,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { useAdminSession } from "@/components/admin/admin-session";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { formatRelative } from "@/lib/admin/format";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

/** Every file the newsroom has uploaded. Portal art and news media are listed
 *  separately because they live in different storage profiles. */
export function MediaLibraryView() {
  const { can } = useAdminSession();
  const { t, language } = useAdminLang();

  const [kind, setKind] = useState<api.AssetKind>("portal");
  const [assets, setAssets] = useState<api.MediaAsset[]>([]);
  const [usage, setUsage] = useState<api.MediaUsage>({});
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const fetchAssets = useCallback(
    async (forKind: api.AssetKind, search: string) => {
      try {
        const page = await api.listMedia({ kind: forKind, search, limit: 120 });
        return { items: page.items, usage: page.usage, error: null as string | null };
      } catch (apiError) {
        return {
          items: [] as api.MediaAsset[],
          usage: {} as api.MediaUsage,
          error:
            apiError instanceof ApiError
              ? apiError.message
              : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
        };
      }
    },
    [t],
  );

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      void (async () => {
        const result = await fetchAssets(kind, query);
        if (!active) return;
        setAssets(result.items);
        setUsage(result.usage);
        setError(result.error);
        setLoading(false);
      })();
    }, query ? 300 : 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [fetchAssets, kind, query]);

  const reload = async () => {
    setLoading(true);
    const result = await fetchAssets(kind, query);
    setAssets(result.items);
    setUsage(result.usage);
    setError(result.error);
    setLoading(false);
  };

  const upload = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    let failed = 0;
    for (const file of list) {
      try {
        await api.uploadMedia(file, kind);
      } catch (apiError) {
        failed += 1;
        toast.error(
          apiError instanceof ApiError ? apiError.message : t("अपलोड नहीं हुआ", "That upload did not go through"),
          { description: file.name, duration: 8000 },
        );
      }
    }
    setUploading(false);

    const uploaded = list.length - failed;
    if (uploaded > 0) {
      toast.success(t(`${uploaded} फ़ाइल अपलोड हुईं`, `${uploaded} file(s) uploaded`));
    }
    await reload();
  };

  const remove = async (asset: api.MediaAsset) => {
    try {
      await api.deleteMedia(asset.id);
      toast.success(t("फ़ाइल डिलीट हो गई", "File deleted"), {
        description: t("स्टोरेज से भी हट गई।", "It was removed from storage too."),
      });
      await reload();
    } catch (apiError) {
      toast.error(apiError instanceof ApiError ? apiError.message : t("डिलीट नहीं हुई", "Could not delete it"));
    }
  };

  const portalUsage = usage.portal ?? { files: 0, bytes: 0 };
  const newsUsage = usage.news ?? { files: 0, bytes: 0 };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("मीडिया लाइब्रेरी", "Media library")}
        description={t(
          "वेबसाइट पर इस्तेमाल होने वाली सारी इमेज और वीडियो फ़ाइलें।",
          "Every image and video file the website uses.",
        )}
        actions={
          <>
            <Button variant="outline" size="sm" disabled={loading} onClick={() => void reload()}>
              <IconRefresh className="size-4" /> {t("रिफ्रेश", "Refresh")}
            </Button>
            {can("media.upload") ? (
              <Button size="sm" disabled={uploading} onClick={() => fileInput.current?.click()}>
                <IconCloudUpload className="size-4" />
                {uploading ? t("अपलोड हो रहा है…", "Uploading…") : t("अपलोड करें", "Upload")}
              </Button>
            ) : null}
          </>
        }
      />

      <input
        ref={fileInput}
        type="file"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) void upload(event.target.files);
          event.target.value = "";
        }}
      />

      {error ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" /> {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label={t("पोर्टल की फ़ाइलें", "Portal files")}
          value={portalUsage.files}
          hint={formatBytes(portalUsage.bytes)}
          icon={<IconPhoto className="size-5" stroke={1.7} />}
        />
        <StatCard
          label={t("न्यूज़ मीडिया", "News media")}
          value={newsUsage.files}
          hint={formatBytes(newsUsage.bytes)}
          icon={<IconVideo className="size-5" stroke={1.7} />}
        />
      </div>

      {can("media.upload") ? (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            void upload(event.dataTransfer.files);
          }}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragging ? "border-accent bg-accent/5" : "border-border bg-surface-muted/40"
          }`}
        >
          <IconCloudUpload className="size-8 text-accent" stroke={1.5} />
          <p className="text-sm font-medium text-text">
            {t("फ़ाइलें यहाँ खींच कर छोड़िए", "Drag and drop files here")}
          </p>
          <p className="text-[12px] text-text-muted">
            {kind === "portal"
              ? t("पोर्टल के लोगो और आइकॉन", "Logos and icons for the portal")
              : t("खबरों की फोटो, वीडियो और रील", "Story photos, video and reels")}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Tabs value={kind} onValueChange={(value) => setKind(value as api.AssetKind)}>
          <TabsList className="rounded-lg">
            <TabsTrigger value="portal" className="rounded-md text-[13px]">
              {t("पोर्टल", "Portal")}
            </TabsTrigger>
            <TabsTrigger value="news" className="rounded-md text-[13px]">
              {t("न्यूज़", "News")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1">
          <IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("फ़ाइल खोजें…", "Search files…")}
            className="h-9 pl-8"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {assets.map((asset) => (
            <Card key={asset.id} className="group gap-0 overflow-hidden py-0">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
                {asset.mimeType.startsWith("video/") ? (
                  <span className="flex h-full items-center justify-center text-text-muted">
                    <IconVideo className="size-8" stroke={1.4} />
                  </span>
                ) : (
                  <Image
                    src={asset.url}
                    alt={asset.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="240px"
                    unoptimized
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    size="icon-sm"
                    variant="secondary"
                    aria-label={t("URL कॉपी करें", "Copy URL")}
                    onClick={() => {
                      navigator.clipboard?.writeText(asset.url);
                      toast.success(t("URL कॉपी हो गया", "URL copied"));
                    }}
                  >
                    <IconCopy className="size-4" />
                  </Button>
                  {can("media.delete") ? (
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      aria-label={t("डिलीट करें", "Delete")}
                      onClick={() => void remove(asset)}
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
              <CardContent className="space-y-0.5 px-2.5 py-2">
                <p className="truncate text-[12px] font-medium text-text">{asset.name}</p>
                <p className="text-[11px] text-text-muted">
                  {asset.width ? `${asset.width}×${asset.height} · ` : ""}
                  {formatBytes(asset.bytes)}
                </p>
                <p className="truncate text-[11px] text-text-muted">
                  {asset.uploadedByName} · {formatRelative(asset.createdAt, language)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && assets.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-muted">
          {t("अभी कोई फ़ाइल नहीं।", "No files yet.")}
        </p>
      ) : null}
    </div>
  );
}
