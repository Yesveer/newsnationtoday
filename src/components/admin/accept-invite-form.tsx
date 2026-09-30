"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { IconAlertTriangle, IconArrowRight, IconLock } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import { siteConfig } from "@/config/site";

/** Where an invited user lands: they set their own password, and only then
 *  does the account become active. */
export function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useAdminLang();

  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    setError(null);
    if (password !== confirm) {
      setError(t("दोनों पासवर्ड एक जैसे नहीं हैं", "The two passwords do not match"));
      return;
    }
    setSaving(true);
    try {
      await api.acceptInvite(token, password);
      toast.success(t("अकाउंट तैयार है", "Your account is ready"));
      router.replace("/login");
    } catch (apiError) {
      if (apiError instanceof ApiError) {
        setError(apiError.fields?.password ?? apiError.message);
      } else {
        setError(t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-admin-theme className="flex min-h-screen items-center justify-center bg-surface-muted/40 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="relative block h-12 w-32">
            <Image src="/logo-nnt.png" alt={siteConfig.name} fill className="object-contain" sizes="128px" priority />
          </span>
          <h1 className="font-display text-lg font-bold tracking-tight">
            {t("अपना पासवर्ड सेट कीजिए", "Set your password")}
          </h1>
          <p className="text-[12.5px] text-text-muted">
            {t("इसके बाद आप एडमिन पोर्टल में लॉगिन कर पाएंगे।", "Then you can sign in to the admin portal.")}
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-3 pt-0">
            {!token ? (
              <p className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive">
                <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
                {t(
                  "इनवाइट टोकन नहीं मिला। एडमिनिस्ट्रेटर से पूरा लिंक मांगिए।",
                  "No invite token in the link. Ask your administrator for the full link.",
                )}
              </p>
            ) : null}

            {error ? (
              <p className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12.5px] text-destructive">
                <IconAlertTriangle className="mt-0.5 size-4 shrink-0" />
                {error}
              </p>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="invite-password" className="flex items-center gap-1.5">
                <IconLock className="size-4" /> {t("नया पासवर्ड", "New password")}
              </Label>
              <Input
                id="invite-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <p className="text-[11px] text-text-muted">
                {t("कम से कम 8 अक्षर, एक अंक ज़रूरी।", "At least 8 characters, including a number.")}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-confirm">{t("दोबारा लिखिए", "Confirm password")}</Label>
              <Input
                id="invite-confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
            </div>

            <Button
              className="mt-1 w-full"
              disabled={saving || !token || !password}
              onClick={() => void submit()}
            >
              {saving ? t("सेट हो रहा है…", "Setting…") : t("पासवर्ड सेट करें", "Set password")}
              <IconArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>

        <div className="mt-4 text-center">
          <Link href="/login" className="text-[12.5px] text-text-muted hover:text-accent">
            {t("पहले से अकाउंट है? लॉगिन कीजिए", "Already set up? Sign in")}
          </Link>
        </div>
      </div>
    </div>
  );
}
