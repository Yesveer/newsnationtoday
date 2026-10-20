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

/** Reads a CSS colour well enough to tell "almost black" from "red".
 *
 *  Only the forms an editor or a paste actually produces: hex, rgb(), rgba()
 *  and the two names that matter. Anything it cannot read comes back null and
 *  is left alone — a colour we do not understand is not one we should throw
 *  away. */
function readColour(value: string): { r: number; g: number; b: number; a: number } | null {
  const text = value.trim().toLowerCase();

  if (text === "black") return { r: 0, g: 0, b: 0, a: 1 };
  if (text === "white") return { r: 255, g: 255, b: 255, a: 1 };

  const hex = text.match(/^#([0-9a-f]{3,8})$/);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) {
      digits = digits
        .split("")
        .map((d) => d + d)
        .join("");
    }
    if (digits.length !== 6 && digits.length !== 8) return null;
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
      a: digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgb = text.match(/^rgba?\(([^)]+)\)$/);
  if (rgb) {
    const parts = rgb[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    if (parts.length < 3 || parts.slice(0, 3).some(Number.isNaN)) return null;
    return {
      r: parts[0],
      g: parts[1],
      b: parts[2],
      a: parts.length > 3 && !Number.isNaN(parts[3]) ? parts[3] : 1,
    };
  }
  return null;
}

/** Whether a colour is near enough to black or white to be the source page's
 *  default rather than an editorial choice.
 *
 *  This is the fix for a real and invisible failure: copy a paragraph from a
 *  website into the editor and the paste carries that site's body colour with
 *  it — `color: rgba(0, 0, 0, 0.9)` on every paragraph. It looks fine while
 *  the page is light and the story disappears completely in dark mode. Nobody
 *  chose black-on-black, so the safe reading is that nobody chose black. */
function isDefaultTextColour(value: string): boolean {
  const colour = readColour(value);
  if (!colour) return false;
  // Nearly transparent is its own kind of invisible.
  if (colour.a < 0.2) return true;
  const { r, g, b } = colour;
  const nearBlack = r <= 40 && g <= 40 && b <= 40;
  const nearWhite = r >= 225 && g >= 225 && b >= 225;
  return nearBlack || nearWhite;
}

/** Drops the colour declarations that would make text invisible in one theme,
 *  keeping everything a reporter deliberately picked. */
function cleanStyle(style: string | undefined): string | undefined {
  if (!style) return style;
  const kept = style
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const [property, ...rest] = part.split(":");
      const name = property.trim().toLowerCase();
      if (name !== "color" && name !== "background-color") return true;
      return !isDefaultTextColour(rest.join(":"));
    });
  return kept.length > 0 ? kept.join("; ") : undefined;
}

/** The tags the editor may put a `style` on. Each one gets the same
 *  treatment, so a pasted colour cannot survive on a heading just because it
 *  was stripped from a paragraph. */
const STYLED_TAGS = ["span", "p", "h2", "h3", "h4", "mark", "table", "td", "th"];

function styleCleaners(): sanitizeHtml.IOptions["transformTags"] {
  const out: NonNullable<sanitizeHtml.IOptions["transformTags"]> = {};
  for (const tag of STYLED_TAGS) {
    out[tag] = (tagName, attribs) => {
      const style = cleanStyle(attribs.style);
      const next = { ...attribs };
      if (style === undefined) delete next.style;
      else next.style = style;
      return { tagName, attribs: next };
    };
  }
  return out;
}

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
      "video", "source",
      "table", "thead", "tbody", "tr", "th", "td",
      "iframe",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      // No autoplay: a clip inside a paragraph starts when the reader says
      // so. The reels feed is the place where video plays by itself.
      video: ["src", "poster", "controls", "preload", "width", "height", "playsinline"],
      source: ["src", "type"],
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
      ...styleCleaners(),
      // Any outbound link opens away from the site and cannot reach back into
      // it through `window.opener`.
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" },
      }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
      // Controls are forced on rather than trusted from the stored markup,
      // so a clip can always be paused.
      video: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, controls: "controls", preload: "metadata" },
      }),
    },
  });
}

/** Rough reading time from the story's text, in minutes. */
export function readingMinutes(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
