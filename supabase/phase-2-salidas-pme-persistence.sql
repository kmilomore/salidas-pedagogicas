-- Ajustes para persistir informacion PME en salidas pedagogicas y permitir guardado borrador.

alter table public.salidas_pedagogicas
  add column if not exists pme_dimension text,
  add column if not exists pme_subdimension text,
  add column if not exists estado text not null default 'borrador';

update public.salidas_pedagogicas
set
  pme_dimension = coalesce(pme_dimension, 'No informado'),
  pme_subdimension = coalesce(pme_subdimension, 'No informado')
where pme_dimension is null or pme_subdimension is null;

alter table public.salidas_pedagogicas
  alter column pme_dimension set not null,
  alter column pme_subdimension set not null;

alter table public.salidas_pedagogicas
  drop constraint if exists salidas_pedagogicas_estado_check,
  add constraint salidas_pedagogicas_estado_check check (estado in ('borrador', 'enviada'));

alter table public.salidas_pedagogicas
  alter column cantidad_estudiantes set default 0,
  alter column cantidad_apoderados set default 0;

alter table public.salidas_pedagogicas
  drop constraint if exists salidas_pedagogicas_cantidad_estudiantes_check,
  drop constraint if exists salidas_pedagogicas_cantidad_apoderados_check;

alter table public.salidas_pedagogicas
  add constraint salidas_pedagogicas_cantidad_estudiantes_check check (cantidad_estudiantes >= 0),
  add constraint salidas_pedagogicas_cantidad_apoderados_check check (cantidad_apoderados >= 0);

create index if not exists salidas_pedagogicas_pme_dimension_idx on public.salidas_pedagogicas (pme_dimension);
create index if not exists salidas_pedagogicas_pme_subdimension_idx on public.salidas_pedagogicas (pme_subdimension);