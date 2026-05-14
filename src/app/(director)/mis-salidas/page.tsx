import { formatDistance, formatTripDate, getStatusClasses, getStatusLabel } from "@/lib/admin/trip-formatting";
import { getDirectorTrips } from "@/lib/admin/trips";

export default async function MyTripsPage() {
  const trips = await getDirectorTrips();
  const sentCount = trips.filter((trip) => trip.estado === "enviada").length;
  const draftCount = trips.filter((trip) => trip.estado === "borrador").length;

  return (
    <section className="grid gap-6 xl:grid-cols-12">
      <article className="portal-panel rounded-[28px] p-8 xl:col-span-12">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Historial</p>
            <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">Mis salidas</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              Revisa el historial operativo de las salidas asociadas a tu establecimiento, incluyendo fecha, destino, kilometraje y estado administrativo.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[420px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Registradas</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{trips.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Enviadas</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{sentCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Borradores</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{draftCount}</p>
            </div>
          </div>
        </div>
      </article>

      <article className="portal-panel rounded-[28px] p-8 xl:col-span-9">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Listado</p>
        <h3 className="font-display mt-4 text-2xl font-semibold text-slate-950">Registro de solicitudes</h3>
        <div className="portal-table mt-6">
          <div className="portal-table__head grid grid-cols-[0.8fr_1fr_0.9fr_0.8fr_0.8fr] gap-4 px-5 py-4">
            <span>Salida</span>
            <span>Destino</span>
            <span>Kilometraje</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>
          {trips.length ? (
            <div className="portal-table__body">
              {trips.map((trip) => (
                <div key={trip.id} className="grid grid-cols-[0.8fr_1fr_0.9fr_0.8fr_0.8fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
                  <div>
                    <p className="font-semibold text-slate-950">{formatTripDate(trip.fecha)}</p>
                    <p className="text-slate-500">{trip.actividad}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">{trip.lugar_nombre}</p>
                    <p className="text-slate-500">{trip.lugar_comuna} · {trip.lugar_region}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-950">{formatDistance(trip.distancia_km)}</p>
                    <p className="text-slate-500">{trip.duracion_minutos} min</p>
                  </div>
                  <div>
                    <span className={getStatusClasses(trip.estado)}>
                      {getStatusLabel(trip.estado)}
                    </span>
                  </div>
                  <div>
                    <a
                      href={`/api/trips/${trip.id}/pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className="portal-button portal-button--secondary portal-button--sm"
                    >
                      PDF
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="portal-table__empty">
              Todavia no existen salidas registradas para este director.
            </div>
          )}
        </div>
      </article>

      <aside className="rounded-[28px] bg-slate-950 p-8 text-white shadow-soft xl:col-span-3">
        <h3 className="font-display text-2xl font-semibold text-white">Vista de seguimiento</h3>
        <p className="mt-5 text-sm leading-6 text-slate-50">
          {trips.length
            ? `Tus salidas visibles hoy suman ${trips.length} registro(s), con ${sentCount} enviada(s) y ${draftCount} borrador(es).`
            : "Cuando existan solicitudes, esta columna destacara observaciones, tramos de mayor kilometraje y estados que requieran accion del establecimiento."}
        </p>
      </aside>
    </section>
  );
}