import { fetchCategories } from "@/lib/api/public";
import type { Category } from "@/types/category";

/** Categories come from the database, so adding or reordering one in the admin
 *  portal changes the site's navigation. */
export async function getCategories(): Promise<Category[]> {
  const categories = await fetchCategories();
  return [...categories].sort((a, b) => a.order - b.order);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await fetchCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}
