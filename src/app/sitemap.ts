import type { MetadataRoute } from "next";

import { ARTICLES } from "@/lib/articles";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/crear", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/plantillas", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/premium", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/articulos", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/privacidad", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/terminos", priority: 0.2, changeFrequency: "yearly" as const },
  ].map((route) => ({
    url: `${siteConfig.url}${route.path === "/" ? "" : route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Drafts stay out of the sitemap until they have a body.
  const articleRoutes = ARTICLES.filter((a) => a.publishedAt !== null).map(
    (article) => ({
      url: `${siteConfig.url}/articulos/${article.slug}`,
      lastModified: new Date(article.publishedAt!),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }),
  );

  return [...staticRoutes, ...articleRoutes];
}
