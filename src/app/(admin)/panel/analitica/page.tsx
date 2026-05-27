import { getTripPassengerTotals } from "@/lib/admin/trip-formatting";
import { logAuditEvent } from "@/lib/admin/audit";
import { getAdminTrips } from "@/lib/admin/trips";

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("es-CL").format(value);
}

function formatPercent(value: number, total: number) {
  if (!total) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

function formatMonthLabel(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);

  return new Intl.DateTimeFormat("es-CL", {
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

export default async function AdminAnalyticsPage() {
  const trips = await getAdminTrips();

  const totalTrips = trips.length;
  const totalPassengers = trips.reduce((sum, trip) => sum + getTripPassengerTotals(trip).cantidadTotalPasajeros, 0);
  const totalStudents = trips.reduce((sum, trip) => sum + trip.cantidad_estudiantes, 0);
  const totalGuardians = trips.reduce((sum, trip) => sum + trip.cantidad_apoderados, 0);
  const totalStaff = trips.reduce((sum, trip) => sum + trip.funcionarios.length, 0);
  const destinationCommunesCount = new Map<string, number>();
  const schoolTripCount = new Map<string, { schoolName: string; tripCount: number; passengers: number }>();
  const monthTripCount = new Map<string, number>();
  const statusCount = new Map<string, number>();

  for (const trip of trips) {
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

  const maxCommuneCount = Math.max(...topCommunes.map((item) => item.count), 1);
  const maxSchoolTripCount = Math.max(...topSchools.map((item) => item.tripCount), 1);
  const maxMonthlyTripCount = Math.max(...monthlyTrips.map((item) => item.count), 1);
  const sentTrips = statusCount.get("enviada") ?? 0;
  const draftTrips = statusCount.get("borrador") ?? 0;
  const uniqueCommunes = destinationCommunesCount.size;
  const uniqueSchools = schoolTripCount.size;
  const averagePassengersPerTrip = totalTrips ? totalPassengers / totalTrips : 0;

  await logAuditEvent({
    eventType: "page_view",
    route: "/panel/analitica",
    targetType: "page",
    targetLabel: "Analitica y metricas",
    metadata: {
      totalTrips,
      uniqueCommunes,
      uniqueSchools,
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
          <p className="text-sm leading-6 text-slate-500">Graficos construidos sobre las salidas administrativas visibles en tiempo real.</p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 xl:col-span-1">
            <p className="text-sm font-semibold text-slate-950">Composicion de pasajeros</p>
            <p className="mt-1 text-sm text-slate-500">Distribucion acumulada por tipo de pasajero.</p>

            <div className="mt-5 h-4 overflow-hidden rounded-full bg-white">
              <div className="flex h-full w-full">
                <div className="bg-slep" style={{ width: `${totalPassengers ? (totalStudents / totalPassengers) * 100 : 0}%` }} />
                <div className="bg-amber-400" style={{ width: `${totalPassengers ? (totalGuardians / totalPassengers) * 100 : 0}%` }} />
                <div className="bg-slate-700" style={{ width: `${totalPassengers ? (totalStaff / totalPassengers) * 100 : 0}%` }} />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-slep" />
                  <span className="text-sm text-slate-700">Estudiantes</span>
                </div>
                <span className="text-sm font-semibold text-slate-950">{formatCompactNumber(totalStudents)} ({formatPercent(totalStudents, totalPassengers)})</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="text-sm text-slate-700">Apoderados</span>
                </div>
                <span className="text-sm font-semibold text-slate-950">{formatCompactNumber(totalGuardians)} ({formatPercent(totalGuardians, totalPassengers)})</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-slate-700" />
                  <span className="text-sm text-slate-700">Funcionarios</span>
                </div>
                <span className="text-sm font-semibold text-slate-950">{formatCompactNumber(totalStaff)} ({formatPercent(totalStaff, totalPassengers)})</span>
              </div>
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 xl:col-span-1">
            <p className="text-sm font-semibold text-slate-950">Estado de viajes</p>
            <p className="mt-1 text-sm text-slate-500">Proporcion entre salidas enviadas y borradores.</p>

            <div className="mt-5 h-4 overflow-hidden rounded-full bg-white">
              <div className="flex h-full w-full">
                <div className="bg-emerald-500" style={{ width: `${totalTrips ? (sentTrips / totalTrips) * 100 : 0}%` }} />
                <div className="bg-amber-400" style={{ width: `${totalTrips ? (draftTrips / totalTrips) * 100 : 0}%` }} />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Enviadas</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCompactNumber(sentTrips)}</p>
                <p className="mt-1 text-sm text-slate-500">{formatPercent(sentTrips, totalTrips)} del total visible.</p>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">Borradores</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{formatCompactNumber(draftTrips)}</p>
                <p className="mt-1 text-sm text-slate-500">{formatPercent(draftTrips, totalTrips)} del total visible.</p>
              </div>
            </div>
          </section>

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

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Viajes por escuela</p>
                <p className="mt-1 text-sm text-slate-500">Ranking de establecimientos con mayor carga registrada.</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Top 10</span>
            </div>

            <div className="mt-5 space-y-3">
              {topSchools.length ? (
                topSchools.map((school) => (
                  <div key={school.rbd} className="rounded-2xl bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950">{school.schoolName}</p>
                        <p className="text-sm text-slate-500">RBD {school.rbd}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-slate-950">{formatCompactNumber(school.tripCount)}</p>
                        <p className="text-xs text-slate-500">viaje(s)</p>
                      </div>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-slep" style={{ width: `${(school.tripCount / maxSchoolTripCount) * 100}%` }} />
                    </div>
                    <p className="mt-2 text-sm text-slate-500">{formatCompactNumber(school.passengers)} pasajero(s) acumulados.</p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm leading-6 text-slate-500">
                  Aun no hay salidas visibles para construir el ranking por establecimiento.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Comunas de destino</p>
                <p className="mt-1 text-sm text-slate-500">Concentracion territorial de las salidas registradas.</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Top 8</span>
            </div>

            <div className="mt-5 space-y-3">
              {topCommunes.length ? (
                topCommunes.map((commune) => (
                  <div key={commune.name} className="rounded-2xl bg-white p-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-slate-950">{commune.name}</p>
                      <p className="text-sm font-semibold text-slate-700">{formatCompactNumber(commune.count)} viaje(s)</p>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${(commune.count / maxCommuneCount) * 100}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm leading-6 text-slate-500">
                  Aun no hay comunas destino visibles para consolidar la distribucion territorial.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Tendencia mensual de viajes</p>
                <p className="mt-1 text-sm text-slate-500">Vista tipo columnas para los ultimos meses con actividad.</p>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Ultimos 8 meses</span>
            </div>

            <div className="mt-6 grid min-h-[18rem] grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-8 xl:items-end">
              {monthlyTrips.length ? (
                monthlyTrips.map((month) => (
                  <div key={month.month} className="flex h-full flex-col justify-end rounded-2xl bg-white p-4">
                    <div className="flex min-h-[10rem] items-end justify-center">
                      <div
                        className="w-full rounded-t-[18px] bg-slep"
                        style={{ height: `${Math.max((month.count / maxMonthlyTripCount) * 100, 12)}%` }}
                      />
                    </div>
                    <p className="mt-4 text-center text-lg font-semibold text-slate-950">{formatCompactNumber(month.count)}</p>
                    <p className="mt-1 text-center text-xs uppercase tracking-[0.14em] text-slate-500">{formatMonthLabel(month.month)}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm leading-6 text-slate-500">
                  No hay suficiente historial para desplegar la tendencia mensual.
                </div>
              )}
            </div>
          </section>

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