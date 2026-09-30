/** The admin portal is deliberately single-colour.
 *
 *  Everything — badges, stat tiles, charts, status dots — is the brand accent.
 *  Where two things need to be told apart, only the *intensity* changes, never
 *  the hue. Anything genuinely colourful in the portal is the public site's own
 *  data (category colours, the accent picker), not portal chrome. */
export type ToneLevel = "strong" | "medium" | "soft";

const fill: Record<ToneLevel, number> = { strong: 16, medium: 10, soft: 7 };
const border: Record<ToneLevel, number> = { strong: 40, medium: 26, soft: 16 };
const dot: Record<ToneLevel, number> = { strong: 100, medium: 55, soft: 30 };

/** Chip / badge surface: tinted accent background, accent text. */
export function toneStyle(level: ToneLevel) {
  return {
    color: level === "soft" ? "var(--text-muted)" : "var(--accent)",
    backgroundColor: `color-mix(in oklab, var(--accent) ${fill[level]}%, transparent)`,
    borderColor: `color-mix(in oklab, var(--accent) ${border[level]}%, transparent)`,
  } as const;
}

/** The small leading dot inside a badge. */
export function toneDotStyle(level: ToneLevel) {
  return {
    backgroundColor: `color-mix(in oklab, var(--accent) ${dot[level]}%, transparent)`,
  } as const;
}

/** Icon tile on stat cards and topic rows. */
export function toneTileStyle(level: ToneLevel = "strong") {
  return {
    color: "var(--accent)",
    backgroundColor: `color-mix(in oklab, var(--accent) ${fill[level]}%, transparent)`,
  } as const;
}

/** Chart series — one hue, stepped down the ranking. */
export function accentAt(percent: number) {
  return `color-mix(in oklab, var(--accent) ${percent}%, transparent)`;
}
