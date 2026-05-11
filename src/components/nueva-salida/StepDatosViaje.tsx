import type { FieldErrors, UseFormRegister } from "react-hook-form";

import { normalizeMultilineText, normalizeSingleLineText } from "@/lib/input-normalization";
import { getPmeDimensionByValue } from "@/lib/pme/eid";
import type { PmeDimensionOption, TripDraftFormValues } from "@/types";

interface StepDatosViajeProps {
  register: UseFormRegister<TripDraftFormValues>;
  errors: FieldErrors<TripDraftFormValues>;
  minDate: string;
  pmeDimensions: PmeDimensionOption[];
  selectedDimension: string;
  onDimensionChange: (value: string) => void;
  onSubdimensionChange: (value: string) => void;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-600">{message}</p>;
}

export default function StepDatosViaje({
  register,
  errors,
  minDate,
  pmeDimensions,
  selectedDimension,
  onDimensionChange,
  onSubdimensionChange,
}: StepDatosViajeProps) {
  const availableSubdimensions = getPmeDimensionByValue(pmeDimensions, selectedDimension)?.subdimensions ?? [];

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Paso 1</p>
      <h3 className="font-display mt-3 text-2xl font-semibold text-slate-950">Datos del viaje</h3>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
        Registra la fecha, horarios, dimension PME, subdimension, nombre de la accion y objetivo pedagogico antes de seleccionar el destino. Las validaciones del paso impiden avanzar con campos incompletos.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Fecha</span>
          <input
            type="date"
            min={minDate}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
            {...register("fecha", {
              required: "Selecciona la fecha de la salida.",
              validate: (value) => value >= minDate || "La fecha no puede ser anterior a hoy.",
            })}
          />
          <FieldError message={errors.fecha?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Hora de salida</span>
          <input
            type="time"
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
            {...register("hora_salida", {
              setValueAs: (value) => normalizeSingleLineText(String(value ?? "")),
              required: "Ingresa la hora de salida.",
            })}
          />
          <FieldError message={errors.hora_salida?.message} />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-slate-800">Hora de regreso</span>
          <input
            type="time"
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
            {...register("hora_regreso", {
              setValueAs: (value) => normalizeSingleLineText(String(value ?? "")),
              validate: (value, formValues) => {
                if (!value || !formValues.hora_salida) {
                  return true;
                }

                return value > formValues.hora_salida || "La hora de regreso debe ser posterior a la salida.";
              },
            })}
          />
          <FieldError message={errors.hora_regreso?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Dimension del PME</span>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
            {...register("pme_dimension", {
              required: "Selecciona la dimension del PME.",
              onChange: (event) => onDimensionChange(event.target.value),
            })}
          >
            <option value="">Selecciona una dimension</option>
            {pmeDimensions.map((dimension) => (
              <option key={dimension.value} value={dimension.value}>
                {dimension.label}
              </option>
            ))}
          </select>
          <FieldError message={errors.pme_dimension?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Subdimension correspondiente</span>
          <select
            className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20 disabled:cursor-not-allowed disabled:bg-slate-100"
            disabled={!selectedDimension}
            {...register("pme_subdimension", {
              required: "Selecciona la subdimension del PME.",
              onChange: (event) => onSubdimensionChange(event.target.value),
            })}
          >
            <option value="">{selectedDimension ? "Selecciona una subdimension" : "Primero selecciona una dimension"}</option>
            {availableSubdimensions.map((subdimension) => (
              <option key={subdimension.value} value={subdimension.value}>
                {subdimension.label}
              </option>
            ))}
          </select>
          <FieldError message={errors.pme_subdimension?.message} />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-slate-800">Nombre de la accion</span>
          <input
            type="text"
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
            placeholder="Ejemplo: visita guiada al museo"
            {...register("actividad", {
              setValueAs: (value) => normalizeSingleLineText(String(value ?? "")),
              required: "Ingresa el nombre de la accion.",
              minLength: {
                value: 5,
                message: "El nombre de la accion debe tener al menos 5 caracteres.",
              },
            })}
          />
          <FieldError message={errors.actividad?.message} />
        </label>

        <label className="block md:col-span-2">
          <span className="text-sm font-semibold text-slate-800">Objetivo pedagogico</span>
          <textarea
            rows={5}
            className="mt-2 w-full rounded-[24px] border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
            placeholder="Describe el objetivo de aprendizaje de la salida."
            {...register("objetivo", {
              setValueAs: (value) => normalizeMultilineText(String(value ?? "")),
              required: "Describe el objetivo pedagogico.",
              minLength: {
                value: 10,
                message: "El objetivo debe tener al menos 10 caracteres.",
              },
            })}
          />
          <FieldError message={errors.objetivo?.message} />
        </label>
      </div>
    </section>
  );
}