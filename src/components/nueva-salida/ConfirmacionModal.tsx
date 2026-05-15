"use client";

import { formatRut } from "@/lib/validations/salida";
import type { DirectorSchoolProfile, TripDraftFormValues } from "@/types";

interface ConfirmacionModalProps {
  values: TripDraftFormValues;
  schoolProfile: DirectorSchoolProfile;
  isBusy: boolean;
  saveError: string | null;
  onConfirm: () => void;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm leading-6 text-slate-900">{value || "—"}</p>
    </div>
  );
}

export default function ConfirmacionModal({ values, schoolProfile, isBusy, saveError, onConfirm, onClose }: ConfirmacionModalProps) {
  const totalPasajeros =
    Number(values.cantidad_estudiantes) +
    Number(values.cantidad_apoderados) +
    (values.funcionarios?.length ?? 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-[20px] border border-[var(--border-1)] bg-white shadow-[var(--shadow-xl)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Confirmación de registro</p>
            <h3 className="font-display mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">
              Revisa la salida antes de confirmar
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Cierra este panel para realizar modificaciones.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-300 text-lg font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-950 disabled:opacity-40"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-6 sm:p-8">

            {/* Establecimiento */}
            <section className="portal-card-subtle px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Establecimiento</p>
              <p className="mt-2 text-sm font-semibold text-slate-950">{schoolProfile.nombre}</p>
              <p className="text-sm text-slate-500">{schoolProfile.comuna} · RBD {schoolProfile.rbd}</p>
            </section>

            {/* Datos del viaje */}
            <section className="portal-subsection-card">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Datos del viaje</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Fecha" value={values.fecha} />
                <Field label="Hora salida" value={values.hora_salida ? values.hora_salida.slice(0, 5) : ""} />
                <Field label="Hora regreso" value={values.hora_regreso ? values.hora_regreso.slice(0, 5) : "No informada"} />
              </div>
            </section>

            {/* PME */}
            <section className="portal-subsection-card">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">PME y acción pedagógica</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Dimensión PME" value={values.pme_dimension_label} />
                <Field label="Subdimensión PME" value={values.pme_subdimension_label} />
                <div className="sm:col-span-2">
                  <Field label="Nombre de la acción" value={values.actividad} />
                </div>
                <div className="sm:col-span-2">
                  <Field label="Objetivo pedagógico" value={values.objetivo} />
                </div>
              </div>
            </section>

            {/* Destino y ruta */}
            <section className="portal-subsection-card">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Destino y ruta</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Destino" value={values.lugar_nombre} />
                </div>
                <Field label="Distancia ida" value={`${Number(values.distancia_ida_km || 0).toFixed(1)} km`} />
                <Field label="Distancia vuelta" value={`${Number(values.distancia_vuelta_km || 0).toFixed(1)} km`} />
                <Field label="Distancia total" value={`${Number(values.distancia_km || 0).toFixed(1)} km`} />
                <div className="sm:col-span-2 sm:[&:not(:last-child)]:col-span-1">
                  <Field label="Resumen vial" value={values.ruta_resumen} />
                </div>
              </div>
            </section>

            {/* Participantes */}
            <section className="portal-subsection-card">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Participantes</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="portal-card-subtle">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Estudiantes</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{String(values.cantidad_estudiantes ?? 0)}</p>
                </div>
                <div className="portal-card-subtle">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Apoderados</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{String(values.cantidad_apoderados ?? 0)}</p>
                </div>
                <div className="portal-card-subtle">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Funcionarios</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">{String(values.funcionarios?.length ?? 0)}</p>
                </div>
                <div className="portal-card-subtle border-slep/20 bg-slep/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slep">Total pasajeros</p>
                  <p className="mt-2 text-2xl font-semibold text-slep">{String(totalPasajeros)}</p>
                </div>
              </div>

              {(values.funcionarios?.length ?? 0) > 0 ? (
                <div className="portal-table mt-4">
                  <div className="portal-table__head grid grid-cols-[1.1fr_0.8fr_0.9fr] gap-4 px-4 py-3 text-[12px] tracking-[0.14em]">
                    <span>Funcionario</span>
                    <span>RUT</span>
                    <span>Cargo</span>
                  </div>
                  <div className="portal-table__body">
                    {values.funcionarios.map((f, i) => (
                      <div key={i} className="grid grid-cols-[1.1fr_0.8fr_0.9fr] gap-4 px-4 py-3 text-sm text-slate-700">
                        <span className="font-medium text-slate-950">{f.nombre_completo}</span>
                        <span>{formatRut(f.rut)}</span>
                        <span>{f.cargo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-4">
                <Field
                  label="Requerimientos adicionales / observaciones"
                  value={values.requerimientos_adicionales || "Sin observaciones adicionales"}
                />
              </div>
            </section>

            {/* Aviso */}
            <div className="portal-status-card border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">Importante</p>
              <p className="mt-2 text-sm leading-6 text-amber-900">
                Al confirmar, el registro quedará guardado en la base de datos y se enviará un comprobante por correo al director.
                El registro de esta solicitud{" "}
                <strong>no autoriza ni confirma</strong> la realización de la salida pedagógica.
              </p>
            </div>

            {saveError ? (
              <div className="portal-status-card status-card-danger text-sm text-red-900">
                {saveError}
              </div>
            ) : null}

          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="portal-button portal-button--secondary"
          >
            Modificar datos
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className="portal-button portal-button--primary px-6 disabled:opacity-60"
          >
            {isBusy ? "Guardando..." : "Confirmar y guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
