-- Fase 6: decision administrativa persistente por salida.

alter table public.salidas_pedagogicas
  add column if not exists decision_admin text not null default 'pendiente';

alter table public.salidas_pedagogicas
  drop constraint if exists salidas_pedagogicas_decision_admin_check,
  add constraint salidas_pedagogicas_decision_admin_check check (decision_admin in ('pendiente', 'aceptada', 'rechazada'));

create index if not exists salidas_pedagogicas_decision_admin_idx on public.salidas_pedagogicas (decision_admin);

comment on column public.salidas_pedagogicas.decision_admin is
  'Decision administrativa persistente de la salida: pendiente, aceptada o rechazada.';