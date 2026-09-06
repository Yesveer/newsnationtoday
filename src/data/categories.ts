import { categoriesConfig } from "@/config/categories.config";
import type { Category } from "@/types/category";

export const categories: Category[] = categoriesConfig.map((config) => ({
  id: `cat_${config.slug}`,
  slug: config.slug,
  name: config.name,
  nameEn: config.nameEn,
  color: config.color,
  order: config.order,
  parentId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}));
