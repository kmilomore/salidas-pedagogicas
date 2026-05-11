export default function MyTripsPage() {
  return (
    <section className="grid gap-6 xl:grid-cols-12">
      <article className="portal-panel rounded-[28px] p-8 xl:col-span-12">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Historial</p>
            <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">Mis salidas</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Revisa el historial operativo de las salidas asociadas a tu establecimiento, incluyendo fecha, destino, kilometraje y estado administrativo.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Registradas</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">0</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Aprobadas</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">0</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Pendientes</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">0</p>
            </div>
          </div>
        </div>
      </article>

      <article className="portal-panel rounded-[28px] p-8 xl:col-span-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Listado</p>
        <h3 className="font-display mt-4 text-2xl font-semibold text-slate-950">Registro de solicitudes</h3>
        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <div className="grid grid-cols-[1.1fr_1fr_0.8fr_0.8fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Salida</span>
            <span>Destino</span>
            <span>Kilometraje</span>
            <span>Estado</span>
          </div>
          <div className="px-5 py-10 text-sm leading-6 text-slate-600">
            Todavia no existen salidas registradas para este director.
          </div>
        </div>
      </article>

      <aside className="rounded-[28px] bg-slate-950 p-8 text-white shadow-soft xl:col-span-4">
        <h3 className="font-display text-2xl font-semibold">Vista de seguimiento</h3>
        <p className="mt-5 text-sm leading-6 text-slate-300">
          Cuando existan solicitudes, esta columna destacara observaciones, tramos de mayor kilometraje y estados que requieran accion del establecimiento.
        </p>
      </aside>
    </section>
  );
}