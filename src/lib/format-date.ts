const relativeFormatter = new Intl.RelativeTimeFormat("hi-IN", { numeric: "auto" });
const absoluteFormatter = new Intl.DateTimeFormat("hi-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = new Date(iso).getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (Math.abs(diffMinutes) < 60) return relativeFormatter.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return relativeFormatter.format(diffHours, "hour");
  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) return relativeFormatter.format(diffDays, "day");

  return absoluteFormatter.format(new Date(iso));
}

export function formatAbsoluteDate(iso: string): string {
  return absoluteFormatter.format(new Date(iso));
}
