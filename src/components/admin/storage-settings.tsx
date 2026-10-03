"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { IconAlertTriangle, IconCloud, IconDeviceFloppy, IconPlugConnected } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";

const emptyProfile: api.StorageProfile = {
  provider: "none",
  folder: "",
  cloudName: "",
  apiKey: "",
  apiSecret: "",
  maxUploadMb: 10,
};

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

/** Where uploaded files live.
 *
 *  Two destinations on purpose: the portal's own art is small and can sit on a
 *  free tier forever, while news photos and video grow without limit and can
 *  be pointed somewhere else entirely — without changing anything else. */
export function StorageSettingsPanel() {
  const { t } = useAdminLang();

  const [settings, setSettings] = useState<api.StorageSettings>({ portal: emptyProfile, news: emptyProfile });
  const [usage, setUsage] = useState<api.MediaUsage>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<api.AssetKind | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const result = await api.getStorageSettings();
      return {
        settings: {
          portal: { ...result.storage.portal, apiSecret: "" },
          news: { ...result.storage.news, apiSecret: "" },
        },
        usage: result.usage,
        error: null as string | null,
      };
    } catch (error) {
      return {
        settings: { portal: emptyProfile, news: emptyProfile },
        usage: {} as api.MediaUsage,
        error:
          error instanceof ApiError
            ? error.message
            : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
      };
    }
  }, [t]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await fetchSettings();
      if (!active) return;
      setSettings(result.settings);
      setUsage(result.usage);
      setLoadError(result.error);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchSettings]);

  const set = (kind: api.AssetKind, partial: Partial<api.StorageProfile>) =>
    setSettings((current) => ({ ...current, [kind]: { ...current[kind], ...partial } }));

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const saved = await api.saveStorageSettings(settings);
      setSettings({ portal: { ...saved.portal, apiSecret: "" }, news: { ...saved.news, apiSecret: "" } });
      toast.success(t("स्टोरेज सेटिंग्स सेव हो गईं", "Storage settings saved"));
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fields ?? {});
        toast.error(error.message);
      } else {
        toast.error(t("सेव नहीं हुआ", "Could not save"));
      }
    } finally {
      setSaving(false);
    }
  };

  const test = async (kind: api.AssetKind) => {
    setTesting(kind);
    try {
      const result = await api.testStorage(kind, settings[kind]);
      toast.success(t("कनेक्शन ठीक है", "Connection works"), { description: result.message });
    } catch (error) {
      toast.error(t("कनेक्शन नहीं बना", "Could not connect"), {
        description: error instanceof ApiError ? error.message : undefined,
        duration: 10000,
      });
    } finally {
      setTesting(null);
    }
  };

  if (loading) return <Skeleton className="h-[460px] w-full" />;

  const profileCard = (
    kind: api.AssetKind,
    title: string,
    description: string,
    stored: { files: number; bytes: number },
  ) => {
    const profile = settings[kind];
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
                <IconCloud className="size-4 text-accent" /> {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <span className="text-[12px] text-text-muted">
              {stored.files} {t("फ़ाइलें", "files")} · {formatBytes(stored.bytes)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("सेवा", "Provider")}</Label>
            <Select
              value={profile.provider}
              onValueChange={(value) => set(kind, { provider: value as api.StorageProfile["provider"] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cloudinary">Cloudinary</SelectItem>
                <SelectItem value="none">{t("कोई नहीं", "None")}</SelectItem>
              </SelectContent>
            </Select>
            {errors[`${kind}.provider`] ? (
              <p className="text-[11.5px] text-destructive">{errors[`${kind}.provider`]}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${kind}-folder`}>{t("फ़ोल्डर", "Folder")}</Label>
            <Input
              id={`${kind}-folder`}
              value={profile.folder}
              onChange={(event) => set(kind, { folder: event.target.value })}
              placeholder={kind === "portal" ? "news-nation/portal" : "news-nation/news"}
              className="font-mono text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${kind}-cloud`}>{t("क्लाउड नाम", "Cloud name")}</Label>
            <Input
              id={`${kind}-cloud`}
              value={profile.cloudName}
              onChange={(event) => set(kind, { cloudName: event.target.value })}
              placeholder="dxxxxxxxx"
            />
            {errors[`${kind}.cloudName`] ? (
              <p className="text-[11.5px] text-destructive">{errors[`${kind}.cloudName`]}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${kind}-key`}>API key</Label>
            <Input
              id={`${kind}-key`}
              value={profile.apiKey}
              onChange={(event) => set(kind, { apiKey: event.target.value })}
              autoComplete="off"
            />
            {errors[`${kind}.apiKey`] ? (
              <p className="text-[11.5px] text-destructive">{errors[`${kind}.apiKey`]}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${kind}-secret`}>API secret</Label>
            <Input
              id={`${kind}-secret`}
              type="password"
              value={profile.apiSecret ?? ""}
              onChange={(event) => set(kind, { apiSecret: event.target.value })}
              placeholder={
                profile.hasSecret
                  ? t("सेव है — बदलना हो तभी भरें", "Saved — fill only to change it")
                  : t("Cloudinary का API secret", "Your Cloudinary API secret")
              }
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${kind}-limit`}>{t("एक फ़ाइल की सीमा (MB)", "Per-file limit (MB)")}</Label>
            <Input
              id={`${kind}-limit`}
              type="number"
              value={profile.maxUploadMb}
              onChange={(event) => set(kind, { maxUploadMb: Number(event.target.value) })}
            />
            {errors[`${kind}.maxUploadMb`] ? (
              <p className="text-[11.5px] text-destructive">{errors[`${kind}.maxUploadMb`]}</p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <Button
              variant="outline"
              size="sm"
              disabled={testing !== null || profile.provider === "none"}
              onClick={() => void test(kind)}
            >
              <IconPlugConnected className="size-4" />
              {testing === kind ? t("जांचा जा रहा है…", "Checking…") : t("कनेक्शन जांचें", "Test connection")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {loadError ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" /> {loadError}
        </p>
      ) : null}

      {profileCard(
        "portal",
        t("पोर्टल के असेट", "Portal assets"),
        t(
          "लोगो, कैटेगरी और टॉपिक के आइकॉन — छोटी फ़ाइलें, फ्री टियर में आराम से।",
          "Logos, category and topic icons — small files that fit a free tier.",
        ),
        usage.portal ?? { files: 0, bytes: 0 },
      )}

      {profileCard(
        "news",
        t("न्यूज़ मीडिया", "News media"),
        t(
          "खबरों की फोटो, वीडियो और रील — ये बढ़ते रहते हैं, इसलिए अलग जगह रख सकते हैं।",
          "Story photos, video and reels — these keep growing, so they can live somewhere else.",
        ),
        usage.news ?? { files: 0, bytes: 0 },
      )}

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-0">
          <p className="max-w-xl text-[11.5px] leading-relaxed text-text-muted">
            {t(
              "स्टोरेज सेट न हो तो पोर्टल के छोटे आइकॉन डेटाबेस में ही सेव हो जाते हैं, ताकि काम रुके नहीं। न्यूज़ मीडिया के लिए स्टोरेज ज़रूरी है। फ़ाइल डिलीट करने पर वो स्टोरेज से भी हट जाती है।",
              "With no storage configured, small portal icons are kept inline in the database so nothing is blocked. News media needs real storage. Deleting a file here removes it from storage too.",
            )}
          </p>
          <Button disabled={saving} onClick={() => void save()}>
            <IconDeviceFloppy className="size-4" />
            {saving ? t("सेव हो रहा है…", "Saving…") : t("सेव करें", "Save")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
