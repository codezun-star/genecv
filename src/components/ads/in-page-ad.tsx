"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

import { IN_PAGE_AD } from "@/lib/ads";

/**
 * La unidad suelta de la red, montada en todas las rutas menos el editor.
 *
 * Es un componente de cliente solo por `usePathname()`: el layout raíz se
 * renderiza en el servidor y allí no hay ruta que mirar.
 *
 * Carga con `lazyOnload` —en el primer rato ocioso del navegador— por lo mismo
 * que la barra social: es publicidad, y no puede disputarle el hilo principal
 * ni a la hidratación ni a la generación del PDF.
 *
 * Conviene saber hasta dónde llega el filtro. `next/script` carga cada `id`
 * una sola vez por documento, así que quien entre por la portada y luego pase
 * al editor se lo lleva puesto: ya se ejecutó, y desmontar el componente no
 * deshace lo que la red haya enganchado al documento. Lo que sí evita es
 * pedirlo cuando la visita **empieza** en /crear, que es una entrada habitual
 * porque es la página que posiciona para «crear cv online».
 */
export function InPageAd() {
  const pathname = usePathname();

  if (IN_PAGE_AD.skipRoutes.some((route) => pathname.startsWith(route))) {
    return null;
  }

  return <Script id="in-page-ad" src={IN_PAGE_AD.src} strategy="lazyOnload" />;
}
