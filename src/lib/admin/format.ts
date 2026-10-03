/** Formatting for the admin portal.
 *
 *  Every helper takes the portal's current language, because the chrome is
 *  bilingual: an English screen showing "अभी" next to "Active" reads as a bug.
 *  Anything other than "en" falls back to Hindi, which the page translator
 *  then converts along with the rest of the screen. */

type Lang = string | undefined;

const isEnglish = (lang: Lang) => lang === "en";

/** Indian-grouping number, e.g. 1,25,400. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatCompact(value: number, lang?: Lang): string {
  const en = isEnglish(lang);
  if (value >= 10_000_000) return `${(value / 10_000_000).toFixed(1)}${en ? " Cr" : " करोड़"}`;
  if (value >= 100_000) return `${(value / 100_000).toFixed(1)}${en ? " L" : " लाख"}`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

export function formatDateTime(iso: string, lang?: Lang): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(isEnglish(lang) ? "en-IN" : "hi-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string, lang?: Lang): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(isEnglish(lang) ? "en-IN" : "hi-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "2 घंटे पहले" / "2 hours ago".
 *
 *  Reads the real clock. Only ever rendered after the data arrives on the
 *  client, so there is no server/client mismatch to guard against. */
export function formatRelative(iso: string, lang?: Lang): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";

  const en = isEnglish(lang);
  // A timestamp a few seconds in the future just means the two clocks differ.
  const minutes = Math.max(0, Math.round((Date.now() - then) / 60000));

  if (minutes < 1) return en ? "just now" : "अभी";
  if (minutes < 60) return en ? `${minutes} min ago` : `${minutes} मिनट पहले`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return en ? `${hours} ${hours === 1 ? "hour" : "hours"} ago` : `${hours} घंटे पहले`;

  const days = Math.round(hours / 24);
  if (days < 30) return en ? `${days} ${days === 1 ? "day" : "days"} ago` : `${days} दिन पहले`;

  const months = Math.round(days / 30);
  if (months < 12) return en ? `${months} ${months === 1 ? "month" : "months"} ago` : `${months} महीने पहले`;

  const years = Math.round(months / 12);
  return en ? `${years} ${years === 1 ? "year" : "years"} ago` : `${years} साल पहले`;
}
