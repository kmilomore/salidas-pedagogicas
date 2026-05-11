import Link from "next/link";

export default function AdminPanelPage() {
  return (
    <section className="grid gap-6 xl:grid-cols-12">
      <article className="portal-panel rounded-[28px] p-8 xl:col-span-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Administracion</p>
            <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">Panel administrativo</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Consolida el seguimiento administrativo de las salidas, visibilidad transversal por establecimiento y acceso directo al formulario operativo.
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
          Cuando existan salidas registradas y procesos administrativos habilitados, esta vista mostrara carga operativa, alertas y observaciones por establecimiento.
        </p>
      </aside>

      <div className="grid gap-6 md:grid-cols-2 xl:col-span-12 xl:grid-cols-4">
        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Establecimientos</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">0</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Con actividad visible en el panel administrativo.</p>
        </article>
        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Solicitudes</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">0</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Total de salidas registradas en la vista transversal.</p>
        </article>
        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">En revision</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">0</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Solicitudes pendientes de observacion o resolucion.</p>
        </article>
        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Cobertura</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">0 km</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">Kilometraje acumulado visible cuando existan datos reales.</p>
        </article>
      </div>
    </section>
  );
}