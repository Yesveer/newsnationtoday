"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IconAlertTriangle,
  IconCloud,
  IconDeviceFloppy,
  IconPlugConnected,
  IconPlus,
  IconStar,
  IconTrash,
} from "@tabler/icons-react";
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
  bucket: "",
  endpoint: "",
  region: "auto",
  publicBaseUrl: "",
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

  const [settings, setSettings] = useState<api.StorageSettings>({ portal: emptyProfile, news: [] });
  const [usage, setUsage] = useState<api.MediaUsage>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Keyed by "portal" or a destination's index, so two cards can be tested
  // one after another without the spinner landing on the wrong one.
  const [testing, setTesting] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const result = await api.getStorageSettings();
      return {
        settings: {
          portal: { ...result.storage.portal, apiSecret: "" },
          news: result.storage.news.map((destination) => ({ ...destination, apiSecret: "" })),
        },
        usage: result.usage,
        error: null as string | null,
      };
    } catch (error) {
      return {
        settings: { portal: emptyProfile, news: [] },
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

  const setPortal = (partial: Partial<api.StorageProfile>) =>
    setSettings((current) => ({ ...current, portal: { ...current.portal, ...partial } }));

  const setNews = (index: number, partial: Partial<api.NewsDestination>) =>
    setSettings((current) => ({
      ...current,
      news: current.news.map((destination, i) =>
        i === index ? { ...destination, ...partial } : destination,
      ),
    }));

  // Exactly one destination is pre-selected in the editor.
  const makeDefault = (index: number) =>
    setSettings((current) => ({
      ...current,
      news: current.news.map((destination, i) => ({ ...destination, default: i === index })),
    }));

  const addDestination = () =>
    setSettings((current) => ({
      ...current,
      news: [
        ...current.news,
        {
          // A blank id tells the server to mint one from the label; an
          // existing id is never regenerated, because assets point at it.
          id: "",
          label: "",
          default: current.news.length === 0,
          ...emptyProfile,
          folder: "news-nation/news",
          maxUploadMb: 50,
        },
      ],
    }));

  const removeDestination = (index: number) =>
    setSettings((current) => {
      const news = current.news.filter((_, i) => i !== index);
      if (news.length > 0 && !news.some((destination) => destination.default)) {
        news[0] = { ...news[0], default: true };
      }
      return { ...current, news };
    });

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const saved = await api.saveStorageSettings(settings);
      setSettings({
        portal: { ...saved.portal, apiSecret: "" },
        news: saved.news.map((destination) => ({ ...destination, apiSecret: "" })),
      });
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

  const test = async (kind: api.AssetKind, slot: string, profile: api.StorageProfile, id?: string) => {
    setTesting(slot);
    try {
      const result = await api.testStorage(kind, profile, id);
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
    slot: string,
    profile: api.StorageProfile,
    set: (partial: Partial<api.StorageProfile>) => void,
    errorPrefix: string,
    title: React.ReactNode,
    description: string,
    stored: { files: number; bytes: number },
    destinationId?: string,
    headerExtra?: React.ReactNode,
  ) => {
    return (
      // `slot` is the list key. Two destinations added before a save both
      // have a blank id, so the index disambiguates them; everything saved
      // keys on its own id and survives a reorder.
      <Card key={slot}>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
                <IconCloud className="size-4 text-accent" /> {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-text-muted">
                {stored.files} {t("फ़ाइलें", "files")} · {formatBytes(stored.bytes)}
              </span>
              {headerExtra}
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("सेवा", "Provider")}</Label>
            <Select
              value={profile.provider}
              onValueChange={(value) => set({ provider: value as api.StorageProfile["provider"] })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="s3">
                  {t("Cloudflare R2 / S3", "Cloudflare R2 / S3-compatible")}
                </SelectItem>
                <SelectItem value="cloudinary">Cloudinary</SelectItem>
                <SelectItem value="none">{t("कोई नहीं", "None")}</SelectItem>
              </SelectContent>
            </Select>
            {errors[`${errorPrefix}.provider`] ? (
              <p className="text-[11.5px] text-destructive">{errors[`${errorPrefix}.provider`]}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${slot}-folder`}>{t("फ़ोल्डर", "Folder")}</Label>
            <Input
              id={`${slot}-folder`}
              value={profile.folder}
              onChange={(event) => set({ folder: event.target.value })}
              placeholder={kind === "portal" ? "news-nation/portal" : "news-nation/news"}
              className="font-mono text-[13px]"
            />
          </div>
          {profile.provider === "cloudinary" ? (
            <div className="space-y-1.5">
              <Label htmlFor={`${slot}-cloud`}>{t("क्लाउड नाम", "Cloud name")}</Label>
              <Input
                id={`${slot}-cloud`}
                value={profile.cloudName}
                onChange={(event) => set({ cloudName: event.target.value })}
                placeholder="dxxxxxxxx"
              />
              {errors[`${errorPrefix}.cloudName`] ? (
                <p className="text-[11.5px] text-destructive">{errors[`${errorPrefix}.cloudName`]}</p>
              ) : null}
            </div>
          ) : null}

          {/* R2 and friends need where the bucket lives, and separately where
              readers load from — on R2 those are two different hosts. */}
          {profile.provider === "s3" ? (
            <>
              <div className="space-y-1.5">
                <Label htmlFor={`${slot}-bucket`}>{t("बकेट", "Bucket")}</Label>
                <Input
                  id={`${slot}-bucket`}
                  value={profile.bucket ?? ""}
                  onChange={(event) => set({ bucket: event.target.value })}
                  placeholder="news-media"
                  className="font-mono text-[13px]"
                />
                {errors[`${errorPrefix}.bucket`] ? (
                  <p className="text-[11.5px] text-destructive">{errors[`${errorPrefix}.bucket`]}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${slot}-endpoint`}>{t("एंडपॉइंट", "Endpoint")}</Label>
                <Input
                  id={`${slot}-endpoint`}
                  value={profile.endpoint ?? ""}
                  onChange={(event) => set({ endpoint: event.target.value })}
                  placeholder="https://<account-id>.r2.cloudflarestorage.com"
                  className="font-mono text-[12.5px]"
                />
                {errors[`${errorPrefix}.endpoint`] ? (
                  <p className="text-[11.5px] text-destructive">{errors[`${errorPrefix}.endpoint`]}</p>
                ) : null}
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor={`${slot}-public`}>
                  {t("पब्लिक URL", "Public URL")}
                </Label>
                <Input
                  id={`${slot}-public`}
                  value={profile.publicBaseUrl ?? ""}
                  onChange={(event) => set({ publicBaseUrl: event.target.value })}
                  placeholder="https://media.newsnationtoday.in"
                  className="font-mono text-[12.5px]"
                />
                <p className="text-[11px] text-text-muted">
                  {t(
                    "पाठक यहीं से फ़ाइल लोड करेंगे। R2 में बकेट का एंडपॉइंट पब्लिक नहीं होता — Cloudflare में बकेट पर एक कस्टम डोमेन जोड़िए (या r2.dev चालू कीजिए) और वही पता यहाँ डालिए।",
                    "This is where readers load files from. An R2 bucket endpoint is not public — attach a custom domain to the bucket in Cloudflare (or turn on r2.dev) and put that address here.",
                  )}
                </p>
                {errors[`${errorPrefix}.publicBaseUrl`] ? (
                  <p className="text-[11.5px] text-destructive">{errors[`${errorPrefix}.publicBaseUrl`]}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`${slot}-region`}>{t("रीजन", "Region")}</Label>
                <Input
                  id={`${slot}-region`}
                  value={profile.region ?? ""}
                  onChange={(event) => set({ region: event.target.value })}
                  placeholder="auto"
                  className="font-mono text-[13px]"
                />
                <p className="text-[11px] text-text-muted">
                  {t("R2 के लिए auto छोड़ दीजिए।", "Leave as auto for R2.")}
                </p>
              </div>
            </>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor={`${slot}-key`}>
              {profile.provider === "s3" ? t("एक्सेस की ID", "Access key ID") : "API key"}
            </Label>
            <Input
              id={`${slot}-key`}
              value={profile.apiKey}
              onChange={(event) => set({ apiKey: event.target.value })}
              autoComplete="off"
            />
            {errors[`${errorPrefix}.apiKey`] ? (
              <p className="text-[11.5px] text-destructive">{errors[`${errorPrefix}.apiKey`]}</p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${slot}-secret`}>
              {profile.provider === "s3" ? t("सीक्रेट एक्सेस की", "Secret access key") : "API secret"}
            </Label>
            <Input
              id={`${slot}-secret`}
              type="password"
              value={profile.apiSecret ?? ""}
              onChange={(event) => set({ apiSecret: event.target.value })}
              placeholder={
                profile.hasSecret
                  ? t("सेव है — बदलना हो तभी भरें", "Saved — fill only to change it")
                  : profile.provider === "s3"
                    ? t("बकेट का सीक्रेट", "Your bucket's secret access key")
                    : t("Cloudinary का API secret", "Your Cloudinary API secret")
              }
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${slot}-limit`}>{t("एक फ़ाइल की सीमा (MB)", "Per-file limit (MB)")}</Label>
            <Input
              id={`${slot}-limit`}
              type="number"
              value={profile.maxUploadMb}
              onChange={(event) => set({ maxUploadMb: Number(event.target.value) })}
            />
            {errors[`${errorPrefix}.maxUploadMb`] ? (
              <p className="text-[11.5px] text-destructive">{errors[`${errorPrefix}.maxUploadMb`]}</p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <Button
              variant="outline"
              size="sm"
              disabled={testing !== null || profile.provider === "none"}
              onClick={() => void test(kind, slot, profile, destinationId)}
            >
              <IconPlugConnected className="size-4" />
              {testing === slot ? t("जांचा जा रहा है…", "Checking…") : t("कनेक्शन जांचें", "Test connection")}
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
        "portal",
        settings.portal,
        setPortal,
        "portal",
        t("पोर्टल के असेट", "Portal assets"),
        t(
          "लोगो, कैटेगरी और टॉपिक के आइकॉन — छोटी फ़ाइलें, फ्री टियर में आराम से।",
          "Logos, category and topic icons — small files that fit a free tier.",
        ),
        usage.portal ?? { files: 0, bytes: 0 },
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div>
          <h3 className="font-display text-base font-bold">{t("न्यूज़ मीडिया", "News media")}</h3>
          <p className="text-[12.5px] text-text-muted">
            {t(
              "खबरों की फोटो और वीडियो। एक से ज़्यादा जगह रख सकते हैं — खबर लिखते समय रिपोर्टर चुनेगा कि कहाँ जाए।",
              "Story photos and video. You can keep more than one — the reporter picks where it goes while writing.",
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={addDestination}>
          <IconPlus className="size-4" /> {t("जगह जोड़ें", "Add destination")}
        </Button>
      </div>

      {errors.news ? (
        <p className="text-[12px] text-destructive">{errors.news}</p>
      ) : null}

      {settings.news.map((destination, index) =>
        profileCard(
          "news",
          destination.id || `new-${index}`,
          destination,
          (partial) => setNews(index, partial),
          `news.${index}`,
          <Input
            value={destination.label}
            onChange={(event) => setNews(index, { label: event.target.value })}
            placeholder={t("जैसे: मुख्य बकेट", "e.g. Main bucket")}
            className="h-8 w-48 font-semibold"
          />,
          t(
            "रिपोर्टर इस नाम से इसे चुनेगा।",
            "The reporter picks this by name while writing a story.",
          ),
          usage[destination.id] ?? { files: 0, bytes: 0 },
          destination.id,
          <div className="flex items-center gap-1.5">
            <Button
              variant={destination.default ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-[11.5px]"
              onClick={() => makeDefault(index)}
            >
              {destination.default ? (
                <>
                  <IconStar className="size-3.5" /> {t("डिफ़ॉल्ट", "Default")}
                </>
              ) : (
                t("डिफ़ॉल्ट बनाएं", "Make default")
              )}
            </Button>
            {settings.news.length > 1 ? (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("हटाएं", "Remove")}
                className="text-text-muted hover:text-destructive"
                onClick={() => removeDestination(index)}
              >
                <IconTrash className="size-4" />
              </Button>
            ) : null}
          </div>,
        ),
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
