import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Category } from "@/types/category";

/**
 * Per-category accent chip. Deliberately styled outside the brand
 * marigold/vermillion pair via color-mix() so it works unmodified in both
 * themes without a second set of light/dark tokens per category.
 */
export function CategoryTag({
  category,
  className,
  interactive = true,
}: {
  category: Pick<Category, "slug" | "name" | "color">;
  className?: string;
  /** Set false when nesting inside another <Link> (e.g. an article card) — a nested <a> is invalid HTML. */
  interactive?: boolean;
}) {
  const style = {
    "--cat": category.color ?? "var(--accent)",
    backgroundColor: "color-mix(in oklab, var(--cat) 16%, transparent)",
    color: "color-mix(in oklab, var(--cat) 85%, black)",
    borderColor: "color-mix(in oklab, var(--cat) 35%, transparent)",
  } as React.CSSProperties;

  const classes = cn(
    "inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap dark:[color:color-mix(in_oklab,var(--cat)_75%,white)]",
    interactive && "transition-opacity hover:opacity-80",
    className,
  );

  if (!interactive) {
    return (
      <span style={style} className={classes}>
        {category.name}
      </span>
    );
  }

  return (
    <Link href={`/${category.slug}`} style={style} className={classes}>
      {category.name}
    </Link>
  );
}
