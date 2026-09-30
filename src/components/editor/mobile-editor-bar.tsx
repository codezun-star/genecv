"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  EyeIcon,
} from "@/components/ui/icons";
import { buttonStyles } from "@/components/ui/button";
import { useCoarsePointer, useIsClient } from "@/lib/client";
import { cn } from "@/lib/utils";

/**
 * La barra de acciones del editor en el móvil, pegada abajo como la de una
 * app: atrás, ver el CV y avanzar —o descargar, en el último paso—, siempre al
 * alcance del pulgar en lugar de al final de un formulario largo.
 *
 * Mientras se escribe se retira: con el teclado en pantalla abierto quedan
 * pocos centímetros de formulario a la vista y la barra se comería la mitad.
 *
 * Va en un portal al `<body>` porque el `<main>` se anima con `transform` al
 * cambiar de pantalla, y un `position: fixed` dentro quedaría atado a él.
 */
export function MobileEditorBar({
  isFirst,
  isLast,
  exporting,
  exportError,
  onPrevious,
  onNext,
  onExport,
  onPreview,
}: {
  isFirst: boolean;
  isLast: boolean;
  exporting: boolean;
  exportError: string | null;
  onPrevious: () => void;
  onNext: () => void;
  onExport: () => void;
  onPreview: () => void;
}) {
  const isClient = useIsClient();
  const typing = useSoftKeyboardOpen();

  if (!isClient) return null;

  return createPortal(
    <div
      className={cn(
        "border-line bg-canvas/90 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-lg transition-transform duration-200 ease-out-brand select-none lg:hidden",
        typing && "pointer-events-none translate-y-full",
      )}
    >
      {exportError && (
        <p role="alert" className="text-danger mx-auto max-w-2xl px-4 pt-2 text-xs">
          {exportError}
        </p>
      )}

      <div className="mx-auto flex max-w-2xl items-center gap-2 py-2.5 pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isFirst}
          aria-label="Paso anterior"
          className={buttonStyles({
            variant: "outline",
            className: "size-11 shrink-0 px-0 active:scale-95",
          })}
        >
          <ChevronLeftIcon className="size-5" strokeWidth={2.25} />
        </button>

        <button
          type="button"
          onClick={onPreview}
          aria-haspopup="dialog"
          className={buttonStyles({
            variant: "outline",
            className: "h-11 shrink-0 px-3.5 active:scale-95",
          })}
        >
          <EyeIcon className="size-5" />
          <span className="max-[359px]:sr-only">Ver CV</span>
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className={buttonStyles({ className: "h-11 min-w-0 flex-1 px-3 active:scale-[0.98]" })}
          >
            {!exporting && <DownloadIcon className="size-5" />}
            {exporting ? "Generando…" : "Descargar PDF"}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className={buttonStyles({ className: "h-11 min-w-0 flex-1 px-3 active:scale-[0.98]" })}
          >
            Siguiente
            <ChevronRightIcon className="size-5" strokeWidth={2.25} />
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}

/**
 * Si hay un campo de texto enfocado en un dispositivo táctil, que es cuando
 * sale el teclado en pantalla. Con ratón y teclado físico no se esconde nada.
 */
function useSoftKeyboardOpen(): boolean {
  const coarse = useCoarsePointer();
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!coarse) return;

    function onFocusIn(event: FocusEvent) {
      if (opensKeyboard(event.target)) setTyping(true);
    }
    function onFocusOut(event: FocusEvent) {
      if (opensKeyboard(event.target)) setTyping(false);
    }

    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, [coarse]);

  return coarse && typing;
}

const NO_KEYBOARD = new Set(["checkbox", "radio", "file", "button", "submit", "reset", "range", "color", "image"]);

function opensKeyboard(target: EventTarget | null): boolean {
  if (target instanceof HTMLTextAreaElement) return true;
  if (target instanceof HTMLInputElement) return !NO_KEYBOARD.has(target.type);
  return target instanceof HTMLElement && target.isContentEditable;
}
