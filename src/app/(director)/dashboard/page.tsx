export default function DashboardPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <article className="rounded-[28px] bg-white p-8 shadow-soft">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Resumen</p>
        <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950">Dashboard</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Aun no hay salidas registradas para mostrar en este panel.
        </p>
      </article>

      <aside className="rounded-[28px] bg-slate-950 p-8 text-white shadow-soft">
        <h3 className="font-display text-2xl font-semibold">Actividad reciente</h3>
        <p className="mt-5 text-sm leading-6 text-slate-300">
          Las proximas solicitudes registradas por este director apareceran aqui con su estado y trazabilidad.
        </p>
      </aside>
    </section>
  );
}