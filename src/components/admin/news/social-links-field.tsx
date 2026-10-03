"use client";

import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTelegram,
  IconBrandThreads,
  IconBrandWhatsapp,
  IconBrandX,
  IconBrandYoutube,
  IconPlus,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminLang } from "@/components/admin/use-admin-lang";
import type { SocialLink, SocialPlatform } from "@/types/admin";

export const SOCIAL_PLATFORMS: {
  value: SocialPlatform;
  label: string;
  labelEn: string;
  Icon: typeof IconWorld;
}[] = [
  { value: "facebook", label: "फेसबुक", labelEn: "Facebook", Icon: IconBrandFacebook },
  { value: "x", label: "X (ट्विटर)", labelEn: "X (Twitter)", Icon: IconBrandX },
  { value: "instagram", label: "इंस्टाग्राम", labelEn: "Instagram", Icon: IconBrandInstagram },
  { value: "youtube", label: "यूट्यूब", labelEn: "YouTube", Icon: IconBrandYoutube },
  { value: "whatsapp", label: "व्हाट्सऐप", labelEn: "WhatsApp", Icon: IconBrandWhatsapp },
  { value: "telegram", label: "टेलीग्राम", labelEn: "Telegram", Icon: IconBrandTelegram },
  { value: "linkedin", label: "लिंक्डइन", labelEn: "LinkedIn", Icon: IconBrandLinkedin },
  { value: "threads", label: "थ्रेड्स", labelEn: "Threads", Icon: IconBrandThreads },
  { value: "koo", label: "कू", labelEn: "Koo", Icon: IconWorld },
  { value: "sharechat", label: "शेयरचैट", labelEn: "ShareChat", Icon: IconWorld },
  { value: "other", label: "अन्य", labelEn: "Other", Icon: IconWorld },
];

export function platformMeta(platform: string) {
  return SOCIAL_PLATFORMS.find((entry) => entry.value === platform) ?? SOCIAL_PLATFORMS.at(-1)!;
}

/** Where this story also lives on social media.
 *
 *  Typed in by hand rather than generated: these are links to the newsroom's
 *  own posts — the reel, the thread, the Facebook write-up — not share buttons.
 *  Readers get them under the story. */
export function SocialLinksField({
  value,
  onChange,
  disabled,
}: {
  value: SocialLink[];
  onChange: (next: SocialLink[]) => void;
  disabled?: boolean;
}) {
  const { t } = useAdminLang();

  const update = (index: number, patch: Partial<SocialLink>) =>
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const add = () => onChange([...value, { platform: "facebook", url: "", label: "" }]);
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index));

  return (
    <div className="flex flex-col gap-2">
      {value.length === 0 ? (
        <p className="text-[12px] text-text-muted">
          {t(
            "इस खबर की फेसबुक पोस्ट, रील या ट्वीट का लिंक यहाँ जोड़िए — खबर के नीचे पाठकों को दिखेगा।",
            "Add the Facebook post, reel or tweet for this story — readers see them under the article.",
          )}
        </p>
      ) : null}

      {value.map((row, index) => {
        const { Icon } = platformMeta(row.platform);
        return (
          <div key={index} className="flex flex-col gap-1.5 rounded-lg border border-border p-2">
            <div className="flex items-center gap-1.5">
              <Select
                value={row.platform}
                onValueChange={(next) => update(index, { platform: next as SocialPlatform })}
                disabled={disabled}
              >
                <SelectTrigger size="sm" className="w-[150px] shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <SelectItem key={platform.value} value={platform.value}>
                      <platform.Icon className="size-3.5" />
                      {t(platform.label, platform.labelEn)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                aria-label={t("हटाएं", "Remove")}
                className="ml-auto text-text-muted hover:text-destructive"
                onClick={() => remove(index)}
              >
                <IconTrash className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1.5">
              <Icon className="size-4 shrink-0 text-text-muted" />
              <Input
                value={row.url}
                disabled={disabled}
                onChange={(event) => update(index, { url: event.target.value })}
                placeholder="https://…"
                className="text-[13px]"
                inputMode="url"
              />
            </div>
            <Input
              value={row.label ?? ""}
              disabled={disabled}
              onChange={(event) => update(index, { label: event.target.value })}
              placeholder={t("लेबल (वैकल्पिक) — जैसे “पूरी रील”", "Label (optional) — e.g. “Full reel”")}
              className="text-[12px]"
            />
          </div>
        );
      })}

      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={add}>
        <IconPlus className="size-4" /> {t("लिंक जोड़ें", "Add link")}
      </Button>
    </div>
  );
}
