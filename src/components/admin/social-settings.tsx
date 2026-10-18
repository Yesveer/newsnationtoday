"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IconAlertTriangle,
  IconBrandYoutube,
  IconCircleCheck,
  IconDeviceFloppy,
  IconPlugConnected,
  IconPlugConnectedX,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";

const emptySettings: api.SocialSettings = {
  youtube: {
    enabled: false,
    clientId: "",
    clientSecret: "",
    privacy: "public",
    categoryId: "25",
    tags: [],
    madeForKids: false,
    descriptionSuffix: "",
    postAutomatically: false,
  },
};

/** Where a published story also goes.
 *
 *  YouTube today. The channel is connected once through Google's consent
 *  screen; after that the server uploads on its own and nobody signs in
 *  again. The client secret and the refresh token are write-only — the API
 *  takes them and never returns them, the same as an SMTP password. */
export function SocialSettingsPanel() {
  const { t } = useAdminLang();

  const [settings, setSettings] = useState<api.SocialSettings>(emptySettings);
  const [redirectUri, setRedirectUri] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await api.getSocialSettings();
      return {
        settings: { youtube: { ...result.social.youtube, clientSecret: "" } },
        redirectUri: result.redirectUri,
        error: null as string | null,
      };
    } catch (error) {
      return {
        settings: emptySettings,
        redirectUri: "",
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
      const result = await load();
      if (!active) return;
      setSettings(result.settings);
      setRedirectUri(result.redirectUri);
      setLoadError(result.error);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [load]);

  const setYouTube = (partial: Partial<api.YouTubeSettings>) =>
    setSettings((current) => ({ ...current, youtube: { ...current.youtube, ...partial } }));

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const saved = await api.saveSocialSettings(settings);
      setSettings({ youtube: { ...saved.youtube, clientSecret: "" } });
      toast.success(t("सोशल सेटिंग्स सेव हो गईं", "Social settings saved"));
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

  const connect = async () => {
    setConnecting(true);
    try {
      // Save first: the consent link is built from the stored client id.
      await api.saveSocialSettings(settings);
      const url = await api.connectYouTube();
      window.location.href = url;
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : t("नहीं जुड़ पाया", "Could not connect"),
        { duration: 10000 },
      );
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      const saved = await api.disconnectYouTube();
      setSettings({ youtube: { ...saved.youtube, clientSecret: "" } });
      toast.success(t("YouTube हटा दिया गया", "YouTube disconnected"));
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t("नहीं हुआ", "That did not work"));
    }
  };

  if (loading) return <Skeleton className="h-[420px] w-full" />;

  const youtube = settings.youtube;

  return (
    <div className="flex flex-col gap-4">
      {loadError ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" /> {loadError}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="font-display flex items-center gap-2 text-base font-bold">
                <IconBrandYoutube className="size-4 text-[#ff0000]" /> YouTube
              </CardTitle>
              <CardDescription>
                {t(
                  "खबर पब्लिश होते ही उसका वीडियो अपने आप चैनल पर चला जाएगा।",
                  "When a story is published, its video goes up on the channel on its own.",
                )}
              </CardDescription>
            </div>
            <Switch
              checked={youtube.enabled}
              onCheckedChange={(checked) => setYouTube({ enabled: checked })}
            />
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 pt-0">
          {youtube.hasConnected ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
              <p className="flex items-center gap-2 text-[13px] text-emerald-700 dark:text-emerald-400">
                <IconCircleCheck className="size-4 shrink-0" />
                {t("चैनल जुड़ा है", "Channel connected")}
                {youtube.channelTitle ? (
                  <span className="font-semibold">· {youtube.channelTitle}</span>
                ) : null}
              </p>
              <Button variant="outline" size="sm" onClick={() => void disconnect()}>
                <IconPlugConnectedX className="size-4" /> {t("हटाएं", "Disconnect")}
              </Button>
            </div>
          ) : (
            <p className="rounded-lg border border-border bg-surface-muted/60 px-3 py-2 text-[12px] text-text-muted">
              {t(
                "अभी कोई चैनल नहीं जुड़ा। नीचे Google प्रोजेक्ट की डिटेल भरिए, फिर “चैनल जोड़ें” दबाइए।",
                "No channel connected yet. Fill in your Google project details below, then press Connect.",
              )}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="yt-client">{t("क्लाइंट ID", "Client ID")}</Label>
              <Input
                id="yt-client"
                value={youtube.clientId}
                onChange={(event) => setYouTube({ clientId: event.target.value })}
                placeholder="123456.apps.googleusercontent.com"
                className="font-mono text-[12.5px]"
              />
              {errors["youtube.clientId"] ? (
                <p className="text-[11.5px] text-destructive">{errors["youtube.clientId"]}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yt-secret">{t("क्लाइंट सीक्रेट", "Client secret")}</Label>
              <Input
                id="yt-secret"
                type="password"
                value={youtube.clientSecret ?? ""}
                onChange={(event) => setYouTube({ clientSecret: event.target.value })}
                placeholder={
                  youtube.hasSecret
                    ? t("सेव है — बदलना हो तभी भरें", "Saved — fill only to change it")
                    : "GOCSPX-…"
                }
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("रीडायरेक्ट URI", "Redirect URI")}</Label>
            <Input value={redirectUri} readOnly className="bg-surface-muted font-mono text-[12px]" />
            <p className="text-[11px] text-text-muted">
              {t(
                "यही पता Google Cloud Console में “Authorized redirect URIs” में डालिए — बिल्कुल वैसा ही, वरना कनेक्ट नहीं होगा।",
                "Put this exact address in “Authorized redirect URIs” in the Google Cloud Console — a mismatch is the usual reason connecting fails.",
              )}
            </p>
          </div>

          {!youtube.hasConnected ? (
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              disabled={connecting || !youtube.clientId}
              onClick={() => void connect()}
            >
              <IconPlugConnected className="size-4" />
              {connecting ? t("भेजा जा रहा है…", "Opening Google…") : t("चैनल जोड़ें", "Connect channel")}
            </Button>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("प्राइवेसी", "Privacy")}</Label>
              <Select
                value={youtube.privacy}
                onValueChange={(value) =>
                  setYouTube({ privacy: value as api.YouTubeSettings["privacy"] })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{t("सबके लिए", "Public")}</SelectItem>
                  <SelectItem value="unlisted">{t("लिंक वालों के लिए", "Unlisted")}</SelectItem>
                  <SelectItem value="private">{t("निजी", "Private")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="yt-tags">{t("हर वीडियो पर टैग", "Tags on every video")}</Label>
              <Input
                id="yt-tags"
                value={(youtube.tags ?? []).join(", ")}
                onChange={(event) =>
                  setYouTube({ tags: event.target.value.split(",").map((tag) => tag.trim()) })
                }
                placeholder={t("कॉमा से अलग करें", "Separate with commas")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="yt-suffix">{t("डिस्क्रिप्शन के आख़िर में", "Added to every description")}</Label>
            <Textarea
              id="yt-suffix"
              rows={2}
              value={youtube.descriptionSuffix}
              onChange={(event) => setYouTube({ descriptionSuffix: event.target.value })}
              placeholder={t("जैसे: और खबरों के लिए…", "e.g. For more news, visit…")}
            />
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5">
                <Label className="text-[13px]">
                  {t("नई खबर में डिफ़ॉल्ट रूप से चालू", "On by default for a new story")}
                </Label>
                <p className="text-[11px] text-text-muted">
                  {t(
                    "रिपोर्टर हर खबर में इसे बंद भी कर सकता है।",
                    "A reporter can still switch it off for any one story.",
                  )}
                </p>
              </div>
              <Switch
                checked={youtube.postAutomatically}
                onCheckedChange={(checked) => setYouTube({ postAutomatically: checked })}
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <Label className="text-[13px]">
                {t("बच्चों के लिए बना है", "Made for kids")}
              </Label>
              <Switch
                checked={youtube.madeForKids}
                onCheckedChange={(checked) => setYouTube({ madeForKids: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-0">
          <p className="max-w-xl text-[11.5px] leading-relaxed text-text-muted">
            {t(
              "खबर पब्लिश होने पर अपलोड शुरू होता है, सेव करने पर नहीं। रील बनी हो तो वही भेजी जाती है — वो Short बनती है और ज़्यादा लोगों तक पहुँचती है। डिस्क्रिप्शन में पूरी खबर टेक्स्ट में जाती है, कोई तस्वीर नहीं।",
              "The upload starts when a story is published, not when it is saved. If a reel exists that is what goes — it becomes a Short and reaches further. The description carries the whole story as text, no pictures.",
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
