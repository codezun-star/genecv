"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useState } from "react";

import { MoreSheet } from "@/components/layout/more-sheet";
import {
  BookIcon,
  HomeIcon,
  MoreIcon,
  PlusIcon,
  TemplatesIcon,
} from "@/components/ui/icons";
import { activeTab } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/**
 * Barra de pestañas del móvil: la navegación principal de una app, abajo,
 * donde llega el pulgar.
 *
 * Cuatro destinos y «Más», con «Crear» en el centro y destacado porque es a
 * lo que viene casi todo el mundo. Por encima de 768 px desaparece y manda la
 * cabecera de escritorio.
 *
 * En el editor no se pinta: allí la barra de abajo es la de la tarea —anterior,
 * vista previa, siguiente— y dos barras apiladas se comerían la pantalla.
 *
 * Deja detrás un hueco de su misma altura para que el final de cada página no
 * quede tapado. Y cuenta con el área segura: en un iPhone sin botón, la barra
 * del sistema se pinta encima de los últimos 34 px de la pantalla.
 */
const TABS = [
  { href: "/", label: "Inicio", Icon: HomeIcon },
  { href: "/plantillas", label: "Plantillas", Icon: TemplatesIcon },
  { href: "/crear", label: "Crear", Icon: PlusIcon, primary: true },
  { href: "/articulos", label: "Guías", Icon: BookIcon },
] as const;

export function TabBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  // El hueco de la barra del editor va aquí, y no dentro de la página,
  // porque tiene que quedar después del pie: si no, la barra taparía el pie.
  if (pathname.startsWith("/crear")) {
    return (
      <div aria-hidden className="h-[calc(4.25rem+env(safe-area-inset-bottom))] lg:hidden" />
    );
  }

  const current = activeTab(pathname);

  return (
    <>
      <div aria-hidden className="h-[calc(4rem+env(safe-area-inset-bottom))] md:hidden" />

      <nav
        aria-label="Secciones"
        className="border-line bg-canvas/90 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-lg select-none [-webkit-touch-callout:none] md:hidden"
      >
        <ul className="mx-auto grid h-16 max-w-lg grid-cols-5 pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]">
          {TABS.map((tab) => {
            const { href, label, Icon } = tab;
            const active = current === href;
            const primary = "primary" in tab;

            return (
              <li key={href} className="flex">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold transition-colors duration-150",
                    active ? "text-primary" : "text-ink-muted",
                  )}
                >
                  {primary ? (
                    <span className="bg-primary shadow-soft grid h-8 w-12 place-items-center rounded-full text-white transition-transform duration-150 group-active:scale-90">
                      <Icon className="size-5" strokeWidth={2.5} />
                    </span>
                  ) : (
                    <span className="relative grid h-8 w-14 place-items-center transition-transform duration-150 group-active:scale-90">
                      {active && (
                        <motion.span
                          layoutId="tab-indicator"
                          className="bg-primary-soft absolute inset-0 rounded-full"
                          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                        />
                      )}
                      <Icon className="relative size-[1.375rem]" strokeWidth={active ? 2.25 : 1.9} />
                    </span>
                  )}
                  {label}
                </Link>
              </li>
            );
          })}

          <li className="flex">
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              className={cn(
                "group flex flex-1 flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold transition-colors duration-150",
                moreOpen ? "text-primary" : "text-ink-muted",
              )}
            >
              <span className="relative grid h-8 w-14 place-items-center transition-transform duration-150 group-active:scale-90">
                <MoreIcon className="size-[1.375rem]" strokeWidth={1.9} />
              </span>
              Más
            </button>
          </li>
        </ul>
      </nav>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  );
}
