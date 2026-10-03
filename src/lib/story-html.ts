/** Story bodies written before the rich editor existed are plain text with
 *  blank lines between paragraphs. Dropped into HTML they collapse into one
 *  unbroken block, so they are converted on the way in — on the public page
 *  and in the editor alike, from the same function, so both agree.
 *
 *  No dependencies on purpose: this runs in the browser bundle too. */

const BLOCK_TAG = /<(p|div|h[1-6]|ul|ol|li|blockquote|pre|table|figure|img|hr|br)\b/i;

export function looksLikeHtml(value: string): boolean {
  return BLOCK_TAG.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Blank line → new paragraph, single newline → line break. */
export function plainTextToHtml(value: string): string {
  return value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** What the editor loads and what the page renders: HTML either way. */
export function toStoryHtml(value: string): string {
  const text = (value ?? "").trim();
  if (!text) return "";
  return looksLikeHtml(text) ? text : plainTextToHtml(text);
}
