-- ---------------------------------------------------------------------------
-- GeneCV — migración al modelo de pase
--
-- Solo hace falta si la base de datos ya se creó con el modelo anterior, en el
-- que se pagaba una plantilla concreta y `consume_pdf_purchase` exigía que la
-- plantilla descargada coincidiera con la comprada.
--
-- En una base nueva, ejecuta `supabase/schema.sql` y olvídate de este fichero.
--
-- Qué cambia:
--   1. `template_id` pasa a ser opcional: al comprar un pase todavía no hay
--      plantilla elegida, y esa es precisamente la gracia del modelo.
--   2. `consume_pdf_purchase` se sustituye por `consume_premium_pass`, que ya
--      no empareja plantillas sino que anota cuál se descargó.
--
-- Es idempotente: se puede ejecutar dos veces sin romper nada.
-- Ejecutar en el SQL Editor de Supabase.
-- ---------------------------------------------------------------------------

-- 1. La plantilla deja de ser obligatoria -----------------------------------

alter table public.pdf_purchases
  alter column template_id drop not null;

-- 2. Nueva función de consumo ------------------------------------------------

create or replace function public.consume_premium_pass(
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
         pdf_generated_at = now(),
         template_id = p_template_id
   where paddle_transaction_id = p_transaction_id
     and status = 'completed'
     and pdf_generated = false
  returning id, email, template_id, paddle_transaction_id;
$$;

revoke all on function public.consume_premium_pass(text, text) from public, anon, authenticated;

-- 3. Fuera la anterior -------------------------------------------------------
--
-- Se borra en lugar de dejarla ahí: exigía que la plantilla descargada fuera la
-- comprada, una regla que ya no se cumple. Una función viva con la regla vieja
-- es una forma silenciosa de que un despliegue antiguo siga rechazando
-- descargas legítimas.

drop function if exists public.consume_pdf_purchase(text, text);
