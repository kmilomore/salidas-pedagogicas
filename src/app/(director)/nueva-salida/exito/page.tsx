import Link from "next/link";

interface SuccessPageProps {
  searchParams?: {
    id?: string;
  };
}

export default function NuevaSalidaExitoPage({ searchParams }: SuccessPageProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-soft sm:p-10">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl font-semibold text-emerald-700">
          ✓
        </div>
        <p className="mt-6 text-sm font-medium uppercase tracking-[0.24em] text-slep">Salida registrada</p>
        <h1 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">La salida pedagogica fue guardada correctamente</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          El registro ya quedo persistido en la base de datos con todos los datos operativos disponibles del formulario.
        </p>
        {searchParams?.id ? (
          <p className="mt-4 text-sm text-slate-500">Identificador del registro: {searchParams.id}</p>
        ) : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/mis-salidas"
            className="inline-flex items-center justify-center rounded-2xl bg-slep px-5 py-3 text-sm font-semibold text-white transition hover:bg-slep-dark"
          >
            Ver mis salidas
          </Link>
          <Link
            href="/nueva-salida"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slep hover:text-slep"
          >
            Registrar otra salida
          </Link>
        </div>
      </div>
    </section>
  );
}