"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { IconPhoto, IconTrash, IconUpload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";

/** Icons go to the portal storage profile. Until that is configured the API
 *  keeps small ones inline, so uploading works from day one either way. */
const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

export function CategoryIconPreview({
  iconUrl,
  color,
  size = 36,
  fallback,
}: {
  iconUrl?: string;
  color?: string;
  size?: number;
  /** Shown when nothing custom is set — a topic's state map, for instance. */
  fallback?: ReactNode;
}) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg"
      style={{
        width: size,
        height: size,
        backgroundColor: `color-mix(in oklab, ${color ?? "#FF5C00"} 14%, transparent)`,
      }}
    >
      {iconUrl ? (
        <Image src={iconUrl} alt="" width={size} height={size} className="size-full object-contain p-1" unoptimized />
      ) : (
        (fallback ?? <IconPhoto className="size-4 opacity-50" style={{ color: color ?? "#FF5C00" }} stroke={1.7} />)
      )}
    </span>
  );
}

/** Set a category's logo: paste a link, or upload a small image. */
export function CategoryIconPicker({
  iconUrl,
  color,
  label,
  onChange,
  fallback,
}: {
  iconUrl?: string;
  color?: string;
  label: string;
  onChange: (iconUrl: string) => void;
  /** What to show when no custom logo is set. */
  fallback?: ReactNode;
}) {
  const { t } = useAdminLang();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(iconUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const readFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("सिर्फ़ इमेज फ़ाइल चुनिए", "Pick an image file"));
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(t("फ़ाइल बहुत बड़ी है", "That file is too large"), {
        description: t("2 MB से छोटी PNG या SVG चुनिए।", "Use a PNG or SVG under 2 MB."),
      });
      return;
    }

    setUploading(true);
    try {
      const asset = await api.uploadMedia(file, "portal");
      setDraft(asset.url);
      toast.success(t("अपलोड हो गया", "Uploaded"));
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : t("अपलोड नहीं हुआ", "The upload did not go through"),
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDraft(iconUrl ?? "");
          setOpen(true);
        }}
        className="rounded-lg outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-accent"
        aria-label={t(`${label} का लोगो बदलें`, `Change the logo for ${label}`)}
        title={t("लोगो बदलें", "Change logo")}
      >
        <CategoryIconPreview iconUrl={iconUrl} color={color} fallback={fallback} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("कैटेगरी का लोगो", "Category logo")}</DialogTitle>
            <DialogDescription>
              {t(
                "लिंक पेस्ट कीजिए या छोटी इमेज अपलोड कीजिए। यही लोगो वेबसाइट के साइड नेविगेशन में दिखेगा।",
                "Paste a link or upload a small image. This is what shows in the site's side navigation.",
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <CategoryIconPreview iconUrl={draft} color={color} size={56} fallback={fallback} />
            <div className="flex flex-col gap-2">
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void readFile(file);
                  event.target.value = "";
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => fileInput.current?.click()}
              >
                <IconUpload className="size-4" />
                {uploading ? t("अपलोड हो रहा है…", "Uploading…") : t("अपलोड करें", "Upload")}
              </Button>
              <p className="text-[11px] text-text-muted">
                {t("PNG, SVG या WebP · 2 MB तक", "PNG, SVG or WebP · up to 2 MB")}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="icon-url">{t("या इमेज का लिंक", "Or an image link")}</Label>
            <Input
              id="icon-url"
              value={draft.startsWith("data:") ? "" : draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="https://…/icon.png"
              className="text-[13px]"
            />
            {draft.startsWith("data:") ? (
              <p className="text-[11px] text-text-muted">
                {t("अपलोड की गई इमेज चुनी हुई है।", "An uploaded image is selected.")}
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              className="text-destructive"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <IconTrash className="size-4" /> {t("लोगो हटाएं", "Remove logo")}
            </Button>
            <span className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t("रद्द करें", "Cancel")}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onChange(draft.trim());
                  setOpen(false);
                }}
              >
                {t("लगाएं", "Apply")}
              </Button>
            </span>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
