# Logo y recursos de marca

## Origen

El logo original está en **`assets/logocv.png`** (1536×1024). Vive fuera de
`public/` a propósito: pesa un megabyte y nadie necesita descargarlo, solo es la
fuente de la que se derivan los demás recursos.

Para regenerar todo:

```bash
npm run logo
```

Eso ejecuta `scripts/build-logo.mjs`. Si el logo cambia, se reemplaza
`assets/logocv.png` y se vuelve a lanzar el comando; no hay que editar nada más.

## Qué genera

| Fichero | Uso |
| --- | --- |
| `public/logo-genecv-compact.png` | Cabecera y pie (icono + logotipo, sin eslogan) |
| `public/logo-genecv.png` | Lockup completo; datos estructurados (`schema.org`) |
| `src/app/icon.png` (512×512) | Favicon moderno |
| `src/app/apple-icon.png` (180×180) | Icono de pantalla de inicio en iOS |
| `src/app/favicon.ico` (32×32) | Clientes que piden `/favicon.ico` a pelo |
| `src/app/opengraph-image.png` (1200×630) | Tarjeta al compartir en redes |

Los cuatro últimos van en `src/app` y no en `public` porque Next los reconoce
**por convención de nombre de fichero** y genera solo las etiquetas
`<link rel="icon">`, `<link rel="apple-touch-icon">` y `og:image` — no hay que
declararlas en ningún `metadata`. `src/app/manifest.ts` completa el conjunto con
el manifiesto de aplicación web.

## Por qué el script hace lo que hace

**El original no tiene canal alfa: el fondo es blanco opaco.** La cabecera es
`bg-canvas/85` con desenfoque, así que un blanco opaco se vería como un recuadro
pegado encima. Hay que recortar el fondo.

No sirve con «hacer transparente todo lo blanco»: el interior del documento del
icono y la marca de verificación **también** son blancos y quedarían
agujereados. El script hace un **relleno por difusión desde los bordes**, que
solo alcanza el blanco exterior conectado.

Son dos pasadas con umbrales distintos. Con una sola pasada estricta, el ruido de
compresión de 230-234 corta la difusión y el fondo se queda sin recortar; con una
sola permisiva, el relleno se cuela por los bordes suavizados y agujerea el
interior. La segunda pasada arranca del fondo ya encontrado y se come el borde
suavizado, con un alfa proporcional a lo oscuro que sea cada píxel para que el
contorno no quede recortado a hachazos.

**Los iconos van sobre una placa blanca con esquinas redondeadas, no sobre
transparencia.** Dos razones: iOS compone los `apple-touch-icon` sobre negro, y
el relleno deja hueco el interior del documento, que sobre fondo oscuro se
leería como un contorno vacío. El `apple-icon` se genera sin redondear porque iOS
aplica su propia máscara y una esquina ya recortada se vería doblemente
redondeada.

**El lockup compacto existe porque el eslogan no se lee a 32 px de alto.** El
script localiza la banda del eslogan buscando el último hueco de filas sin tinta
en la zona del texto, la recorta y recompone icono + logotipo centrados. Así el
recorte no depende de coordenadas escritas a mano que se romperían si el logo
cambia.

## Limitación conocida

El lockup transparente está pensado para **fondos claros**: el interior del
documento es transparente, así que sobre un fondo oscuro la marca se lee como un
contorno. Hoy no importa porque la cabecera y el pie son `bg-canvas`. Si algún
día hace falta una versión para fondo oscuro, lo suyo es pedir el logo en SVG o
con alfa en origen, en lugar de seguir derivándolo de un PNG opaco.
