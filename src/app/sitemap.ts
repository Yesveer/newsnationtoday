import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/data/get-articles";
import { getCategories } from "@/lib/data/get-categories";
import { siteConfig } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, articles] = await Promise.all([getCategories(), getAllArticles()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "hourly", priority: 1 },
    { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteConfig.url}/contact`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteConfig.url}/search`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${siteConfig.url}/${category.slug}`,
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteConfig.url}/${article.category.slug}/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "daily",
    priority: 0.5,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
