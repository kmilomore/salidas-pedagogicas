import PortalLogo from "@/components/branding/PortalLogo";

type PortalSectionLoaderVariant = "history" | "wizard" | "admin";

interface PortalSectionLoaderProps {
  sectionLabel: string;
  title: string;
  description: string;
  statusText: string;
  variant: PortalSectionLoaderVariant;
}

function SkeletonLine({ width, className }: { width: string; className?: string }) {
  return <div className={["portal-skeleton-block rounded-full", className].filter(Boolean).join(" ")} style={{ width }} />;
}

function MetricCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <SkeletonLine width="45%" className="h-3" />
      <SkeletonLine width="30%" className="mt-4 h-8" />
      <SkeletonLine width="78%" className="mt-3 h-3" />
    </div>
  );
}

function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="portal-table mt-6">
      <div className="portal-table__head grid grid-cols-5 gap-4 px-5 py-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonLine key={index} width="70%" className="h-3" />
        ))}
      </div>
      <div className="portal-table__body">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-5 gap-4 px-5 py-4">
            {Array.from({ length: 5 }).map((__, columnIndex) => (
              <SkeletonLine
                key={columnIndex}
                width={columnIndex === 0 ? "82%" : columnIndex === 1 ? "90%" : columnIndex === 4 ? "64%" : "72%"}
                className="h-4"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryLayout({ sectionLabel, title, description, statusText }: Omit<PortalSectionLoaderProps, "variant">) {
  return (
    <section className="grid gap-6 xl:grid-cols-12" aria-hidden="true">
      <article className="portal-panel rounded-[28px] p-8 xl:col-span-12">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">{sectionLabel}</p>
            <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">{title}</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
            <MetricCard />
            <MetricCard />
            <MetricCard />
          </div>
        </div>
      </article>

      <article className="portal-panel rounded-[28px] p-8 xl:col-span-9">
        <SkeletonLine width="18%" className="h-3" />
        <SkeletonLine width="32%" className="mt-4 h-8 rounded-2xl" />
        <TableSkeleton rows={5} />
      </article>

      <aside className="rounded-[28px] bg-slate-950 p-8 text-white shadow-soft xl:col-span-3">
        <h3 className="font-display text-2xl font-semibold text-white">Vista de seguimiento</h3>
        <p className="mt-5 text-sm leading-6 text-slate-50">{statusText}</p>
        <div className="mt-6 space-y-3">
          <div className="portal-skeleton-block portal-skeleton-block--dark h-4 w-full rounded-full" />
          <div className="portal-skeleton-block portal-skeleton-block--dark h-4 w-4/5 rounded-full" />
          <div className="portal-skeleton-block portal-skeleton-block--dark h-4 w-2/3 rounded-full" />
        </div>
      </aside>
    </section>
  );
}

function AdminLayout({ sectionLabel, title, description, statusText }: Omit<PortalSectionLoaderProps, "variant">) {
  return (
    <section className="grid gap-6 xl:grid-cols-12" aria-hidden="true">
      <article className="portal-panel rounded-[28px] p-8 xl:col-span-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">{sectionLabel}</p>
            <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">{title}</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="portal-skeleton-block h-12 w-32 rounded-2xl" />
            <div className="portal-skeleton-block h-12 w-36 rounded-2xl" />
            <div className="portal-skeleton-block h-12 w-44 rounded-2xl" />
          </div>
        </div>
      </article>

      <aside className="rounded-[28px] bg-slep-dark p-8 text-white shadow-soft xl:col-span-4">
        <h3 className="font-display text-2xl font-semibold text-white">Estado operacional</h3>
        <p className="mt-5 text-sm leading-6 text-slate-50">{statusText}</p>
        <div className="mt-6 space-y-3">
          <div className="portal-skeleton-block portal-skeleton-block--dark h-4 w-full rounded-full" />
          <div className="portal-skeleton-block portal-skeleton-block--dark h-4 w-5/6 rounded-full" />
          <div className="portal-skeleton-block portal-skeleton-block--dark h-4 w-3/4 rounded-full" />
        </div>
      </aside>

      <div className="grid gap-6 md:grid-cols-2 xl:col-span-12 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <article key={index} className="portal-panel rounded-[28px] p-8">
            <SkeletonLine width="40%" className="h-3" />
            <SkeletonLine width="28%" className="mt-4 h-8" />
            <SkeletonLine width="82%" className="mt-3 h-3" />
          </article>
        ))}
      </div>

      <article className="portal-panel rounded-[28px] p-8 xl:col-span-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <SkeletonLine width="20%" className="h-3" />
            <SkeletonLine width="34%" className="mt-4 h-8 rounded-2xl" />
          </div>
          <SkeletonLine width="24%" className="h-4" />
        </div>

        <div className="mt-6 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,1fr)_minmax(180px,0.8fr)_auto_auto]">
          <div>
            <SkeletonLine width="24%" className="h-3" />
            <div className="portal-skeleton-block mt-2 h-12 w-full rounded-2xl" />
          </div>
          <div>
            <SkeletonLine width="34%" className="h-3" />
            <div className="portal-skeleton-block mt-2 h-12 w-full rounded-2xl" />
          </div>
          <div>
            <SkeletonLine width="28%" className="h-3" />
            <div className="portal-skeleton-block mt-2 h-12 w-full rounded-2xl" />
          </div>
          <div className="portal-skeleton-block h-12 self-end rounded-2xl lg:w-28" />
          <div className="portal-skeleton-block h-12 self-end rounded-2xl lg:w-28" />
        </div>

        <TableSkeleton rows={6} />
      </article>
    </section>
  );
}

function WizardLayout({ sectionLabel, title, description, statusText }: Omit<PortalSectionLoaderProps, "variant">) {
  return (
    <section className="grid gap-6 xl:grid-cols-12" aria-hidden="true">
      <article className="portal-panel rounded-[28px] p-8 xl:col-span-12">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">{sectionLabel}</p>
            <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">{title}</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{description}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="portal-skeleton-block h-12 w-40 rounded-2xl" />
            <div className="portal-skeleton-block h-12 w-32 rounded-2xl" />
          </div>
        </div>
      </article>

      <article className="portal-panel rounded-[28px] p-8 xl:col-span-8">
        <div className="flex flex-wrap items-center gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="portal-skeleton-block h-10 w-10 rounded-full" />
              <SkeletonLine width="96px" className="h-4" />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 md:col-span-2">
            <SkeletonLine width="18%" className="h-3" />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="portal-skeleton-block h-12 rounded-2xl" />
              <div className="portal-skeleton-block h-12 rounded-2xl" />
              <div className="portal-skeleton-block h-12 rounded-2xl" />
              <div className="portal-skeleton-block h-12 rounded-2xl" />
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 md:col-span-2">
            <SkeletonLine width="22%" className="h-3" />
            <div className="portal-skeleton-block mt-4 h-[320px] rounded-[24px]" />
          </div>
        </div>
      </article>

      <aside className="rounded-[28px] bg-slate-950 p-8 text-white shadow-soft xl:col-span-4">
        <h3 className="font-display text-2xl font-semibold text-white">Preparando formulario</h3>
        <p className="mt-5 text-sm leading-6 text-slate-50">{statusText}</p>
        <div className="mt-6 space-y-3">
          <div className="portal-skeleton-block portal-skeleton-block--dark h-4 w-full rounded-full" />
          <div className="portal-skeleton-block portal-skeleton-block--dark h-4 w-5/6 rounded-full" />
          <div className="portal-skeleton-block portal-skeleton-block--dark h-4 w-2/3 rounded-full" />
        </div>
      </aside>
    </section>
  );
}

export default function PortalSectionLoader(props: PortalSectionLoaderProps) {
  const { sectionLabel, title, description, statusText, variant } = props;

  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <section className="portal-loader-card overflow-hidden">
        <div className="portal-loader-card__brandbar" aria-hidden="true" />
        <div className="portal-loader-card__content">
          <PortalLogo size="md" priority />
          <div className="portal-loader-copy">
            <p className="portal-kicker">Cargando seccion</p>
            <h1 className="font-display text-3xl font-semibold text-slate-950 sm:text-4xl">{title}</h1>
            <p className="max-w-3xl text-base leading-7 text-slate-600">{description}</p>
          </div>
          <div className="portal-loader-progress" aria-hidden="true">
            <div className="portal-loader-progress__bar" />
          </div>
          <div className="portal-loader-status">
            <span className="portal-loader-dot" aria-hidden="true" />
            <span className="portal-loader-status__text">{statusText}</span>
          </div>
        </div>
      </section>

      {variant === "history" ? <HistoryLayout sectionLabel={sectionLabel} title={title} description={description} statusText={statusText} /> : null}
      {variant === "admin" ? <AdminLayout sectionLabel={sectionLabel} title={title} description={description} statusText={statusText} /> : null}
      {variant === "wizard" ? <WizardLayout sectionLabel={sectionLabel} title={title} description={description} statusText={statusText} /> : null}
    </div>
  );
}
