const WORDS_PER_MINUTE = 200;

export function estimateReadingTime(bodyHtml: string): number {
  const text = bodyHtml.replace(/<[^>]+>/g, " ");
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE));
}
