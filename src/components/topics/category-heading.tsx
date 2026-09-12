"use client";

import { useLanguage } from "@/components/i18n/language-provider";

export function CategoryHeading({ name, nameEn }: { name: string; nameEn: string }) {
  const { language } = useLanguage();
  return (
    <h1 className="border-b border-border pb-3 text-2xl font-bold text-text">
      {language === "en" ? nameEn : name}
    </h1>
  );
}
