# Pagos — Paddle Billing + Supabase

Integración de la descarga premium de GeneCV.

## Modelo

Se vende un **pase de descarga**, no una plantilla. Un pago único desbloquea
las diecisiete plantillas premium; la descarga del PDF consume el pase y el
sistema vuelve a bloquearse. Para un segundo PDF hace falta otro pago.

```
CV gratis → premium con marca de agua → pago → las 17 desbloqueadas
          → pruebas y comparas → descargas → se consume → bloqueado otra vez
```

Por qué así y no un precio por plantilla:

- **No hay que tarifar diecisiete diseños.** Poner precios distintos obliga a
  defender por qué «Ejecutiva» vale más que «Bruma», y ponerlos iguales hace que
  los diecisiete precios sean diecisiete sitios donde equivocarse.
- **Se compara antes de decidir.** Con precio por plantilla se compra a ciegas:
  hay que elegir el diseño antes de haber podido verlo junto a los otros con el
  CV propio delante. Aquí se paga una vez y se prueban todos.
- **El valor está en el PDF, no en el diseño.** Lo que la persona quiere es su
  currículum descargado. Cobrar por eso es cobrar por lo que se lleva.

No hay cuentas ni contraseñas. El email se pide solo porque Paddle lo necesita
para la factura.

### La parte que hay que decir antes de cobrar

El re-bloqueo tras la descarga es legítimo pero es **fácil de leer como
«acceso premium»**, y descubrirlo después de pagar es como se ganan las
devoluciones y las reseñas malas. Por eso el aviso aparece tres veces antes del
pago —en el bloque de compra, en el paso de plantilla y junto al botón de
descarga— y el texto vive en un solo sitio, `PASS_COPY` en
`src/lib/payments/copy.ts`, para que no pueda decirse distinto en cada pantalla.

Si alguna vez se toca ese texto, la regla es: no prometer «acceso» ni
«desbloqueo permanente».

## Estado: siempre de pago

Las plantillas premium se cobran, punto. Hubo un flag
(`NEXT_PUBLIC_PREMIUM_MODE`) que permitía regalarlas durante el lanzamiento;
ya no existe, y con él se fueron los textos de «gratis por lanzamiento». Las
tres gratuitas siguen siendo gratuitas y se descargan en el navegador sin
tocar ninguna API.

**Lo que esto implica: sin `NEXT_PUBLIC_PADDLE_PRICE_ID_PASS` configurado, las
premium no se pueden comprar.** El editor lo dice —«todavía no están a la
venta»— en lugar de abrir un checkout roto, pero de cara al negocio son
diecisiete plantillas que nadie puede llevarse. Es el estado correcto mientras
se completa el alta en Paddle, y es un estado que conviene no alargar.

Si algún día hiciera falta volver a regalarlas, es un `git revert` del commit
que quitó el flag; no hay que reconstruir nada.

### Dónde se editan los textos

Todos en `src/lib/payments/copy.ts`, en `PASS_COPY`.

El precio **no** está ahí a propósito: se le pregunta a Paddle con
`PricePreview` (`fetchPassPrice`), así sale en la moneda de quien mira y no
puede desfasarse del que se cobra en el overlay.

### Qué falta para cobrar de verdad

1. Ejecutar `supabase/migracion-pase.sql` si la base ya existía. **Antes que
   nada**: sin la función `consume_premium_pass`, se cobra y la descarga falla.
2. Crear el producto y el precio del pase:
   `PADDLE_API_KEY=pdl_sdbx_... npm run paddle:seed -- --amount=499 --currency=USD`
3. Copiar el `NEXT_PUBLIC_PADDLE_PRICE_ID_PASS=pri_...` que imprime, a
   `.env.local` y a Vercel.
4. **Redesplegar.** Las variables `NEXT_PUBLIC_` se incrustan en el bundle en
   tiempo de compilación: cambiarlas en el panel de Vercel no surte efecto
   hasta que hay un build nuevo.
5. Comprobar con un pago de sandbox que el flujo completo funciona (ver
   «Pruebas en Sandbox»).

Y los trámites que no son código:

- **Confirmar el precio final.** Se cambia en el dashboard de Paddle y la
  interfaz lo recoge sola, sin desplegar: el importe no está en el código.
- **Revisar la categoría fiscal** del producto. Debe ser «Standard digital
  goods» (`standard`), no «SaaS»: determina qué impuesto cobra Paddle en cada
  país.
- **Pasar Paddle a producción**: cuenta verificada (pide datos fiscales y tarda
  días, conviene empezarlo antes), producto y precio recreados en la cuenta
  real, `NEXT_PUBLIC_PADDLE_PRICE_ID_PASS` de producción,
  `NEXT_PUBLIC_PADDLE_ENV=production`, claves de producción, nuevo destino de
  webhook con su propio secreto y dominio aprobado en *Checkout → Website
  approval*.
- **Revisar `/terminos`**: conviene añadir la política de reembolsos concreta.

## Dónde vive cada cosa

| Fichero | Papel |
| --- | --- |
| `supabase/schema.sql` | Tabla `pdf_purchases`, RLS y consumo atómico del pase |
| `supabase/migracion-pase.sql` | Migración desde el modelo anterior (precio por plantilla) |
| `src/components/editor/use-premium-pass.ts` | El pase, visto desde React |
| `src/lib/payments/copy.ts` | **Todos los textos del modelo** |
| `src/lib/payments/pricing.ts` | El price_id del pase y contra qué se contrasta |
| `src/lib/payments/paddle-server.ts` | Verificación del pago contra la API de Paddle |
| `src/lib/payments/purchases.ts` | Acceso a Supabase con service role |
| `src/lib/payments/checkout-client.ts` | Overlay de Paddle.js y precio localizado |
| `src/lib/payments/pass-store.ts` | El pase en el navegador (localStorage) |
| `src/components/editor/premium-unlock.tsx` | Compra del pase y estado desbloqueado |
| `src/components/editor/editor-shell.tsx` | El botón que consume el pase al descargar |
| `src/app/api/generate-pdf/route.ts` | **El único punto que autoriza un PDF** |
| `src/app/api/premium-pass/route.ts` | ¿El pase guardado sigue valiendo? (solo interfaz) |
| `src/app/api/webhooks/paddle/route.ts` | Registro de la compra (auditoría) |
| `src/lib/cv/pdf/render-server.ts` | Render del PDF en servidor |

El render reutiliza `CvDocument`, el mismo componente que usa la descarga
gratuita del navegador. No hay una segunda implementación del diseño, así que
el PDF de pago no puede salir distinto de la vista previa.

## El modelo de seguridad

El callback `checkout.completed` de Paddle.js **no autoriza nada**. Corre en el
navegador, así que cualquiera puede invocarlo desde la consola. Lo único que se
toma de él es el `transaction_id`, que es un identificador, no una prueba.

Lo mismo vale para el pase guardado en localStorage: **no es una credencial**.
Escribir a mano `genecv:pase` en el navegador desbloquea la vista previa y nada
más; al pulsar «Descargar PDF» el servidor resuelve ese id contra Paddle y
responde 403.

`/api/generate-pdf` comprueba dos cosas antes de renderizar:

1. **¿Existe, está pagada y es del pase?** `GET /transactions/{id}` contra la
   API de Paddle con la API key del servidor. Se aceptan los estados `paid` y
   `completed`: justo tras cerrarse el overlay la transacción suele estar en
   `paid` y pasa a `completed` poco después. Exigir solo `completed` rompería el
   flujo en la misma sesión.

   Que sea *del pase* se decide por el `price_id` realmente facturado, no por
   `custom_data` —que lo fija el cliente al abrir el checkout y por tanto es
   manipulable—. La cuenta de Paddle sirve a más de un producto: sin esta
   comprobación, la compra de cualquier otro producto valdría como pase.

2. **¿Está sin usar?** `UPDATE ... SET pdf_generated = true WHERE
   paddle_transaction_id = ? AND pdf_generated = false`. Postgres serializa los
   UPDATE sobre la misma fila, así que ante un doble clic solo una petición ve
   `false` y la otra recibe cero filas. No hace falta lock explícito.

Ya **no** se comprueba qué plantilla se pagó, porque no se paga una plantilla:
el pase vale para las diecisiete. Lo que sí se exige es que la plantilla pedida
sea premium — una gratuita no gasta pase, se genera en el navegador.

El consumo se marca **antes** de renderizar. La alternativa —renderizar y luego
marcar— deja una ventana en la que dos peticiones simultáneas generan dos PDF.
El coste es que un fallo de renderizado consumiría el pase, así que en ese
camino se llama a `releasePurchase` y el usuario puede reintentar sin pagar de
nuevo.

El webhook es **complementario**: registra el pago para auditoría y soporte
(por ejemplo si alguien cierra la pestaña después de pagar), pero no dispara la
generación ni es requisito para descargar. `/api/generate-pdf` crea la fila él
mismo si el webhook aún no llegó.

### Por qué el pase sobrevive a una recarga

Vive en `localStorage` y no en memoria porque el pago abre un overlay y la
gente cierra pestañas: haber pagado y perder el desbloqueo por un F5 sería
cobrar dos veces por lo mismo.

Al arrancar, el editor pregunta a `/api/premium-pass` si ese pase sigue en pie
(pagado, no consumido, no reembolsado). Ese endpoint **no autoriza nada**: solo
evita enseñar un desbloqueo que al pulsar «Descargar» daría un error.

Un detalle deliberado: si esa comprobación **no se puede hacer** —sin red, o el
endpoint responde 503 porque falta una variable— el pase se deja **activo**.
Equivocarse hacia «desbloqueado» cuesta un error claro al descargar, porque el
servidor sigue siendo la autoridad; equivocarse hacia «bloqueado» invita a
alguien que ya pagó a pagar otra vez. Por eso `/api/premium-pass` responde 503
ante un fallo de configuración en lugar de `valid: false`: un despliegue al que
le falta una variable no debe borrarle el pase a todo el que haya pagado.

## Puesta en marcha

### 1. Supabase

Ejecutar `supabase/schema.sql` en el SQL Editor. Crea la tabla, los índices,
activa RLS sin políticas (denegar a todos salvo service role) y define
`consume_premium_pass`.

Si la base **ya existía** con el modelo anterior (un precio por plantilla),
ejecutar `supabase/migracion-pase.sql` en su lugar: hace `template_id`
opcional, crea la función nueva y borra la vieja.

Copiar de *Project Settings → API*:

- Project URL → `SUPABASE_URL`
- `service_role` secret → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Producto y precio en Paddle Sandbox

Con el script, que es un comando:

```bash
PADDLE_API_KEY=pdl_sdbx_... npm run paddle:seed -- --amount=499 --currency=USD
```

Es idempotente: marca el producto con `custom_data.genecv = "premium_pass"`, así
que volver a ejecutarlo reutiliza lo que exista. Imprime la línea
`NEXT_PUBLIC_PADDLE_PRICE_ID_PASS=pri_...` lista para pegar.

Para comprobar el estado sin tocar nada —incluido si la variable de entorno
apunta al precio correcto de ese entorno:

```bash
PADDLE_API_KEY=pdl_sdbx_... npm run paddle:check
```

A mano, en [sandbox-vendors.paddle.com](https://sandbox-vendors.paddle.com):

1. *Catalog → Products → New product*
   - Name: `GeneCV — Pase de descarga premium`
   - Tax category: **Standard digital goods**
2. Dentro del producto, *New price*
   - Type: **One-time** (no recurrente: el pase se gasta, no se renueva)
   - Amount: el que decidas
3. Copiar el `pri_...` a `NEXT_PUBLIC_PADDLE_PRICE_ID_PASS`.

> Si vienes del modelo anterior tendrás diecisiete productos «GeneCV —
> Plantilla …» en la cuenta. Ya no se usan: se pueden archivar. No hace falta
> borrarlos, el código solo mira el price_id del pase.

### 3. Dominio aprobado

En *Checkout → Website approval*, añadir el dominio desde el que se sirve el
checkout (en sandbox vale `localhost`). Sin esto el overlay no abre.

### 4. Webhook

*Developer tools → Notifications → New destination*:

- URL: `https://TU-DOMINIO.vercel.app/api/webhooks/paddle`
- Eventos: `transaction.completed` y `adjustment.created`
- Copiar el secreto → `PADDLE_WEBHOOK_SECRET`

`adjustment.created` sirve para marcar reembolsos: un pase reembolsado deja de
poder generar PDF.

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

Flujo esperado: editor → paso «Plantilla» → elegir una premium (con candado) →
paso «Revisión y descarga» → escribir email → *Pagar y desbloquear las
premium* → overlay → pago → **los candados desaparecen en las diecisiete** →
volver al paso de plantilla y cambiar de diseño libremente, sin marca de agua →
*Descargar PDF* → el PDF llega sin marca de agua → **los candados vuelven** y
aparece el aviso de que el pase se consumió.

### Que el desbloqueo sobrevive a una recarga

Tras pagar, recargar la página (F5). Las plantillas deben seguir desbloqueadas:
el pase se recupera de localStorage y se revalida contra `/api/premium-pass`.

### Que un pase inventado no desbloquea nada

En la consola del navegador:

```js
localStorage.setItem("genecv:pase", JSON.stringify({ transactionId: "txn_falso" }));
location.reload();
```

Esperado: la revalidación responde `valid:false`, el pase se borra solo y
vuelven los candados. Y aunque no se borrase, `/api/generate-pdf` respondería
403: la vista previa no es el PDF.

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

Esperado: un `200` y un `403`, nunca dos `200`. Esta es la prueba que sostiene
el modelo entero: si diera dos `200`, el pase no se consumiría de verdad.

### Que la plantilla ya no importa (pero premium sí)

Pagar un pase y llamar al endpoint con `"templateId": "editorial"` y luego con
`"templateId": "creativa"`.

Esperado: la primera **200**, la segunda **403** `already_used`. El pase vale
para cualquier premium, pero solo una vez.

Con `"templateId": "clasica"` (gratuita): **400** `not_premium`. Una plantilla
gratuita no puede gastar un pase.

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

Debe existir una fila con `status = 'completed'`. `template_id` estará en
`NULL` hasta que se descargue, y entonces guardará la plantilla elegida — que
es la señal útil de qué diseños se llevan de verdad:

```sql
select template_id, count(*)
from pdf_purchases
where pdf_generated
group by template_id
order by count(*) desc;
```

Reenviar el mismo evento desde Paddle (*Notifications → Logs → Replay*) no debe
duplicar la fila ni resetear `pdf_generated`: eso es lo que verifica la
idempotencia.

Firma inválida:

```bash
curl -i -X POST http://localhost:3000/api/webhooks/paddle \
  -H 'Content-Type: application/json' \
  -H 'Paddle-Signature: ts=1;h1=falsa' \
  -d '{"event_type":"transaction.completed"}'
```

Esperado: **401** `{"error":"invalid_signature"}`.

## Paso a producción

1. Repetir producto y precio en la cuenta de producción
   (`npm run paddle:seed -- --env=production ...`) y poner ese
   `NEXT_PUBLIC_PADDLE_PRICE_ID_PASS` en las variables de producción de Vercel.
2. `NEXT_PUBLIC_PADDLE_ENV=production` y las claves de producción.
3. Nuevo destino de webhook apuntando al dominio real, con su propio secreto.
4. Aprobar el dominio de producción en *Checkout → Website approval*.

Definir `NEXT_PUBLIC_PADDLE_PRICE_ID_PASS` **por entorno** en Vercel (Production
distinto de Preview/Development) evita el fallo clásico: desplegar a producción
apuntando al precio de sandbox, donde nadie paga de verdad.

## Límite conocido

El PDF se genera en una función serverless de Vercel. `@react-pdf/renderer`
necesita el runtime Node (ya declarado en la ruta) y arranca en frío en torno a
1–2 s la primera vez. Si el volumen crece y ese arranque molesta, lo siguiente
sería mantener la función caliente o mover el render a un servicio dedicado; el
contrato de la API no cambiaría.
