/** Indian-grouping number, e.g. 1,25,400. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatCompact(value: number): string {
  if (value >= 10_000_000) return `${(value / 10_000_000).toFixed(1)} करोड़`;
  if (value >= 100_000) return `${(value / 100_000).toFixed(1)} लाख`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("hi-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("hi-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** "2 घंटे पहले" — fixed reference date keeps server and client output equal. */
export function formatRelative(iso: string, now = new Date("2026-09-25T08:00:00.000Z")): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "अभी";
  if (minutes < 60) return `${minutes} मिनट पहले`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} घंटे पहले`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} दिन पहले`;
  const months = Math.round(days / 30);
  return `${months} महीने पहले`;
}
