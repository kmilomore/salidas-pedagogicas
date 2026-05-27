import Link from "next/link";

import { logAuditEvent } from "@/lib/admin/audit";
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
  };
}

export default async function AdminPanelPage({ searchParams }: AdminPanelPageProps) {
  const [allTrips, whitelistUsers] = await Promise.all([getAdminTrips(), getWhitelistUsers()]);
  const filters: TripQueryFilters = {
    search: searchParams?.search?.trim() || undefined,
    rbd: searchParams?.rbd?.trim() || undefined,
    estado: searchParams?.estado === "borrador" || searchParams?.estado === "enviada" ? searchParams.estado : "all",
  };
  const trips = filterTrips(allTrips, filters).slice(0, 100);
  const schoolOptions = Array.from(new Map(allTrips.map((trip) => [trip.rbd, { rbd: trip.rbd, name: trip.school_name }])).values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );
  const filterQuery = serializeTripFilters(filters);
  const schoolCount = new Set(trips.map((trip) => trip.rbd)).size;
  const sentCount = trips.filter((trip) => trip.estado === "enviada").length;
  const draftCount = trips.filter((trip) => trip.estado === "borrador").length;
  const totalDistance = trips.reduce((sum, trip) => sum + Number(trip.distancia_km ?? 0), 0);
  const activeDirectorProfiles = whitelistUsers.filter((user) => user.rol === "director" && user.activo && user.rbd);
  const directorCoverageBySchool = new Map<string, { rbd: string; schoolName: string; directors: string[] }>();

  for (const director of activeDirectorProfiles) {
    const rbd = director.rbd as string;
    const currentEntry = directorCoverageBySchool.get(rbd);

    if (currentEntry) {
      currentEntry.directors.push(director.email);
      continue;
    }

    directorCoverageBySchool.set(rbd, {
      rbd,
      schoolName: director.school_name ?? `RBD ${rbd}`,
      directors: [director.email],
    });
  }

  const respondedRbds = new Set(allTrips.map((trip) => trip.rbd));
  const directorCoverage = Array.from(directorCoverageBySchool.values())
    .map((school) => ({
      ...school,
      directors: school.directors.sort((a, b) => a.localeCompare(b, "es")),
    }))
    .sort((a, b) => a.schoolName.localeCompare(b.schoolName, "es"));
  const respondedSchools = directorCoverage.filter((school) => respondedRbds.has(school.rbd));
  const pendingSchools = directorCoverage.filter((school) => !respondedRbds.has(school.rbd));
  const respondedDirectorCount = respondedSchools.reduce((sum, school) => sum + school.directors.length, 0);
  const pendingDirectorCount = pendingSchools.reduce((sum, school) => sum + school.directors.length, 0);

  await logAuditEvent({
    eventType: "page_view",
    route: "/panel",
    targetType: "page",
    targetLabel: "Panel administrativo",
    metadata: {
      search: filters.search ?? null,
      rbd: filters.rbd ?? null,
      estado: filters.estado ?? "all",
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

        <form method="GET" className="mt-6 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,1fr)_minmax(180px,0.8fr)_auto_auto]">
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

        <section className="mt-8 space-y-6 rounded-[24px] border border-slate-200 bg-slate-50 p-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Cobertura de respuesta</p>
            <h4 className="font-display mt-3 text-2xl font-semibold text-slate-950">Directores activos asociados</h4>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Este resumen usa como universo los directores con perfil activo y RBD asignado en la whitelist. Una escuela cuenta como respondida si ya registra al menos una salida en el historial.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Escuelas consideradas</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{directorCoverage.length}</p>
                <p className="mt-1 text-sm text-slate-500">{activeDirectorProfiles.length} director(es) activos con RBD.</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Respondieron</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-950">{respondedSchools.length}</p>
                <p className="mt-1 text-sm text-emerald-800">{respondedDirectorCount} director(es) activos asociados a escuelas con carga.</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">No respondieron</p>
                <p className="mt-2 text-2xl font-semibold text-amber-950">{pendingSchools.length}</p>
                <p className="mt-1 text-sm text-amber-800">{pendingDirectorCount} director(es) activos siguen pendientes.</p>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-emerald-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Escuelas con respuesta</p>
                <p className="text-sm text-slate-500">Directores activos asociados a escuelas que ya registraron salidas.</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800">
                {respondedSchools.length}
              </span>
            </div>

            <div className="mt-4 max-h-[22rem] space-y-3 overflow-y-auto pr-1">
              {respondedSchools.length ? (
                respondedSchools.map((school) => (
                  <article key={school.rbd} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-950">{school.schoolName}</p>
                    <p className="mt-1 text-sm text-slate-500">RBD {school.rbd}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Directores activos asociados</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{school.directors.join(", ")}</p>
                  </article>
                ))
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
                <p className="text-sm text-slate-500">Directores activos asociados a escuelas que aun no registran salidas.</p>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
                {pendingSchools.length}
              </span>
            </div>

            <div className="mt-4 max-h-[22rem] space-y-3 overflow-y-auto pr-1">
              {pendingSchools.length ? (
                pendingSchools.map((school) => (
                  <article key={school.rbd} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-950">{school.schoolName}</p>
                    <p className="mt-1 text-sm text-slate-500">RBD {school.rbd}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Directores activos asociados</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{school.directors.join(", ")}</p>
                  </article>
                ))
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