import type { MetadataRoute } from "next";

import { ANSWER_ENGINE_CRAWLERS } from "@/lib/crawlers";
import { siteConfig } from "@/lib/site";

// Ahora mismo no hay ningún endpoint bajo /api, pero la exclusión se queda: si
// mañana se añade uno, no es una página, no responde a ninguna búsqueda y
// rastrearlo solo gasta presupuesto de rastreo.
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
