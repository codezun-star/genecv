import { atsSignals, type TemplateMeta } from "@/lib/cv/templates";
import type { CvData } from "@/lib/cv/types";

export type CheckSeverity = "error" | "warning" | "info";

export interface AtsCheck {
  id: string;
  severity: CheckSeverity;
  title: string;
  detail: string;
  /** What the user can do about it. */
  fix?: string;
}

export interface AtsReport {
  /** 0-100. Only a heuristic, never a guarantee. */
  score: number;
  checks: AtsCheck[];
  passed: AtsCheck[];
}

/** Weight subtracted from the score per severity. */
const PENALTY: Record<CheckSeverity, number> = {
  error: 22,
  warning: 10,
  info: 4,
};

/**
 * Heuristic ATS compatibility review.
 *
 * Applicant Tracking Systems read the PDF as a flat text stream. The usual
 * failure modes are multi-column layouts (text gets interleaved), tables,
 * meaning carried only by graphics, and content in the page header/footer.
 * We check the chosen template for those, plus a few content-level issues.
 */
export function analyzeAts(cv: CvData, template: TemplateMeta): AtsReport {
  const signals = atsSignals(template);
  const checks: AtsCheck[] = [];
  const passed: AtsCheck[] = [];

  const record = (ok: boolean, check: AtsCheck) => {
    (ok ? passed : checks).push(check);
  };

  // --- Template structure -------------------------------------------------
  record(!signals.multiColumn, {
    id: "multi-column",
    severity: "error",
    title: "La plantilla usa dos columnas",
    detail:
      "Muchos ATS leen el PDF de izquierda a derecha y mezclan el texto de la barra lateral con el del cuerpo, así que tu experiencia puede llegar desordenada.",
    fix: "Si vas a subir el CV a un portal de empleo, cambia a «Clásica ATS» o «Moderna». Reserva las plantillas de dos columnas para enviarlo por email o en mano.",
  });

  record(!signals.usesTables, {
    id: "tables",
    severity: "error",
    title: "La plantilla se apoya en tablas",
    detail:
      "Las tablas suelen extraerse celda a celda y rompen el orden de lectura.",
    fix: "Elige una plantilla de flujo simple.",
  });

  record(!signals.graphicRatings, {
    id: "graphic-ratings",
    severity: "warning",
    title: "El nivel de habilidades se muestra con gráficos",
    detail:
      "Las barras y los puntos no son texto: el ATS ve el nombre de la habilidad, pero no tu nivel.",
    fix: "Añade el nivel también por escrito, o usa una plantilla que lo escriba en texto.",
  });

  record(!signals.headerFooterContent, {
    id: "header-footer",
    severity: "warning",
    title: "Hay contenido en la cabecera o el pie de página",
    detail:
      "Parte de los parsers descartan esa zona, y con ella datos de contacto importantes.",
    fix: "Mantén el email y el teléfono en el cuerpo del documento.",
  });

  // --- Content ------------------------------------------------------------
  const { personal, experience, skills } = cv;

  record(Boolean(personal.email?.trim()), {
    id: "email",
    severity: "error",
    title: "Falta el correo electrónico",
    detail:
      "Es el campo que casi todos los ATS usan para identificar la candidatura.",
    fix: "Añádelo en el paso de datos personales.",
  });

  record(Boolean(personal.phone?.trim()), {
    id: "phone",
    severity: "warning",
    title: "Falta el teléfono",
    detail: "Muchos formularios lo dan por hecho al importar el CV.",
    fix: "Añade un teléfono con prefijo internacional.",
  });

  record(Boolean(personal.headline?.trim()), {
    id: "headline",
    severity: "warning",
    title: "No has indicado un puesto",
    detail:
      "El titular profesional es de lo primero que se compara con el nombre de la vacante.",
    fix: "Escribe el puesto al que aspiras, con las mismas palabras que la oferta.",
  });

  const summaryWords = personal.summary?.trim().split(/\s+/).filter(Boolean) ?? [];
  record(summaryWords.length >= 25, {
    id: "summary-length",
    severity: "info",
    title: "El perfil profesional es muy corto",
    detail:
      "Un resumen de 40-80 palabras da margen para incluir las palabras clave del sector.",
    fix: "Usa el banco de frases para ampliarlo.",
  });

  const filledExperience = experience.filter(
    (item) => item.position.trim() || item.company.trim(),
  );
  record(filledExperience.length > 0, {
    id: "experience-empty",
    severity: "error",
    title: "No hay experiencia laboral",
    detail:
      "Sin puestos ni fechas el ATS no puede calcular tus años de experiencia.",
    fix: "Añade al menos un puesto; también valen prácticas o voluntariado.",
  });

  // A half-picked date ("2021-" with no month) does not count as complete.
  const hasFullMonth = (value: string) => /^\d{4}-\d{2}$/.test(value);
  const datedExperience = filledExperience.filter(
    (item) =>
      hasFullMonth(item.startDate) &&
      (item.current || hasFullMonth(item.endDate)),
  );
  record(
    filledExperience.length === 0 ||
      datedExperience.length === filledExperience.length,
    {
      id: "experience-dates",
      severity: "warning",
      title: "Hay puestos sin fechas completas",
      detail:
        "Las fechas de inicio y fin son lo que usa el ATS para ordenar tu trayectoria.",
      fix: "Completa el mes de inicio y el de fin, o marca «Actualmente aquí».",
    },
  );

  const achievementCount = filledExperience.reduce(
    (total, item) =>
      total + item.achievements.filter((line) => line.trim().length > 0).length,
    0,
  );
  record(filledExperience.length === 0 || achievementCount >= filledExperience.length, {
    id: "achievements",
    severity: "warning",
    title: "Algún puesto no tiene logros descritos",
    detail:
      "Las descripciones son la principal fuente de palabras clave para el filtro.",
    fix: "Añade al menos un logro por puesto, mejor si va con una cifra.",
  });

  const namedSkills = skills.filter((skill) => skill.name.trim().length > 0);
  record(namedSkills.length >= 5, {
    id: "skills-count",
    severity: "warning",
    title: "Pocas habilidades listadas",
    detail:
      "La sección de habilidades es donde el ATS busca coincidencias exactas con la oferta.",
    fix: "Enumera al menos cinco, usando los términos tal y como aparecen en la vacante.",
  });

  record(personal.showPhoto === false || cv.region !== "anglo", {
    id: "photo-anglo",
    severity: "warning",
    title: "Foto en un CV para el mercado anglosajón",
    detail:
      "En Estados Unidos, Reino Unido o Canadá la foto puede provocar el descarte automático por política antidiscriminación.",
    fix: "Desactiva la foto en el paso de datos personales.",
  });

  const penalty = checks.reduce(
    (total, check) => total + PENALTY[check.severity],
    0,
  );

  return {
    score: Math.max(0, Math.min(100, 100 - penalty)),
    checks: checks.sort(
      (a, b) => PENALTY[b.severity] - PENALTY[a.severity],
    ),
    passed,
  };
}

export function scoreLabel(score: number) {
  if (score >= 85) return { label: "Excelente", tone: "success" as const };
  if (score >= 65) return { label: "Aceptable", tone: "warning" as const };
  return { label: "Riesgo alto", tone: "danger" as const };
}
