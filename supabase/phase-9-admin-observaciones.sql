-- Fase 9: observaciones administrativas persistentes por salida.

alter table public.salidas_pedagogicas
  add column if not exists observaciones_admin text;

comment on column public.salidas_pedagogicas.observaciones_admin is
  'Observaciones administrativas internas asociadas a la salida para seguimiento y revision.';