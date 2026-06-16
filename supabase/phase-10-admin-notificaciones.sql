alter table public.salidas_pedagogicas
  add column if not exists notificacion_decision_enviada boolean not null default false;

alter table public.salidas_pedagogicas
  add column if not exists notificacion_decision_enviada_at timestamptz null;

update public.salidas_pedagogicas
set
  notificacion_decision_enviada = coalesce(notificacion_decision_enviada, email_enviado, false),
  notificacion_decision_enviada_at = case
    when coalesce(notificacion_decision_enviada, email_enviado, false) and notificacion_decision_enviada_at is null then now()
    else notificacion_decision_enviada_at
  end;
