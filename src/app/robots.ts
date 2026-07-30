import type { MetadataRoute } from "next";

import { ANSWER_ENGINE_CRAWLERS } from "@/lib/crawlers";
import { siteConfig } from "@/lib/site";

// Los endpoints no son páginas: no responden a ninguna búsqueda y rastrearlos
// solo gasta presupuesto de rastreo. `/api/generate-pdf` además construye un
// PDF en cada petición.
const DISALLOW = ["/api/"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      // Los motores de respuestas pueden leer y citar el sitio, con la misma
      // exclusión de endpoints. El grupo tiene que repetir el `disallow`: un
      // rastreador obedece solo su grupo más específico y no hereda nada de
      // `*` (ver lib/crawlers.ts). Si algún día se añade otra ruta excluida,
      // va en la constante de arriba y entra en los dos grupos a la vez.
      {
        userAgent: [...ANSWER_ENGINE_CRAWLERS],
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
