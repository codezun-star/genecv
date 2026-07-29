import "server-only";

import { createElement } from "react";

import { buildFileName } from "@/lib/cv/pdf/export";
import type { CvData } from "@/lib/cv/types";
import { buildCvView } from "@/lib/cv/view";

/**
 * Genera el PDF en el servidor.
 *
 * Reutiliza exactamente el mismo `CvDocument` que la descarga gratuita del
 * navegador: no hay una segunda implementación del diseño, así que un PDF de
 * pago no puede salir distinto del que el usuario vio en la vista previa.
 * Lo único que cambia es el destino — un Buffer en lugar de un Blob.
 *
 * `@react-pdf/renderer` es pesado y solo hace falta cuando alguien compra, así
 * que se importa de forma dinámica para no penalizar el arranque en frío del
 * resto de rutas.
 */
export async function renderCvPdf(
  cv: CvData,
): Promise<{ buffer: Buffer; fileName: string }> {
  const [{ renderToBuffer }, { CvDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/lib/cv/pdf/document"),
  ]);

  const fileName = buildFileName(cv);
  const view = buildCvView(cv);

  const buffer = await renderToBuffer(
    createElement(CvDocument, {
      view,
      templateId: cv.templateId,
      title: fileName.replace(/\.pdf$/, ""),
    }),
  );

  return { buffer, fileName };
}
