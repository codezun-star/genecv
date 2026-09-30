"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";

import { Container } from "@/components/layout/container";
import { Logo } from "@/components/layout/logo";
import { buttonStyles } from "@/components/ui/button";
import { ChevronLeftIcon, ShareIcon } from "@/components/ui/icons";
import { useCanShare } from "@/lib/client";
import { canGoBackInApp, parentRoute, type ParentRoute } from "@/lib/navigation";
import { mainNav } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * Cabecera.
 *
 * En escritorio es la de siempre: marca, enlaces y el botón de crear. En el
 * móvil se comporta como la barra superior de una app: la marca centrada, la
 * flecha «atrás» a la izquierda en las pantallas que cuelgan de otra y el
 * botón de compartir del sistema a la derecha. Los enlaces se van a la barra
 * de pestañas de abajo, donde llega el pulgar.
 *
 * El relleno superior es el área segura: instalada como app en un iPhone con
 * isla, la página se pinta también por detrás de la barra de estado.
 */
export function Navbar() {
  const pathname = usePathname();
  const parent = parentRoute(pathname);

  return (
    <header className="border-line bg-canvas/85 sticky top-0 z-40 border-b pt-[env(safe-area-inset-top)] backdrop-blur-lg select-none md:select-auto">
      <Container>
        <nav
          aria-label="Principal"
          className="grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-2 md:flex md:h-16 md:justify-between md:gap-4"
        >
          <div className="flex min-w-0 items-center md:hidden">
            {parent && <BackLink parent={parent} />}
          </div>

          <Logo priority />

          <ul className="hidden items-center gap-1 md:flex">
            {mainNav.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-field px-3 py-2 text-[0.9375rem] font-medium transition-colors duration-150",
                      active
                        ? "text-primary"
                        : "text-ink-soft hover:text-primary hover:bg-secondary-soft",
                    )}
                  >
                    {item.label}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="bg-primary absolute inset-x-3 -bottom-px h-0.5 rounded-full"
                        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-end gap-2">
            <Link
              href="/crear"
              className={buttonStyles({ size: "sm", className: "hidden md:inline-flex" })}
            >
              Crear mi CV
            </Link>
            <ShareButton />
          </div>
        </nav>
      </Container>
    </header>
  );
}

/**
 * «Atrás» como en una app: vuelve a la pantalla anterior si se llegó desde el
 * propio sitio y, si no —se entró por un enlace de fuera—, sube a la pantalla
 * padre. Es un enlace de verdad a esa pantalla padre, así que sin JavaScript,
 * o con un clic central, hace lo esperable.
 */
function BackLink({ parent }: { parent: ParentRoute }) {
  const router = useRouter();

  return (
    <Link
      href={parent.href}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey) return;
        if (canGoBackInApp()) {
          event.preventDefault();
          router.back();
        }
      }}
      className="text-primary -ml-2 inline-flex h-10 min-w-0 items-center rounded-field pr-2 text-[0.9375rem] font-semibold transition-opacity duration-150 active:opacity-50"
    >
      <ChevronLeftIcon className="size-6" strokeWidth={2.25} />
      {/* En los móviles más estrechos no cabe junto a la marca centrada:
          queda la flecha, y el nombre sigue ahí para los lectores de pantalla. */}
      <span className="truncate max-[359px]:sr-only">{parent.label}</span>
    </Link>
  );
}

/** La hoja de compartir del sistema, donde existe. En escritorio no se pinta. */
function ShareButton() {
  const canShare = useCanShare();
  if (!canShare) return null;

  async function share() {
    try {
      await navigator.share({ title: document.title, url: window.location.href });
    } catch {
      // Cerrar la hoja sin elegir nada también llega aquí: no es un error.
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      aria-label="Compartir"
      className="text-primary -mr-2 grid size-10 place-items-center rounded-field transition-opacity duration-150 active:opacity-50 md:hidden"
    >
      <ShareIcon className="size-[1.375rem]" />
    </button>
  );
}
