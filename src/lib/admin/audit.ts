import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { AuditSeverity, OperationalSecurityCheck, PortalAuditEvent, UserRole } from "@/types";

interface AuditActor {
  userId: string | null;
  email: string | null;
  role: UserRole | "system" | null;
}

interface AuditEventInput {
  eventType: string;
  severity?: AuditSeverity;
  route?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  targetLabel?: string | null;
  metadata?: Record<string, unknown>;
}

interface AuditEventRow {
  id: string;
  created_at: string;
  actor_user_id: string | null;
  actor_email: string | null;
  actor_role: UserRole | "system" | null;
  event_type: string;
  severity: AuditSeverity;
  route: string | null;
  target_type: string | null;
  target_id: string | null;
  target_label: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
}

interface AuditEventFilters {
  actorEmail?: string;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function resolveAuditActor(): Promise<AuditActor> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return { userId: null, email: null, role: "system" };
    }

    const normalizedEmail = normalizeEmail(user.email);
    const { data: whitelistUser } = await supabase
      .from("whitelist_usuarios")
      .select("rol")
      .eq("email", normalizedEmail)
      .eq("activo", true)
      .maybeSingle<{ rol: UserRole }>();

    return {
      userId: user.id,
      email: normalizedEmail,
      role: whitelistUser?.rol ?? "system",
    };
  } catch {
    return { userId: null, email: null, role: "system" };
  }
}

function getRequestMeta() {
  try {
    const headerStore = headers();
    const forwardedFor = headerStore.get("x-forwarded-for");
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || headerStore.get("x-real-ip") || null;

    return {
      ipAddress,
      userAgent: headerStore.get("user-agent"),
    };
  } catch {
    return {
      ipAddress: null,
      userAgent: null,
    };
  }
}

function isPrefetchRequest() {
  try {
    const headerStore = headers();
    return headerStore.get("purpose") === "prefetch" || headerStore.get("next-router-prefetch") !== null;
  } catch {
    return false;
  }
}

async function assertAdminAuditAccess() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { data: whitelistUser } = await supabase
    .from("whitelist_usuarios")
    .select("rol")
    .eq("email", normalizeEmail(user.email))
    .eq("activo", true)
    .maybeSingle<{ rol: UserRole }>();

  if (!whitelistUser || whitelistUser.rol !== "admin") {
    redirect("/acceso-denegado");
  }

  return createAdminClient();
}

export async function logAuditEvent({
  eventType,
  severity = "info",
  route = null,
  targetType = null,
  targetId = null,
  targetLabel = null,
  metadata = {},
}: AuditEventInput) {
  if (isPrefetchRequest()) {
    return;
  }

  try {
    const adminClient = createAdminClient();
    const actor = await resolveAuditActor();
    const requestMeta = getRequestMeta();

    await adminClient.from("portal_audit_log").insert({
      actor_user_id: actor.userId,
      actor_email: actor.email,
      actor_role: actor.role,
      event_type: eventType,
      severity,
      route,
      target_type: targetType,
      target_id: targetId,
      target_label: targetLabel,
      ip_address: requestMeta.ipAddress,
      user_agent: requestMeta.userAgent,
      metadata,
    });
  } catch (error) {
    console.error("[audit] No fue posible registrar el evento", eventType, error);
  }
}

export async function getRecentAuditEvents(limit = 20, filters: AuditEventFilters = {}): Promise<PortalAuditEvent[]> {
  try {
    const adminClient = await assertAdminAuditAccess();
    const actorEmail = filters.actorEmail?.trim().toLowerCase();
    let query = adminClient
      .from("portal_audit_log")
      .select("id, created_at, actor_user_id, actor_email, actor_role, event_type, severity, route, target_type, target_id, target_label, ip_address, user_agent, metadata")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (actorEmail) {
      query = query.ilike("actor_email", `%${actorEmail}%`);
    }

    const { data, error } = await query.returns<AuditEventRow[]>();

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      ...row,
      metadata: row.metadata ?? {},
    }));
  } catch {
    return [];
  }
}

export function getOperationalSecurityChecks(): OperationalSecurityCheck[] {
  const checks: OperationalSecurityCheck[] = [
    {
      id: "supabase-url",
      label: "NEXT_PUBLIC_SUPABASE_URL",
      status: process.env.NEXT_PUBLIC_SUPABASE_URL ? "ok" : "critical",
      description: process.env.NEXT_PUBLIC_SUPABASE_URL
        ? "Configurada para clientes y server components de Supabase."
        : "Falta la URL base de Supabase; el portal no puede autenticarse ni consultar datos.",
      isSensitive: false,
    },
    {
      id: "supabase-publishable",
      label: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      status: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? "ok" : "critical",
      description: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
        ? "Clave publica disponible para sesiones del cliente."
        : "Falta la clave publishable de Supabase; el login no podra iniciar sesion.",
      isSensitive: false,
    },
    {
      id: "supabase-service-role",
      label: "SUPABASE_SERVICE_ROLE_KEY",
      status: process.env.SUPABASE_SERVICE_ROLE_KEY ? "ok" : "critical",
      description: process.env.SUPABASE_SERVICE_ROLE_KEY
        ? "Presente para lecturas administrativas y escrituras privilegiadas."
        : "Falta la service role key; se rompen auditoria, whitelist y lecturas administrativas.",
      isSensitive: true,
    },
    {
      id: "app-url",
      label: "NEXT_PUBLIC_APP_URL",
      status: process.env.NEXT_PUBLIC_APP_URL ? "ok" : "warning",
      description: process.env.NEXT_PUBLIC_APP_URL
        ? "URL base configurada para callback OAuth y enlaces absolutos."
        : "No esta definida; el callback usa el origin del request como fallback.",
      isSensitive: false,
    },
    {
      id: "maps-public",
      label: "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
      status: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "ok" : "critical",
      description: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        ? "Disponible para carga de Google Maps en cliente."
        : "Falta la API key publica de Google Maps; no se cargaran mapa ni autocomplete.",
      isSensitive: false,
    },
    {
      id: "maps-server",
      label: "GOOGLE_MAPS_SERVER_KEY",
      status: process.env.GOOGLE_MAPS_SERVER_KEY ? "ok" : "critical",
      description: process.env.GOOGLE_MAPS_SERVER_KEY
        ? "Disponible para calculo server-side de rutas."
        : "Falta la API key server-side de Google Maps; no se podran calcular rutas.",
      isSensitive: true,
    },
    {
      id: "apps-script-url",
      label: "APPS_SCRIPT_WEBHOOK_URL",
      status: process.env.APPS_SCRIPT_WEBHOOK_URL ? "ok" : "warning",
      description: process.env.APPS_SCRIPT_WEBHOOK_URL
        ? "Disponible para notificacion por correo post registro."
        : "Falta el webhook de Apps Script; la salida se guarda, pero la notificacion se omitira.",
      isSensitive: false,
    },
    {
      id: "apps-script-secret",
      label: "APPS_SCRIPT_WEBHOOK_SECRET",
      status: process.env.APPS_SCRIPT_WEBHOOK_SECRET ? "ok" : "warning",
      description: process.env.APPS_SCRIPT_WEBHOOK_SECRET
        ? "Secreto presente para autenticar llamadas al webhook."
        : "Falta el secreto del webhook; el envio de correo fallara o quedara expuesto.",
      isSensitive: true,
    },
  ];

  return checks;
}