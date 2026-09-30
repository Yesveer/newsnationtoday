"use client";

import { useState } from "react";
import Image from "next/image";
import { IconSearch } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MediaItem } from "@/types/admin";
import { useAdminLang } from "@/components/admin/use-admin-lang";

export function MediaPickerDialog({
  open,
  onOpenChange,
  media,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  media: MediaItem[];
  onSelect: (item: MediaItem) => void;
}) {
  const { t } = useAdminLang();
  const [query, setQuery] = useState("");
  const results = media.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("मीडिया लाइब्रेरी", "Media library")}</DialogTitle>
          <DialogDescription>
            {t("कवर इमेज चुनिए — यही वेबसाइट के कार्ड पर दिखेगी।", "Pick a cover image — it shows on the website's cards.")}
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <IconSearch className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-text-muted" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("फ़ाइल का नाम खोजें…", "Search file names…")}
            className="pl-8"
          />
        </div>
        <ScrollArea className="h-[380px] pr-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item)}
                className="group flex flex-col gap-1 overflow-hidden rounded-lg border border-border text-left transition-colors hover:border-accent"
              >
                <span className="relative block aspect-[4/3] w-full overflow-hidden bg-surface-muted">
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="200px"
                  />
                </span>
                <span className="truncate px-2 pb-1.5 text-[11px] text-text-muted">{item.name}</span>
              </button>
            ))}
          </div>
          {results.length === 0 ? (
            <p className="py-12 text-center text-sm text-text-muted">{t("कोई फ़ाइल नहीं मिली।", "No files found.")}</p>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
