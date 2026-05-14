-- Fase 4: auditoria operacional y trazabilidad basica de accesos/acciones.

create table if not exists public.portal_audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  actor_user_id uuid null,
  actor_email text null,
  actor_role text null,
  event_type text not null,
  severity text not null default 'info',
  route text null,
  target_type text null,
  target_id text null,
  target_label text null,
  ip_address text null,
  user_agent text null,
  metadata jsonb not null default '{}'::jsonb,
  constraint portal_audit_log_actor_role_check check (actor_role in ('director', 'admin', 'system') or actor_role is null),
  constraint portal_audit_log_severity_check check (severity in ('info', 'warning', 'error'))
);

create index if not exists portal_audit_log_created_at_idx
  on public.portal_audit_log (created_at desc);

create index if not exists portal_audit_log_actor_email_idx
  on public.portal_audit_log (actor_email);

create index if not exists portal_audit_log_event_type_idx
  on public.portal_audit_log (event_type);

comment on table public.portal_audit_log is
  'Bitacora operacional del portal: accesos, acciones administrativas, exportaciones y eventos relevantes de operacion.';

comment on column public.portal_audit_log.metadata is
  'Datos auxiliares del evento. No almacenar secretos, tokens ni valores sensibles completos.';

alter table public.portal_audit_log enable row level security;