-- Fase 8: seguimiento por etapa administrativa para salidas.

alter table public.salidas_pedagogicas
  add column if not exists etapa_admin text not null default 'pendiente';

alter table public.salidas_pedagogicas
  drop constraint if exists salidas_pedagogicas_etapa_admin_check,
  add constraint salidas_pedagogicas_etapa_admin_check
    check (etapa_admin in ('pendiente', 'etapa_1', 'etapa_2', 'terminada', 'seleccionada'));

create index if not exists salidas_pedagogicas_etapa_admin_idx on public.salidas_pedagogicas (etapa_admin);

comment on column public.salidas_pedagogicas.etapa_admin is
  'Etapa administrativa de seguimiento: pendiente, etapa_1, etapa_2, terminada o seleccionada.';