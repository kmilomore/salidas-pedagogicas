export default function AdminPanelPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <article className="rounded-[28px] bg-white p-8 shadow-soft lg:col-span-2">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Administracion</p>
        <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950">Panel administrativo</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          No hay registros administrativos disponibles para mostrar en este momento.
        </p>
      </article>

      <aside className="rounded-[28px] bg-slep-dark p-8 text-white shadow-soft">
        <h3 className="font-display text-2xl font-semibold">Estado operacional</h3>
        <p className="mt-5 text-sm leading-6 text-slate-100/85">
          Cuando existan salidas registradas y procesos administrativos habilitados, esta vista mostrara los datos reales asociados al usuario autenticado.
        </p>
      </aside>
    </section>
  );
}