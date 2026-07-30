import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

/**
 * Manifiesto de la aplicación web.
 *
 * Es lo que hace que el icono y el nombre correctos aparezcan cuando alguien
 * añade GeneCV a la pantalla de inicio del móvil o lo ancla en el escritorio.
 * Next lo sirve en /manifest.webmanifest y añade la etiqueta <link> solo por
 * existir este fichero.
 *
 * Los campos se tratan como una ficha de tienda de aplicaciones, porque es
 * literalmente lo que enseña el navegador al ofrecer la instalación: nombre
 * corto que no se corte bajo el icono, descripción que diga qué hace la
 * herramienta y accesos directos a lo que la gente viene a hacer.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    lang: siteConfig.lang,
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    categories: ["productivity", "business", "utilities"],
    background_color: "#F7F7F7",
    theme_color: "#234D68",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Android recorta el icono con la forma del sistema; este lleva el dibujo
      // reducido y centrado para que el recorte no se coma el documento.
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    /**
     * Capturas reales de la aplicación. Con ellas el navegador enseña un
     * diálogo de instalación con imágenes en lugar de una línea de texto; sin
     * ellas se ofrece igual, pero sin ninguna previsualización.
     */
    screenshots: [
      {
        src: "/screenshots/movil-inicio.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Crea un CV profesional en minutos, gratis",
      },
      {
        src: "/screenshots/movil-plantillas.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "Plantillas compatibles con los filtros ATS",
      },
      {
        src: "/screenshots/escritorio-inicio.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
        label: "Crea un CV profesional en minutos, gratis",
      },
      {
        src: "/screenshots/escritorio-editor.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
        label: "El editor, con vista previa del CV en tiempo real",
      },
    ],
    /** Accesos directos al mantener pulsado el icono de la aplicación. */
    shortcuts: [
      {
        name: "Crear mi CV",
        short_name: "Crear",
        description: "Abre el editor y empieza un currículum",
        url: "/crear",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Ver plantillas",
        short_name: "Plantillas",
        description: "Los diseños disponibles, todos compatibles con ATS",
        url: "/plantillas",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
