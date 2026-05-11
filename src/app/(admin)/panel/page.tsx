import Link from "next/link";

import AdminTripsTable from "@/components/admin/AdminTripsTable";
import { formatDistance } from "@/lib/admin/trip-formatting";
import { getAdminTrips } from "@/lib/admin/trips";

export default async function AdminPanelPage() {
  const trips = await getAdminTrips(20);
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
          <div className="mt-2 flex flex-wrap gap-3">
            <a
              href="/api/admin/export-csv"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slep hover:text-slep"
            >
              Exportar CSV
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

        <AdminTripsTable trips={trips} />
      </article>
    </section>
  );
}