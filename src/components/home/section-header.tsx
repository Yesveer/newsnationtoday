"use client";

import { useLanguage } from "@/components/i18n/language-provider";
import type { TranslationKey } from "@/lib/i18n/dictionary";

export function SectionHeader({ labelKey, live = false }: { labelKey: TranslationKey; live?: boolean }) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2.5 border-b border-border pb-2.5">
      <span className="h-5 w-1.5 rounded-full bg-accent" aria-hidden />
      <h2 className="text-xl font-bold text-text">{t(labelKey)}</h2>
      {live && (
        <span className="flex items-center gap-1.5 rounded-full bg-live/10 px-2 py-0.5 text-[11px] font-bold text-live">
          <span className="animate-live-pulse size-1.5 rounded-full bg-live" aria-hidden />
          {t("label.live")}
        </span>
      )}
    </div>
  );
}
