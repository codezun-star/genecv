import type { MetadataRoute } from "next";

import { getAllArticles } from "@/lib/blog";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/crear", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/plantillas", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/articulos", priority: 0.8, changeFrequency: "weekly" as const },
    { path: "/premium", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/privacidad", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/terminos", priority: 0.2, changeFrequency: "yearly" as const },
  ].map((route) => ({
    url: `${siteConfig.url}${route.path === "/" ? "" : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const articleRoutes = getAllArticles().map((article) => ({
    url: `${siteConfig.url}/articulos/${article.slug}`,
    lastModified: new Date(article.updatedAt || article.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes];
}
