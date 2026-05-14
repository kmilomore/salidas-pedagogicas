export default function DashboardPage() {
  return (
    <section className="grid gap-6 xl:grid-cols-12">
      <article className="portal-panel rounded-[28px] p-8 xl:col-span-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Resumen</p>
        <div className="mt-4 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-slate-950 sm:text-4xl">Dashboard</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Visualiza el estado general de las salidas pedagogicas, el avance operativo y los recorridos que se vayan registrando para tu establecimiento.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Solicitudes</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">0</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">En revision</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">0</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Kilometraje</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">0 km</p>
            </div>
          </div>
        </div>
      </article>

      <aside className="rounded-[28px] bg-slate-950 p-8 text-white shadow-soft xl:col-span-4">
        <h3 className="font-display text-2xl font-semibold text-white">Actividad reciente</h3>
        <p className="mt-5 text-sm leading-6 text-slate-50">
          Las proximas solicitudes registradas por este director apareceran aqui con su estado, trazabilidad y puntos criticos de aprobacion.
        </p>
      </aside>

      <div className="grid gap-6 md:grid-cols-2 xl:col-span-12 xl:grid-cols-3">
        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Proxima accion</p>
          <h3 className="font-display mt-4 text-2xl font-semibold text-slate-950">Registrar una nueva salida</h3>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Usa el formulario para definir destino, circuito y kilometraje referencial antes de enviar la solicitud.
          </p>
        </article>

        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Seguimiento</p>
          <h3 className="font-display mt-4 text-2xl font-semibold text-slate-950">Estados y trazabilidad</h3>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Aqui podras identificar solicitudes pendientes, observadas o aprobadas a medida que exista historial real.
          </p>
        </article>

        <article className="portal-panel rounded-[28px] p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Cobertura</p>
          <h3 className="font-display mt-4 text-2xl font-semibold text-slate-950">Rutas y destinos</h3>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            El panel consolidara comunas, destinos frecuentes y kilometraje acumulado cuando existan recorridos registrados.
          </p>
        </article>
      </div>
    </section>
  );
}