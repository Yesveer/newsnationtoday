import { categoriesConfig } from "@/config/categories.config";
import type { Category } from "@/types/category";

const categoryColors: Record<string, string> = {
  desh: "#2F6F4E",
  rajya: "#1F6F78",
  rajniti: "#6B4C9A",
  khel: "#3B6FB6",
  manoranjan: "#C2478A",
  vyapar: "#5B7B29",
  tech: "#4A4E9E",
};

export const categories: Category[] = categoriesConfig.map((config) => ({
  id: `cat_${config.slug}`,
  slug: config.slug,
  name: config.name,
  nameEn: config.nameEn,
  color: categoryColors[config.slug],
  order: config.order,
  parentId: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
}));
