"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { useTrackNavigation } from "@/lib/navigation";

/**
 * El `<main>` de todas las páginas, con la entrada de pantalla de una app.
 *
 * Al cambiar de ruta el contenido nuevo aparece subiendo unos píxeles y
 * fundiéndose, en lugar de sustituir al anterior de golpe. La cabecera y la
 * barra de pestañas quedan fuera y no se mueven, que es lo que le dice al ojo
 * que ha cambiado la pantalla y no la aplicación entera.
 *
 * Se anima con la Web Animations API sobre el nodo y no con estado de React:
 * así la primera carga —la que ve un buscador, la que cuenta para el LCP— se
 * pinta tal cual llega del servidor, sin empezar transparente, y solo las
 * navegaciones dentro del sitio llevan animación. Tampoco hay `key` que
 * remonte el árbol de Next por debajo.
 *
 * Mientras dura la animación el `<main>` tiene un `transform`, y eso ata a su
 * caja cualquier `position: fixed` que viva dentro. Por eso las barras y hojas
 * fijas del editor van en un portal al `<body>`.
 */
export function RouteTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const main = useRef<HTMLElement>(null);
  const shown = useRef(pathname);

  useTrackNavigation(pathname);

  useEffect(() => {
    if (shown.current === pathname) return;
    shown.current = pathname;

    const node = main.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    node.animate(
      [
        { opacity: 0, transform: "translateY(10px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 260, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, [pathname]);

  return (
    <main ref={main} id="contenido" className="flex-1">
      {children}
    </main>
  );
}
