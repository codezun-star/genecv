"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { MobileEditorBar } from "@/components/editor/mobile-editor-bar";
import { useCv } from "@/components/editor/use-cv";
import { ReviewStep } from "@/components/editor/steps/review-step";
import { EducationStep } from "@/components/editor/steps/education-step";
import { ExperienceStep } from "@/components/editor/steps/experience-step";
import { FormatStep } from "@/components/editor/steps/format-step";
import { PersonalStep } from "@/components/editor/steps/personal-step";
import { SkillsStep } from "@/components/editor/steps/skills-step";
import { TemplateStep } from "@/components/editor/steps/template-step";
import { AdBanner } from "@/components/ads/ad-banner";
import { NativeAd } from "@/components/ads/native-ad";
import { CvPreview } from "@/components/cv/cv-preview";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/ui/sheet";
import { buildFileName, downloadCvPdf } from "@/lib/cv/pdf/export";
import { buildCvView } from "@/lib/cv/view";
import { cn } from "@/lib/utils";

// The template is picked up front, right after the market format: seeing the
// design while filling the form is the whole point of the live preview.
const STEPS = [
  { id: "formato", label: "Formato", Component: FormatStep },
  { id: "plantilla", label: "Plantilla", Component: TemplateStep },
  { id: "personal", label: "Datos personales", Component: PersonalStep },
  { id: "experiencia", label: "Experiencia", Component: ExperienceStep },
  { id: "formacion", label: "Formación", Component: EducationStep },
  { id: "habilidades", label: "Habilidades", Component: SkillsStep },
  { id: "revision", label: "Revisión y descarga", Component: ReviewStep },
] as const;

export function EditorShell() {
  const { cv, hydrated, resumed, saveState, reset } = useCv();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [dismissedResume, setDismissedResume] = useState(false);
  const form = useRef<HTMLDivElement>(null);

  const view = useMemo(() => buildCvView(cv), [cv]);
  const Current = STEPS[step].Component;
  const isLast = step === STEPS.length - 1;

  function goTo(next: number) {
    if (next < 0 || next >= STEPS.length) return;
    setDirection(next > step ? 1 : -1);
    setStep(next);

    // Sube hasta los pasos, no hasta arriba del todo: en el móvil la
    // presentación de la página ocupa media pantalla, y volver a pasar por
    // ella en cada paso es tiempo perdido. Solo si ya se había bajado de ahí.
    const node = form.current;
    if (node && node.getBoundingClientRect().top < 80) {
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      await downloadCvPdf(cv);
    } catch {
      setExportError(
        "No se pudo generar el PDF. Recarga la página e inténtalo de nuevo.",
      );
    } finally {
      setExporting(false);
    }
  }

  function handleReset() {
    const ok = window.confirm(
      "Se borrará todo lo que has escrito en este navegador. ¿Continuar?",
    );
    if (ok) {
      reset();
      goTo(0);
    }
  }

  // Avoid flashing an empty form before the saved draft is read.
  //
  // La espera ocupa casi lo mismo que el editor, a propósito. Si fuese una
  // franja baja, al llegar a /crear desde una página desplazada el documento
  // saldría tan corto que el navegador recortaría el desplazamiento a unos
  // pocos píxeles, Next daría por visto el principio de la página y no subiría
  // arriba: el titular quedaba escondido bajo la cabecera. Y el formulario ya
  // no empuja el pie al aparecer.
  if (!hydrated) {
    return (
      <Container className="min-h-[70vh] py-24">
        <div className="text-ink-muted flex items-center justify-center gap-3">
          <span className="border-secondary-200 border-t-primary size-5 animate-spin rounded-full border-2" />
          Cargando tu borrador…
        </div>
      </Container>
    );
  }

  return (
    <Container size="wide" className="py-6 lg:py-8">
      {resumed && !dismissedResume && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          className="border-primary-100 bg-primary-soft rounded-card mb-6 flex flex-wrap items-center justify-between gap-3 border p-4"
        >
          <p className="text-ink-soft text-sm">
            <span className="text-primary font-semibold">
              Hemos recuperado tu borrador.
            </span>{" "}
            Continúa donde lo dejaste.
          </p>
          <button
            type="button"
            onClick={() => setDismissedResume(true)}
            className="text-secondary hover:text-primary -mx-1 inline-flex min-h-9 items-center px-1 text-xs font-semibold transition-colors duration-150"
          >
            Entendido
          </button>
        </motion.div>
      )}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]">
        {/* --------------------------------------------------------- Form */}
        <div
          ref={form}
          className="min-w-0 scroll-mt-[calc(5rem+env(safe-area-inset-top))]"
        >
          <div className="mb-1 flex min-h-5 items-center justify-between gap-3 lg:hidden">
            <p className="text-ink-muted text-xs font-semibold">
              Paso {step + 1} de {STEPS.length}
            </p>
            <SaveIndicator state={saveState} />
          </div>

          <StepNav step={step} onSelect={goTo} />

          <div className="mt-6 overflow-hidden">
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={STEPS[step].id}
                custom={direction}
                initial={{ opacity: 0, x: direction * 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -24 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <Current />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* En el móvil estos botones viven en la barra fija de abajo. */}
          <div className="border-line mt-10 hidden flex-wrap items-center justify-between gap-3 border-t pt-6 lg:flex">
            <Button
              variant="outline"
              onClick={() => goTo(step - 1)}
              disabled={step === 0}
            >
              ← Anterior
            </Button>

            <div className="flex flex-wrap items-center gap-3">
              <SaveIndicator state={saveState} />
              {isLast ? (
                <Button onClick={handleExport} disabled={exporting}>
                  {exporting ? "Generando PDF…" : "Descargar PDF"}
                </Button>
              ) : (
                <Button onClick={() => goTo(step + 1)}>Siguiente →</Button>
              )}
            </div>
          </div>

          {exportError && (
            <p className="text-danger mt-3 hidden text-sm lg:block">{exportError}</p>
          )}

          <div className="border-line mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
            <p className="text-ink-muted text-xs leading-relaxed">
              Tu progreso se guarda solo en este navegador. Puedes cerrar la
              pestaña y continuar más tarde desde este mismo dispositivo.
            </p>
            <Button variant="danger" size="sm" onClick={handleReset}>
              Borrar borrador
            </Button>
          </div>

          {/* Debajo de todo, y no pegado al botón de descarga: en un editor,
              un anuncio junto al botón que la gente viene a pulsar se lleva
              clics que no eran para él. */}
          <AdBanner placement="banner" className="mt-10" />
        </div>

        {/* ------------------------------------------------------ Preview
            En el móvil la vista previa no ocupa sitio en la página: se abre
            a pantalla completa desde la barra de abajo. */}
        <aside className="hidden min-w-0 lg:block">
          <div className="lg:sticky lg:top-24">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-ink text-sm font-semibold">
                Vista previa
              </h2>
              <span className="text-ink-muted text-xs">
                {buildFileName(cv)}
              </span>
            </div>

            <div className="mt-3">
              <CvPreview view={view} templateId={cv.templateId} />
            </div>

            {/* Pegado junto a la vista previa: el editor es donde más rato
                se está, así que este hueco acompaña toda la sesión en lugar de
                verse una vez. Por debajo de 1024 px toda esta columna se
                esconde —la vista previa pasa a una hoja— y el hueco con ella. */}
            <AdBanner placement="sidebar" className="mt-4" />
          </div>
        </aside>
      </div>

      <NativeAd className="mt-12" />

      <MobileEditorBar
        isFirst={step === 0}
        isLast={isLast}
        exporting={exporting}
        exportError={exportError}
        onPrevious={() => goTo(step - 1)}
        onNext={() => goTo(step + 1)}
        onExport={handleExport}
        onPreview={() => setPreviewOpen(true)}
      />

      <BottomSheet
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Vista previa"
        description={buildFileName(cv)}
        size="full"
        footer={
          isLast ? (
            <Button onClick={handleExport} disabled={exporting} className="w-full">
              {exporting ? "Generando PDF…" : "Descargar PDF"}
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setPreviewOpen(false)} className="w-full">
              Seguir editando
            </Button>
          )
        }
      >
        <div className="bg-surface min-h-full px-4 py-4">
          <CvPreview view={view} templateId={cv.templateId} />
        </div>
      </BottomSheet>
    </Container>
  );
}

/**
 * Los pasos. En el móvil son una tira que se desliza con el dedo, como las
 * pestañas de una app, y el paso activo se centra solo al cambiar; en
 * pantallas anchas caben todos y se reparten en líneas.
 */
function StepNav({
  step,
  onSelect,
}: {
  step: number;
  onSelect: (index: number) => void;
}) {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const strip = list.current;
    const item = strip?.children[step] as HTMLElement | undefined;
    if (!strip || !item || strip.scrollWidth <= strip.clientWidth) return;

    // A mano y no con `scrollIntoView`: ese también movería la página en
    // vertical y se pelearía con el desplazamiento de `goTo`.
    strip.scrollTo({
      left: item.offsetLeft - (strip.clientWidth - item.offsetWidth) / 2,
      behavior: "smooth",
    });
  }, [step]);

  return (
    <nav aria-label="Pasos del editor">
      <ol
        ref={list}
        className="no-scrollbar relative -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
      >
        {STEPS.map((item, index) => {
          const active = index === step;
          const done = index < step;

          return (
            <li key={item.id} className="shrink-0">
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "rounded-field relative px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-150",
                  active
                    ? "text-primary"
                    : done
                      ? "text-secondary hover:text-primary"
                      : "text-ink-muted hover:text-secondary",
                )}
              >
                <span className="mr-1.5 text-xs opacity-70">{index + 1}</span>
                {item.label}
                {active && (
                  <motion.span
                    layoutId="step-underline"
                    className="bg-primary absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full"
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="bg-surface-dark mt-1 h-1 overflow-hidden rounded-full">
        <motion.div
          className="bg-primary h-full rounded-full"
          initial={false}
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </nav>
  );
}

function SaveIndicator({ state }: { state: "idle" | "saving" | "saved" | "error" }) {
  if (state === "idle") return null;

  const copy = {
    saving: { text: "Guardando…", className: "text-ink-muted" },
    saved: { text: "Guardado", className: "text-success" },
    error: {
      text: "No se pudo guardar (¿almacenamiento lleno?)",
      className: "text-danger",
    },
  }[state];

  return (
    <span className={cn("text-xs font-medium", copy.className)}>
      {state === "saved" && "✓ "}
      {copy.text}
    </span>
  );
}
