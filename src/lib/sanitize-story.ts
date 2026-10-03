import sanitizeHtml from "sanitize-html";

/** Cleans story HTML before it is rendered.
 *
 *  The body is written by the newsroom in the admin editor, so this is not
 *  guarding against strangers — but it is still HTML arriving from a database
 *  and going straight into the page, and a pasted-in block from Word or a
 *  website can carry a `<script>`, an `onerror=` or a `javascript:` link that
 *  nobody in the newsroom intended. Only what the editor can produce survives.
 */
const COLOUR = /^(#[0-9a-f]{3,8}|rgba?\([\d\s.,%/]+\)|[a-z]+)$/i;

export function sanitizeStoryHtml(html: string): string {
  if (!html) return "";

  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "hr",
      "h2", "h3", "h4", "h5", "h6",
      "strong", "b", "em", "i", "u", "s", "del", "mark", "sub", "sup", "span",
      "ul", "ol", "li",
      "blockquote", "code", "pre",
      "a", "img", "figure", "figcaption",
      "table", "thead", "tbody", "tr", "th", "td",
      "iframe",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      iframe: ["src", "title", "allow", "allowfullscreen", "width", "height"],
      span: ["style"],
      mark: ["style", "data-color"],
      p: ["style"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      th: ["colspan", "rowspan", "style"],
      td: ["colspan", "rowspan", "style"],
      table: ["style"],
    },
    allowedStyles: {
      "*": {
        color: [COLOUR],
        "background-color": [COLOUR],
        "text-align": [/^(left|right|center|justify)$/],
      },
    },
    // http(s) only — a `javascript:` or `data:` href is never something the
    // editor writes, so anything using one was not written here.
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    // Only embeds from places the newsroom actually uses.
    allowedIframeHostnames: [
      "www.youtube.com",
      "youtube.com",
      "www.youtube-nocookie.com",
      "player.vimeo.com",
      "www.dailymotion.com",
    ],
    transformTags: {
      // Any outbound link opens away from the site and cannot reach back into
      // it through `window.opener`.
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
      }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
    },
  });
}

/** Rough reading time from the story's text, in minutes. */
export function readingMinutes(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
