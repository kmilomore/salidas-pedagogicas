import PortalLogo from "@/components/branding/PortalLogo";

export default function Loading() {
  return (
    <main className="portal-loader-shell" aria-busy="true" aria-live="polite">
      <section className="portal-loader-card">
        <div className="portal-loader-card__brandbar" aria-hidden="true" />
        <div className="portal-loader-card__content">
          <PortalLogo size="lg" priority />
          <div className="portal-loader-copy">
            <p className="portal-kicker">Cargando portal</p>
            <h1 className="font-display text-3xl font-semibold text-slate-950 sm:text-4xl">
              Preparando la experiencia institucional
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Estamos cargando datos, permisos y superficies operativas para continuar con el flujo del portal.
            </p>
          </div>

          <div className="portal-loader-progress" aria-hidden="true">
            <div className="portal-loader-progress__bar" />
          </div>

          <div className="portal-loader-status" aria-hidden="true">
            <span className="portal-loader-dot" />
            <span className="portal-loader-status__text">Conectando servicios y vistas seguras</span>
          </div>
        </div>
      </section>
    </main>
  );
}
