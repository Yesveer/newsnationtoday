import { sanitizeStoryHtml } from "@/lib/sanitize-story";
import { toStoryHtml } from "@/lib/story-html";

/** The story itself.
 *
 *  `.news-prose` is the same class the admin editor writes inside, so the
 *  layout a reporter built is the layout a reader gets. The HTML is sanitised
 *  on the way out — see `sanitizeStoryHtml` for why that matters even for
 *  in-house copy. */
export function ArticleBody({ bodyHtml }: { bodyHtml: string }) {
  const clean = sanitizeStoryHtml(toStoryHtml(bodyHtml));

  return (
    // Deliberately translatable: a reader who picks another language wants
    // the story in it. (The admin editor is the opposite — see its own note.)
    <div className="news-prose" dangerouslySetInnerHTML={{ __html: clean }} />
  );
}
