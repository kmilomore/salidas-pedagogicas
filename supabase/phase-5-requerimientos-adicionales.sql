alter table public.salidas_pedagogicas
  add column if not exists requerimientos_adicionales text;

comment on column public.salidas_pedagogicas.requerimientos_adicionales is
  'Observaciones del director y requerimientos adicionales para la coordinacion del servicio, por ejemplo movilidad reducida u otros apoyos.';