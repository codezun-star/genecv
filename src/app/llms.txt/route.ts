import { getAllArticles } from "@/lib/blog";
import { REGION_LIST } from "@/lib/cv/regions";
import { FREE_TEMPLATES, PREMIUM_TEMPLATES } from "@/lib/cv/templates";
import { HOME_STEPS, homeFaq } from "@/lib/landing-content";
import { isFreeLaunch } from "@/lib/payments/mode";
import { siteConfig } from "@/lib/site";

/**
 * /llms.txt — el mapa del sitio escrito para un modelo, no para un rastreador.
 *
 * sitemap.xml enumera URLs y nada más: un modelo que lo lee sabe que existen
 * treinta páginas, pero no cuál contesta a la pregunta que le acaban de hacer,
 * así que o las descarga todas o adivina. Este archivo da lo otro: qué es
 * GeneCV, qué hace, cuánto cuesta y, por cada página, una línea de qué
 * contiene.
 *
 * Se genera en lugar de escribirse a mano por la misma razón que el sitemap:
 * un archivo estático se queda desfasado en cuanto se publica una guía o se
 * añade una plantilla, y un mapa que miente es peor que no tener mapa. Sale de
 * las mismas fuentes que las páginas, así que no puede desincronizarse — el
 * modo de cobro incluido, que se lee del mismo flag que la interfaz.
 *
 * El formato es el de llms.txt: markdown, un `#` con el nombre, un `>` con el
 * resumen, y secciones `##` con listas anotadas.
 */
export const dynamic = "force-static";

function section(title: string, lines: string[]): string {
  return lines.length > 0 ? `\n## ${title}\n\n${lines.join("\n")}\n` : "";
}

export function GET(): Response {
  const articles = getAllArticles();
  const url = siteConfig.url;

  const precio = isFreeLaunch()
    ? [
        "- Coste: todo es gratuito ahora mismo, incluidas las plantillas premium,",
        "  que se descargan sin marca de agua durante el lanzamiento.",
        "- No hay suscripción, ni cuenta, ni tarjeta.",
      ]
    : [
        "- Coste: las plantillas gratuitas se descargan sin coste y sin marca de agua.",
        "  Las premium se prueban gratis; un pago único desbloquea todas las premium",
        "  y da derecho a una descarga, que consume el pase.",
        "- No hay suscripción ni hace falta crear una cuenta.",
      ];

  const body = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    "## Qué es",
    "",
    `- Nombre: ${siteConfig.name}`,
    `- Sitio: ${url}`,
    "- Tipo: generador de currículums en el navegador",
    "- Idioma de la interfaz: español",
    "- Salida: PDF",
    ...precio,
    "- Privacidad: no hay cuentas ni base de datos. El borrador vive en el",
    "  almacenamiento local del navegador y ni los datos ni la foto se envían",
    "  a ningún servidor. Si se borran los datos del navegador, se borra el CV.",
    "- ATS: son los sistemas que filtran candidaturas antes de que las lea una",
    "  persona. Suelen fallar con columnas, tablas y gráficos; GeneCV analiza la",
    "  plantilla y el contenido y avisa cuando algo puede dar problemas.",
    "",
    section(
      "Cómo se usa",
      HOME_STEPS.map((step, i) => `${i + 1}. **${step.title}**: ${step.text}`),
    ),
    section("Páginas principales", [
      `- [Inicio](${url}/): qué hace GeneCV, funciones, formatos y preguntas frecuentes.`,
      `- [Crear mi CV](${url}/crear): el editor. Formulario paso a paso, vista previa y descarga del PDF.`,
      `- [Plantillas](${url}/plantillas): catálogo completo, con la marca de cuáles son seguras para ATS.`,
      `- [Premium](${url}/premium): los diseños premium y cómo se obtienen.`,
      `- [Guías por país](${url}/articulos): qué espera cada mercado en un CV.`,
    ]),
    section(
      "Formatos de CV",
      REGION_LIST.map(
        (region) =>
          `- **${region.label}** (${region.markets}): documento llamado "${region.documentName}"; fotografía ${
            region.photo === "recommended"
              ? "habitual"
              : region.photo === "optional"
                ? "opcional"
                : "no recomendada"
          }.`,
      ),
    ),
    section("Plantillas", [
      `- Gratuitas (${FREE_TEMPLATES.length}): ${FREE_TEMPLATES.map((t) => t.name).join(", ")}.`,
      `- Premium (${PREMIUM_TEMPLATES.length}): ${PREMIUM_TEMPLATES.map((t) => t.name).join(", ")}.`,
      "- Las plantillas de una sola columna son las que mejor pasan un ATS; las",
      "  de barra lateral o retícula son más arriesgadas y la interfaz lo avisa.",
    ]),
    section(
      "Preguntas frecuentes",
      homeFaq().map((item) => `- **${item.q}** ${item.a}`),
    ),
    section(
      "Guías por país",
      articles.map(
        (article) =>
          `- [${article.title}](${url}/articulos/${article.slug}): ${article.description} (${article.country}, revisada ${article.updatedAt || article.publishedAt})`,
      ),
    ),
    section("Legal", [
      `- [Privacidad](${url}/privacidad)`,
      `- [Términos](${url}/terminos)`,
    ]),
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
