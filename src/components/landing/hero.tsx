"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { Container } from "@/components/layout/container";
import { buttonStyles } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Soft brand wash behind the hero. */}
      <div
        aria-hidden
        className="from-primary-50 pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b via-surface to-surface"
      />

      <Container className="py-16 sm:py-24">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.07 }}
          className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]"
        >
          <div>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="border-primary-100 bg-canvas text-primary inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
            >
              <span className="bg-success size-1.5 rounded-full" />
              {/* Acota la promesa a las gratuitas a propósito. Suelto, «gratis
                  y sin marcas de agua» se lee como «todo el catálogo», y quien
                  llegue por esa frase y se encuentre una premium con marca de
                  agua tendrá razón al sentirse engañado. Así es cierto tanto
                  ahora como cuando las premium se cobren. */}
              Tres plantillas gratis, sin registro ni marca de agua
            </motion.p>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mt-5 text-4xl font-extrabold sm:text-5xl lg:text-[3.4rem]"
            >
              Crea un CV profesional
              <span className="text-primary"> en minutos</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="text-ink-soft mt-5 max-w-xl text-lg leading-relaxed"
            >
              Elige el formato de tu país, completa el formulario guiado y
              descarga un PDF listo para enviar. GeneCV adapta la foto, el orden
              de las secciones y la terminología según el mercado al que te
              postules.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link href="/crear" className={buttonStyles({ size: "lg" })}>
                Crear mi CV
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4"
                  aria-hidden
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                href="/plantillas"
                className={buttonStyles({ variant: "outline", size: "lg" })}
              >
                Ver plantillas
              </Link>
            </motion.div>

            <motion.ul
              variants={fadeUp}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="text-ink-muted mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm"
            >
              {[
                "Compatible con ATS",
                "Exporta a PDF",
                "Tus datos no salen del navegador",
              ].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-success size-4"
                    aria-hidden
                  >
                    <path d="M4 12.5l5 5L20 6.5" />
                  </svg>
                  {item}
                </li>
              ))}
            </motion.ul>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.34, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <HeroPreview />
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}

/** Decorative mock of the live preview — pure CSS, no user data involved. */
function HeroPreview() {
  return (
    <div className="relative mx-auto max-w-md">
      <div
        aria-hidden
        className="bg-secondary-200/40 absolute -top-4 -right-4 h-full w-full rounded-card"
      />
      <div className="border-line bg-canvas shadow-lift relative rounded-card border p-6">
        <div className="flex items-start gap-4">
          <div className="bg-primary-100 size-14 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="bg-primary h-3.5 w-40 rounded-full" />
            <div className="bg-secondary-300 h-2.5 w-28 rounded-full" />
          </div>
        </div>

        <div className="bg-line my-5 h-px" />

        {[
          { w: "w-24", lines: 3 },
          { w: "w-32", lines: 2 },
          { w: "w-20", lines: 2 },
        ].map((block, i) => (
          <div key={i} className="mb-5 last:mb-0">
            <div className={`bg-primary-400 mb-3 h-2.5 rounded-full ${block.w}`} />
            <div className="space-y-2">
              {Array.from({ length: block.lines }).map((_, j) => (
                <motion.div
                  key={j}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.35 + i * 0.1 + j * 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ originX: 0 }}
                  className="bg-surface-dark h-2 rounded-full"
                  data-width={j}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
