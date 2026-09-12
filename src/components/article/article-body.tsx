/** `bodyHtml` is authored in-house (mock data today, admin-authored in Phase 2) — never raw user input. */
export function ArticleBody({ bodyHtml }: { bodyHtml: string }) {
  return (
    <div
      className="flex flex-col gap-4 text-[17px] leading-[1.85] text-text [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-text-muted"
      dangerouslySetInnerHTML={{ __html: bodyHtml }}
    />
  );
}
