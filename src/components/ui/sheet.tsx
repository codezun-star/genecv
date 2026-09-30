"use client";

import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import { useEffect, useEffectEvent, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { CloseIcon } from "@/components/ui/icons";
import { useIsClient } from "@/lib/client";
import { cn } from "@/lib/utils";

/**
 * Hoja inferior, el menú de las aplicaciones móviles.
 *
 * Sube desde el borde, oscurece lo de detrás y se cierra de cuatro formas: la
 * X, tocando fuera, la tecla Escape y arrastrándola hacia abajo por el
 * asidero. El arrastre sale solo de la cabecera y no de toda la hoja, porque
 * si no el gesto de desplazar el contenido y el de cerrarla serían el mismo.
 *
 * Va en un portal al `<body>` por el `position: fixed`: cualquier antepasado
 * con `transform` o `backdrop-filter` —la barra de pestañas, la transición
 * entre pantallas— lo ataría a su propia caja en lugar de a la pantalla.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  description,
  size = "auto",
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  /** `full` ocupa toda la pantalla menos una franja arriba, como las hojas de iOS. */
  size?: "auto" | "full";
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const isClient = useIsClient();
  const panel = useRef<HTMLDivElement>(null);
  const drag = useDragControls();
  const titleId = useId();

  const close = useEffectEvent(onClose);

  useEffect(() => {
    if (!open) return;

    // Al abrir: el foco entra en la hoja, lo de detrás deja de desplazarse y,
    // al cerrar, todo vuelve como estaba, foco incluido.
    const previous = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const frame = requestAnimationFrame(() => panel.current?.focus());

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "Tab") trapFocus(event, panel.current);
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = previousOverflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, [open]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    // Cierra si se ha bajado un buen trecho o si se ha soltado con impulso,
    // que es como se despacha una hoja con el pulgar.
    if (info.offset.y > 96 || info.velocity.y > 480) onClose();
  }

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div key="sheet" className="fixed inset-0 z-50">
          <motion.div
            aria-hidden
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="bg-ink/40 absolute inset-0"
          />

          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{
              y: "100%",
              transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            drag="y"
            dragListener={false}
            dragControls={drag}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.8 }}
            onDragEnd={handleDragEnd}
            className={cn(
              "bg-canvas shadow-lift absolute inset-x-0 bottom-0 mx-auto flex max-w-2xl flex-col rounded-t-[1.375rem] outline-none",
              size === "full"
                ? "h-[calc(100dvh-env(safe-area-inset-top)-0.75rem)]"
                : "max-h-[calc(100dvh-env(safe-area-inset-top)-0.75rem)]",
            )}
          >
            <div
              onPointerDown={(event) => drag.start(event)}
              className="cursor-grab touch-none px-5 pt-2.5 pb-3 select-none active:cursor-grabbing"
            >
              <div className="bg-line-strong mx-auto h-1.5 w-10 rounded-full" />
              <div className="mt-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 id={titleId} className="text-lg font-bold">
                    {title}
                  </h2>
                  {description && (
                    <div className="text-ink-muted mt-0.5 truncate text-xs">
                      {description}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  // El arrastre empieza en `pointerdown`; sin esto, tocar la X
                  // arrancaría un arrastre en vez de un clic.
                  onPointerDown={(event) => event.stopPropagation()}
                  aria-label="Cerrar"
                  className="bg-surface text-ink-soft hover:text-primary -mr-1 grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-150"
                >
                  <CloseIcon className="size-[1.125rem]" strokeWidth={2.25} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>

            {footer ? (
              <div className="border-line border-t px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                {footer}
              </div>
            ) : (
              <div aria-hidden className="h-[env(safe-area-inset-bottom)] shrink-0" />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Mantiene el tabulador dentro de la hoja mientras está abierta. */
function trapFocus(event: KeyboardEvent, container: HTMLElement | null) {
  if (!container) return;
  const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE));
  if (items.length === 0) {
    event.preventDefault();
    return;
  }

  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && (active === first || active === container)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
