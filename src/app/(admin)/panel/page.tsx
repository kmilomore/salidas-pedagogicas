import Link from "next/link";

import { logAuditEvent } from "@/lib/admin/audit";
import { buildResponseCoverageSummary } from "@/lib/admin/response-coverage";
import AdminTripsKanban from "@/components/admin/AdminTripsKanban";
import AdminPendingReviewTable from "@/components/admin/AdminPendingReviewTable";
import AdminTripsTable from "@/components/admin/AdminTripsTable";
import { formatDistance } from "@/lib/admin/trip-formatting";
import { filterTrips, getAdminTrips, serializeTripFilters } from "@/lib/admin/trips";
import { getWhitelistUsers } from "@/lib/admin/whitelist";
import type { TripQueryFilters } from "@/types";

interface AdminPanelPageProps {
  searchParams?: {
    search?: string;
    rbd?: string;
    estado?: string;
    decision_admin?: string;
    etapa_admin?: string;
  };
}

export default async function AdminPanelPage({ searchParams }: AdminPanelPageProps) {
  const [allTrips, whitelistUsers] = await Promise.all([getAdminTrips(), getWhitelistUsers()]);
  const filters: TripQueryFilters = {
    search: searchParams?.search?.trim() || undefined,
    rbd: searchParams?.rbd?.trim() || undefined,
    estado: searchParams?.estado === "borrador" || searchParams?.estado === "enviada" ? searchParams.estado : "all",
    decision_admin:
      searchParams?.decision_admin === "pendiente" || searchParams?.decision_admin === "aceptada" || searchParams?.decision_admin === "rechazada"
        ? searchParams.decision_admin
        : "all",
    etapa_admin:
      searchParams?.etapa_admin === "pendiente" ||
      searchParams?.etapa_admin === "etapa_1" ||
      searchParams?.etapa_admin === "etapa_2" ||
      searchParams?.etapa_admin === "terminada" ||
      searchParams?.etapa_admin === "seleccionada"
        ? searchParams.etapa_admin
        : "all",
  };
  const trips = filterTrips(allTrips, filters).slice(0, 100);
  const pendingReviewTrips = filterTrips(allTrips, { ...filters, decision_admin: "pendiente" }).slice(0, 12);
  const schoolOptions = Array.from(new Map(allTrips.map((trip) => [trip.rbd, { rbd: trip.rbd, name: trip.school_name }])).values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );
  const filterQuery = serializeTripFilters(filters);
  const schoolCount = new Set(trips.map((trip) => trip.rbd)).size;
  const sentCount = trips.filter((trip) => trip.estado === "enviada").length;
  const draftCount = trips.filter((trip) => trip.estado === "borrador").length;
  const totalDistance = trips.reduce((sum, trip) => sum + Number(trip.distancia_km ?? 0), 0);
  const { directorCoverage, respondedSchools, pendingSchools, expectedDirectorCount, respondedDirectorCount, pendingDirectorCount } =
    buildResponseCoverageSummary(whitelistUsers, allTrips);
  const permittedSchools = directorCoverage.map((school) => ({
    ...school,
    responded: respondedSchools.some((respondedSchool) => respondedSchool.rbd === school.rbd),
  }));

  await logAuditEvent({
    eventType: "page_view",
    route: "/panel",
    targetType: "page",
    targetLabel: "Panel administrativo",
    metadata: {
      search: filters.search ?? null,
      rbd: filters.rbd ?? null,
      estado: filters.estado ?? "all",
      decision_admin: filters.decision_admin ?? "all",
      etapa_admin: filters.etapa_admin ?? "all",
    },
  });

  return (
    <section className="grid gap-6 xl:grid-cols-12">
      <article className="portal-panel rounded-[28px] p-8 xl:col-span-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Administracion</p>
            <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">Panel administrativo</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Consolida el seguimiento transversal de las salidas registradas por los establecimientos y muestra las ultimas cargas operativas reales.
            </p>
          </div>
          <div className="mt-2 flex flex-wrap gap-3">
            <a
              href={`/api/admin/export-csv${filterQuery}`}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slep hover:text-slep"
            >
              Exportar CSV
            </a>
            <a
              href={`/api/admin/export-xlsx${filterQuery}`}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slep hover:text-slep"
            >
              Exportar Excel
            </a>
            <Link
              href="/nueva-salida"
              className="inline-flex items-center justify-center rounded-2xl bg-slep px-5 py-3 text-sm font-semibold text-white transition hover:bg-slep-dark"
            >
              Abrir formulario de salidas
            </Link>
          </div>
        </div>
      </article>

      <aside className="rounded-[28px] bg-slep-dark p-8 text-white shadow-soft xl:col-span-4">
        <h3 className="font-display text-2xl font-semibold text-white">Estado operacional</h3>
        <p className="mt-5 text-sm leading-6 text-slate-50">
          {trips.length
            ? `Existen ${trips.length} salidas visibles en esta vista administrativa, con ${sentCount} enviadas y ${draftCount} en borrador.`
            : "Aun no existen salidas visibles en el panel administrativo. Cuando se registren solicitudes reales, apareceran aqui automaticamente."}
        </p>
      </aside>

      <div className="grid gap-6 md:grid-cols-2 xl:col-span-12 xl:grid-cols-4">
        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Establecimientos</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{schoolCount}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Con salidas registradas visibles en el panel administrativo.</p>
        </article>
        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Solicitudes</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{trips.length}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Total de salidas cargadas en la vista transversal.</p>
        </article>
        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Enviadas</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{sentCount}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Solicitudes listas y persistidas como enviadas.</p>
        </article>
        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Cobertura</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{formatDistance(totalDistance)}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Kilometraje acumulado visible en las ultimas salidas registradas.</p>
        </article>
      </div>

      <article className="portal-panel rounded-[28px] p-8 xl:col-span-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Listado transversal</p>
            <h3 className="font-display mt-4 text-2xl font-semibold text-slate-950">Ultimas salidas registradas</h3>
          </div>
          <p className="text-sm leading-6 text-slate-500">Filtros aplicados sobre el historial administrativo real.</p>
        </div>

        <form method="GET" className="mt-6 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(220px,1fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)_auto_auto]">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Busqueda</span>
            <input
              type="text"
              name="search"
              defaultValue={filters.search ?? ""}
              placeholder="Actividad, destino, establecimiento o RBD"
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Establecimiento</span>
            <select
              name="rbd"
              defaultValue={filters.rbd ?? ""}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
            >
              <option value="">Todos los establecimientos</option>
              {schoolOptions.map((option) => (
                <option key={option.rbd} value={option.rbd}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Estado</span>
            <select
              name="estado"
              defaultValue={filters.estado ?? "all"}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
            >
              <option value="all">Todos</option>
              <option value="enviada">Enviada</option>
              <option value="borrador">Borrador</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Decision administrativa</span>
            <select
              name="decision_admin"
              defaultValue={filters.decision_admin ?? "all"}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
            >
              <option value="all">Todas</option>
              <option value="pendiente">Pendiente</option>
              <option value="aceptada">Aceptada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Etapa administrativa</span>
            <select
              name="etapa_admin"
              defaultValue={filters.etapa_admin ?? "all"}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
            >
              <option value="all">Todas</option>
              <option value="pendiente">Pendiente</option>
              <option value="etapa_1">Etapa 1</option>
              <option value="etapa_2">Etapa 2</option>
              <option value="terminada">Terminada</option>
              <option value="seleccionada">Seleccionada</option>
            </select>
          </label>

          <button
            type="submit"
            className="inline-flex items-center justify-center self-end rounded-2xl bg-slep px-5 py-3 text-sm font-semibold text-white transition hover:bg-slep-dark"
          >
            Filtrar
          </button>

          <Link
            href="/panel"
            className="inline-flex items-center justify-center self-end rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slep hover:text-slep"
          >
            Limpiar
          </Link>
        </form>

        <AdminTripsTable trips={trips} />

        <AdminTripsKanban trips={trips} />

        <section className="mt-8 rounded-[24px] border border-amber-200 bg-amber-50/60 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-700">Revision administrativa</p>
              <h4 className="font-display mt-3 text-2xl font-semibold text-slate-950">Salidas pendientes de revision</h4>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Este bloque prioriza las salidas con decision administrativa pendiente para que puedas aceptarlas o rechazarlas desde el detalle sin salir del panel.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-700">
              <span className="font-semibold text-slate-950">{pendingReviewTrips.length}</span> pendiente(s) visibles
            </div>
          </div>

          <AdminPendingReviewTable trips={pendingReviewTrips} />
        </section>

        <section className="mt-8 space-y-6 rounded-[24px] border border-slate-200 bg-slate-50 p-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Cobertura de respuesta</p>
            <h4 className="font-display mt-3 text-2xl font-semibold text-slate-950">Directores esperados asociados</h4>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Este resumen usa como universo las escuelas asociadas a los correos permitidos con perfil director y RBD asignado en la whitelist, aunque hoy ese acceso esté desactivado. Una escuela cuenta como respondida si ya registra al menos una salida en el historial.
            </p>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Escuelas consideradas</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{directorCoverage.length}</p>
                <p className="mt-1 text-sm text-slate-500">{expectedDirectorCount} director(es) esperados con RBD.</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Respondieron</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-950">{respondedSchools.length}</p>
                <p className="mt-1 text-sm text-emerald-800">{respondedDirectorCount} director(es) esperados asociados a escuelas con carga.</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">No respondieron</p>
                <p className="mt-2 text-2xl font-semibold text-amber-950">{pendingSchools.length}</p>
                <p className="mt-1 text-sm text-amber-800">{pendingDirectorCount} director(es) esperados siguen pendientes.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Escuelas permitidas</p>
                <p className="text-sm text-slate-500">Cruce base entre escuelas habilitadas por correo permitido y su estado de registro.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
                {permittedSchools.length}
              </span>
            </div>

            <div className="portal-table mt-4">
              <div className="space-y-3 xl:hidden">
                {permittedSchools.length ? (
                  permittedSchools.map((school) => (
                    <article key={`${school.rbd}-mobile-permitted`} className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">{school.schoolName}</p>
                          <p className="text-sm text-slate-500">RBD {school.rbd}</p>
                        </div>
                        <span className={school.responded ? "portal-chip portal-chip--success" : "portal-chip portal-chip--warning"}>
                          {school.responded ? "Respondio" : "No respondio"}
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Director(es) permitidos</p>
                        <p className="mt-1 text-sm text-slate-700">{school.directors.join(", ")}</p>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="portal-table__empty">No hay escuelas permitidas activas asociadas a los correos entregados.</div>
                )}
              </div>

              <div className="portal-table__head hidden xl:grid min-w-[980px] grid-cols-[1.1fr_0.5fr_1.3fr_0.7fr] gap-4 px-5 py-4">
                <span>Establecimiento</span>
                <span>RBD</span>
                <span>Director(es) permitidos</span>
                <span>Estado</span>
              </div>

              {permittedSchools.length ? (
                <div className="portal-table__body hidden max-h-[22rem] overflow-y-auto xl:block">
                  {permittedSchools.map((school) => (
                    <div key={school.rbd} className="grid min-w-[980px] grid-cols-[1.1fr_0.5fr_1.3fr_0.7fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
                      <div>
                        <p className="font-semibold text-slate-950">{school.schoolName}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-950">{school.rbd}</p>
                      </div>
                      <div>
                        <p>{school.directors.join(", ")}</p>
                      </div>
                      <div>
                        <span className={school.responded ? "portal-chip portal-chip--success" : "portal-chip portal-chip--warning"}>
                          {school.responded ? "Respondio" : "No respondio"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="portal-table__empty">No hay escuelas permitidas activas asociadas a los correos entregados.</div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-emerald-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Escuelas con respuesta</p>
                <p className="text-sm text-slate-500">Directores esperados asociados a escuelas que ya registraron salidas.</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                {respondedSchools.length}
              </span>
            </div>

            <div className="portal-table mt-4">
              <div className="space-y-3 xl:hidden">
                {respondedSchools.length ? (
                  respondedSchools.map((school) => (
                    <article key={`${school.rbd}-mobile-responded`} className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="font-semibold text-slate-950">{school.schoolName}</p>
                      <p className="mt-1 text-sm text-slate-500">RBD {school.rbd}</p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Directores activos asociados</p>
                      <p className="mt-1 text-sm text-slate-700">{school.directors.join(", ")}</p>
                    </article>
                  ))
                ) : null}
              </div>

              <div className="portal-table__head hidden xl:grid min-w-[720px] grid-cols-[1.2fr_0.55fr_1.5fr] gap-4 px-5 py-4">
                <span>Establecimiento</span>
                <span>RBD</span>
                <span>Directores activos asociados</span>
              </div>

              {respondedSchools.length ? (
                <div className="portal-table__body hidden max-h-[22rem] overflow-y-auto xl:block">
                  {respondedSchools.map((school) => (
                    <div key={school.rbd} className="grid min-w-[720px] grid-cols-[1.2fr_0.55fr_1.5fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
                      <div>
                        <p className="font-semibold text-slate-950">{school.schoolName}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-950">{school.rbd}</p>
                      </div>
                      <div>
                        <p>{school.directors.join(", ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm leading-6 text-slate-500">
                  No hay escuelas respondidas dentro del universo actual de directores activos.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-amber-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Escuelas sin respuesta</p>
                <p className="text-sm text-slate-500">Directores esperados asociados a escuelas que aun no registran salidas.</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                {pendingSchools.length}
              </span>
            </div>

            <div className="portal-table mt-4">
              <div className="space-y-3 xl:hidden">
                {pendingSchools.length ? (
                  pendingSchools.map((school) => (
                    <article key={`${school.rbd}-mobile-pending`} className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="font-semibold text-slate-950">{school.schoolName}</p>
                      <p className="mt-1 text-sm text-slate-500">RBD {school.rbd}</p>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Directores activos asociados</p>
                      <p className="mt-1 text-sm text-slate-700">{school.directors.join(", ")}</p>
                    </article>
                  ))
                ) : null}
              </div>

              <div className="portal-table__head hidden xl:grid min-w-[720px] grid-cols-[1.2fr_0.55fr_1.5fr] gap-4 px-5 py-4">
                <span>Establecimiento</span>
                <span>RBD</span>
                <span>Directores activos asociados</span>
              </div>

              {pendingSchools.length ? (
                <div className="portal-table__body hidden max-h-[22rem] overflow-y-auto xl:block">
                  {pendingSchools.map((school) => (
                    <div key={school.rbd} className="grid min-w-[720px] grid-cols-[1.2fr_0.55fr_1.5fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
                      <div>
                        <p className="font-semibold text-slate-950">{school.schoolName}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-950">{school.rbd}</p>
                      </div>
                      <div>
                        <p>{school.directors.join(", ")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 px-4 py-6 text-sm leading-6 text-emerald-800">
                  Todas las escuelas con director activo ya registran al menos una salida.
                </div>
              )}
            </div>
          </div>
        </section>
      </article>
    </section>
  );
}