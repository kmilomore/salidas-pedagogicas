-- Fase 3: monto referencial administrable desde panel admin.

alter table public.salidas_pedagogicas
  add column if not exists monto_referencial numeric(12, 2);

comment on column public.salidas_pedagogicas.monto_referencial is
  'Monto referencial administrativo visible y editable solo por usuarios con rol admin.';