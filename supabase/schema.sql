-- ---------------------------------------------------------------------------
-- GeneCV — compras de descarga puntual
--
-- Modelo de negocio: no se vende acceso a una plantilla, se vende UNA descarga
-- concreta. Cada fila es un pago y da derecho exactamente a un PDF.
--
-- Ejecutar en el SQL Editor de Supabase.
-- ---------------------------------------------------------------------------

create table if not exists public.pdf_purchases (
  id uuid primary key default gen_random_uuid(),

  -- Paddle exige un email para la factura. No es una cuenta: no hay login ni
  -- verificación, solo sirve para el recibo y para dar soporte.
  email text not null,

  -- Plantilla premium por la que se pagó. Se compara contra el template_id que
  -- pide /api/generate-pdf para que no se pague una barata y se descargue otra.
  template_id text not null,

  -- Identificador de la transacción en Paddle. UNIQUE: es lo que hace que el
  -- webhook sea idempotente (Paddle reintenta) y lo que ancla el consumo.
  paddle_transaction_id text not null unique,

  status text not null default 'completed'
    check (status in ('completed', 'refunded')),

  -- Marca de consumo: una transacción pagada genera un único PDF.
  pdf_generated boolean not null default false,
  pdf_generated_at timestamptz,

  created_at timestamptz not null default now()
);

-- La búsqueda por transaction_id ocurre en cada descarga; el índice único ya
-- la cubre. Este otro es para el panel de soporte ("¿qué compró este email?").
create index if not exists pdf_purchases_email_idx
  on public.pdf_purchases (email);

create index if not exists pdf_purchases_created_at_idx
  on public.pdf_purchases (created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
--
-- La tabla solo la toca el backend con la service role key, que ignora RLS por
-- diseño. Aun así se activa RLS y NO se crea ninguna política: así, si algún
-- día se filtrase la anon key o alguien apuntase el cliente del navegador a
-- esta tabla, el resultado sería cero filas en lugar de todo el historial de
-- compras. Activar RLS sin políticas es "denegar a todo el mundo salvo service
-- role", que es exactamente lo que queremos.
-- ---------------------------------------------------------------------------

alter table public.pdf_purchases enable row level security;

-- Defensa en profundidad: revocar también los permisos de tabla a los roles
-- que usa el cliente. RLS ya bloquea, pero esto evita incluso el intento.
revoke all on public.pdf_purchases from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Consumo atómico
--
-- El endpoint de descarga hace un UPDATE condicional en lugar de leer y luego
-- escribir: si dos peticiones entran a la vez (doble clic, reintento de red),
-- solo una consigue actualizar la fila y la otra recibe cero filas afectadas.
-- Postgres serializa los UPDATE sobre la misma fila, así que no hace falta un
-- lock explícito.
--
-- Se define como función para que la condición viva junto al esquema y no
-- pueda relajarse por accidente desde el código.
-- ---------------------------------------------------------------------------

create or replace function public.consume_pdf_purchase(
  p_transaction_id text,
  p_template_id text
)
returns table (
  id uuid,
  email text,
  template_id text,
  paddle_transaction_id text
)
language sql
security definer
set search_path = public
as $$
  update public.pdf_purchases
     set pdf_generated = true,
         pdf_generated_at = now()
   where paddle_transaction_id = p_transaction_id
     and template_id = p_template_id
     and status = 'completed'
     and pdf_generated = false
  returning id, email, template_id, paddle_transaction_id;
$$;

revoke all on function public.consume_pdf_purchase(text, text) from public, anon, authenticated;
