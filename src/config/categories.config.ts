export interface CategoryConfig {
  slug: string;
  name: string;
  nameEn: string;
  order: number;
  /** Vivid per-category accent used for sidebar icon tiles and category chips. */
  color: string;
  isNew?: boolean;
}

export const categoriesConfig: CategoryConfig[] = [
  { slug: "desh", name: "देश", nameEn: "National", order: 1, color: "#E23744" },
  { slug: "rajya", name: "राज्य", nameEn: "Regional", order: 2, color: "#F26B21" },
  { slug: "rajniti", name: "राजनीति", nameEn: "Politics", order: 3, color: "#7C3AED" },
  { slug: "khel", name: "खेल", nameEn: "Sports", order: 4, color: "#0EA5E9" },
  { slug: "manoranjan", name: "मनोरंजन", nameEn: "Entertainment", order: 5, color: "#EC4899" },
  { slug: "vyapar", name: "व्यापार", nameEn: "Business", order: 6, color: "#16A34A" },
  { slug: "tech", name: "तकनीक", nameEn: "Technology", order: 7, color: "#6366F1", isNew: true },
];
