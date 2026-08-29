"use client";

import { useEffect, useRef } from "react";

import { NATIVE_AD } from "@/lib/ads";
import { cn } from "@/lib/utils";

/**
 * Banner nativo: una fila de piezas que imitan tarjetas de contenido.
 *
 * Se monta a mano en vez de con `next/script` porque `next/script` recuerda lo
 * que ya cargó y no lo vuelve a ejecutar al cambiar de ruta: el contenedor de
 * la siguiente página se quedaría vacío. Insertando el `<script>` en un efecto,
 * cada montaje pide una creatividad nueva.
 *
 * Uno por página: el script de la red escribe dentro de un `id` fijo. Ver
 * `NATIVE_AD` en `src/lib/ads.ts`.
 */
export function NativeAd({ className }: { className?: string }) {
  const host = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = host.current;
    if (!node) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = NATIVE_AD.src;
    // La red lo pide así: sin esto Cloudflare puede reescribir el script y
    // romper la inserción.
    script.dataset.cfasync = "false";
    node.appendChild(script);

    // El contenedor lo desmonta React con el resto del árbol; aquí solo hay
    // que retirar el `<script>`, que se insertó por fuera.
    return () => script.remove();
  }, []);

  return (
    <aside
      ref={host}
      aria-label="Publicidad"
      className={cn("mx-auto text-center", className)}
    >
      <p className="text-ink-muted mb-1.5 text-[0.625rem] tracking-[0.14em] uppercase">
        Publicidad
      </p>
      {/* Alto mínimo aproximado del formato: sin él, la fila aparece de golpe
          y empuja hacia abajo lo que haya debajo. */}
      <div id={NATIVE_AD.containerId} className="min-h-[180px]" />
    </aside>
  );
}
