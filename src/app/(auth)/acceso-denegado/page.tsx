import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="surface-card w-full max-w-2xl rounded-[32px] border border-white/70 px-8 py-12 sm:px-12">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Acceso denegado</p>
        <h1 className="font-display mt-4 text-4xl font-semibold text-slate-950">
          Tu cuenta no esta autorizada para ingresar.
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Verifica que el correo usado en Google coincida con uno habilitado en la whitelist institucional. Si necesitas ayuda, solicita la habilitacion al equipo administrador de SLEP Colchagua.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl bg-slep px-5 py-3.5 font-semibold text-white transition hover:bg-slep-dark"
          >
            Volver al login
          </Link>
          <Link
            href="mailto:soporte@slepcolchagua.cl"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3.5 font-semibold text-slate-700 transition hover:border-slep hover:text-slep"
          >
            Contactar soporte
          </Link>
        </div>
      </section>
    </main>
  );
}