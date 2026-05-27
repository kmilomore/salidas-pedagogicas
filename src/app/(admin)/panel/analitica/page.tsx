import Link from "next/link";

import AdminAnalyticsCharts from "@/components/admin/AdminAnalyticsCharts";
import { logAuditEvent } from "@/lib/admin/audit";
import { getAdminTrips } from "@/lib/admin/trips";
import { getTripPassengerTotals } from "@/lib/admin/trip-formatting";

interface AdminAnalyticsPageProps {
  searchParams?: {
    from?: string;
    to?: string;
    rbd?: string;
    estado?: string;
  };
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("es-CL").format(value);
}

function normalizeDateParam(value?: string) {
  const normalized = value?.trim();

  if (!normalized || !/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return undefined;
  }

  return normalized;
}

export default async function AdminAnalyticsPage({ searchParams }: AdminAnalyticsPageProps) {
  const trips = await getAdminTrips();
  const filters = {
    from: normalizeDateParam(searchParams?.from),
    to: normalizeDateParam(searchParams?.to),
    rbd: searchParams?.rbd?.trim() || undefined,
    estado: searchParams?.estado === "borrador" || searchParams?.estado === "enviada" ? searchParams.estado : "all",
  };
  const filteredTrips = trips.filter((trip) => {
    const matchesRbd = filters.rbd ? trip.rbd === filters.rbd : true;
    const matchesEstado = filters.estado !== "all" ? trip.estado === filters.estado : true;
    const matchesFrom = filters.from ? trip.fecha >= filters.from : true;
    const matchesTo = filters.to ? trip.fecha <= filters.to : true;

    return matchesRbd && matchesEstado && matchesFrom && matchesTo;
  });
  const schoolOptions = Array.from(new Map(trips.map((trip) => [trip.rbd, { rbd: trip.rbd, name: trip.school_name }])).values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );

  const totalTrips = filteredTrips.length;
  const totalPassengers = filteredTrips.reduce((sum, trip) => sum + getTripPassengerTotals(trip).cantidadTotalPasajeros, 0);
  const totalStudents = filteredTrips.reduce((sum, trip) => sum + trip.cantidad_estudiantes, 0);
  const totalGuardians = filteredTrips.reduce((sum, trip) => sum + trip.cantidad_apoderados, 0);
  const totalStaff = filteredTrips.reduce((sum, trip) => sum + trip.funcionarios.length, 0);
  const destinationCommunesCount = new Map<string, number>();
  const schoolTripCount = new Map<string, { schoolName: string; tripCount: number; passengers: number }>();
  const monthTripCount = new Map<string, number>();
  const statusCount = new Map<string, number>();

  for (const trip of filteredTrips) {
    const normalizedComuna = trip.lugar_comuna?.trim() || "Comuna no informada";
    destinationCommunesCount.set(normalizedComuna, (destinationCommunesCount.get(normalizedComuna) ?? 0) + 1);

    const currentSchool = schoolTripCount.get(trip.rbd);
    const tripPassengers = getTripPassengerTotals(trip).cantidadTotalPasajeros;

    if (currentSchool) {
      currentSchool.tripCount += 1;
      currentSchool.passengers += tripPassengers;
    } else {
      schoolTripCount.set(trip.rbd, {
        schoolName: trip.school_name,
        tripCount: 1,
        passengers: tripPassengers,
      });
    }

    const monthKey = trip.fecha.slice(0, 7);
    monthTripCount.set(monthKey, (monthTripCount.get(monthKey) ?? 0) + 1);
    statusCount.set(trip.estado, (statusCount.get(trip.estado) ?? 0) + 1);
  }

  const topCommunes = Array.from(destinationCommunesCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"))
    .slice(0, 8);
  const topSchools = Array.from(schoolTripCount.entries())
    .map(([rbd, value]) => ({ rbd, ...value }))
    .sort((a, b) => b.tripCount - a.tripCount || a.schoolName.localeCompare(b.schoolName, "es"))
    .slice(0, 10);
  const monthlyTrips = Array.from(monthTripCount.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-8);

  const sentTrips = statusCount.get("enviada") ?? 0;
  const draftTrips = statusCount.get("borrador") ?? 0;
  const uniqueCommunes = destinationCommunesCount.size;
  const uniqueSchools = schoolTripCount.size;
  const averagePassengersPerTrip = totalTrips ? totalPassengers / totalTrips : 0;
  const passengerCompositionData = [
    { name: "Estudiantes", value: totalStudents },
    { name: "Apoderados", value: totalGuardians },
    { name: "Funcionarios", value: totalStaff },
  ].filter((item) => item.value > 0);
  const statusData = [
    { name: "Enviadas", value: sentTrips },
    { name: "Borradores", value: draftTrips },
  ].filter((item) => item.value > 0);
  const communeChartData = topCommunes.map((commune) => ({ comuna: commune.name, viajes: commune.count }));
  const schoolChartData = topSchools.map((school) => ({
    establecimiento: school.schoolName,
    viajes: school.tripCount,
    pasajeros: school.passengers,
  }));
  const monthlyTripsChartData = monthlyTrips.map((month) => ({ month: month.month, viajes: month.count }));

  await logAuditEvent({
    eventType: "page_view",
    route: "/panel/analitica",
    targetType: "page",
    targetLabel: "Analitica y metricas",
    metadata: {
      totalTrips,
      uniqueCommunes,
      uniqueSchools,
      from: filters.from ?? null,
      to: filters.to ?? null,
      rbd: filters.rbd ?? null,
      estado: filters.estado,
    },
  });

  return (
    <section className="grid gap-6 xl:grid-cols-12">
      <article className="portal-panel rounded-[28px] p-8 xl:col-span-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Analitica</p>
        <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">Analitica y metricas de respuestas</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Consolida los indicadores transversales del historial administrativo para revisar volumen de viajes, pasajeros movilizados, comunas de destino y concentracion por establecimiento.
        </p>
      </article>

      <aside className="rounded-[28px] bg-slep-dark p-8 text-white shadow-soft xl:col-span-4">
        <h3 className="font-display text-2xl font-semibold text-white">Lectura ejecutiva</h3>
        <p className="mt-5 text-sm leading-6 text-slate-50">
          {totalTrips
            ? `Se observan ${formatCompactNumber(totalTrips)} viaje(s), ${formatCompactNumber(totalPassengers)} pasajero(s) acumulados y ${formatCompactNumber(uniqueCommunes)} comuna(s) de destino distintas en la base administrativa visible.`
            : "Aun no hay viajes visibles para construir una vista analitica en el panel administrativo."}
        </p>
      </aside>

      <article className="portal-panel rounded-[28px] p-8 xl:col-span-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Filtros analiticos</p>
            <h3 className="font-display mt-4 text-2xl font-semibold text-slate-950">Segmenta la lectura ejecutiva</h3>
          </div>
          <p className="text-sm leading-6 text-slate-500">La analitica se recalcula en servidor usando los mismos registros administrativos visibles.</p>
        </div>

        <form method="GET" className="mt-6 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5 lg:grid-cols-[minmax(180px,0.8fr)_minmax(180px,0.8fr)_minmax(220px,1fr)_minmax(180px,0.8fr)_auto_auto]">
          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Desde</span>
            <input
              type="date"
              name="from"
              defaultValue={filters.from ?? ""}
              className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Hasta</span>
            <input
              type="date"
              name="to"
              defaultValue={filters.to ?? ""}
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
              defaultValue={filters.estado}
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
            Aplicar filtros
          </button>

          <Link
            href="/panel/analitica"
            className="inline-flex items-center justify-center self-end rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slep hover:text-slep"
          >
            Limpiar
          </Link>
        </form>
      </article>

      <div className="grid gap-6 md:grid-cols-2 xl:col-span-12 xl:grid-cols-4">
        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Viajes totales</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{formatCompactNumber(totalTrips)}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Cantidad acumulada de registros administrativos visibles.</p>
        </article>
        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Pasajeros</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{formatCompactNumber(totalPassengers)}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Suma de estudiantes, apoderados y funcionarios en todas las salidas.</p>
        </article>
        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Comunas destino</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{formatCompactNumber(uniqueCommunes)}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Territorios distintos declarados como destino de viaje.</p>
        </article>
        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Escuelas con viajes</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{formatCompactNumber(uniqueSchools)}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Establecimientos con al menos una salida visible en la base.</p>
        </article>
      </div>

      <article className="portal-panel rounded-[28px] p-8 xl:col-span-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Resumen analitico</p>
            <h3 className="font-display mt-4 text-2xl font-semibold text-slate-950">Lectura transversal de respuestas y demanda</h3>
          </div>
          <p className="text-sm leading-6 text-slate-500">Graficos interactivos construidos sobre las salidas administrativas visibles segun los filtros aplicados.</p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <AdminAnalyticsCharts
            passengerCompositionData={passengerCompositionData}
            statusData={statusData}
            communeChartData={communeChartData}
            schoolChartData={schoolChartData}
            monthlyTripsChartData={monthlyTripsChartData}
            totalPassengers={totalPassengers}
            totalTrips={totalTrips}
          />

          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 xl:col-span-1">
            <p className="text-sm font-semibold text-slate-950">Indicadores rapidos</p>
            <p className="mt-1 text-sm text-slate-500">Referencias operativas del universo administrativo actual.</p>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Promedio pasajeros por viaje</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{averagePassengersPerTrip.toFixed(1)}</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Escuela con mas viajes</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{topSchools[0]?.schoolName ?? "Sin datos"}</p>
                <p className="mt-1 text-sm text-slate-500">{topSchools[0] ? `${formatCompactNumber(topSchools[0].tripCount)} viaje(s)` : "No hay registros para comparar."}</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Comuna de destino mas frecuente</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{topCommunes[0]?.name ?? "Sin datos"}</p>
                <p className="mt-1 text-sm text-slate-500">{topCommunes[0] ? `${formatCompactNumber(topCommunes[0].count)} viaje(s)` : "No hay destinos visibles aun."}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Viajes por escuela</p>
                <p className="mt-1 text-sm text-slate-500">Tabla resumen de conteo y pasajeros.</p>
              </div>
            </div>

            <div className="portal-table mt-5">
              <div className="portal-table__head grid min-w-[640px] grid-cols-[1.1fr_0.45fr_0.45fr] gap-4 px-5 py-4">
                <span>Establecimiento</span>
                <span>Viajes</span>
                <span>Pasajeros</span>
              </div>

              {topSchools.length ? (
                <div className="portal-table__body max-h-[22rem] overflow-y-auto">
                  {topSchools.map((school) => (
                    <div key={school.rbd} className="grid min-w-[640px] grid-cols-[1.1fr_0.45fr_0.45fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
                      <div>
                        <p className="font-semibold text-slate-950">{school.schoolName}</p>
                        <p className="text-slate-500">RBD {school.rbd}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-950">{formatCompactNumber(school.tripCount)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-slate-950">{formatCompactNumber(school.passengers)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="portal-table__empty">Aun no hay viajes visibles para construir el resumen por establecimiento.</div>
              )}
            </div>
          </section>
        </div>
      </article>
    </section>
  );
}