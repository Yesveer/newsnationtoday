import { categories } from "@/data/categories";
import type { Category } from "@/types/category";

export async function getCategories(): Promise<Category[]> {
  return [...categories].sort((a, b) => a.order - b.order);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return categories.find((category) => category.slug === slug) ?? null;
}
