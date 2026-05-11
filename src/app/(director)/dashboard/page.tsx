export default function DashboardPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <article className="rounded-[28px] bg-white p-8 shadow-soft">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Fase 1</p>
        <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950">Dashboard inicial listo</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Este espacio queda preparado para mostrar resumen de salidas, accesos recientes y acciones rapidas del director en la siguiente fase.
        </p>
      </article>

      <aside className="rounded-[28px] bg-slate-950 p-8 text-white shadow-soft">
        <h3 className="font-display text-2xl font-semibold">Estado del entorno</h3>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
          <li>Supabase SSR configurado para sesiones en App Router.</li>
          <li>Middleware con whitelist y redireccion por rol.</li>
          <li>Rutas base del flujo director ya creadas.</li>
        </ul>
      </aside>
    </section>
  );
}