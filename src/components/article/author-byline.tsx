import Image from "next/image";
import type { Author } from "@/types/author";

/** Compact inline byline — Bhaskar shows this only for bylined/ground-report pieces, not every article. */
export function AuthorByline({ author }: { author: Author }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-text-muted">
      {author.avatarUrl && (
        <Image src={author.avatarUrl} alt={author.name} width={20} height={20} className="size-5 rounded-full object-cover" />
      )}
      <span className="font-medium text-text">{author.name}</span>
    </div>
  );
}
