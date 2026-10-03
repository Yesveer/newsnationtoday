"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { IconCamera, IconTrash } from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";

/** One megabyte. A headshot needs nothing close to it, and the server
 *  enforces the same number — this check is here to fail fast and say so in
 *  the person's own language, not to be the only guard. */
const MAX_BYTES = 1024 * 1024;

export function AvatarUpload({
  name,
  url,
  onChange,
  disabled,
}: {
  name: string;
  url?: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const { t } = useAdminLang();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(t("कोई इमेज चुनिए", "Pick an image file"));
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t("फ़ोटो 1 MB से छोटी होनी चाहिए", "The photo must be under 1 MB"), {
        description: t(
          `यह ${(file.size / 1024 / 1024).toFixed(1)} MB की है।`,
          `This one is ${(file.size / 1024 / 1024).toFixed(1)} MB.`,
        ),
      });
      return;
    }

    setBusy(true);
    try {
      const asset = await api.uploadMedia(file, "portal", "avatar");
      onChange(asset.url);
      toast.success(t("फ़ोटो लग गई", "Photo updated"));
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : t("फ़ोटो अपलोड नहीं हुई", "Could not upload the photo"),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-16 shrink-0">
        {url ? <AvatarImage src={url} alt={name} /> : null}
        <AvatarFallback className="text-lg">{name.slice(0, 1) || "?"}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-col gap-1.5">
        <input
          ref={input}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void pick(file);
            event.target.value = "";
          }}
        />
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || busy}
            onClick={() => input.current?.click()}
          >
            <IconCamera className="size-4" />
            {busy
              ? t("अपलोड हो रही है…", "Uploading…")
              : url
                ? t("फ़ोटो बदलें", "Change photo")
                : t("फ़ोटो लगाएं", "Add a photo")}
          </Button>
          {url ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || busy}
              className="text-text-muted"
              onClick={() => onChange("")}
            >
              <IconTrash className="size-4" /> {t("हटाएं", "Remove")}
            </Button>
          ) : null}
        </div>
        <p className="text-[11px] text-text-muted">
          {t("JPG या PNG · 1 MB से कम", "JPG or PNG · under 1 MB")}
        </p>
      </div>
    </div>
  );
}
