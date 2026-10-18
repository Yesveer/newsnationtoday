"use client";

import { useEffect, useState } from "react";
import { IconAlertTriangle, IconCircleCheck, IconLoader2 } from "@tabler/icons-react";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { cn } from "@/lib/cn";
import type { Reel } from "@/types/admin";

/** Where the vertical cut has got to.
 *
 *  The encode runs on the server after the save, so the editor needs to say
 *  something other than nothing while it works — and show the reason when it
 *  does not. */
export function ReelStatus({ reel }: { reel: Reel }) {
  const { t } = useAdminLang();
  const working = reel.status === "queued" || reel.status === "working";

  // While it is running the page does not know when it finishes; a reload is
  // the simplest honest way to find out, and it is a one-off per encode.
  const [waited, setWaited] = useState(0);
  useEffect(() => {
    if (!working) return;
    const timer = setInterval(() => setWaited((value) => value + 1), 5000);
    return () => clearInterval(timer);
  }, [working]);

  if (!reel.status) return null;

  if (working) {
    return (
      <div className="flex items-start gap-2 rounded-lg bg-surface-muted px-3 py-2 text-[12px] text-text-muted">
        <IconLoader2 className="mt-0.5 size-3.5 shrink-0 animate-spin" />
        <span>
          {reel.status === "queued"
            ? t("रील कतार में है…", "Reel is queued…")
            : t("रील बन रही है…", "Making the reel…")}
          {waited > 2 ? (
            <span className="ml-1">
              {t("पेज रिफ्रेश करके देखिए।", "Refresh the page to check.")}
            </span>
          ) : null}
        </span>
      </div>
    );
  }

  if (reel.status === "failed") {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[12px] text-amber-700 dark:text-amber-400">
        <IconAlertTriangle className="mt-0.5 size-3.5 shrink-0" />
        <span>
          <span className="font-semibold">{t("रील नहीं बनी।", "The reel failed.")}</span>{" "}
          {reel.error}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-center gap-1.5 text-[12px] text-emerald-700 dark:text-emerald-400">
        <IconCircleCheck className="size-3.5 shrink-0" />
        {t("रील तैयार है — 1080×1920", "Reel ready — 1080×1920")}
      </p>
      {reel.videoUrl ? (
        <video
          src={reel.videoUrl}
          poster={reel.posterUrl}
          controls
          preload="metadata"
          className={cn("w-32 rounded-lg border border-border bg-black", "aspect-[9/16] object-cover")}
        />
      ) : null}
    </div>
  );
}
