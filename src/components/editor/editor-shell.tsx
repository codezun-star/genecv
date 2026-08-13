"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

import { useCv } from "@/components/editor/use-cv";
import { ReviewStep } from "@/components/editor/steps/review-step";
import { EducationStep } from "@/components/editor/steps/education-step";
import { ExperienceStep } from "@/components/editor/steps/experience-step";
import { FormatStep } from "@/components/editor/steps/format-step";
import { PersonalStep } from "@/components/editor/steps/personal-step";
import { SkillsStep } from "@/components/editor/steps/skills-step";
import { TemplateStep } from "@/components/editor/steps/template-step";
import { CvPreview } from "@/components/cv/cv-preview";
import { AdSlot } from "@/components/layout/ad-slot";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { buildFileName, downloadCvPdf } from "@/lib/cv/pdf/export";
import { buildCvView } from "@/lib/cv/view";
import { DownloadError, downloadPaidPdf } from "@/lib/payments/checkout-client";
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
  const {
    cv,
    hydrated,
    resumed,
    saveState,
    locked,
    isPremiumTemplate,
    pass,
    consumePass,
    clearPass,
    reset,
  } = useCv();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [dismissedResume, setDismissedResume] = useState(false);

  const view = useMemo(() => buildCvView(cv), [cv]);
  const Current = STEPS[step].Component;
  const isLast = step === STEPS.length - 1;

  function goTo(next: number) {
    if (next < 0 || next >= STEPS.length) return;
    setDirection(next > step ? 1 : -1);
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /**
   * El único botón de descarga, para los dos caminos.
   *
   * Con una plantilla premium el PDF lo sirve el servidor, tras verificar el
   * pase contra Paddle y consumirlo. Con una gratuita se genera aquí mismo, en
   * el navegador, sin pasar por ninguna API.
   *
   * Con pase, el servidor es quien decide: aquí solo se refleja lo que ya ha
   * pasado allí. Por eso el pase local se borra *después* de que la descarga
   * haya ido bien, y no antes.
   */
  async function handleExport() {
    // Premium sin pase: la compra la lleva el bloque del paso de revisión.
    if (locked) return;

    if (isPremiumTemplate && !pass) return;

    setExporting(true);
    setExportError(null);

    try {
      if (isPremiumTemplate && pass) {
        await downloadPaidPdf({
          transactionId: pass.transactionId,
          templateId: cv.templateId,
          cv,
        });

        // Consumido en el servidor: se refleja aquí y vuelve el bloqueo.
        consumePass();
      } else {
        await downloadCvPdf(cv);
      }
    } catch (error) {
      if (error instanceof DownloadError) {
        setExportError(error.message);

        // El pase ya no existe o nunca valió: quitarlo evita dejar al usuario
        // pulsando un botón que va a fallar siempre. Los demás errores —un
        // fallo de render, por ejemplo— lo dejan intacto, porque el servidor lo
        // ha devuelto y el reintento debe ser gratis.
        if (
          error.code === "already_used" ||
          error.code === "not_found" ||
          error.code === "price_mismatch"
        ) {
          clearPass();
        }
      } else {
        setExportError(
          "No se pudo generar el PDF. Recarga la página e inténtalo de nuevo.",
        );
      }
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
  if (!hydrated) {
    return (
      <Container className="py-24">
        <div className="text-ink-muted flex items-center justify-center gap-3">
          <span className="border-secondary-200 border-t-primary size-5 animate-spin rounded-full border-2" />
          Cargando tu borrador…
        </div>
      </Container>
    );
  }

  return (
    <Container size="wide" className="py-8">
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
        <div className="min-w-0">
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

          <div className="border-line mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
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
                // Con una premium sin pase la compra la lleva el bloque del
                // paso de revisión, no este botón.
                !locked && (
                  <div className="flex flex-wrap items-center gap-3">
                    {isPremiumTemplate && (
                      // El botón está al final del formulario, lejos del bloque
                      // que explica el modelo. Nadie debería gastar el pase sin
                      // tener el aviso a la vista.
                      <span className="text-ink-muted text-xs">
                        Usará tu pase
                      </span>
                    )}
                    <Button onClick={handleExport} disabled={exporting}>
                      {exporting ? "Generando PDF…" : "Descargar PDF"}
                    </Button>
                  </div>
                )
              ) : (
                <Button onClick={() => goTo(step + 1)}>Siguiente →</Button>
              )}
            </div>
          </div>

          {exportError && (
            <p className="text-danger mt-3 text-sm">{exportError}</p>
          )}

          <div className="mt-8">
            <AdSlot slotId="editor-bottom" format="leaderboard" />
          </div>

          <div className="border-line mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-6">
            <p className="text-ink-muted text-xs leading-relaxed">
              Tu progreso se guarda solo en este navegador. Puedes cerrar la
              pestaña y continuar más tarde desde este mismo dispositivo.
            </p>
            <Button variant="danger" size="sm" onClick={handleReset}>
              Borrar borrador
            </Button>
          </div>
        </div>

        {/* ------------------------------------------------------ Preview */}
        <aside className="min-w-0">
          <div className="lg:sticky lg:top-24">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-ink text-sm font-semibold">
                Vista previa
              </h2>
              <span className="text-ink-muted text-xs">
                {buildFileName(cv)}
              </span>
            </div>

            {/* On small screens the preview is collapsed by default so the
                form stays the focus. */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowPreviewMobile((v) => !v)}
              >
                {showPreviewMobile ? "Ocultar vista previa" : "Ver mi CV"}
              </Button>
            </div>

            <div
              className={cn(
                "mt-3",
                showPreviewMobile ? "block" : "hidden lg:block",
              )}
            >
              <CvPreview
                view={view}
                templateId={cv.templateId}
                locked={locked}
              />
            </div>

            <div className="mt-4 hidden lg:block">
              <AdSlot slotId="editor-sidebar" format="rectangle" />
            </div>
          </div>
        </aside>
      </div>
    </Container>
  );
}

function StepNav({
  step,
  onSelect,
}: {
  step: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav aria-label="Pasos del editor">
      <ol className="flex flex-wrap gap-1.5">
        {STEPS.map((item, index) => {
          const active = index === step;
          const done = index < step;

          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "rounded-field relative px-3 py-2 text-sm font-medium transition-colors duration-150",
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
