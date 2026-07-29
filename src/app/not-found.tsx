import Link from "next/link";

import { Container } from "@/components/layout/container";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container size="narrow" className="py-28 text-center">
      <p className="text-primary font-display text-6xl font-extrabold">404</p>
      <h1 className="mt-4 text-3xl font-bold">Esta página no existe</h1>
      <p className="text-ink-soft mt-3 leading-relaxed">
        El enlace puede estar roto o la página haberse movido. Tu borrador de CV
        sigue guardado en este navegador.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/" className={buttonStyles()}>
          Volver al inicio
        </Link>
        <Link href="/crear" className={buttonStyles({ variant: "outline" })}>
          Ir al editor
        </Link>
      </div>
    </Container>
  );
}
