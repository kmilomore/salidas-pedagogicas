import Link from "next/link";

import AdminAnalyticsCharts from "@/components/admin/AdminAnalyticsCharts";
import AdminDecisionSchoolsTable from "@/components/admin/AdminDecisionSchoolsTable";
import AdminSchoolTripsExplorer from "@/components/admin/AdminSchoolTripsExplorer";
import { logAuditEvent } from "@/lib/admin/audit";
import { buildResponseCoverageSummary } from "@/lib/admin/response-coverage";
import { createAdminClient } from "@/lib/supabase/server";
import { normalizeSingleLineText } from "@/lib/input-normalization";
import { filterTrips, getAdminTrips } from "@/lib/admin/trips";
import { getTripPassengerTotals } from "@/lib/admin/trip-formatting";
import { getWhitelistUsers } from "@/lib/admin/whitelist";
import type { SchoolRecord, TripQueryFilters } from "@/types";

interface AdminAnalyticsPageProps {
  searchParams?: {
    from?: string;
    to?: string;
    rbd?: string;
    estado?: string;
    decision_admin?: string;
    etapa_admin?: string;
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

function normalizeRegionLabel(value?: string) {
  const normalized = normalizeSingleLineText(value ?? "");

  if (!normalized) {
    return "Region no informada";
  }

  const simplified = normalized
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(region|region of|region de|regio?n)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const regionAliases = [
    { label: "Arica y Parinacota", aliases: ["arica y parinacota"] },
    { label: "Tarapaca", aliases: ["tarapaca"] },
    { label: "Antofagasta", aliases: ["antofagasta"] },
    { label: "Atacama", aliases: ["atacama"] },
    { label: "Coquimbo", aliases: ["coquimbo"] },
    { label: "Valparaiso", aliases: ["valparaiso"] },
    { label: "Metropolitana", aliases: ["metropolitana", "metropolitana de santiago", "santiago metropolitan"] },
    { label: "O'Higgins", aliases: ["o higgins", "ohiggins", "libertador bernardo ohiggins", "bernardo ohiggins"] },
    { label: "Maule", aliases: ["maule"] },
    { label: "Nuble", aliases: ["nuble", "ñuble"] },
    { label: "Biobio", aliases: ["biobio", "bio bio"] },
    { label: "La Araucania", aliases: ["araucania", "la araucania"] },
    { label: "Los Rios", aliases: ["los rios"] },
    { label: "Los Lagos", aliases: ["los lagos"] },
    { label: "Aysen", aliases: ["aysen", "aisen", "aysen del general carlos ibanez del campo"] },
    { label: "Magallanes", aliases: ["magallanes", "magallanes y de la antartica chilena"] },
  ];

  for (const region of regionAliases) {
    if (region.aliases.some((alias) => simplified.includes(alias))) {
      return region.label;
    }
  }

  return normalized;
}

interface DecisionSchoolRow {
  rbd: string;
  schoolName: string;
  directorName: string;
  emails: string[];
  tripCount: number;
}

function buildDecisionSchoolRows(
  trips: Awaited<ReturnType<typeof getAdminTrips>>,
  decision: "aceptada" | "rechazada",
  schoolContacts: Map<string, { directorName: string; emails: string[] }>,
) {
  const groupedSchools = new Map<string, DecisionSchoolRow>();

  for (const trip of trips) {
    if (trip.decision_admin !== decision) {
      continue;
    }

    const current = groupedSchools.get(trip.rbd);
    const schoolContact = schoolContacts.get(trip.rbd);

    if (current) {
      current.tripCount += 1;
      continue;
    }

    groupedSchools.set(trip.rbd, {
      rbd: trip.rbd,
      schoolName: trip.school_name,
      directorName: schoolContact?.directorName ?? "",
      emails: schoolContact?.emails ?? [],
      tripCount: 1,
    });
  }

  return Array.from(groupedSchools.values()).sort((a, b) => b.tripCount - a.tripCount || a.schoolName.localeCompare(b.schoolName, "es"));
}

export default async function AdminAnalyticsPage({ searchParams }: AdminAnalyticsPageProps) {
  const [trips, whitelistUsers] = await Promise.all([getAdminTrips(), getWhitelistUsers()]);
  const filters: {
    from?: string;
    to?: string;
    rbd?: string;
    estado: TripQueryFilters["estado"];
    decision_admin: TripQueryFilters["decision_admin"];
    etapa_admin: TripQueryFilters["etapa_admin"];
  } = {
    from: normalizeDateParam(searchParams?.from),
    to: normalizeDateParam(searchParams?.to),
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
  const tripFilters: TripQueryFilters = {
    rbd: filters.rbd,
    estado: filters.estado,
    decision_admin: filters.decision_admin,
    etapa_admin: filters.etapa_admin,
  };
  const filteredTrips = filterTrips(trips, tripFilters).filter((trip) => {
    const matchesFrom = filters.from ? trip.fecha >= filters.from : true;
    const matchesTo = filters.to ? trip.fecha <= filters.to : true;

    return matchesFrom && matchesTo;
  });
  const analyticsRbds = Array.from(new Set(filteredTrips.map((trip) => trip.rbd)));
  const schoolOptions = Array.from(new Map(trips.map((trip) => [trip.rbd, { rbd: trip.rbd, name: trip.school_name }])).values()).sort((a, b) =>
    a.name.localeCompare(b.name, "es"),
  );

  const schoolContacts = new Map<string, { directorName: string; emails: string[] }>();

  if (analyticsRbds.length) {
    const adminClient = createAdminClient();
    const { data: schoolRows } = await adminClient
      .from("BASE DE DATOS ESCUELAS SLEP")
      .select('RBD,"DIRECTOR/A","CORREO ELECTRÓNICO"')
      .in("RBD", analyticsRbds)
      .returns<Pick<SchoolRecord, "RBD" | "DIRECTOR/A" | "CORREO ELECTRÓNICO">[]>();

    for (const row of schoolRows ?? []) {
      const rbd = row.RBD?.trim();

      if (!rbd) {
        continue;
      }

      const email = row["CORREO ELECTRÓNICO"]?.trim();
      schoolContacts.set(rbd, {
        directorName: row["DIRECTOR/A"]?.trim() ?? "",
        emails: email ? [email] : [],
      });
    }
  }

  const totalTrips = filteredTrips.length;
  const totalPassengers = filteredTrips.reduce((sum, trip) => sum + getTripPassengerTotals(trip).cantidadTotalPasajeros, 0);
  const totalStudents = filteredTrips.reduce((sum, trip) => sum + trip.cantidad_estudiantes, 0);
  const totalGuardians = filteredTrips.reduce((sum, trip) => sum + trip.cantidad_apoderados, 0);
  const totalStaff = filteredTrips.reduce((sum, trip) => sum + trip.funcionarios.length, 0);
  const destinationCommunesCount = new Map<string, number>();
  const destinationRegionsCount = new Map<string, number>();
  const destinationPlacesCount = new Map<string, { name: string; region: string; count: number }>();
  const schoolTripCount = new Map<string, { schoolName: string; tripCount: number; passengers: number }>();
  const monthTripCount = new Map<string, number>();
  const statusCount = new Map<string, number>();

  for (const trip of filteredTrips) {
    const normalizedComuna = trip.lugar_comuna?.trim() || "Comuna no informada";
    const normalizedRegion = normalizeRegionLabel(trip.lugar_region);
    const normalizedPlace = trip.lugar_nombre?.trim() || "Lugar no informado";
    destinationCommunesCount.set(normalizedComuna, (destinationCommunesCount.get(normalizedComuna) ?? 0) + 1);
    destinationRegionsCount.set(normalizedRegion, (destinationRegionsCount.get(normalizedRegion) ?? 0) + 1);

    const currentPlace = destinationPlacesCount.get(normalizedPlace);

    if (currentPlace) {
      currentPlace.count += 1;
    } else {
      destinationPlacesCount.set(normalizedPlace, {
        name: normalizedPlace,
        region: normalizedRegion,
        count: 1,
      });
    }

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
  const topRegions = Array.from(destinationRegionsCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"))
    .slice(0, 8);
  const topPlaces = Array.from(destinationPlacesCount.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"))
    .slice(0, 8);
  const schoolSummaries = Array.from(schoolTripCount.entries())
    .map(([rbd, value]) => ({ rbd, ...value }))
    .sort((a, b) => b.tripCount - a.tripCount || a.schoolName.localeCompare(b.schoolName, "es"));
  const topSchools = schoolSummaries.slice(0, 10);
  const monthlyTrips = Array.from(monthTripCount.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-8);

  const sentTrips = statusCount.get("enviada") ?? 0;
  const draftTrips = statusCount.get("borrador") ?? 0;
  const acceptedTrips = filteredTrips.filter((trip) => trip.decision_admin === "aceptada").length;
  const rejectedTrips = filteredTrips.filter((trip) => trip.decision_admin === "rechazada").length;
  const pendingAdminTrips = filteredTrips.filter((trip) => trip.decision_admin === "pendiente").length;
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
  const adminDecisionData = [
    { name: "Aceptadas", value: acceptedTrips },
    { name: "Rechazadas", value: rejectedTrips },
    { name: "Pendientes", value: pendingAdminTrips },
  ].filter((item) => item.value > 0);
  const acceptedSchoolRows = buildDecisionSchoolRows(filteredTrips, "aceptada", schoolContacts);
  const rejectedSchoolRows = buildDecisionSchoolRows(filteredTrips, "rechazada", schoolContacts);
  const communeChartData = topCommunes.map((commune) => ({ comuna: commune.name, viajes: commune.count }));
  const regionChartData = topRegions.map((region) => ({ region: region.name, viajes: region.count }));
  const placeChartData = topPlaces.map((place) => ({ lugar: place.name, region: place.region, viajes: place.count }));
  const schoolChartData = topSchools.map((school) => ({
    establecimiento: school.schoolName,
    viajes: school.tripCount,
    pasajeros: school.passengers,
  }));
  const monthlyTripsChartData = monthlyTrips.map((month) => ({ month: month.month, viajes: month.count }));
  const responseCoverage = buildResponseCoverageSummary(whitelistUsers, filteredTrips);
  const responseCoverageChartData = [
    {
      name: "Respondieron",
      value: responseCoverage.respondedSchools.length,
      schoolNames: responseCoverage.respondedSchools.map((school) => school.schoolName),
    },
    {
      name: "No respondieron",
      value: responseCoverage.pendingSchools.length,
      schoolNames: responseCoverage.pendingSchools.map((school) => school.schoolName),
    },
  ].filter((item) => item.value > 0);
  const responseRate = responseCoverage.directorCoverage.length
    ? Math.round((responseCoverage.respondedSchools.length / responseCoverage.directorCoverage.length) * 100)
    : 0;

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
      decision_admin: filters.decision_admin,
      etapa_admin: filters.etapa_admin,
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

        <form method="GET" className="mt-6 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5 lg:grid-cols-[minmax(180px,0.8fr)_minmax(180px,0.8fr)_minmax(220px,1fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)_auto_auto]">
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

          <label className="block">
            <span className="text-sm font-semibold text-slate-800">Decision administrativa</span>
            <select
              name="decision_admin"
              defaultValue={filters.decision_admin}
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
              defaultValue={filters.etapa_admin}
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
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Indicadores rapidos</p>
            <h3 className="font-display mt-4 text-2xl font-semibold text-slate-950">Referencias operativas del universo administrativo</h3>
          </div>
          <p className="text-sm leading-6 text-slate-500">Lectura resumida de los hitos mas representativos segun los filtros aplicados.</p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Promedio pasajeros por viaje</p>
            <p className="mt-4 text-3xl font-semibold text-slate-950">{averagePassengersPerTrip.toFixed(1)}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Escuela con mas viajes</p>
            <p className="mt-4 text-lg font-semibold text-slate-950">{topSchools[0]?.schoolName ?? "Sin datos"}</p>
            <p className="mt-2 text-sm text-slate-500">{topSchools[0] ? `${formatCompactNumber(topSchools[0].tripCount)} viaje(s)` : "No hay registros para comparar."}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Comuna de destino mas frecuente</p>
            <p className="mt-4 text-lg font-semibold text-slate-950">{topCommunes[0]?.name ?? "Sin datos"}</p>
            <p className="mt-2 text-sm text-slate-500">{topCommunes[0] ? `${formatCompactNumber(topCommunes[0].count)} viaje(s)` : "No hay destinos visibles aun."}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Region mas visitada</p>
            <p className="mt-4 text-lg font-semibold text-slate-950">{topRegions[0]?.name ?? "Sin datos"}</p>
            <p className="mt-2 text-sm text-slate-500">{topRegions[0] ? `${formatCompactNumber(topRegions[0].count)} viaje(s)` : "No hay regiones visibles aun."}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Lugar mas visitado</p>
            <p className="mt-4 text-lg font-semibold text-slate-950">{topPlaces[0]?.name ?? "Sin datos"}</p>
            <p className="mt-2 text-sm text-slate-500">
              {topPlaces[0] ? `${formatCompactNumber(topPlaces[0].count)} viaje(s) • ${topPlaces[0].region}` : "No hay lugares visibles aun."}
            </p>
          </div>
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Salidas aceptadas</p>
            <p className="mt-4 text-3xl font-semibold text-emerald-950">{formatCompactNumber(acceptedTrips)}</p>
            <p className="mt-2 text-sm text-emerald-800">Registradas como aceptadas en la revision administrativa.</p>
          </div>
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-700">Salidas rechazadas</p>
            <p className="mt-4 text-3xl font-semibold text-rose-950">{formatCompactNumber(rejectedTrips)}</p>
            <p className="mt-2 text-sm text-rose-800">Registradas como rechazadas en la revision administrativa.</p>
          </div>
        </div>
      </article>

      <article className="portal-panel rounded-[28px] p-8 xl:col-span-12">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Cobertura de respuesta</p>
            <h3 className="font-display mt-4 text-2xl font-semibold text-slate-950">Escuelas que respondieron versus pendientes</h3>
          </div>
          <p className="text-sm leading-6 text-slate-500">
            El porcentaje se calcula sobre el universo esperado de escuelas con director(es) permitido(s) en whitelist y RBD asociado.
          </p>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <AdminAnalyticsCharts
            responseCoverageData={responseCoverageChartData}
            responseCoverageTotalSchools={responseCoverage.directorCoverage.length}
            responseRate={responseRate}
            passengerCompositionData={passengerCompositionData}
            statusData={statusData}
            adminDecisionData={adminDecisionData}
            communeChartData={communeChartData}
            regionChartData={regionChartData}
            placeChartData={placeChartData}
            schoolChartData={schoolChartData}
            monthlyTripsChartData={monthlyTripsChartData}
            totalPassengers={totalPassengers}
            totalTrips={totalTrips}
            renderMode="responseCoverage"
          />

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Escuelas consideradas</p>
              <p className="mt-4 text-3xl font-semibold text-slate-950">{formatCompactNumber(responseCoverage.directorCoverage.length)}</p>
              <p className="mt-2 text-sm text-slate-500">{formatCompactNumber(responseCoverage.expectedDirectorCount)} director(es) esperados con RBD asociado.</p>
            </div>
            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Respondieron</p>
              <p className="mt-4 text-3xl font-semibold text-emerald-950">{formatCompactNumber(responseCoverage.respondedSchools.length)}</p>
              <p className="mt-2 text-sm text-emerald-800">{formatCompactNumber(responseCoverage.respondedDirectorCount)} director(es) vinculados a escuelas con carga.</p>
            </div>
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">No respondieron</p>
              <p className="mt-4 text-3xl font-semibold text-amber-950">{formatCompactNumber(responseCoverage.pendingSchools.length)}</p>
              <p className="mt-2 text-sm text-amber-800">{formatCompactNumber(responseCoverage.pendingDirectorCount)} director(es) siguen pendientes.</p>
            </div>
          </div>
        </div>
      </article>

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
            responseCoverageData={[]}
            responseCoverageTotalSchools={0}
            responseRate={0}
            passengerCompositionData={passengerCompositionData}
            statusData={statusData}
            adminDecisionData={adminDecisionData}
            communeChartData={communeChartData}
            regionChartData={regionChartData}
            placeChartData={placeChartData}
            schoolChartData={schoolChartData}
            monthlyTripsChartData={monthlyTripsChartData}
            totalPassengers={totalPassengers}
            totalTrips={totalTrips}
            renderMode="full"
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <AdminDecisionSchoolsTable
            title="Escuelas aprobadas"
            description="Escuelas con al menos una salida aceptada dentro del universo analitico visible."
            emptyMessage="No hay escuelas con salidas aceptadas bajo los filtros actuales."
            badgeClassName="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800"
            badgeLabel={`${acceptedSchoolRows.length} escuela(s)`}
            decisionType="aceptada"
            rows={acceptedSchoolRows}
          />
          <AdminDecisionSchoolsTable
            title="Escuelas rechazadas"
            description="Escuelas con al menos una salida rechazada para comunicar observaciones o resultado administrativo."
            emptyMessage="No hay escuelas con salidas rechazadas bajo los filtros actuales."
            badgeClassName="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-800"
            badgeLabel={`${rejectedSchoolRows.length} escuela(s)`}
            decisionType="rechazada"
            rows={rejectedSchoolRows}
          />
        </div>

        <AdminSchoolTripsExplorer trips={filteredTrips} topSchools={schoolSummaries} />
      </article>
    </section>
  );
}