interface PublicRoutePageProps {
  params: {
    id: string;
  };
}

export default function PublicRoutePage({ params }: PublicRoutePageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="surface-card w-full max-w-4xl rounded-[32px] border border-white/70 px-8 py-12 sm:px-12">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Ruta publica</p>
        <h1 className="font-display mt-4 text-4xl font-semibold text-slate-950">
          Vista compartible preparada
        </h1>
        <p className="mt-6 text-base leading-7 text-slate-600">
          Este identificador publico <span className="font-semibold text-slate-900">{params.id}</span> quedara conectado a la vista <span className="font-semibold text-slate-900">ruta_publica</span> en las siguientes fases para mostrar mapa, resumen y distancia del recorrido.
        </p>
      </section>
    </main>
  );
}