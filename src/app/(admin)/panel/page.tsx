import Link from "next/link";
import { redirect } from "next/navigation";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

interface AdminTripRow {
  id: string;
  rbd: string;
  fecha: string;
  actividad: string;
  lugar_nombre: string;
  distancia_km: number;
  estado: "borrador" | "enviada";
  created_at: string;
}

interface SchoolNameRow {
  RBD: string | null;
  "NOMBRE ESTABLECIMIENTO": string | null;
}

function formatTripDate(value: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDistance(value: number) {
  return `${Number(value ?? 0).toFixed(1)} km`;
}

function getStatusLabel(status: AdminTripRow["estado"]) {
  return status === "enviada" ? "Enviada" : "Borrador";
}

function getStatusClasses(status: AdminTripRow["estado"]) {
  return status === "enviada"
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : "border-amber-200 bg-amber-50 text-amber-900";
}

async function getAdminTrips() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const { data: whitelistUser, error: whitelistError } = await supabase
    .from("whitelist_usuarios")
    .select("rol")
    .eq("email", user.email.trim().toLowerCase())
    .eq("activo", true)
    .maybeSingle<{ rol: UserRole }>();

  if (whitelistError || !whitelistUser || whitelistUser.rol !== "admin") {
    redirect("/acceso-denegado");
  }

  const { data: trips, error } = await supabase
    .from("salidas_pedagogicas")
    .select("id, rbd, fecha, actividad, lugar_nombre, distancia_km, estado, created_at")
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<AdminTripRow[]>();

  if (error || !trips) {
    return [] as AdminTripRow[];
  }

  return trips;
}

async function getSchoolNamesByRbd(rbds: string[]) {
  if (!rbds.length) {
    return new Map<string, string>();
  }

  const adminSupabase = createAdminClient();
  const { data } = await adminSupabase
    .from("BASE DE DATOS ESCUELAS SLEP")
    .select('RBD,"NOMBRE ESTABLECIMIENTO"')
    .in("RBD", rbds)
    .returns<SchoolNameRow[]>();

  return new Map(
    (data ?? [])
      .filter((row) => row.RBD && row["NOMBRE ESTABLECIMIENTO"])
      .map((row) => [row.RBD as string, row["NOMBRE ESTABLECIMIENTO"] as string]),
  );
}

export default async function AdminPanelPage() {
  const trips = await getAdminTrips();
  const schoolNames = await getSchoolNamesByRbd(Array.from(new Set(trips.map((trip) => trip.rbd))));
  const schoolCount = new Set(trips.map((trip) => trip.rbd)).size;
  const sentCount = trips.filter((trip) => trip.estado === "enviada").length;
  const draftCount = trips.filter((trip) => trip.estado === "borrador").length;
  const totalDistance = trips.reduce((sum, trip) => sum + Number(trip.distancia_km ?? 0), 0);

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
          <div className="mt-2">
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
        <h3 className="font-display text-2xl font-semibold">Estado operacional</h3>
        <p className="mt-5 text-sm leading-6 text-slate-100/85">
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
          <p className="text-sm leading-6 text-slate-500">Se muestran las 20 cargas mas recientes.</p>
        </div>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr_0.7fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Establecimiento</span>
            <span>Fecha</span>
            <span>Actividad / destino</span>
            <span>Kilometraje</span>
            <span>Estado</span>
          </div>

          {trips.length ? (
            <div className="divide-y divide-slate-200 bg-white">
              {trips.map((trip) => (
                <div key={trip.id} className="grid grid-cols-[1.2fr_0.8fr_1fr_0.8fr_0.7fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
                  <div>
                    <p className="font-semibold text-slate-950">{schoolNames.get(trip.rbd) ?? `RBD ${trip.rbd}`}</p>
                    <p className="text-slate-500">RBD {trip.rbd}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">{formatTripDate(trip.fecha)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">{trip.actividad}</p>
                    <p className="text-slate-500">{trip.lugar_nombre}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">{formatDistance(Number(trip.distancia_km ?? 0))}</p>
                  </div>
                  <div>
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(trip.estado)}`}>
                      {getStatusLabel(trip.estado)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-10 text-sm leading-6 text-slate-600">Aun no existen salidas registradas visibles para administracion.</div>
          )}
        </div>
      </article>
    </section>
  );
}