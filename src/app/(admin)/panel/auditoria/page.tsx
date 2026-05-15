import AdminOperationalPanel from "@/components/admin/AdminOperationalPanel";
import { getOperationalSecurityChecks, getRecentAuditEvents, logAuditEvent } from "@/lib/admin/audit";

interface AdminAuditPageProps {
  searchParams?: {
    actor?: string;
  };
}

export default async function AdminAuditPage({ searchParams }: AdminAuditPageProps) {
  const actorFilter = searchParams?.actor?.trim() || undefined;

  await logAuditEvent({
    eventType: "page_view",
    route: "/panel/auditoria",
    targetType: "page",
    targetLabel: "Auditoria y controles",
    metadata: {
      actor: actorFilter ?? null,
    },
  });

  const auditEvents = await getRecentAuditEvents(actorFilter ? 100 : 30, { actorEmail: actorFilter });
  const operationalChecks = getOperationalSecurityChecks();
  const criticalCount = operationalChecks.filter((check) => check.status === "critical").length;
  const warningCount = operationalChecks.filter((check) => check.status === "warning").length;

  return (
    <section className="grid gap-6 xl:grid-cols-12">
      <article className="portal-panel rounded-[28px] p-8 xl:col-span-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Auditoria</p>
        <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">Auditoria y controles</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Revisa los ultimos accesos, exportaciones y acciones administrativas del portal, junto con el estado operativo de variables y configuraciones sensibles.
        </p>
      </article>

      <aside className="rounded-[28px] bg-slep-dark p-8 text-white shadow-soft xl:col-span-4">
        <h3 className="font-display text-2xl font-semibold text-white">Resumen de control</h3>
        <p className="mt-5 text-sm leading-6 text-slate-50">
          {criticalCount
            ? `Hay ${criticalCount} control(es) critico(s) que requieren revision inmediata y ${warningCount} alerta(s) operativas adicionales.`
            : warningCount
              ? `No hay hallazgos criticos, pero existen ${warningCount} alerta(s) operativas pendientes de revisar.`
              : "No hay hallazgos criticos visibles en la configuracion auditada y la bitacora esta disponible para seguimiento administrativo."}
        </p>
      </aside>

      <div className="xl:col-span-12">
        <AdminOperationalPanel checks={operationalChecks} auditEvents={auditEvents} auditActorFilter={actorFilter} />
      </div>
    </section>
  );
}