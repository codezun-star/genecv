import type { CvData } from "@/lib/cv/types";
import { buildCvView } from "@/lib/cv/view";
import { toFileSlug } from "@/lib/utils";

/**
 * "Nombre_Apellido_CV.pdf" — accents stripped and spaces replaced so the file
 * is safe to attach anywhere. Falls back to "CV.pdf" when there is no name.
 */
export function buildFileName(cv: CvData): string {
  const slug = toFileSlug(cv.personal.firstName, cv.personal.lastName);
  const suffix = cv.region === "anglo" ? "Resume" : "CV";
  return slug === "CV" ? `${suffix}.pdf` : `${slug}_${suffix}.pdf`;
}

/**
 * Generates the PDF in the browser and triggers the download.
 *
 * `@react-pdf/renderer` is imported dynamically: it is a large dependency and
 * only ever runs on the client, so keeping it out of the initial bundle makes
 * the editor load noticeably faster.
 */
export async function downloadCvPdf(cv: CvData): Promise<void> {
  const [{ pdf }, { CvDocument }, React] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/lib/cv/pdf/document"),
    import("react"),
  ]);

  const fileName = buildFileName(cv);
  const view = buildCvView(cv);

  const blob = await pdf(
    React.createElement(CvDocument, {
      view,
      templateId: cv.templateId,
      title: fileName.replace(/\.pdf$/, ""),
    }),
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
