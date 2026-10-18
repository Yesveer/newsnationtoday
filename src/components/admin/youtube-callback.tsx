"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconAlertTriangle, IconCircleCheck, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";

export function YouTubeCallback() {
  const { t } = useAdminLang();
  const params = useSearchParams();

  // What Google sent back is known at render time; only the exchange is
  // asynchronous, so the failure cases are derived rather than set in an
  // effect.
  const denied = params.get("error");
  const code = params.get("code");
  const upfrontProblem = denied
    ? t("Google पर अनुमति नहीं दी गई।", "Permission was not granted on Google.")
    : code
      ? ""
      : t("Google से कोई कोड नहीं आया।", "Google did not send a code back.");

  const [result, setResult] = useState<{ ok: boolean; channel: string; message: string } | null>(
    null,
  );
  // The code is single-use: exchanging it twice fails, and React runs
  // effects twice in development.
  const exchanged = useRef(false);

  useEffect(() => {
    if (exchanged.current || upfrontProblem || !code) return;
    exchanged.current = true;

    void (async () => {
      try {
        const social = await api.completeYouTube(code);
        setResult({ ok: true, channel: social.youtube.channelTitle ?? "", message: "" });
      } catch (error) {
        setResult({
          ok: false,
          channel: "",
          message:
            error instanceof ApiError
              ? error.message
              : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
        });
      }
    })();
  }, [code, upfrontProblem, t]);

  const state: "working" | "done" | "failed" = upfrontProblem
    ? "failed"
    : result
      ? result.ok
        ? "done"
        : "failed"
      : "working";
  const message = upfrontProblem || result?.message || "";
  const channel = result?.channel ?? "";

  return (
    <Card className="mx-auto max-w-lg">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        {state === "working" ? (
          <>
            <IconLoader2 className="size-8 animate-spin text-accent" />
            <p className="text-sm text-text-muted">
              {t("YouTube से जोड़ा जा रहा है…", "Connecting YouTube…")}
            </p>
          </>
        ) : null}

        {state === "done" ? (
          <>
            <IconCircleCheck className="size-8 text-emerald-500" />
            <p className="font-display text-base font-bold">
              {t("चैनल जुड़ गया", "Channel connected")}
            </p>
            {channel ? <p className="text-sm text-text-muted">{channel}</p> : null}
          </>
        ) : null}

        {state === "failed" ? (
          <>
            <IconAlertTriangle className="size-8 text-amber-500" />
            <p className="font-display text-base font-bold">
              {t("नहीं जुड़ पाया", "Could not connect")}
            </p>
            <p className="max-w-sm text-sm text-text-muted">{message}</p>
          </>
        ) : null}

        {state !== "working" ? (
          <Button asChild variant="outline" size="sm" className="mt-1">
            <Link href="/admin/settings">{t("सेटिंग्स पर वापस", "Back to settings")}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
