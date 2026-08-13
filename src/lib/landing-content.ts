/**
 * Textos de la portada que se usan en más de un sitio.
 *
 * Los pasos y las preguntas no viven en `sections.tsx` porque además de
 * pintarse alimentan los datos estructurados (`HowTo` y `FAQPage`) y
 * `/llms.txt`. Duplicarlos en cada consumidor acaba con el esquema diciendo
 * una cosa y la página otra, que es exactamente lo que las guías de datos
 * estructurados prohíben.
 *
 * Aparte, este módulo es TypeScript a secas, sin JSX ni componentes: eso es lo
 * que permite que un route handler lo importe sin arrastrar consigo la mitad
 * del árbol de React de la portada.
 */

import { FREE_TEMPLATES, PREMIUM_TEMPLATES } from "@/lib/cv/templates";

export const HOME_STEPS = [
  {
    title: "Elige tu formato",
    text: "España y Europa, Latinoamérica o anglosajón. Ajustamos foto, secciones y terminología.",
  },
  {
    title: "Completa el formulario",
    text: "Paso a paso, con sugerencias de frases por profesión y guardado automático.",
  },
  {
    title: "Elige plantilla y descarga",
    text: "Compara diseños con la vista previa y exporta el PDF con tu nombre en el archivo.",
  },
] as const;

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * Las preguntas de la portada.
 *
 * Es una función y no una constante porque dos de las respuestas dependen de
 * datos que cambian: cuántas plantillas hay en el catálogo y si las premium se
 * están cobrando. Escritas a mano se quedaron desfasadas —decían "las cuatro
 * plantillas base" cuando las gratuitas son tres, y anunciaban unas premium
 * "más adelante" que ya existen—, y eso importa más ahora que antes: el mismo
 * texto va al `FAQPage` y a `/llms.txt`, así que un dato viejo deja de ser una
 * errata en una página y pasa a ser lo que un asistente responde cuando le
 * preguntan si GeneCV es gratis.
 */
export function homeFaq(): FaqItem[] {
  const gratuitas = FREE_TEMPLATES.length;
  const premium = PREMIUM_TEMPLATES.length;

  return [
    {
      q: "¿Es realmente gratis?",
      a: `Las ${gratuitas} plantillas gratuitas, la vista previa y la exportación a PDF no cuestan nada y salen sin marca de agua, sin cuenta y sin tarjeta. Los ${premium} diseños premium se prueban gratis con tu contenido: un pago único los desbloquea todos para que compares, y ese pase se consume al descargar el PDF. No hay suscripción.`,
    },
    {
      q: "¿Dónde se guardan mis datos?",
      a: "En el almacenamiento local de tu navegador. No hay cuentas ni servidores: si borras los datos del navegador, se borra tu borrador.",
    },
    {
      q: "¿Qué es la compatibilidad ATS?",
      a: "Los ATS son los sistemas que filtran candidaturas antes de que las lea una persona. Suelen fallar con columnas, tablas y gráficos. GeneCV te avisa cuando tu elección de plantilla puede dar problemas.",
    },
    {
      q: "¿Puedo usarlo para otro país?",
      a: "Sí. GeneCV no está pensado para un solo mercado: eliges el formato al empezar y puedes cambiarlo en cualquier momento sin perder el contenido.",
    },
  ];
}
