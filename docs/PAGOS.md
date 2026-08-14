# Pagos — Paddle Billing + Supabase

Integración de la descarga premium de GeneCV.

## Modelo

No se vende acceso a una plantilla: se vende **una descarga concreta**. Cada
pago da derecho a exactamente un PDF sin marca de agua. Si mañana la misma
persona quiere otro PDF —el mismo CV o uno nuevo, la misma plantilla u otra—
vuelve a pagar. No hay cuentas, ni contraseñas, ni acceso reutilizable.

Todo ocurre en una sola sesión:

```
CV gratis → previsualiza premium (con marca de agua) → paga → descarga → fin
```

## Modo de monetización (`NEXT_PUBLIC_PREMIUM_MODE`)

Toda la integración descrita en este documento sigue en el repositorio y
funcionando. Un único flag decide si se ejecuta.

| Valor | Qué pasa |
| --- | --- |
| `free_launch` | Las plantillas premium se descargan **gratis y sin marca de agua**, con un aviso de que después tendrán coste. No se abre el checkout, no se llama a `/api/generate-pdf` y no se contacta con Paddle. |
| `paid` | El flujo real: checkout de Paddle, verificación en servidor y descarga servida por `/api/generate-pdf`. |

**Estado actual: `free_launch`**, para validar demanda antes de cobrar.

Ante una variable ausente o mal escrita el valor cae en `free_launch`: el
fallo seguro es no cobrar, nunca cobrar por error.

### Qué cambia en la interfaz

En `free_launch`:

- La descarga de una plantilla premium usa el **mismo camino que las
  gratuitas** (`downloadCvPdf`, en el navegador). No pasa por el endpoint
  verificado porque no hay pago que verificar.
- Desaparecen la marca de agua de la vista previa, el candado de las tarjetas
  y el desenfoque de la galería: mostrarlos cuando la descarga es libre sería
  engañar al usuario.
- Aparece el aviso de lanzamiento justo encima del botón de descarga.
- Los textos de `/premium`, `/plantillas` y `/terminos` cambian solos: en modo
  gratuito no pueden seguir diciendo que se cobra.

### Dónde se editan los textos

Todos en `src/lib/payments/mode.ts`, en `FREE_LAUNCH_COPY`.

El precio anunciado vive en `priceLabel`. Mientras esté vacío el aviso dice
«Más adelante pasará a ser de pago»; en cuanto se le pone un valor (`"4,99 €"`)
pasa a decir «Más adelante costará 4,99 €». No hay que reescribir la frase ni
tocar ningún componente.

### Cómo reactivar los cobros

1. Poner `NEXT_PUBLIC_PREMIUM_MODE=paid` en Vercel y en `.env.local`.
2. **Redesplegar.** Las variables `NEXT_PUBLIC_` se incrustan en el bundle en
   tiempo de compilación: cambiarlas en el panel de Vercel no surte efecto
   hasta que hay un build nuevo.
3. Comprobar con un pago de sandbox que el flujo completo sigue funcionando.

Eso es todo lo que hace falta en el código. Lo que queda son decisiones de
negocio y trámites en Paddle:

- **Confirmar los precios finales** y crearlos con
  `npm run paddle:seed -- --amount=... --currency=...`. Verificar con
  `npm run paddle:check` que las 17 plantillas tienen `price_id` y que no
  queda ningún marcador `pri_PENDIENTE_*`.
- **Revisar la categoría fiscal** de cada producto. Debe ser «Standard digital
  goods» (`standard`), no «SaaS»: determina qué impuesto cobra Paddle en cada
  país.
- **Pasar Paddle a producción**: cuenta verificada (pide datos fiscales y
  tarda días, conviene empezarlo antes), productos y precios recreados en la
  cuenta real, `PRODUCTION_PRICE_IDS` rellenado en `catalog.ts`,
  `NEXT_PUBLIC_PADDLE_ENV=production`, claves de producción, nuevo destino de
  webhook con su propio secreto y dominio aprobado en *Checkout → Website
  approval*.
- **Revisar `/terminos`**: el texto de pago vuelve solo al cambiar el flag,
  pero conviene añadir la política de reembolsos concreta.

### Lo que el flag NO toca

Nada del backend cambia: `supabase/schema.sql`, `/api/webhooks/paddle`,
`/api/generate-pdf` y `catalog.ts` quedan exactamente igual. El endpoint sigue
activo y sigue exigiendo un pago verificado, así que aunque alguien lo llame
directamente durante el lanzamiento gratuito no obtiene nada sin una
transacción real. Los productos de Paddle Sandbox tampoco hay que borrarlos:
simplemente no se llaman.

## Dónde vive cada cosa

| Fichero | Papel |
| --- | --- |
| `supabase/schema.sql` | Tabla `pdf_purchases`, RLS y función de consumo atómico |
| `src/lib/payments/mode.ts` | **El flag y los textos del lanzamiento gratuito** |
| `src/components/editor/free-launch-notice.tsx` | Aviso de «gratis por lanzamiento» |
| `src/lib/payments/catalog.ts` | Mapa `template_id` ↔ `price_id` (sandbox y producción) |
| `src/lib/payments/paddle-server.ts` | Verificación del pago contra la API de Paddle |
| `src/lib/payments/purchases.ts` | Acceso a Supabase con service role |
| `src/lib/payments/checkout-client.ts` | Overlay de Paddle.js y llamada a la API |
| `src/components/editor/premium-checkout.tsx` | Email + botón de compra en el editor |
| `src/app/api/generate-pdf/route.ts` | **El único punto que autoriza un PDF** |
| `src/app/api/webhooks/paddle/route.ts` | Registro de la compra (auditoría) |
| `src/lib/cv/pdf/render-server.ts` | Render del PDF en servidor |

El render reutiliza `CvDocument`, el mismo componente que usa la descarga
gratuita del navegador. No hay una segunda implementación del diseño, así que
el PDF de pago no puede salir distinto de la vista previa.

## El modelo de seguridad

El callback `checkout.completed` de Paddle.js **no autoriza nada**. Corre en el
navegador, así que cualquiera puede invocarlo desde la consola. Lo único que se
toma de él es el `transaction_id`, que es un identificador, no una prueba.

`/api/generate-pdf` comprueba tres cosas antes de renderizar:

1. **¿Existe y está pagada?** `GET /transactions/{id}` contra la API de Paddle
   con la API key del servidor. Se aceptan los estados `paid` y `completed`:
   justo tras cerrarse el overlay la transacción suele estar en `paid` y pasa a
   `completed` poco después. Exigir solo `completed` rompería la descarga en la
   misma sesión.
2. **¿Corresponde a la plantilla pedida?** Se resuelve desde el `price_id`
   realmente facturado, **no** desde `custom_data`: `custom_data` lo fija el
   cliente al abrir el checkout y por tanto es manipulable. Así, pagar la
   plantilla barata y pedir la cara devuelve 403.
3. **¿Está sin usar?** `UPDATE ... SET pdf_generated = true WHERE
   paddle_transaction_id = ? AND pdf_generated = false`. Postgres serializa los
   UPDATE sobre la misma fila, así que ante un doble clic solo una petición ve
   `false` y la otra recibe cero filas. No hace falta lock explícito.

El consumo se marca **antes** de renderizar. La alternativa —renderizar y luego
marcar— deja una ventana en la que dos peticiones simultáneas generan dos PDF.
El coste es que un fallo de renderizado consumiría la compra, así que en ese
camino se llama a `releasePurchase` y el usuario puede reintentar sin pagar de
nuevo.

El webhook es **complementario**: registra el pago para auditoría y soporte
(por ejemplo si alguien cierra la pestaña antes de descargar), pero no dispara
la generación ni es requisito para descargar. `/api/generate-pdf` crea la fila
él mismo si el webhook aún no llegó.

## Puesta en marcha

### 1. Supabase

Ejecutar `supabase/schema.sql` en el SQL Editor. Crea la tabla, los índices,
activa RLS sin políticas (denegar a todos salvo service role) y define
`consume_pdf_purchase`.

Copiar de *Project Settings → API*:

- Project URL → `SUPABASE_URL`
- `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Productos y precios en Paddle Sandbox

En [sandbox-vendors.paddle.com](https://sandbox-vendors.paddle.com), por cada
una de las 17 plantillas premium:

1. *Catalog → Products → New product*
   - Name: `GeneCV — Plantilla Creativa` (y equivalente para el resto)
   - Tax category: **Standard digital goods**
2. Dentro del producto, *New price*
   - Type: **One-time** (no recurrente: se cobra una descarga)
   - Amount: el que decidas
   - Description: `Descarga PDF — Creativa`
3. Copiar el `pri_...` resultante.

Los ids de plantilla son los de `src/lib/cv/templates.ts`:

```
creativa      ejecutiva     compacta     editorial    corporativa
consultora    directiva     trayectoria  academica    tecnica
contraste     meridiano     nordica      atenea       pulso
vanguardia    bruma
```

Pegar cada `pri_...` en `SANDBOX_PRICE_IDS` dentro de
`src/lib/payments/catalog.ts`.

**Atajo.** Crear 17 productos y 17 precios a mano son 34 formularios y 17 ids
que copiar sin equivocarse. El script los crea por API y escupe el bloque listo
para pegar:

```bash
PADDLE_API_KEY=pdl_sdbx_... npm run paddle:seed -- --amount=499 --currency=USD
```

Es idempotente: marca cada producto con `custom_data.template_id`, así que
volver a ejecutarlo reutiliza lo que ya exista y solo crea lo que falte. Para
comprobar el estado sin tocar nada:

```bash
PADDLE_API_KEY=pdl_sdbx_... npm run paddle:check
```

Los `price_id` no son secretos —viajan al navegador para abrir el checkout—
por eso viven en el repositorio y no en variables de entorno.

Mientras una plantilla conserve su marcador `pri_PENDIENTE_*`, la interfaz
muestra «todavía no está a la venta» en lugar de abrir un checkout roto.

### 3. Dominio aprobado

En *Checkout → Website approval*, añadir el dominio desde el que se sirve el
checkout (en sandbox vale `localhost`). Sin esto el overlay no abre.

### 4. Webhook

*Developer tools → Notifications → New destination*:

- URL: `https://TU-DOMINIO.vercel.app/api/webhooks/paddle`
- Eventos: `transaction.completed` y `adjustment.created`
- Copiar el secreto → `PADDLE_WEBHOOK_SECRET`

`adjustment.created` sirve para marcar reembolsos: una compra reembolsada deja
de poder generar PDF.

### 5. Claves

De *Developer tools → Authentication*:

- API key (server) → `PADDLE_API_KEY`
- Client-side token → `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`

Y `NEXT_PUBLIC_PADDLE_ENV=sandbox`.

Ver `.env.example` para la lista completa y qué es público y qué no.

## Pruebas en Sandbox

### Pago de prueba

Tarjeta de sandbox de Paddle:

```
Número: 4242 4242 4242 4242
Caducidad: cualquier fecha futura
CVC: 100
```

Flujo esperado: editor → paso «Plantilla» → elegir una premium → paso
«Revisión y descarga» → escribir email → *Pagar y descargar* → overlay → pago →
el PDF se descarga solo, sin marca de agua.

### Que rechaza un transaction_id falso

```bash
curl -i -X POST http://localhost:3000/api/generate-pdf \
  -H 'Content-Type: application/json' \
  -d '{
    "transactionId": "txn_inventado_123",
    "templateId": "creativa",
    "cv": { "version":1, "region":"europa", "templateId":"creativa",
            "industry":"general", "accentColor":"#234D68",
            "personal":{"firstName":"Ana","lastName":"Pérez","headline":"QA",
                        "email":"a@b.com","phone":"","city":"","country":"",
                        "website":"","linkedin":"","photo":null,
                        "showPhoto":false,"summary":"","birthDate":"",
                        "nationality":"","drivingLicense":""},
            "experience":[], "education":[], "skills":[], "languages":[],
            "sectionOrder":["summary","experience","education","skills","languages"],
            "updatedAt":"" }
  }'
```

Esperado: **403** con `{"error":"not_found"}`.

### Que rechaza el cruce de plantillas

Pagar `creativa` y luego llamar al endpoint con el mismo `transactionId` pero
`"templateId": "editorial"`.

Esperado: **403** con `{"error":"template_mismatch"}`. Es la comprobación que
impide pagar la barata y descargar la cara.

### Que solo entrega el PDF una vez

Repetir la llamada con un `transactionId` ya usado.

Esperado: primera vez **200** con el PDF; segunda **403** con
`{"error":"already_used"}`.

Para provocar la carrera de verdad, dos peticiones en paralelo:

```bash
for i in 1 2; do
  curl -s -o /tmp/pdf-$i.bin -w "%{http_code}\n" -X POST \
    http://localhost:3000/api/generate-pdf \
    -H 'Content-Type: application/json' -d @/tmp/payload.json &
done; wait
```

Esperado: un `200` y un `403`, nunca dos `200`.

### Que el webhook registra en paralelo

En local, el webhook necesita una URL pública. Con el CLI de Vercel o cualquier
túnel:

```bash
npx vercel dev            # o: npx untun tunnel http://localhost:3000
```

Apuntar el destino de notificaciones a esa URL. Tras un pago de prueba:

```sql
select paddle_transaction_id, email, template_id, status,
       pdf_generated, pdf_generated_at
from pdf_purchases
order by created_at desc
limit 5;
```

Debe existir una fila con `status = 'completed'` y `pdf_generated = true` si ya
se descargó. Reenviar el mismo evento desde Paddle (*Notifications → Logs →
Replay*) no debe duplicar la fila ni resetear `pdf_generated`: eso es lo que
verifica la idempotencia.

Firma inválida:

```bash
curl -i -X POST http://localhost:3000/api/webhooks/paddle \
  -H 'Content-Type: application/json' \
  -H 'Paddle-Signature: ts=1;h1=falsa' \
  -d '{"event_type":"transaction.completed"}'
```

Esperado: **401** `{"error":"invalid_signature"}`.

## Paso a producción

1. Repetir productos y precios en la cuenta de producción y rellenar
   `PRODUCTION_PRICE_IDS`.
2. `NEXT_PUBLIC_PADDLE_ENV=production` y las claves de producción.
3. Nuevo destino de webhook apuntando al dominio real, con su propio secreto.
4. Aprobar el dominio de producción en *Checkout → Website approval*.

## Límite conocido

El PDF se genera en una función serverless de Vercel. `@react-pdf/renderer`
necesita el runtime Node (ya declarado en la ruta) y arranca en frío en torno a
1–2 s la primera vez. Si el volumen crece y ese arranque molesta, lo siguiente
sería mantener la función caliente o mover el render a un servicio dedicado; el
contrato de la API no cambiaría.
