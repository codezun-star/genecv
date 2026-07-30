import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

/**
 * Manifiesto de la aplicación web.
 *
 * Es lo que hace que el icono y el nombre correctos aparezcan cuando alguien
 * añade GeneCV a la pantalla de inicio del móvil o lo ancla en el escritorio.
 * Next lo sirve en /manifest.webmanifest y añade la etiqueta <link> solo por
 * existir este fichero.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    lang: siteConfig.lang,
    start_url: "/",
    display: "standalone",
    background_color: "#F7F7F7",
    theme_color: "#234D68",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
