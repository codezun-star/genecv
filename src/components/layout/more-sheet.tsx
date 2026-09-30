"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  BookIcon,
  ChevronRightIcon,
  DocumentIcon,
  GlobeIcon,
  InstallIcon,
  PenIcon,
  ShareIcon,
  ShieldIcon,
  SparkleIcon,
  TemplatesIcon,
} from "@/components/ui/icons";
import { BottomSheet } from "@/components/ui/sheet";
import { promptInstall, useInstallMode } from "@/lib/pwa";
import { footerNav, siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * El menú «Más» de la barra de pestañas.
 *
 * Reúne lo que no cabe en las cuatro pestañas, con los mismos grupos que el
 * pie de página —que en el móvil se queda en una línea— para que ningún enlace
 * se pierda al cambiar de pantalla. Y es donde vive «Instalar la app», que es
 * lo que convierte la web en un icono en la pantalla de inicio.
 */
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "/crear": PenIcon,
  "/plantillas": TemplatesIcon,
  "/premium": SparkleIcon,
  "/articulos": BookIcon,
  "/privacidad": ShieldIcon,
  "/terminos": DocumentIcon,
};

export function MoreSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <BottomSheet open={open} onClose={onClose} title="Más" description={siteConfig.tagline}>
      <div className="space-y-6 pb-6">
        <InstallRow />

        {footerNav.map((group) => (
          <section key={group.title}>
            <h3 className="text-ink-muted px-5 text-xs font-semibold tracking-wide uppercase">
              {group.title}
            </h3>
            <ul className="bg-surface divide-line mx-4 mt-2 divide-y overflow-hidden rounded-card">
              {group.links.map((link) => {
                const Icon = ICONS[link.href] ?? GlobeIcon;
                const current = pathname === link.href;

                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "flex min-h-13 items-center gap-3 px-4 py-2 transition-colors duration-150 active:bg-surface-dark",
                        current ? "text-primary" : "text-ink",
                      )}
                    >
                      <span className="bg-canvas text-primary shadow-ring grid size-8 shrink-0 place-items-center rounded-lg">
                        <Icon className="size-[1.125rem]" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium">
                        {link.label}
                      </span>
                      <ChevronRightIcon className="text-ink-muted size-4" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        <p className="text-ink-muted px-5 text-center text-xs leading-relaxed">
          Tus datos se guardan solo en este dispositivo.
          <br />© {new Date().getFullYear()} {siteConfig.name}. Hecho por Codezun.
        </p>
      </div>
    </BottomSheet>
  );
}

/**
 * La fila de instalar. Solo aparece donde hay algo que hacer: el diálogo del
 * navegador en Chrome/Edge, o las instrucciones en Safari para iOS. Si ya se
 * está usando como aplicación, o el navegador no lo permite, no se pinta.
 */
function InstallRow() {
  const mode = useInstallMode();
  const [showSteps, setShowSteps] = useState(false);

  if (mode !== "prompt" && mode !== "ios") return null;

  return (
    <div className="border-primary-100 bg-primary-soft mx-4 rounded-card border p-4">
      <div className="flex items-center gap-3">
        <span className="bg-primary grid size-10 shrink-0 place-items-center rounded-xl text-white">
          <InstallIcon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-ink text-sm font-semibold">Instala GeneCV</p>
          <p className="text-ink-soft text-xs leading-snug">
            Ábrela desde la pantalla de inicio, a pantalla completa.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (mode === "prompt") void promptInstall();
            else setShowSteps((v) => !v);
          }}
          aria-expanded={mode === "ios" ? showSteps : undefined}
          className="bg-primary hover:bg-primary-dark h-9 shrink-0 rounded-full px-4 text-sm font-semibold text-white transition-colors duration-150 active:scale-95"
        >
          Instalar
        </button>
      </div>

      {mode === "ios" && showSteps && (
        <ol className="text-ink-soft border-primary-100 mt-3 space-y-1.5 border-t pt-3 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-primary font-semibold">1.</span>
            Toca
            <ShareIcon className="text-primary size-[1.125rem]" />
            <span className="font-medium">Compartir</span> en Safari.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-primary font-semibold">2.</span>
            Elige <span className="font-medium">«Añadir a pantalla de inicio»</span>.
          </li>
        </ol>
      )}
    </div>
  );
}
