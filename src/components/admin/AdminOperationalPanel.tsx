import { formatChileDateTime } from "@/lib/date-time";
import type { OperationalSecurityCheck, PortalAuditEvent } from "@/types";

interface AdminOperationalPanelProps {
  checks: OperationalSecurityCheck[];
  auditEvents: PortalAuditEvent[];
}

function getCheckLabel(status: OperationalSecurityCheck["status"]) {
  switch (status) {
    case "critical":
      return "Critico";
    case "warning":
      return "Alerta";
    default:
      return "OK";
  }
}

function formatAuditTimestamp(value: string) {
  return formatChileDateTime(value, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatEventLabel(eventType: string) {
  return eventType
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function getSeverityChip(severity: PortalAuditEvent["severity"]) {
  switch (severity) {
    case "error":
      return "portal-chip portal-chip--danger";
    case "warning":
      return "portal-chip portal-chip--warning";
    default:
      return "portal-chip portal-chip--info";
  }
}

export default function AdminOperationalPanel({ checks, auditEvents }: AdminOperationalPanelProps) {
  const criticalCount = checks.filter((check) => check.status === "critical").length;
  const warningCount = checks.filter((check) => check.status === "warning").length;

  return (
    <div className="grid min-w-0 gap-6">
      <section className="portal-section-card min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Controles</p>
            <h3 className="font-display mt-4 text-2xl font-semibold text-slate-950">Estado operativo y variables</h3>
          </div>
          <p className="text-sm leading-6 text-slate-500">
            {criticalCount
              ? `${criticalCount} control(es) critico(s) requieren atencion.`
              : warningCount
                ? `${warningCount} alerta(s) operativas detectadas.`
                : "Sin alertas criticas detectadas en la configuracion visible."}
          </p>
        </div>

          <div className="mt-6 min-w-0 overflow-x-auto">
            <div className="portal-table min-w-[720px]">
              <div className="portal-table__head grid grid-cols-[1fr_0.7fr_2.2fr_0.8fr] gap-4 px-5 py-4">
                <span>Control</span>
                <span>Estado</span>
                <span>Descripcion</span>
                <span>Sensibilidad</span>
              </div>

              {checks.length ? (
                <div className="portal-table__body">
                  {checks.map((check) => (
                    <div key={check.id} className="grid grid-cols-[1fr_0.7fr_2.2fr_0.8fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
                      <div>
                        <p className="font-medium text-slate-950">{check.label}</p>
                      </div>
                      <div>
                        <span className={getSeverityChip(check.status === "critical" ? "error" : check.status === "warning" ? "warning" : "info")}>
                          {getCheckLabel(check.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-slate-700">{check.description}</p>
                      </div>
                      <div>
                        <span className={check.isSensitive ? "portal-chip portal-chip--warning" : "portal-chip portal-chip--info"}>
                          {check.isSensitive ? "Secreto" : "Visible"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="portal-table__empty">
                  No hay controles cargados para esta vista.
                </div>
              )}
            </div>
        </div>
      </section>

        <section className="portal-section-card min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Auditoria</p>
            <h3 className="font-display mt-4 text-2xl font-semibold text-slate-950">Ultimos movimientos</h3>
          </div>
          <p className="text-sm leading-6 text-slate-500">Accesos, exportaciones, cambios administrativos y acciones operativas recientes.</p>
        </div>

        <div className="mt-6 min-w-0 overflow-x-auto">
          <div className="portal-table min-w-[760px] overflow-hidden">
            <div className="max-h-[560px] overflow-auto">
              <div className="portal-table__head sticky top-0 z-10 grid grid-cols-[0.9fr_1.1fr_1.2fr_0.8fr_1fr_1fr] gap-4 border-b border-slate-200 px-5 py-4">
                <span>Fecha</span>
                <span>Evento</span>
                <span>Actor</span>
                <span>Severidad</span>
                <span>Ruta</span>
                <span>Objetivo</span>
              </div>

              {auditEvents.length ? (
                <div className="portal-table__body">
                {auditEvents.map((event) => (
                  <div key={event.id} className="grid grid-cols-[0.9fr_1.1fr_1.2fr_0.8fr_1fr_1fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
                    <div>
                      <p className="font-medium text-slate-950">{formatAuditTimestamp(event.created_at)}</p>
                      <p className="text-slate-500">{event.ip_address ?? "IP no disponible"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-950">{formatEventLabel(event.event_type)}</p>
                      <p className="text-slate-500">{event.metadata.count ? `${event.metadata.count} registro(s)` : "Evento registrado"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-950">{event.actor_email ?? "Sistema"}</p>
                      <p className="text-slate-500">{event.actor_role ?? "system"}</p>
                    </div>
                    <div>
                      <span className={getSeverityChip(event.severity)}>{event.severity}</span>
                    </div>
                    <div>
                      <p className="font-medium text-slate-950">{event.route ?? "-"}</p>
                      <p className="text-slate-500 truncate">{event.user_agent ?? "Sin user-agent"}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-950">{event.target_label ?? event.target_type ?? "-"}</p>
                      <p className="text-slate-500">{event.target_id ?? "Sin referencia"}</p>
                    </div>
                  </div>
                ))}
                </div>
              ) : (
                <div className="portal-table__empty">
                  Aun no hay eventos de auditoria persistidos o la migracion no ha sido aplicada en la base de datos.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}