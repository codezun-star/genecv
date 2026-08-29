"use client";

import { useEffect, useRef, useState } from "react";

import {
  AD_RESERVE,
  AD_UNITS,
  AD_WRAPPER,
  type AdPlacementId,
  type AdUnit,
  type AdUnitId,
  chooseAdUnit,
} from "@/lib/ads";
import { cn } from "@/lib/utils";

/**
 * Un banner de la red, aislado en su propio iframe.
 *
 * El aislamiento no es una precaución: es la única forma de que estos banners
 * funcionen aquí. El `invoke.js` de la red se pinta con `document.write` y lee
 * una global `atOptions` que es única por documento. Metido directamente en la
 * página, el primer banner que cargase tras la hidratación borraría el
 * documento, y el segundo leería las opciones del primero. Dentro de un iframe
 * con `srcDoc` cada unidad tiene su documento y su global, y al navegar el
 * componente se desmonta y el siguiente banner arranca limpio.
 *
 * El iframe no lleva `sandbox`: un `srcDoc` sin ese atributo hereda el origen
 * de la página, que es exactamente lo que tendría el script si estuviera
 * pegado en el HTML. Restringirlo rompería el clic hacia el anunciante, que es
 * lo que se cobra.
 */

function buildSrcDoc({ key, width, height }: AdUnit): string {
  // Sin margen y sin scroll: el iframe mide justo lo que mide el creativo.
  return [
    "<!doctype html><html><head><meta charset='utf-8'>",
    "<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent}</style>",
    "</head><body>",
    `<script>atOptions={key:'${key}',format:'iframe',height:${height},width:${width},params:{}};</script>`,
    `<script src="https://www.highrevenueformat.com/${key}/invoke.js"></script>`,
    "</body></html>",
  ].join("");
}

export function AdBanner({
  placement,
  className,
}: {
  placement: AdPlacementId;
  className?: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [unit, setUnit] = useState<AdUnitId | null>(null);

  useEffect(() => {
    const node = box.current;
    if (!node) return;

    // La unidad se elige por lo que mide la caja, no la ventana: en la columna
    // del editor o en una página estrecha caben cosas muy distintas. Un
    // `display:none` mide 0 y devuelve `null`, que es lo que evita pedir un
    // anuncio que el CSS va a esconder.
    const measure = () =>
      setUnit(
        chooseAdUnit(
          placement,
          node.getBoundingClientRect().width,
          window.innerHeight,
        ),
      );

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    // El observador ve la anchura; el alto de la ventana, que decide entre
    // rascacielos entero y medio, solo cambia al redimensionar.
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [placement]);

  const spec = unit ? AD_UNITS[unit] : null;

  return (
    <aside
      aria-label="Publicidad"
      className={cn("mx-auto text-center", AD_WRAPPER[placement], className)}
    >
      {/* La ley de servicios de la sociedad de la información exige que la
          publicidad se distinga del contenido. Cuesta una línea de 10 px. */}
      <p className="text-ink-muted mb-1.5 text-[0.625rem] tracking-[0.14em] uppercase">
        Publicidad
      </p>
      <div
        ref={box}
        // Antes de medir manda el alto reservado; después, el de la unidad
        // elegida, que es el exacto.
        style={spec ? { height: spec.height } : undefined}
        className={cn(
          "flex items-center justify-center overflow-hidden",
          AD_RESERVE[placement],
        )}
      >
        {spec && (
          // `key` fuerza un iframe nuevo al cambiar de formato: reescribir el
          // `srcDoc` de uno ya montado no vuelve a ejecutar los scripts.
          <iframe
            key={unit}
            title="Publicidad"
            srcDoc={buildSrcDoc(spec)}
            width={spec.width}
            height={spec.height}
            loading="lazy"
            scrolling="no"
            className="block max-w-full border-0"
          />
        )}
      </div>
    </aside>
  );
}
