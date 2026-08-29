# GeneCV

Generador de currículums profesional, gratuito y universal — [genecv.codezun.com](https://genecv.codezun.com)

Crea un CV adaptado al mercado al que te postulas (España/Europa, Latinoamérica
o anglosajón), con vista previa en tiempo real, verificador de compatibilidad
ATS y exportación a PDF. Sin cuentas y sin backend: todo el borrador vive en el
`localStorage` del navegador.

## Stack

| Pieza        | Elección                                          |
| ------------ | ------------------------------------------------- |
| Framework    | Next.js 16 (App Router, Turbopack)                |
| Lenguaje     | TypeScript + React 19.2                           |
| Estilos      | Tailwind CSS v4 (tokens en `src/app/globals.css`) |
| Animación    | Motion (Framer Motion) v12                        |
| Drag & drop  | dnd-kit                                           |
| PDF          | `@react-pdf/renderer` (en cliente)                |
| Persistencia | `localStorage`                                    |
| Deploy       | Vercel                                            |

## Desarrollo

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # build de producción
npm run lint
```

## Diseño

La paleta y la tipografía se definen **una sola vez** como tokens de Tailwind v4
en `src/app/globals.css`. Los componentes nunca escriben colores literales.

| Token                    | Valor     | Uso                           |
| ------------------------ | --------- | ----------------------------- |
| `--color-surface`        | `#F7F7F7` | Fondo de la aplicación        |
| `--color-canvas`         | `#FFFFFF` | Tarjetas, hoja del CV, navbar |
| `--color-primary`        | `#234D68` | Cabeceras, botones y CTAs     |
| `--color-primary-dark`   | `#1B3C51` | Hover/active de primario      |
| `--color-secondary`      | `#566B81` | Elementos secundarios, badges |
| `--color-secondary-dark` | `#46586A` | Hover/active de secundario    |

Cada base tiene además una escala `50…900` para tintes y bordes. Tipografía:
**Plus Jakarta Sans** para titulares (600–800) e **Inter** para texto (400–500),
ambas auto-alojadas por `next/font`.

Las animaciones se mantienen entre 150 y 300 ms y respetan
`prefers-reduced-motion`.

## Estructura

```
src/
  app/                  Rutas (App Router)
    crear/              Editor multi-paso
    plantillas/         Galería de plantillas
    premium/            Página comercial de las plantillas premium
    articulos/[slug]/   Guías por país (renderizadas desde Markdown)
  components/
    ads/                Huecos publicitarios (banner, nativo)
    layout/             Navbar, footer, contenedor, logo
    landing/            Secciones de la portada
    editor/             Formularios, pasos y reordenamiento
    cv/                 Plantillas de CV (vista previa)
    ui/                 Primitivas (Button, Card, Badge, Reveal…)
  lib/
    cv/                 Tipos, presets regionales, catálogo de plantillas,
                        verificador ATS, almacenamiento y exportación a PDF
    site.ts             Configuración del sitio y helper de metadata
    blog.ts             Lectura y renderizado de los artículos Markdown
    ads.ts              Inventario publicitario: claves, tamaños y huecos
  data/                 Banco de frases por profesión
content/
  articulos/            25 guías por país en Markdown con frontmatter
```

## Blog

Los artículos son ficheros Markdown en `content/articulos`, parseados en
tiempo de compilación. No hay base de datos ni CMS: **publicar es añadir un
`.md`** a esa carpeta. Cada fichero lleva frontmatter con el título SEO, la
meta descripción, el país, la región de CV asociada, las palabras clave, las
fechas y el bloque de preguntas frecuentes.

A partir de ahí, cada artículo obtiene automáticamente su URL, su entrada en
el sitemap, su índice de contenidos, sus enlaces relacionados y el marcado
estructurado (`Article`, `BreadcrumbList` y `FAQPage`).

## Monetización

Todo el sitio es gratuito: las plantillas se descargan sin coste, sin marca de
agua y sin cuenta. No hay pasarela de pago ni base de datos. Lo que lo paga es
**la publicidad**, y por eso el inventario es denso: entre tres y seis huecos
por página.

Las claves, los tamaños y en qué anchura se usa cada uno están en
`src/lib/ads.ts`, que es el único sitio donde aparecen. Hay tres piezas:

- **`<AdBanner placement="…" />`** — los seis formatos IAB de la red. Mide su
  propia caja con un `ResizeObserver` y pinta **una** unidad: la más ancha que
  cabe en la columna (`banner` da 728x90, 468x60 o 320x50; `block` siempre
  300x250; `sidebar` y `tower`, los formatos de barra lateral). La columna, no
  la ventana: confundirlas es lo que mete un 728x90 en la columna de 512 px
  del editor. Una caja escondida mide 0 y no pide nada, así que el CSS nunca
  esconde un anuncio ya pagado.
- **`<NativeAd />`** — el banner nativo, que imita tarjetas de contenido.
  **Uno por página**: su script escribe dentro de un `id` fijo.
- **La barra social**, el formato flotante, cargada una vez en el layout raíz
  con `strategy="lazyOnload"`. Como ya ocupa el borde inferior de la pantalla,
  no hay además un banner fijo propio: se solaparían.

Cada banner se monta **dentro de su propio iframe** (`srcDoc`). No es una
precaución: el `invoke.js` de la red se pinta con `document.write` —que tras la
hidratación borraría el documento entero— y lee sus opciones de una global
`atOptions` que es única por documento, de modo que dos banners en la misma
página se pisarían. Un iframe por unidad da a cada una su documento y su
global. Va sin `sandbox` a propósito: un `srcDoc` sin ese atributo hereda el
origen de la página, que es justo lo que tendría el script pegado en el HTML, y
restringirlo rompería el clic hacia el anunciante.

Todos los huecos reservan su altura antes de cargar (`AD_RESERVE`), van
rotulados como «Publicidad» y ninguno se pega al botón de descarga del editor:
un anuncio junto al botón que la gente viene a pulsar se lleva clics que no
eran para él.

`isPremium` sigue en el catálogo de plantillas, pero solo distingue el tipo de
maquetación —barras laterales, líneas de tiempo, retículas— de los diseños de
una sola columna. No gatea nada.

## Privacidad

No hay backend de usuarios. El CV, incluida la fotografía, se guarda solo en el
navegador y el PDF se genera en el dispositivo del usuario.

La red de anuncios sí es un tercero: sus scripts corren en el navegador del
visitante y ven lo que ve cualquier servidor al que se le pide algo —IP,
`User-Agent`, página de origen—, y pueden instalar sus propias cookies. No ven
el CV, que nunca sale del dispositivo. `src/app/privacidad/page.tsx` lo cuenta
así y hay que mantenerlo al día: si cambia la red, cambia esa página.
