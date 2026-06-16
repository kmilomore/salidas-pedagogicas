import Link from "next/link";

interface SuccessPageProps {
  searchParams?: {
    id?: string;
  };
}

export default function NuevaSalidaExitoPage({ searchParams }: SuccessPageProps) {
  const id = searchParams?.id?.trim() ?? null;

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-soft sm:p-10">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-3xl font-semibold text-emerald-700">
          ✓
        </div>
        <p className="mt-6 text-sm font-medium uppercase tracking-[0.24em] text-slep">Postulación registrada</p>
        <h1 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
          La salida pedagógica fue registrada correctamente
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          El registro quedó persistido en la base de datos. Se enviará un comprobante por correo al director con copia a la coordinación SLEP.
        </p>

        <div className="mx-auto mt-6 max-w-xl rounded-[20px] border border-amber-200 bg-amber-50 px-6 py-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">
            Importante — esto es una postulación, no una confirmación
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            El registro de esta solicitud <strong>no autoriza ni confirma</strong> la realización de la salida pedagógica.
            La postulación será evaluada en términos de factibilidad presupuestaria.
            Una vez que se cuente con claridad operativa, nos comunicaremos con usted.
          </p>
        </div>

        {id ? (
          <p className="mt-5 text-xs text-slate-400">ID de registro: {id}</p>
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
