"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { IconUpload, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";

/** A media field that takes a file or a link.
 *
 *  Pasting a link is allowed and normal — a reporter will have found the clip
 *  somewhere. It does not stay a link: on save the server downloads it into
 *  our own storage and rewrites the story, so the database only ever holds an
 *  address we serve. Uploading here skips that round trip. */
export function MediaUrlField({
  value,
  onChange,
  disabled,
  destination,
  accept,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  destination?: string;
  accept: string;
  placeholder: string;
}) {
  const { t } = useAdminLang();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const asset = await api.uploadMedia(file, "news", undefined, destination);
      onChange(asset.url);
      toast.success(t("अपलोड हो गया", "Uploaded"));
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : t("अपलोड नहीं हुआ", "Could not upload"),
        { duration: 10000 },
      );
    } finally {
      setBusy(false);
    }
  };

  const isVideo = /^video\//.test(accept) || /\.(mp4|webm|mov|m4v|mkv)(\?|$)/i.test(value);

  return (
    <div className="flex flex-col gap-2">
      {value ? (
        <div className="overflow-hidden rounded-lg border border-border bg-surface-muted">
          {isVideo ? (
            <video src={value} controls preload="metadata" className="aspect-video w-full bg-black" />
          ) : (
            // A plain img: the source may be anywhere until the story is saved.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="aspect-video w-full object-cover" />
          )}
        </div>
      ) : null}

      <div className="flex items-center gap-1.5">
        <Input
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="text-[13px]"
        />
        <input
          ref={input}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || busy}
          onClick={() => input.current?.click()}
        >
          <IconUpload className="size-4" />
          {busy ? t("हो रहा है…", "Working…") : t("अपलोड", "Upload")}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={disabled}
            aria-label={t("हटाएं", "Clear")}
            onClick={() => onChange("")}
          >
            <IconX className="size-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
