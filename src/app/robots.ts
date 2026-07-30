import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Los endpoints no son páginas: no responden a ninguna búsqueda y
      // rastrearlos solo gasta presupuesto de rastreo. `/api/generate-pdf`
      // además construye un PDF en cada petición.
      disallow: ["/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
