"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { IconAlertTriangle, IconDeviceFloppy, IconMail, IconSend } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { useAdminSession } from "@/components/admin/admin-session";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";

const emptySettings: api.SmtpSettings = {
  enabled: false,
  host: "",
  port: 587,
  username: "",
  password: "",
  encryption: "starttls",
  fromName: "",
  fromEmail: "",
  replyTo: "",
  portalUrl: "",
  notify: {
    userInvited: true,
    passwordReset: true,
    storySubmitted: true,
    storyPublished: true,
    storyChanges: true,
    storyRejected: true,
    deleteRequest: true,
    accountStatus: true,
  },
};

/** SMTP configuration and the list of emails the newsroom sends.
 *
 *  Administrator-only. The password is write-only: the API accepts it and
 *  never hands it back, so this form shows "saved" rather than the secret. */
export function SmtpSettingsPanel() {
  const { t } = useAdminLang();
  const { user } = useAdminSession();

  const [settings, setSettings] = useState<api.SmtpSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testTo, setTestTo] = useState(user.email);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const stored = await api.getSmtpSettings();
      return { settings: { ...emptySettings, ...stored, password: "" }, error: null as string | null };
    } catch (error) {
      return {
        settings: emptySettings,
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
      setLoadError(result.error);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchSettings]);

  const set = (partial: Partial<api.SmtpSettings>) => setSettings((current) => ({ ...current, ...partial }));
  const setNotify = (partial: Partial<api.NotifySettings>) =>
    setSettings((current) => ({ ...current, notify: { ...current.notify, ...partial } }));

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const saved = await api.saveSmtpSettings(settings);
      setSettings({ ...emptySettings, ...saved, password: "" });
      toast.success(t("ईमेल सेटिंग्स सेव हो गईं", "Email settings saved"));
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

  const sendTest = async () => {
    setTesting(true);
    try {
      const result = await api.sendTestEmail(settings, testTo);
      toast.success(t("टेस्ट मेल भेज दिया", "Test email sent"), { description: result.message });
    } catch (error) {
      toast.error(t("टेस्ट मेल नहीं गया", "Test email failed"), {
        description: error instanceof ApiError ? error.message : undefined,
        duration: 10000,
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <Skeleton className="h-[460px] w-full" />;

  const notifications: { key: keyof api.NotifySettings; label: string; hint: string }[] = [
    {
      key: "userInvited",
      label: t("नया यूज़र बने", "A user is created"),
      hint: t("इनवाइट लिंक या पासवर्ड उसी को", "The invite link or password, to them"),
    },
    {
      key: "passwordReset",
      label: t("पासवर्ड रीसेट हो", "A password is reset"),
      hint: t("नया पासवर्ड उसी यूज़र को", "The new password, to that user"),
    },
    {
      key: "storySubmitted",
      label: t("खबर रिव्यू में आए", "A story is sent for review"),
      hint: t("सभी एडमिन को — अप्रूवल के लिए", "To every admin — for approval"),
    },
    {
      key: "storyPublished",
      label: t("खबर पब्लिश हो", "A story is published"),
      hint: t("रिपोर्टर को, लिंक के साथ", "To the reporter, with the link"),
    },
    {
      key: "storyChanges",
      label: t("बदलाव मांगे जाएं", "Changes are requested"),
      hint: t("रिपोर्टर को, कमेंट के साथ", "To the reporter, with the note"),
    },
    {
      key: "storyRejected",
      label: t("खबर रिजेक्ट हो", "A story is rejected"),
      hint: t("रिपोर्टर को, वजह के साथ", "To the reporter, with the reason"),
    },
    {
      key: "deleteRequest",
      label: t("डिलीट रिक्वेस्ट और फ़ैसला", "Delete requests and decisions"),
      hint: t("एडमिन को रिक्वेस्ट, रिपोर्टर को फ़ैसला", "Request to admins, decision to the reporter"),
    },
    {
      key: "accountStatus",
      label: t("अकाउंट सस्पेंड / बहाल हो", "An account is suspended or restored"),
      hint: t("उसी यूज़र को", "To that user"),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {loadError ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" /> {loadError}
        </p>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
                <IconMail className="size-4 text-accent" /> {t("SMTP सर्वर", "SMTP server")}
              </CardTitle>
              <CardDescription>
                {t(
                  "न्यूज़रूम यहीं से ईमेल भेजता है — इनवाइट, पासवर्ड और अप्रूवल की सूचनाएं।",
                  "This is how the newsroom sends email — invites, passwords and approval notices.",
                )}
              </CardDescription>
            </div>
            <span className="flex items-center gap-2">
              <span className="text-[12.5px] text-text-muted">{t("चालू", "Enabled")}</span>
              <Switch checked={settings.enabled} onCheckedChange={(checked) => set({ enabled: checked })} />
            </span>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="smtp-host">{t("होस्ट", "Host")}</Label>
            <Input
              id="smtp-host"
              value={settings.host}
              onChange={(event) => set({ host: event.target.value })}
              placeholder="smtp.gmail.com"
            />
            {errors.host ? <p className="text-[11.5px] text-destructive">{errors.host}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="smtp-port">{t("पोर्ट", "Port")}</Label>
              <Input
                id="smtp-port"
                type="number"
                value={settings.port}
                onChange={(event) => set({ port: Number(event.target.value) })}
              />
              {errors.port ? <p className="text-[11.5px] text-destructive">{errors.port}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label>{t("एन्क्रिप्शन", "Encryption")}</Label>
              <Select
                value={settings.encryption}
                onValueChange={(value) => set({ encryption: value as api.SmtpSettings["encryption"] })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starttls">STARTTLS (587)</SelectItem>
                  <SelectItem value="tls">TLS (465)</SelectItem>
                  <SelectItem value="none">{t("कोई नहीं", "None")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="smtp-username">{t("यूज़रनेम", "Username")}</Label>
            <Input
              id="smtp-username"
              value={settings.username}
              onChange={(event) => set({ username: event.target.value })}
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="smtp-password">{t("पासवर्ड", "Password")}</Label>
            <Input
              id="smtp-password"
              type="password"
              value={settings.password ?? ""}
              onChange={(event) => set({ password: event.target.value })}
              placeholder={
                settings.hasPassword
                  ? t("सेव है — बदलना हो तभी भरें", "Saved — fill only to change it")
                  : t("ऐप पासवर्ड", "App password")
              }
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="smtp-from-name">{t("भेजने वाले का नाम", "From name")}</Label>
            <Input
              id="smtp-from-name"
              value={settings.fromName}
              onChange={(event) => set({ fromName: event.target.value })}
              placeholder="News Nation Today"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="smtp-from-email">{t("भेजने वाला ईमेल", "From email")}</Label>
            <Input
              id="smtp-from-email"
              type="email"
              value={settings.fromEmail}
              onChange={(event) => set({ fromEmail: event.target.value })}
              placeholder="no-reply@newsnationtoday.in"
            />
            {errors.fromEmail ? <p className="text-[11.5px] text-destructive">{errors.fromEmail}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="smtp-reply-to">{t("जवाब इस पते पर (वैकल्पिक)", "Reply-to (optional)")}</Label>
            <Input
              id="smtp-reply-to"
              type="email"
              value={settings.replyTo ?? ""}
              onChange={(event) => set({ replyTo: event.target.value })}
            />
            {errors.replyTo ? <p className="text-[11.5px] text-destructive">{errors.replyTo}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="smtp-portal">{t("पोर्टल का पता", "Portal address")}</Label>
            <Input
              id="smtp-portal"
              value={settings.portalUrl}
              onChange={(event) => set({ portalUrl: event.target.value })}
              placeholder="https://newsnationtoday.vercel.app"
            />
            <p className="text-[11px] text-text-muted">
              {t("ईमेल के अंदर के लिंक इसी से बनते हैं।", "Links inside emails are built from this.")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base font-bold">{t("कौन-कौन से मेल जाएं", "Which emails go out")}</CardTitle>
          <CardDescription>
            {t("किसी एक को बंद करना हो तो पूरा ईमेल बंद करने की ज़रूरत नहीं।", "Switch one off without turning email off.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0">
          {notifications.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-[13.5px] font-medium text-text">{item.label}</p>
                <p className="text-[11.5px] text-text-muted">{item.hint}</p>
              </div>
              <Switch
                checked={settings.notify[item.key]}
                onCheckedChange={(checked) => setNotify({ [item.key]: checked })}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base font-bold">{t("टेस्ट करें", "Test it")}</CardTitle>
          <CardDescription>
            {t(
              "सेव करने से पहले ही इन्हीं सेटिंग्स से एक मेल भेज कर देख लीजिए।",
              "Send one email with these settings, even before saving them.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-2 pt-0">
          <div className="min-w-[240px] flex-1 space-y-1.5">
            <Label htmlFor="smtp-test-to">{t("किसे भेजें", "Send to")}</Label>
            <Input
              id="smtp-test-to"
              type="email"
              value={testTo}
              onChange={(event) => setTestTo(event.target.value)}
            />
          </div>
          <Button variant="outline" disabled={testing} onClick={() => void sendTest()}>
            <IconSend className="size-4" />
            {testing ? t("भेजा जा रहा है…", "Sending…") : t("टेस्ट मेल भेजें", "Send test email")}
          </Button>
          <Button disabled={saving} onClick={() => void save()}>
            <IconDeviceFloppy className="size-4" />
            {saving ? t("सेव हो रहा है…", "Saving…") : t("सेव करें", "Save")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
