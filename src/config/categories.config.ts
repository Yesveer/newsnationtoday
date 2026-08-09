export interface CategoryConfig {
  slug: string;
  name: string;
  nameEn: string;
  order: number;
}

export const categoriesConfig: CategoryConfig[] = [
  { slug: "desh", name: "देश", nameEn: "National", order: 1 },
  { slug: "rajya", name: "राज्य", nameEn: "Regional", order: 2 },
  { slug: "rajniti", name: "राजनीति", nameEn: "Politics", order: 3 },
  { slug: "khel", name: "खेल", nameEn: "Sports", order: 4 },
  { slug: "manoranjan", name: "मनोरंजन", nameEn: "Entertainment", order: 5 },
  { slug: "vyapar", name: "व्यापार", nameEn: "Business", order: 6 },
  { slug: "tech", name: "तकनीक", nameEn: "Technology", order: 7 },
];
