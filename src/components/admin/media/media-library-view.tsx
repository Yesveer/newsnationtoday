"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  IconCopy,
  IconCloudUpload,
  IconPhoto,
  IconSearch,
  IconTrash,
  IconVideo,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { useAdminSession } from "@/components/admin/admin-session";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { formatRelative } from "@/lib/admin/format";
import type { MediaItem } from "@/types/admin";

export function MediaLibraryView({ items }: { items: MediaItem[] }) {
  const { can } = useAdminSession();
  const { t } = useAdminLang();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | "image" | "video">("all");
  const [dragging, setDragging] = useState(false);

  const results = items.filter(
    (item) =>
      (type === "all" || item.type === type) && item.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("मीडिया लाइब्रेरी", "Media library")}
        description={t(
          "वेबसाइट पर इस्तेमाल होने वाली सारी इमेज और वीडियो फ़ाइलें।",
          "Every image and video file the website uses.",
        )}
        actions={
          can("media.upload") ? (
            <Button
              size="sm"
              onClick={() =>
                toast.success(t("अपलोड शुरू", "Upload started"), {
                  description: t("स्टोरेज बैकएंड के साथ जुड़ेगा।", "Wires up with the storage backend."),
                })
              }
            >
              <IconCloudUpload className="size-4" /> {t("अपलोड करें", "Upload")}
            </Button>
          ) : null
        }
      />

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
            toast.success(
              t(
                `${event.dataTransfer.files.length || 1} फ़ाइल कतार में`,
                `${event.dataTransfer.files.length || 1} file(s) queued`,
              ),
              { description: t("स्टोरेज बैकएंड जुड़ते ही असली अपलोड होगा।", "Real uploads start once storage is connected.") },
            );
          }}
          className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragging ? "border-accent bg-accent/5" : "border-border bg-surface-muted/40"
          }`}
        >
          <IconCloudUpload className="size-8 text-accent" stroke={1.5} />
          <p className="text-sm font-medium text-text">{t("फ़ाइलें यहाँ खींच कर छोड़िए", "Drag and drop files here")}</p>
          <p className="text-[12px] text-text-muted">
            {t("JPG, PNG, WebP, MP4 — एक बार में 20 फ़ाइल तक", "JPG, PNG, WebP, MP4 — up to 20 files at once")}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("फ़ाइल खोजें…", "Search files…")}
            className="h-9 pl-8"
          />
        </div>
        <Tabs value={type} onValueChange={(value) => setType(value as typeof type)}>
          <TabsList className="rounded-lg">
            <TabsTrigger value="all" className="rounded-md text-[13px]">{t("सभी", "All")}</TabsTrigger>
            <TabsTrigger value="image" className="rounded-md text-[13px]">
              <IconPhoto className="size-3.5" /> {t("इमेज", "Images")}
            </TabsTrigger>
            <TabsTrigger value="video" className="rounded-md text-[13px]">
              <IconVideo className="size-3.5" /> {t("वीडियो", "Video")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {results.map((item) => (
          <Card key={item.id} className="group gap-0 overflow-hidden py-0">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
              <Image
                src={item.url}
                alt={item.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="240px"
              />
              {item.type === "video" ? (
                <span className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {t("वीडियो", "Video")}
                </span>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  size="icon-sm"
                  variant="secondary"
                  aria-label={t("URL कॉपी करें", "Copy URL")}
                  onClick={() => {
                    navigator.clipboard?.writeText(item.url);
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
                    onClick={() =>
                      toast.success(t("फ़ाइल डिलीट की गई", "File deleted"), {
                        description: t("बैकएंड जुड़ते ही लाइव।", "Live once the backend is connected."),
                      })
                    }
                  >
                    <IconTrash className="size-4" />
                  </Button>
                ) : null}
              </div>
            </div>
            <CardContent className="space-y-0.5 px-2.5 py-2">
              <p className="truncate text-[12px] font-medium text-text">{item.name}</p>
              <p className="text-[11px] text-text-muted">
                {item.dimensions} · {item.sizeLabel}
              </p>
              <p className="truncate text-[11px] text-text-muted">
                {item.uploadedByName} · {formatRelative(item.uploadedAt)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {results.length === 0 ? (
        <p className="py-12 text-center text-sm text-text-muted">{t("कोई फ़ाइल नहीं मिली।", "No files found.")}</p>
      ) : null}
    </div>
  );
}
