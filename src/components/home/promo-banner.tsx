import { IconBrandGoogle } from "@tabler/icons-react";
import { siteConfig } from "@/config/site";

export function PromoBanner() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-surface-muted px-4 py-3">
      <p className="text-sm text-text">{siteConfig.name} को अपना पसंदीदा न्यूज़ सोर्स बनाएं</p>
      <button
        type="button"
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-foreground"
      >
        <IconBrandGoogle className="size-4" /> Follow us
      </button>
    </div>
  );
}
