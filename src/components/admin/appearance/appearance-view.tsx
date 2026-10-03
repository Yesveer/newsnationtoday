"use client";

import { useCallback, useEffect, useState } from "react";
import { SafeImage as Image } from "@/components/ui/safe-image";
import { toast } from "sonner";
import {
  IconArrowDown,
  IconArrowUp,
  IconDeviceFloppy,
  IconDeviceMobile,
  IconLanguage,
  IconEye,
  IconLayoutSidebar,
  IconPalette,
  IconPhotoUp,
  IconAlertTriangle,
  IconRefresh,
  IconTypography,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PageHeader } from "@/components/admin/page-header";
import { AppearancePreview } from "@/components/admin/appearance/appearance-preview";
import { LanguageSettingsPanel } from "@/components/admin/appearance/language-settings";
import { defaultAppearance, type NavItemSetting } from "@/config/appearance.config";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import * as api from "@/lib/api/admin";
import { useRef } from "react";
import type { SiteSettings } from "@/lib/data/get-site-config";

const accentSwatches = ["#FF5C00", "#E23744", "#7C3AED", "#0EA5E9", "#16A34A", "#F59E0B", "#EC4899"];

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-[13.5px] font-medium text-text">{label}</p>
        {description ? <p className="text-[11.5px] text-text-muted">{description}</p> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export function AppearanceView() {
  const { t } = useAdminLang();
  // This is the live site configuration from the database — saving it changes
  // what every reader sees.
  const [settings, setSettings] = useState<SiteSettings>(defaultAppearance);
  const logoInput = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // The logo goes to the portal storage profile, same as category icons.
  const uploadLogo = async (file: File) => {
    setUploadingLogo(true);
    try {
      const asset = await api.uploadMedia(file, "portal");
      update("brand", { logoUrl: asset.url });
      toast.success(t("लोगो अपलोड हो गया", "Logo uploaded"), {
        description: t("सेव करना न भूलें।", "Remember to save."),
      });
    } catch (apiError) {
      toast.error(
        apiError instanceof ApiError ? apiError.message : t("अपलोड नहीं हुआ", "The upload did not go through"),
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const result = await api.saveSiteConfig(settings);
      setSettings({ ...defaultAppearance, ...result.config });
      toast.success(t("अपीयरेंस सेव हो गया", "Appearance saved"), {
        description: t("वेबसाइट पर लागू हो गया है।", "It is live on the website."),
      });
    } catch (apiError) {
      toast.error(
        apiError instanceof ApiError ? apiError.message : t("सेव नहीं हुआ", "Could not save"),
      );
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    setSaving(true);
    try {
      const result = await api.resetSiteConfig<SiteSettings>();
      setSettings({ ...defaultAppearance, ...result.config });
      toast.success(t("डिफ़ॉल्ट पर लौटा दिया", "Reset to defaults"));
    } catch (apiError) {
      toast.error(apiError instanceof ApiError ? apiError.message : t("रीसेट नहीं हुआ", "Could not reset"));
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof SiteSettings>(
    key: K,
    patch: Partial<SiteSettings[K]>,
  ) => setSettings((current) => ({ ...current, [key]: { ...current[key], ...patch } }));

  const updateNavItem = (
    scope: "header" | "mobileDock",
    id: string,
    patch: Partial<NavItemSetting>,
  ) =>
    setSettings((current) => ({
      ...current,
      [scope]: {
        ...current[scope],
        navItems:
          scope === "header"
            ? current.header.navItems.map((item) => (item.id === id ? { ...item, ...patch } : item))
            : current.header.navItems,
        items:
          scope === "mobileDock"
            ? current.mobileDock.items.map((item) => (item.id === id ? { ...item, ...patch } : item))
            : undefined,
      },
    }));

  const moveSection = (index: number, direction: -1 | 1) =>
    setSettings((current) => {
      const sections = [...current.homepage.sections];
      const target = index + direction;
      if (target < 0 || target >= sections.length) return current;
      [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...current, homepage: { ...current.homepage, sections } };
    });

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={t("अपीयरेंस", "Appearance")}
        description={t(
          "वेबसाइट का लोगो, रंग, नेविगेशन, हीरो और होमपेज — सब कुछ यहीं से बदलता है।",
          "The site's logo, colours, navigation, hero and homepage — all change from here.",
        )}
        actions={
          <>
            <Button variant="outline" size="sm" disabled={saving || loading} onClick={() => void reset()}>
              <IconRefresh className="size-4" /> {t("रीसेट", "Reset")}
            </Button>
            <Button size="sm" disabled={saving || loading} onClick={() => void save()}>
              <IconDeviceFloppy className="size-4" />
              {saving ? t("सेव हो रहा है…", "Saving…") : t("सेव करें", "Save")}
            </Button>
          </>
        }
      />

      {error ? (
        <p className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
          <IconAlertTriangle className="size-4 shrink-0" /> {error}
        </p>
      ) : null}

      {loading ? <Skeleton className="h-[480px] w-full" /> : (
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Tabs defaultValue="brand" className="min-w-0">
          <TabsList className="flex w-full flex-wrap justify-start gap-1 rounded-lg">
            <TabsTrigger value="brand" className="rounded-md text-[13px]">
              <IconPhotoUp className="size-3.5" /> {t("ब्रांड", "Brand")}
            </TabsTrigger>
            <TabsTrigger value="theme" className="rounded-md text-[13px]">
              <IconPalette className="size-3.5" /> {t("थीम", "Theme")}
            </TabsTrigger>
            <TabsTrigger value="nav" className="rounded-md text-[13px]">
              <IconLayoutSidebar className="size-3.5" /> {t("नेविगेशन", "Navigation")}
            </TabsTrigger>
            <TabsTrigger value="home" className="rounded-md text-[13px]">
              <IconEye className="size-3.5" /> {t("होमपेज", "Homepage")}
            </TabsTrigger>
            <TabsTrigger value="mobile" className="rounded-md text-[13px]">
              <IconDeviceMobile className="size-3.5" /> {t("मोबाइल", "Mobile")}
            </TabsTrigger>
            <TabsTrigger value="languages" className="rounded-md text-[13px]">
              <IconLanguage className="size-3.5" /> {t("भाषा", "Languages")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="brand" className="mt-3 flex flex-col gap-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base font-bold">{t("लोगो और नाम", "Logo and name")}</CardTitle>
                <CardDescription>{t("हेडर, फ़ेविकॉन और शेयर कार्ड पर यही दिखेगा।", "This shows in the header, favicon and share cards.")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                <div className="flex items-center gap-4 rounded-lg border border-border p-3">
                  <span className="relative block h-16 w-32 shrink-0 rounded bg-surface-muted">
                    <Image src={settings.brand.logoUrl} alt="logo" fill className="object-contain p-1.5" sizes="128px" />
                  </span>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={logoInput}
                      type="file"
                      accept="image/png,image/svg+xml,image/webp"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadLogo(file);
                        event.target.value = "";
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={uploadingLogo}
                      onClick={() => logoInput.current?.click()}
                    >
                      <IconPhotoUp className="size-4" />
                      {uploadingLogo
                        ? t("अपलोड हो रहा है…", "Uploading…")
                        : t("नया लोगो अपलोड करें", "Upload a new logo")}
                    </Button>
                    <p className="text-[11px] text-text-muted">
                      {t("PNG या SVG · पारदर्शी बैकग्राउंड · कम से कम 900×300", "PNG or SVG · transparent background · at least 900×300")}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("साइट का नाम", "Site name")}</Label>
                  <Input
                    value={settings.brand.siteName}
                    onChange={(event) => update("brand", { siteName: event.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("टैगलाइन", "Tagline")}</Label>
                  <Input
                    value={settings.brand.tagline}
                    onChange={(event) => update("brand", { tagline: event.target.value })}
                  />
                </div>
                <div className="space-y-2 rounded-lg border border-border px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <Label>{t("लोगो का साइज़", "Logo size")}</Label>
                    <span className="text-[12px] tabular-nums text-text-muted">{settings.brand.logoSize}px</span>
                  </div>
                  <Slider
                    value={[settings.brand.logoSize]}
                    min={20}
                    max={60}
                    step={1}
                    onValueChange={([value]) => update("brand", { logoSize: value })}
                  />
                </div>
                <Row label={t("लोगो के नीचे नाम दिखाएं", "Show the name under the logo")}>
                  <Switch
                    checked={settings.brand.showNameUnderLogo}
                    onCheckedChange={(checked) => update("brand", { showNameUnderLogo: checked })}
                  />
                </Row>
                <Row
                  label={t("लोगो एनिमेशन", "Logo animation")}
                  description={t("शाइन स्वीप और एंट्री एनिमेशन", "Shine sweep and entry animation")}
                >
                  <Switch
                    checked={settings.brand.animateLogo}
                    onCheckedChange={(checked) => update("brand", { animateLogo: checked })}
                  />
                </Row>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme" className="mt-3 flex flex-col gap-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base font-bold">{t("रंग", "Colours")}</CardTitle>
                <CardDescription>{t("ब्रांड कलर पूरी वेबसाइट के बटन, लिंक और बैज पर लगता है।", "The brand colour drives every button, link and badge on the site.")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                <div className="space-y-2">
                  <Label>{t("एक्सेंट कलर", "Accent colour")}</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {accentSwatches.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => update("theme", { accent: color })}
                        aria-label={color}
                        className={`size-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          settings.theme.accent === color ? "border-text" : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <Input
                      value={settings.theme.accent}
                      onChange={(event) => update("theme", { accent: event.target.value })}
                      className="h-8 w-28 font-mono text-[12px]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("लाइव / ब्रेकिंग कलर", "Live / breaking colour")}</Label>
                  <div className="flex items-center gap-2">
                    <span className="size-8 rounded-full border border-border" style={{ backgroundColor: settings.theme.live }} />
                    <Input
                      value={settings.theme.live}
                      onChange={(event) => update("theme", { live: event.target.value })}
                      className="h-8 w-28 font-mono text-[12px]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("डिफ़ॉल्ट थीम", "Default theme")}</Label>
                  <RadioGroup
                    value={settings.theme.defaultMode}
                    onValueChange={(value) =>
                      update("theme", { defaultMode: value as SiteSettings["theme"]["defaultMode"] })
                    }
                    className="flex gap-4"
                  >
                    {[
                      { value: "light", label: t("लाइट", "Light") },
                      { value: "dark", label: t("डार्क", "Dark") },
                      { value: "system", label: t("सिस्टम", "System") },
                    ].map((option) => (
                      <div key={option.value} className="flex items-center gap-2">
                        <RadioGroupItem value={option.value} id={`mode-${option.value}`} />
                        <Label htmlFor={`mode-${option.value}`} className="text-[13px] font-normal">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-2 rounded-lg border border-border px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-1.5">
                      <IconTypography className="size-4" /> {t("फ़ॉन्ट साइज़", "Font size")}
                    </Label>
                    <span className="text-[12px] tabular-nums text-text-muted">{settings.theme.fontScale}%</span>
                  </div>
                  <Slider
                    value={[settings.theme.fontScale]}
                    min={90}
                    max={120}
                    step={5}
                    onValueChange={([value]) => update("theme", { fontScale: value })}
                  />
                </div>
                <div className="space-y-2 rounded-lg border border-border px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <Label>{t("कोनों की गोलाई", "Corner radius")}</Label>
                    <span className="text-[12px] tabular-nums text-text-muted">{settings.theme.radius}px</span>
                  </div>
                  <Slider
                    value={[settings.theme.radius]}
                    min={0}
                    max={20}
                    step={1}
                    onValueChange={([value]) => update("theme", { radius: value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nav" className="mt-3 flex flex-col gap-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base font-bold">{t("टॉप नेविगेशन", "Top navigation")}</CardTitle>
                <CardDescription>{t("हेडर में दिखने वाले लिंक और उनका क्रम।", "The links in the header and their order.")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-0">
                {settings.header.navItems.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2.5">
                    <Input
                      value={item.label}
                      onChange={(event) => updateNavItem("header", item.id, { label: event.target.value })}
                      className="h-8 w-28"
                    />
                    <Input
                      value={item.href}
                      onChange={(event) => updateNavItem("header", item.id, { href: event.target.value })}
                      className="h-8 w-32 font-mono text-[12px]"
                    />
                    <span className="ml-auto flex items-center gap-2">
                      <span className="text-[11.5px] text-text-muted">{t("दिखाएं", "Show")}</span>
                      <Switch
                        checked={item.visible}
                        onCheckedChange={(checked) => updateNavItem("header", item.id, { visible: checked })}
                      />
                    </span>
                  </div>
                ))}
                <div className="space-y-2 rounded-lg border border-border px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <Label>{t("हेडर की ऊँचाई", "Header height")}</Label>
                    <span className="text-[12px] tabular-nums text-text-muted">{settings.header.height}px</span>
                  </div>
                  <Slider
                    value={[settings.header.height]}
                    min={48}
                    max={88}
                    step={2}
                    onValueChange={([value]) => update("header", { height: value })}
                  />
                </div>
                <Row label={t("स्क्रॉल पर चिपका रहे", "Stick on scroll")}>
                  <Switch
                    checked={settings.header.sticky}
                    onCheckedChange={(checked) => update("header", { sticky: checked })}
                  />
                </Row>
                <Row
                  label={t("ग्लास इफ़ेक्ट", "Glass effect")}
                  description={t("बैकड्रॉप ब्लर के साथ पारदर्शी हेडर", "Translucent header with backdrop blur")}
                >
                  <Switch
                    checked={settings.header.glass}
                    onCheckedChange={(checked) => update("header", { glass: checked })}
                  />
                </Row>
                <Row label={t("भाषा बदलने का बटन", "Language switcher")}>
                  <Switch
                    checked={settings.header.showLanguageSwitch}
                    onCheckedChange={(checked) => update("header", { showLanguageSwitch: checked })}
                  />
                </Row>
                <Row label={t("सर्च बार", "Search bar")}>
                  <Switch
                    checked={settings.header.showSearch}
                    onCheckedChange={(checked) => update("header", { showSearch: checked })}
                  />
                </Row>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base font-bold">{t("साइडबार और राइट रेल", "Sidebar and right rail")}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5 pt-0">
                <Row label={t("कैटेगरी आइकॉन दिखाएं", "Show category icons")}>
                  <Switch
                    checked={settings.sidebar.showCategoryIcons}
                    onCheckedChange={(checked) => update("sidebar", { showCategoryIcons: checked })}
                  />
                </Row>
                <Row label={t("सोशल लिंक", "Social links")}>
                  <Switch
                    checked={settings.sidebar.showSocialLinks}
                    onCheckedChange={(checked) => update("sidebar", { showSocialLinks: checked })}
                  />
                </Row>
                <Row label={t("NEW बैज", "NEW badges")}>
                  <Switch
                    checked={settings.sidebar.showNewBadges}
                    onCheckedChange={(checked) => update("sidebar", { showNewBadges: checked })}
                  />
                </Row>
                <Row label={t("ट्रेंडिंग विजेट", "Trending widget")}>
                  <Switch
                    checked={settings.rail.trendingWidget}
                    onCheckedChange={(checked) => update("rail", { trendingWidget: checked })}
                  />
                </Row>
                <Row label={t("ट्रेंडिंग लिस्ट अपने आप स्क्रॉल हो", "Auto-scroll the trending list")}>
                  <Switch
                    checked={settings.rail.autoScrollTrending}
                    onCheckedChange={(checked) => update("rail", { autoScrollTrending: checked })}
                  />
                </Row>
                <Row label={t("वीडियो विजेट", "Video widget")}>
                  <Switch
                    checked={settings.rail.videoWidget}
                    onCheckedChange={(checked) => update("rail", { videoWidget: checked })}
                  />
                </Row>
                <Row label={t("फ़ुटर राइट रेल में", "Footer inside the right rail")}>
                  <Switch
                    checked={settings.rail.footerInRail}
                    onCheckedChange={(checked) => update("rail", { footerInRail: checked })}
                  />
                </Row>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="home" className="mt-3 flex flex-col gap-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base font-bold">{t("हीरो सेक्शन", "Hero section")}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5 pt-0">
                <Row label={t("हीरो दिखाएं", "Show hero")}>
                  <Switch
                    checked={settings.hero.enabled}
                    onCheckedChange={(checked) => update("hero", { enabled: checked })}
                  />
                </Row>
                <div className="space-y-2 rounded-lg border border-border px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <Label>{t("स्लाइड बदलने का समय", "Slide interval")}</Label>
                    <span className="text-[12px] tabular-nums text-text-muted">{settings.hero.autoplaySeconds}s</span>
                  </div>
                  <Slider
                    value={[settings.hero.autoplaySeconds]}
                    min={3}
                    max={12}
                    step={1}
                    onValueChange={([value]) => update("hero", { autoplaySeconds: value })}
                  />
                </div>
                <div className="space-y-2 rounded-lg border border-border px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <Label>{t("कितनी स्लाइड", "Number of slides")}</Label>
                    <span className="text-[12px] tabular-nums text-text-muted">{settings.hero.slideCount}</span>
                  </div>
                  <Slider
                    value={[settings.hero.slideCount]}
                    min={3}
                    max={8}
                    step={1}
                    onValueChange={([value]) => update("hero", { slideCount: value })}
                  />
                </div>
                <Row
                  label={t("केन बर्न्स ज़ूम", "Ken Burns zoom")}
                  description={t("इमेज पर धीमा ज़ूम इफ़ेक्ट", "A slow zoom across the image")}
                >
                  <Switch
                    checked={settings.hero.kenBurns}
                    onCheckedChange={(checked) => update("hero", { kenBurns: checked })}
                  />
                </Row>
                <Row label={t("लाइव बैज", "Live badge")}>
                  <Switch
                    checked={settings.hero.showLiveBadge}
                    onCheckedChange={(checked) => update("hero", { showLiveBadge: checked })}
                  />
                </Row>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base font-bold">{t("होमपेज सेक्शन", "Homepage sections")}</CardTitle>
                <CardDescription>{t("क्रम बदलिए या सेक्शन बंद कीजिए।", "Reorder them, or switch a section off.")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-0">
                {settings.homepage.sections.map((section, index) => (
                  <div key={section.id} className="flex items-center gap-2 rounded-lg border border-border p-2.5">
                    <div className="flex flex-col">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        disabled={index === 0}
                        onClick={() => moveSection(index, -1)}
                        aria-label={t("ऊपर", "Move up")}
                      >
                        <IconArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        disabled={index === settings.homepage.sections.length - 1}
                        onClick={() => moveSection(index, 1)}
                        aria-label={t("नीचे", "Move down")}
                      >
                        <IconArrowDown className="size-3.5" />
                      </Button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium text-text">{section.label}</p>
                      <p className="text-[11.5px] text-text-muted">{section.description}</p>
                    </div>
                    <Switch
                      checked={section.visible}
                      onCheckedChange={(checked) =>
                        setSettings((current) => ({
                          ...current,
                          homepage: {
                            ...current.homepage,
                            sections: current.homepage.sections.map((item) =>
                              item.id === section.id ? { ...item, visible: checked } : item,
                            ),
                          },
                        }))
                      }
                    />
                  </div>
                ))}
                <div className="space-y-2 rounded-lg border border-border px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <Label>{t("एक पंक्ति में कार्ड", "Cards per row")}</Label>
                    <span className="text-[12px] tabular-nums text-text-muted">{settings.homepage.cardsPerRow}</span>
                  </div>
                  <Slider
                    value={[settings.homepage.cardsPerRow]}
                    min={2}
                    max={4}
                    step={1}
                    onValueChange={([value]) => update("homepage", { cardsPerRow: value })}
                  />
                </div>
                <Row label={t("ट्रेंडिंग चिप्स", "Trending chips")}>
                  <Switch
                    checked={settings.homepage.trendingChips}
                    onCheckedChange={(checked) => update("homepage", { trendingChips: checked })}
                  />
                </Row>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="languages" className="mt-3">
            <LanguageSettingsPanel
              value={settings.languages}
              onChange={(languages) => setSettings((current) => ({ ...current, languages }))}
            />
          </TabsContent>

          <TabsContent value="mobile" className="mt-3 flex flex-col gap-3">
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-base font-bold">{t("मोबाइल डॉक", "Mobile dock")}</CardTitle>
                <CardDescription>{t("फ़ोन पर नीचे तैरता हुआ नेविगेशन बार।", "The floating nav bar at the bottom on phones.")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2.5 pt-0">
                <Row label={t("डॉक दिखाएं", "Show dock")}>
                  <Switch
                    checked={settings.mobileDock.enabled}
                    onCheckedChange={(checked) => update("mobileDock", { enabled: checked })}
                  />
                </Row>
                <Row label={t("लिक्विड ग्लास लुक", "Liquid glass look")}>
                  <Switch
                    checked={settings.mobileDock.glass}
                    onCheckedChange={(checked) => update("mobileDock", { glass: checked })}
                  />
                </Row>
                <div className="space-y-2 rounded-lg border border-border px-3 py-2.5">
                  <div className="flex items-center justify-between">
                    <Label>{t("आइकॉन का साइज़", "Icon size")}</Label>
                    <span className="text-[12px] tabular-nums text-text-muted">{settings.mobileDock.iconSize}px</span>
                  </div>
                  <Slider
                    value={[settings.mobileDock.iconSize]}
                    min={20}
                    max={36}
                    step={1}
                    onValueChange={([value]) => update("mobileDock", { iconSize: value })}
                  />
                </div>
                {settings.mobileDock.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 rounded-lg border border-border p-2.5">
                    <Input
                      value={item.label}
                      onChange={(event) => updateNavItem("mobileDock", item.id, { label: event.target.value })}
                      className="h-8 w-28"
                    />
                    <code className="text-[11.5px] text-text-muted">{item.href}</code>
                    <Switch
                      className="ml-auto"
                      checked={item.visible}
                      onCheckedChange={(checked) => updateNavItem("mobileDock", item.id, { visible: checked })}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="xl:sticky xl:top-20 xl:h-fit">
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
                <IconEye className="size-4 text-accent" /> {t("लाइव प्रीव्यू", "Live preview")}
              </CardTitle>
              <CardDescription>{t("बदलाव यहाँ तुरंत दिखते हैं।", "Changes show up here instantly.")}</CardDescription>
            </CardHeader>
            <CardContent>
              <AppearancePreview settings={settings} />
              <p className="mt-3 text-[11.5px] text-text-muted">
                {t(
                  "यह प्रीव्यू है — “सेव करें” दबाते ही असली वेबसाइट पर लागू हो जाएगा।",
                  "A preview — pressing Save applies it to the live site straight away.",
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
}
