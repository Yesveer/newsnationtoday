import { sanitizeStoryHtml } from "@/lib/sanitize-story";
import { toStoryHtml } from "@/lib/story-html";
import { StoryContent } from "@/components/article/story-content";

/** The story itself.
 *
 *  `.news-prose` is the same class the admin editor writes inside, so the
 *  layout a reporter built is the layout a reader gets. The HTML is sanitised
 *  on the way out — see `sanitizeStoryHtml` for why that matters even for
 *  in-house copy. */
export function ArticleBody({ bodyHtml }: { bodyHtml: string }) {
  const clean = sanitizeStoryHtml(toStoryHtml(bodyHtml));

  // Deliberately translatable: a reader who picks another language wants the
  // story in it. (The admin editor is the opposite — see its own note.)
  //
  // Rendered by a client component so the photos in it can be opened full
  // screen; the sanitising stays here, on the server.
  return <StoryContent html={clean} />;
}
