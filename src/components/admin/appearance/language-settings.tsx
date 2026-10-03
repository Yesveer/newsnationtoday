"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconLanguage, IconPlus, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import type { LanguageSettings, LanguageSetting } from "@/config/appearance.config";

/** Which languages the website offers, which one it opens in, and which one
 *  the newsroom writes in. The public site's language menu renders this list
 *  straight from the database, so adding a row here adds it to the site. */
export function LanguageSettingsPanel({
  value,
  onChange,
}: {
  value: LanguageSettings;
  onChange: (next: LanguageSettings) => void;
}) {
  const { t } = useAdminLang();
  const [draft, setDraft] = useState({ code: "", label: "", englishLabel: "" });

  const items = value.items ?? [];
  const enabled = items.filter((item) => item.enabled !== false);

  const patchItem = (code: string, partial: Partial<LanguageSetting>) =>
    onChange({ ...value, items: items.map((item) => (item.code === code ? { ...item, ...partial } : item)) });

  const add = () => {
    const code = draft.code.trim().toLowerCase();
    if (!/^[a-z]{2}(-[a-z]{2,4})?$/i.test(code)) {
      toast.error(t("भाषा कोड सही नहीं है", "That language code is not valid"), {
        description: t("जैसे: ta, bn, gu, zh-CN", "Examples: ta, bn, gu, zh-CN"),
      });
      return;
    }
    if (items.some((item) => item.code === code)) {
      toast.error(t("यह भाषा पहले से है", "That language is already in the list"));
      return;
    }
    if (!draft.label.trim()) {
      toast.error(t("भाषा का नाम लिखिए", "Enter the language name"));
      return;
    }

    onChange({
      ...value,
      items: [
        ...items,
        {
          code,
          label: draft.label.trim(),
          englishLabel: draft.englishLabel.trim() || draft.label.trim(),
          rtl: false,
          enabled: true,
        },
      ],
    });
    setDraft({ code: "", label: "", englishLabel: "" });
    toast.success(t("भाषा जुड़ गई — सेव करना न भूलें", "Language added — remember to save"));
  };

  const remove = (code: string) => {
    if (code === value.default || code === value.source) {
      toast.error(
        t(
          "डिफ़ॉल्ट या सोर्स भाषा नहीं हटा सकते",
          "You cannot remove the default or the source language",
        ),
      );
      return;
    }
    onChange({ ...value, items: items.filter((item) => item.code !== code) });
  };

  return (
    <div className="flex flex-col gap-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-base font-bold">
            <IconLanguage className="size-4 text-accent" /> {t("वेबसाइट की भाषा", "Website language")}
          </CardTitle>
          <CardDescription>
            {t(
              "वेबसाइट कौन सी भाषा में खुलेगी, और खबरें किस भाषा में लिखी जाती हैं।",
              "Which language the site opens in, and which one the newsroom writes in.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>{t("डिफ़ॉल्ट भाषा", "Default language")}</Label>
            <Select value={value.default} onValueChange={(next) => onChange({ ...value, default: next })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {enabled.map((item) => (
                  <SelectItem key={item.code} value={item.code}>
                    <span className="notranslate" translate="no">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-text-muted">{item.code}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-text-muted">
              {t("नया पाठक पहली बार यही भाषा देखेगा।", "A first-time reader sees this one.")}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>{t("कंटेंट की भाषा (सोर्स)", "Content language (source)")}</Label>
            <Select value={value.source} onValueChange={(next) => onChange({ ...value, source: next })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {items.map((item) => (
                  <SelectItem key={item.code} value={item.code}>
                    <span className="notranslate" translate="no">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-text-muted">{item.code}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-text-muted">
              {t(
                "खबरें इसी भाषा में लिखी जाती हैं; बाकी भाषाएं इसी से अनुवाद होती हैं।",
                "Stories are written in this one; every other language is translated from it.",
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-base font-bold">
            {t("समर्थित भाषाएं", "Supported languages")}
          </CardTitle>
          <CardDescription>
            {t(
              "यही सूची वेबसाइट के भाषा मेन्यू में दिखती है। कोड Google Translate का होना चाहिए।",
              "This list is what the site's language menu shows. Codes are Google Translate codes.",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 pt-0">
          {items.map((item) => {
            const locked = item.code === value.default || item.code === value.source;
            return (
              <div
                key={item.code}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2.5"
              >
                <code className="w-14 shrink-0 rounded bg-surface-muted px-1.5 py-1 text-center text-[11px] font-bold uppercase">
                  {item.code}
                </code>
                <Input
                  value={item.label}
                  onChange={(event) => patchItem(item.code, { label: event.target.value })}
                  className="h-8 w-32"
                  placeholder={t("नाम", "Name")}
                />
                <Input
                  value={item.englishLabel}
                  onChange={(event) => patchItem(item.code, { englishLabel: event.target.value })}
                  className="h-8 w-32"
                  placeholder="English name"
                />
                <span className="flex items-center gap-1.5">
                  <span className="text-[11.5px] text-text-muted">RTL</span>
                  <Switch
                    checked={Boolean(item.rtl)}
                    onCheckedChange={(checked) => patchItem(item.code, { rtl: checked })}
                  />
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="text-[11.5px] text-text-muted">{t("चालू", "On")}</span>
                  <Switch
                    checked={item.enabled !== false}
                    disabled={locked}
                    onCheckedChange={(checked) => patchItem(item.code, { enabled: checked })}
                  />
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive"
                  disabled={locked}
                  aria-label={t("हटाएं", "Remove")}
                  onClick={() => remove(item.code)}
                >
                  <IconTrash className="size-4" />
                </Button>
              </div>
            );
          })}

          <div className="mt-1 flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-border p-2.5">
            <div className="space-y-1">
              <Label className="text-[11.5px]">{t("कोड", "Code")}</Label>
              <Input
                value={draft.code}
                onChange={(event) => setDraft({ ...draft, code: event.target.value })}
                className="h-8 w-20 font-mono"
                placeholder="ta"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11.5px]">{t("नाम (अपनी लिपि में)", "Name (own script)")}</Label>
              <Input
                value={draft.label}
                onChange={(event) => setDraft({ ...draft, label: event.target.value })}
                className="h-8 w-36"
                placeholder="தமிழ்"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11.5px]">{t("अंग्रेज़ी नाम", "English name")}</Label>
              <Input
                value={draft.englishLabel}
                onChange={(event) => setDraft({ ...draft, englishLabel: event.target.value })}
                className="h-8 w-36"
                placeholder="Tamil"
              />
            </div>
            <Button size="sm" variant="outline" onClick={add}>
              <IconPlus className="size-4" /> {t("भाषा जोड़ें", "Add language")}
            </Button>
          </div>

          <p className="text-[11.5px] text-text-muted">
            {t(
              "हिंदी और अंग्रेज़ी के अलावा बाकी भाषाएं Google अनुवाद से आती हैं — कोड वही होना चाहिए जो Google इस्तेमाल करता है।",
              "Beyond Hindi and English the text is machine-translated by Google, so the code must be one Google knows.",
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
