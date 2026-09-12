export interface CategoryConfig {
  slug: string;
  name: string;
  nameEn: string;
  order: number;
  /** Vivid per-category accent — drives the sidebar icon tile and category chips. */
  color: string;
  isNew?: boolean;
}

export const categoriesConfig: CategoryConfig[] = [
  { slug: "desh", name: "देश", nameEn: "National", order: 1, color: "#E23744" },
  { slug: "rajya", name: "राज्य", nameEn: "States", order: 2, color: "#F26B21" },
  { slug: "videsh", name: "विदेश", nameEn: "International", order: 3, color: "#06B6D4" },
  { slug: "rajniti", name: "राजनीति", nameEn: "Politics", order: 4, color: "#7C3AED" },
  { slug: "cricket", name: "क्रिकेट", nameEn: "Cricket", order: 5, color: "#16A34A" },
  { slug: "khel", name: "स्पोर्ट्स", nameEn: "Sports", order: 6, color: "#3B82F6" },
  { slug: "manoranjan", name: "बॉलीवुड", nameEn: "Entertainment", order: 7, color: "#D946EF" },
  { slug: "vyapar", name: "बिजनेस", nameEn: "Business", order: 8, color: "#10B981" },
  { slug: "tech", name: "टेक - ऑटो", nameEn: "Tech - Auto", order: 9, color: "#6366F1" },
  { slug: "tejaswini", name: "तेजस्विनी", nameEn: "Tejaswini", order: 10, color: "#EC4899", isNew: true },
  { slug: "investigation", name: "इन्वेस्टिगेशन", nameEn: "Investigation", order: 11, color: "#0EA5E9" },
  { slug: "khaas", name: "खास", nameEn: "Exclusive", order: 12, color: "#EAB308" },
  { slug: "originals", name: "ओरिजिनल", nameEn: "Originals", order: 13, color: "#F59E0B" },
  { slug: "jobs", name: "जॉब - एजुकेशन", nameEn: "Jobs & Education", order: 14, color: "#8B5CF6" },
  { slug: "lifestyle", name: "लाइफस्टाइल", nameEn: "Lifestyle", order: 15, color: "#F43F5E" },
  { slug: "jeevan-mantra", name: "जीवन मंत्र", nameEn: "Jeevan Mantra", order: 16, color: "#F97316" },
  { slug: "opinion", name: "ओपिनियन", nameEn: "Opinion", order: 17, color: "#64748B" },
  { slug: "rashifal", name: "राशिफल", nameEn: "Horoscope", order: 18, color: "#A855F7" },
];
