import type { MetadataRoute } from "next";

import { getAllArticles } from "@/lib/blog";
import { siteConfig } from "@/lib/site";

/**
 * Sitemap.
 *
 * Sobre las fechas: `lastModified` solo sirve de algo si es verdad. Poner la
 * fecha del build en todas las URLs le dice al buscador que el sitio entero
 * cambió en cada despliegue; en cuanto comprueba un par de veces que no era
 * cierto, deja de hacer caso a la señal para todo el dominio. Por eso aquí solo
 * la llevan las páginas cuya fecha se puede saber de verdad —los artículos, y
 * el índice que los lista—, y las demás van sin ella, que es una opción válida
 * del formato y mejor que una fecha inventada.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles();

  const fechaDe = (a: (typeof articles)[number]) =>
    new Date(a.updatedAt || a.publishedAt);

  // El índice de artículos cambia cuando se publica o se revisa uno.
  const ultimoArticulo = articles
    .map(fechaDe)
    .reduce<Date | undefined>((max, d) => (!max || d > max ? d : max), undefined);

  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/crear", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/plantillas", priority: 0.8, changeFrequency: "monthly" as const },
    {
      path: "/articulos",
      priority: 0.8,
      changeFrequency: "weekly" as const,
      lastModified: ultimoArticulo,
    },
    { path: "/premium", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/privacidad", priority: 0.2, changeFrequency: "yearly" as const },
    { path: "/terminos", priority: 0.2, changeFrequency: "yearly" as const },
  ].map((route) => ({
    url: `${siteConfig.url}${route.path === "/" ? "" : route.path}`,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
    ...(route.lastModified ? { lastModified: route.lastModified } : {}),
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteConfig.url}/articulos/${article.slug}`,
    lastModified: fechaDe(article),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...articleRoutes];
}
