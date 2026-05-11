export default function AdminPanelPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <article className="rounded-[28px] bg-white p-8 shadow-soft lg:col-span-2">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Fase 1</p>
        <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950">Panel administrativo base</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          El modulo administrativo queda reservado para revision de whitelist, supervision de salidas y trazabilidad institucional en las siguientes iteraciones.
        </p>
      </article>

      <aside className="rounded-[28px] bg-slep-dark p-8 text-white shadow-soft">
        <h3 className="font-display text-2xl font-semibold">Checklist</h3>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-100/85">
          <li>Login con Google conectado a Supabase Auth.</li>
          <li>Acceso por roles validado en middleware.</li>
          <li>Ruta publica reservada para enlaces compartibles.</li>
        </ul>
      </aside>
    </section>
  );
}