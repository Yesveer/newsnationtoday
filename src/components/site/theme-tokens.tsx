import type { SiteSettings } from "@/lib/data/get-site-config";

/** Applies the colours, radius and font scale chosen in the admin portal.
 *
 *  Rendered on the server as a plain <style>, so the site paints in the right
 *  colours immediately — no flash of the default orange. */
export function ThemeTokens({ settings }: { settings: SiteSettings }) {
  const { accent, live, radius, fontScale } = settings.theme;

  const css = `:root{--accent:${accent};--live:${live};--radius:${radius / 16}rem}
html{font-size:${fontScale}%}`;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
