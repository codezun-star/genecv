import { EditorShell } from "@/components/editor/editor-shell";
import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Crear mi CV gratis",
  description:
    "Editor guiado de currículum: elige el formato de tu país, completa el formulario paso a paso, comprueba la compatibilidad ATS y descarga el PDF.",
  path: "/crear",
  keywords: ["crear cv online", "editor de curriculum", "cv gratis pdf"],
});

export default function CreatePage() {
  return <EditorShell />;
}
