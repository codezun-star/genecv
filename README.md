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
    premium/            Placeholder de plantillas premium (pago en USDT)
    articulos/[slug]/   Guías por país (estructura lista, contenido pendiente)
  components/
    layout/             Navbar, footer, contenedor, ad slots
    landing/            Secciones de la portada
    editor/             Formularios, pasos y reordenamiento
    cv/                 Plantillas de CV (vista previa)
    ui/                 Primitivas (Button, Card, Badge, Reveal…)
  lib/
    cv/                 Tipos, presets regionales, catálogo de plantillas,
                        verificador ATS, almacenamiento y exportación a PDF
    site.ts             Configuración del sitio y helper de metadata
  data/                 Banco de frases por profesión
```

## Monetización (pendiente)

- **Publicidad**: `<AdSlot />` reserva el espacio de cada banner sin cargar
  todavía ninguna red de anuncios. Al integrar un proveedor, el script se
  renderiza dentro del mismo contenedor para evitar saltos de layout.
- **Plantillas premium**: el modelo de datos ya distingue `isPremium`. El pago
  en USDT está esbozado en `/premium` pero **no hay wallet ni pasarela
  conectada**.

## Privacidad

No hay backend de usuarios. El CV, incluida la fotografía, se guarda solo en el
navegador y el PDF se genera en el dispositivo del usuario.
