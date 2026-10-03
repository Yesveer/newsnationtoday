"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandX,
  IconBrandYoutube,
  IconAlertTriangle,
  IconDeviceFloppy,
  IconCloud,
  IconMail,
  IconWorld,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/admin/page-header";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { useAdminSession } from "@/components/admin/admin-session";
import { SmtpSettingsPanel } from "@/components/admin/smtp-settings";
import { StorageSettingsPanel } from "@/components/admin/storage-settings";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import { defaultAppearance } from "@/config/appearance.config";
import type { SiteSettings } from "@/lib/data/get-site-config";
import { siteConfig } from "@/config/site";

export function SettingsView() {
  const { t } = useAdminLang();
  // Mail settings carry a password, so they stay with the administrator.
  const { can } = useAdminSession();
  // Identity, contact, SEO and the switches all live in the same site
  // configuration document the Appearance screen edits.
  const [settings, setSettings] = useState<SiteSettings>(defaultAppearance);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState("general");
  // Tabs that write through this page's own Save button.
  const ownsSave = !["email", "media"].includes(tab);

  const fetchConfig = useCallback(async () => {
    try {
      const result = await api.getSiteConfig<SiteSettings>();
      return { config: { ...defaultAppearance, ...result.config }, error: null as string | null };
    } catch (apiError) {
      return {
        config: defaultAppearance as SiteSettings,
        error:
          apiError instanceof ApiError
            ? apiError.message
            : t("सर्वर से संपर्क नहीं हो पाया।", "Could not reach the server."),
      };
    }
  }, [t]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await fetchConfig();
      if (!active) return;
      setSettings(result.config);
      setError(result.error);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [fetchConfig]);

  const brand = settings.brand;
  const contact = settings.contact ?? {};
  const seo = settings.seo ?? {};
  const advanced = settings.advanced ?? {};

  const patch = (partial: Partial<SiteSettings>) =>
    setSettings((current) => ({ ...current, ...partial }));

  const save = async () => {
    setSaving(true);
    try {
      const result = await api.saveSiteConfig(settings);
      setSettings({ ...defaultAppearance, ...result.config });
      toast.success(t("सेटिंग्स सेव हो गईं", "Settings saved"), {
        description: t("वेबसाइट पर लागू हो गया है।", "It is live on the website."),
      });
    } catch (apiError) {
      toast.error(apiError instanceof ApiError ? apiError.message : t("सेव नहीं हुआ", "Could not save"));
    } finally {
      setSaving(false);
    }
  };

  const socials = [
    { key: "twitter", label: "X (Twitter)", icon: IconBrandX, value: siteConfig.social.twitter },
    { key: "facebook", label: "Facebook", icon: IconBrandFacebook, value: siteConfig.social.facebook },
    { key: "instagram", label: "Instagram", icon: IconBrandInstagram, value: siteConfig.social.instagram },
    { key: "youtube", label: "YouTube", icon: IconBrandYoutube, value: siteConfig.social.youtube },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("साइट सेटिंग्स", "Site settings")}
        description={t(
          "साइट की पहचान, संपर्क, सोशल लिंक और SEO — सब एक जगह।",
          "The site's identity, contact details, social links and SEO — all in one place.",
        )}
        actions={
          // The Email and Media panels have their own Save and write to their
          // own endpoints. Showing this one next to them meant a filled-in
          // Cloudinary form could be "saved" by a button that never sends it.
          ownsSave ? (
            <Button size="sm" disabled={saving || loading} onClick={() => void save()}>
              <IconDeviceFloppy className="size-4" />
              {saving ? t("सेव हो रहा है…", "Saving…") : t("सेव करें", "Save")}
            </Button>
          ) : null
        }
      />

      {error ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" /> {error}
        </p>
      ) : null}

      {loading ? <Skeleton className="h-[420px] w-full" /> : (
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex w-full flex-wrap justify-start gap-1 rounded-lg">
          <TabsTrigger value="general" className="rounded-md text-[13px]">{t("सामान्य", "General")}</TabsTrigger>
          <TabsTrigger value="social" className="rounded-md text-[13px]">{t("सोशल", "Social")}</TabsTrigger>
          <TabsTrigger value="seo" className="rounded-md text-[13px]">SEO</TabsTrigger>
          {can("users.manage") ? (
            <TabsTrigger value="email" className="rounded-md text-[13px]">
              <IconMail className="size-3.5" /> {t("ईमेल", "Email")}
            </TabsTrigger>
          ) : null}
          {can("users.manage") ? (
            <TabsTrigger value="media" className="rounded-md text-[13px]">
              <IconCloud className="size-3.5" /> {t("मीडिया", "Media")}
            </TabsTrigger>
          ) : null}
          <TabsTrigger value="advanced" className="rounded-md text-[13px]">{t("एडवांस", "Advanced")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base font-bold">{t("साइट की पहचान", "Site identity")}</CardTitle>
              <CardDescription>
                {t("यह नाम हेडर, टैब और शेयर कार्ड पर दिखता है।", "This name shows in the header, browser tab and share cards.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="site-name">{t("साइट का नाम", "Site name")}</Label>
                <Input
                  id="site-name"
                  value={brand.siteName}
                  onChange={(event) => patch({ brand: { ...brand, siteName: event.target.value } })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="site-tagline">{t("टैगलाइन", "Tagline")}</Label>
                <Input
                  id="site-tagline"
                  value={brand.tagline}
                  onChange={(event) => patch({ brand: { ...brand, tagline: event.target.value } })}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="site-desc">{t("विवरण", "Description")}</Label>
                <Textarea
                  id="site-desc"
                  rows={3}
                  value={seo.metaDescription ?? siteConfig.description}
                  onChange={(event) => patch({ seo: { ...seo, metaDescription: event.target.value } })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="site-url" className="flex items-center gap-1.5">
                  <IconWorld className="size-4" /> {t("वेबसाइट URL", "Website URL")}
                </Label>
                <Input
                  id="site-url"
                  value={contact.url ?? siteConfig.url}
                  onChange={(event) => patch({ contact: { ...contact, url: event.target.value } })}
                  className="font-mono text-[13px]"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="site-email" className="flex items-center gap-1.5">
                  <IconMail className="size-4" /> {t("न्यूज़रूम ईमेल", "Newsroom email")}
                </Label>
                <Input
                  id="site-email"
                  value={contact.email ?? siteConfig.email}
                  onChange={(event) => patch({ contact: { ...contact, email: event.target.value } })}
                  className="font-mono text-[13px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base font-bold">{t("सोशल लिंक", "Social links")}</CardTitle>
              <CardDescription>
                {t("ये लिंक साइडबार और फ़ुटर में दिखते हैं।", "These appear in the sidebar and the footer.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              {socials.map((social) => (
                <div key={social.key} className="space-y-1.5">
                  <Label htmlFor={`social-${social.key}`} className="flex items-center gap-1.5">
                    <social.icon className="size-4" /> {social.label}
                  </Label>
                  <Input
                    id={`social-${social.key}`}
                    value={contact.social?.[social.key] ?? social.value}
                    onChange={(event) =>
                      patch({
                        contact: {
                          ...contact,
                          social: { ...(contact.social ?? {}), [social.key]: event.target.value },
                        },
                      })
                    }
                    className="font-mono text-[13px]"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base font-bold">{t("SEO डिफ़ॉल्ट", "SEO defaults")}</CardTitle>
              <CardDescription>
                {t("जिन खबरों का अपना SEO नहीं भरा, उन पर यही लगेगा।", "Used for any story that doesn't set its own SEO.")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              <div className="space-y-1.5">
                <Label htmlFor="seo-title">{t("डिफ़ॉल्ट मेटा टाइटल", "Default meta title")}</Label>
                <Input
                  id="seo-title"
                  value={seo.metaTitle ?? `${brand.siteName} — ${brand.tagline}`}
                  onChange={(event) => patch({ seo: { ...seo, metaTitle: event.target.value } })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seo-desc">{t("डिफ़ॉल्ट मेटा डिस्क्रिप्शन", "Default meta description")}</Label>
                <Textarea
                  id="seo-desc"
                  rows={3}
                  value={seo.metaDescription ?? siteConfig.description}
                  onChange={(event) => patch({ seo: { ...seo, metaDescription: event.target.value } })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="seo-ga">{t("एनालिटिक्स ID", "Analytics ID")}</Label>
                <Input
                  id="seo-ga"
                  placeholder="G-XXXXXXXXXX"
                  value={seo.analyticsId ?? ""}
                  onChange={(event) => patch({ seo: { ...seo, analyticsId: event.target.value } })}
                  className="font-mono text-[13px]"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <div>
                  <p className="text-[13.5px] font-medium text-text">
                    {t("सर्च इंजन पर दिखें", "Allow search engines")}
                  </p>
                  <p className="text-[11.5px] text-text-muted">
                    {t("बंद करने पर robots.txt सब कुछ ब्लॉक कर देगा।", "Turning this off makes robots.txt block everything.")}
                  </p>
                </div>
                <Switch
                  checked={seo.indexing ?? true}
                  onCheckedChange={(checked) => patch({ seo: { ...seo, indexing: checked } })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {can("users.manage") ? (
          <TabsContent value="email" className="mt-3">
            <SmtpSettingsPanel />
          </TabsContent>
        ) : null}

        {can("users.manage") ? (
          <TabsContent value="media" className="mt-3">
            <StorageSettingsPanel />
          </TabsContent>
        ) : null}

        <TabsContent value="advanced" className="mt-3">
          <Card>
            <CardHeader>
              <CardTitle className="font-display text-base font-bold">{t("एडवांस", "Advanced")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <div>
                  <p className="text-[13.5px] font-medium text-text">{t("पाठकों के कमेंट", "Reader comments")}</p>
                  <p className="text-[11.5px] text-text-muted">
                    {t("खबर के नीचे कमेंट सेक्शन दिखेगा।", "Shows a comment section under each story.")}
                  </p>
                </div>
                <Switch
                  checked={advanced.comments ?? true}
                  onCheckedChange={(checked) => patch({ advanced: { ...advanced, comments: checked } })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-amber-500/40 bg-amber-500/5 px-3 py-2.5">
                <div>
                  <p className="text-[13.5px] font-medium text-text">{t("मेंटेनेंस मोड", "Maintenance mode")}</p>
                  <p className="text-[11.5px] text-text-muted">
                    {t("पाठकों को सिर्फ़ “जल्द लौटेंगे” पेज दिखेगा।", "Readers only see a “back soon” page.")}
                  </p>
                </div>
                <Switch
                  checked={advanced.maintenance ?? false}
                  onCheckedChange={(checked) => patch({ advanced: { ...advanced, maintenance: checked } })}
                />
              </div>
              {advanced.maintenance ? (
                <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[12.5px] text-amber-700 dark:text-amber-400">
                  {t(
                    "ध्यान दें: सेव करते ही पूरी वेबसाइट पाठकों के लिए बंद हो जाएगी।",
                    "Careful: saving this takes the whole website offline for readers.",
                  )}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}
