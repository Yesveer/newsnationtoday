import { categoriesConfig } from "@/config/categories.config";

export const navLinks = [
  { label: "होम", href: "/" },
  ...categoriesConfig
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((category) => ({ label: category.name, href: `/${category.slug}` })),
  { label: "हमारे बारे में", href: "/about" },
];
