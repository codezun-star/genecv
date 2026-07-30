# Calidad del texto que llega al PDF

Todo lo que el usuario escribe pasa por `src/lib/cv/text.ts` antes de aparecer
en la vista previa o en el PDF. Este documento explica qué hace y por qué está
en ese punto del flujo.

## El problema real: qué soporta la fuente del PDF

El PDF se compone con **Helvetica**, una de las 14 fuentes estándar del formato.
El proyecto no registra ninguna fuente propia — no hay una sola llamada a
`Font.register` en `src/lib/cv/pdf/document.tsx` —, de modo que el texto se
codifica en **WinAnsi, es decir CP1252**.

Lo que no cabe en ese repertorio no desaparece: se reinterpreta byte a byte y
sale basura. Comprobado generando un PDF real con el propio proyecto y
extrayendo después su texto:

| Se escribe | Sale en el PDF |
| --- | --- |
| `Hola 😀 mundo 🚀 fin ✅` | `Hola   = mundo   =€ fin` |
| `A → B ✅✅ ⭐` | `A ’ B` |
| `≥ ≈ ∞` | `e d H \`` |
| `Привет 中文` | `@825B -‡` |
| `a<ZWSP>b<BOM>c` | `a b cÿd` |

En cambio **sí** sobreviven, y por tanto se conservan tal cual: acentos y ñ,
comillas tipográficas (`“ ” ‘ ’`), guiones en/em (`– —`), elipsis (`…`) y los
símbolos `€ £ © ® ™ ° ± ½ • § µ`.

Por eso la regla no es «quitar emojis», que es un blanco móvil, sino la más
precisa y estable: **conservar lo que CP1252 puede representar**, traducir un
puñado de símbolos frecuentes a su equivalente ASCII (`→` → `->`, `≥` → `>=`,
`▪` → `•`) y eliminar el resto.

## Dónde se filtra, y por qué ahí

El filtro vive en **`src/lib/cv/view.ts`**, dentro de `clean()` y
`cleanMultiline()`, que ya eran el único punto por el que pasaba todo el texto
antes de renderizarse. Es decir, se extendió la sanitización que ya existía en
lugar de añadir otra en paralelo.

Ese fichero construye el modelo de vista que consumen **a la vez** la vista
previa en HTML y el documento PDF. Filtrar ahí da tres cosas:

1. **Una sola fuente de verdad.** Vista previa y PDF no pueden divergir, porque
   comen del mismo modelo. Si se filtrase solo al generar el PDF, el usuario
   vería el emoji en la vista previa y no en la descarga.
2. **El editor no toca lo que el usuario escribió.** El emoji sigue en el campo
   y en el borrador guardado. Borrarle a alguien lo que acaba de teclear, sin
   posibilidad de deshacerlo, es peor que el problema que resuelve.
3. **Coste cero al escribir.** No se filtra en cada pulsación ni al guardar: se
   filtra al construir la vista, que es trabajo que ya se hacía.

Se descartó filtrar **al guardar** porque es destructivo e irreversible, y
filtrar **solo al generar el PDF** porque dejaría la vista previa mintiendo.

La generación del PDF no se tocó más allá de esto: `render-server.ts`,
`export.ts` y `document.tsx` siguen igual, y reciben el texto ya limpio porque
`buildCvView` se ejecuta antes.

## El aviso en la interfaz

`hasUnsupportedChars()` solo comprueba, no transforma. Con eso,
`TextField`, `TextAreaField` (en `src/components/editor/fields.tsx`) y el
`textarea` de logros de `experience-step.tsx` muestran debajo del campo un aviso
discreto: «Los emojis y símbolos especiales no se imprimen en el PDF; se
quitarán al descargar». Aparece y desaparece según el contenido del campo, y no
bloquea la escritura.

## Espacio tras punto y seguido

`fixSentenceSpacing()` inserta el espacio que falta cuando tras `.`, `;` o `:`
viene directamente una mayúscula: `automatización.Áreas` pasa a
`automatización. Áreas`.

Se aplica en dos sitios: en la vista (para que el PDF salga bien) y al perder el
foco de un campo (`tidyEditorText`, para que el borrador coincida con lo que se
ve). Al perder el foco, y no en cada pulsación, para que nada pelee con el
cursor mientras se escribe.

Lo que **no** toca, y por qué:

| Caso | Motivo |
| --- | --- |
| `v2.5Beta`, `30.5Millones` | tras el punto hay un dígito, y el patrón exige mayúscula |
| `S.A.Madrid`, `EE.UU.Volví`, `Ph.D`, `e.g.Ejemplo` | se exigen tres letras o más antes del separador |
| `ASP.NET`, `Node.JS`, `Adobe.XD` | se exige una minúscula tras la mayúscula; ahí vienen más mayúsculas |
| `www.Example.com`, `ana.Perez@empresa.com`, `https://…/Articulos` | URLs y correos se apartan antes de aplicar la regex y se restauran después |
| `10:30`, `A:B` | dígito tras el separador, o una sola letra delante |

`ASP.NET` es el caso que fijó la regla de la minúscula: sin ella acababa como
`ASP. NET`, y aparece como competencia en muchísimos CV.

El precio de ser prudente es dejar sin corregir `Ventas.CRM nuevo`, porque no
hay forma de distinguirlo de `ASP.NET` sin un diccionario. Se prefiere no tocar
una frase correcta antes que partir el nombre de una tecnología.

En cambio **sí** se corrige cuando delante hay una cifra
(`un 40%.Nuevas métricas` → `un 40%. Nuevas métricas`), porque una cifra nunca
es una sigla de dos letras.

## Espacios exóticos

Los tabuladores y los espacios Unicode que no existen en CP1252 (fino, en, em,
ideográfico, ` `…) se convierten en un espacio normal **antes** del filtro.
Si llegaran al filtro se eliminarían como cualquier otro carácter no soportado y
las palabras quedarían pegadas: `Nombre<TAB>Apellido` → `NombreApellido`.
Aparecen constantemente al pegar desde Word o desde un PDF.

Los caracteres de ancho cero (`​`–`‏`, BOM, guion suave, word joiner)
sí se eliminan sin dejar espacio, que es justo lo contrario y por eso van en una
lista aparte.

## Huecos y signos huérfanos

Quitar un carácter deja rastro: `Logro 😀.` se quedaría como `Logro .`, con un
espacio antes del punto. `tidyGaps()` recompone eso — espacio sobrante antes de
puntuación de cierre, tras puntuación de apertura, viñetas pegadas a un signo o
sueltas al final de línea — y se ejecuta **antes** de `fixSentenceSpacing`,
porque con ese espacio delante del punto la regex del espaciado no reconocería
la frase.

El `%` queda fuera de esa limpieza a propósito: en español lo correcto es
`40 %` con espacio, y así lo escriben los textos de ejemplo del propio editor.
