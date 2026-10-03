import {
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandTelegram,
  IconBrandThreads,
  IconBrandWhatsapp,
  IconBrandX,
  IconBrandYoutube,
  IconWorld,
} from "@tabler/icons-react";
import type { ArticleSocialLink } from "@/types/article";

/** The newsroom's own posts for this story.
 *
 *  Not share buttons — those are in the header. These are links the reporter
 *  entered: the reel, the thread, the Facebook write-up. */
const PLATFORMS: Record<string, { label: string; Icon: typeof IconWorld; color: string }> = {
  facebook: { label: "फेसबुक", Icon: IconBrandFacebook, color: "#1877f2" },
  x: { label: "X", Icon: IconBrandX, color: "#111111" },
  instagram: { label: "इंस्टाग्राम", Icon: IconBrandInstagram, color: "#d62976" },
  youtube: { label: "यूट्यूब", Icon: IconBrandYoutube, color: "#ff0000" },
  whatsapp: { label: "व्हाट्सऐप", Icon: IconBrandWhatsapp, color: "#25d366" },
  telegram: { label: "टेलीग्राम", Icon: IconBrandTelegram, color: "#229ed9" },
  linkedin: { label: "लिंक्डइन", Icon: IconBrandLinkedin, color: "#0a66c2" },
  threads: { label: "थ्रेड्स", Icon: IconBrandThreads, color: "#111111" },
  koo: { label: "कू", Icon: IconWorld, color: "#facd00" },
  sharechat: { label: "शेयरचैट", Icon: IconWorld, color: "#ea4c3f" },
  other: { label: "लिंक", Icon: IconWorld, color: "var(--accent)" },
};

export function ArticleSocialLinks({ links }: { links?: ArticleSocialLink[] }) {
  const valid = (links ?? []).filter((link) => /^https?:\/\//i.test(link.url));
  if (valid.length === 0) return null;

  return (
    <section className="flex flex-col gap-2 rounded-lg border border-border p-3">
      <h2 className="text-[13px] font-semibold text-text">
        यह खबर सोशल मीडिया पर
      </h2>
      <ul className="flex flex-wrap gap-2">
        {valid.map((link) => {
          const meta = PLATFORMS[link.platform] ?? PLATFORMS.other;
          return (
            <li key={link.url}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[12.5px] font-medium text-text transition-colors hover:border-accent hover:text-accent"
              >
                <meta.Icon className="size-4 shrink-0" style={{ color: meta.color }} />
                {link.label?.trim() || meta.label}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
