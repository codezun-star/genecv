import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site";

/**
 * Marca de GeneCV.
 *
 * Se usa el lockup compacto (icono + logotipo, sin el eslogan) porque a la
 * altura a la que se muestra —32 px en la cabecera— el eslogan del logo
 * completo queda ilegible. Los dos ficheros los genera `scripts/build-logo.mjs`
 * a partir de `assets/logocv.png`.
 *
 * El PNG lleva transparencia, así que funciona sobre la cabecera translúcida
 * (`bg-canvas/85` con desenfoque). El interior del documento del icono es
 * transparente, de modo que la marca está pensada para fondos claros; sobre uno
 * oscuro se leería como un contorno.
 */
const LOGO = {
  src: "/logo-genecv-compact.png",
  width: 339,
  height: 96,
};

export function Logo({
  className,
  priority = false,
}: {
  className?: string;
  /** Actívalo en la cabecera: es lo primero que se ve al cargar. */
  priority?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — inicio`}
      className={cn(
        "inline-flex items-center transition-opacity duration-150 hover:opacity-90",
        className,
      )}
    >
      <Image
        src={LOGO.src}
        alt={siteConfig.name}
        width={LOGO.width}
        height={LOGO.height}
        priority={priority}
        // El alto manda y el ancho se calcula solo, que es lo que evita que el
        // logo salte de tamaño mientras carga la fuente o la propia imagen.
        className="h-8 w-auto"
      />
    </Link>
  );
}
