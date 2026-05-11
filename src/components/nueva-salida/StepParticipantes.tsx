import type { FieldErrors, UseFieldArrayAppend, UseFieldArrayRemove, UseFieldArrayReturn, UseFormRegister } from "react-hook-form";

import type { TripDraftFormValues } from "@/types";

import FuncionariosList from "./FuncionariosList";

interface StepParticipantesProps {
  register: UseFormRegister<TripDraftFormValues>;
  errors: FieldErrors<TripDraftFormValues>;
  fields: UseFieldArrayReturn<TripDraftFormValues, "funcionarios", "id">["fields"];
  append: UseFieldArrayAppend<TripDraftFormValues, "funcionarios">;
  remove: UseFieldArrayRemove;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-600">{message}</p>;
}

export default function StepParticipantes({ register, errors, fields, append, remove }: StepParticipantesProps) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Paso 3</p>
      <h3 className="font-display mt-3 text-2xl font-semibold text-slate-950">Participantes y envio</h3>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
        Completa los participantes de la salida antes de guardar el registro definitivo. El sistema exige al menos un funcionario y una cantidad valida de estudiantes.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Cantidad de estudiantes</span>
          <input
            type="number"
            min={1}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
            {...register("cantidad_estudiantes", {
              valueAsNumber: true,
              required: "Ingresa la cantidad de estudiantes.",
              min: {
                value: 1,
                message: "Debes registrar al menos 1 estudiante.",
              },
            })}
          />
          <FieldError message={errors.cantidad_estudiantes?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-slate-800">Cantidad de apoderados</span>
          <input
            type="number"
            min={0}
            className="mt-2 w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
            {...register("cantidad_apoderados", {
              valueAsNumber: true,
              min: {
                value: 0,
                message: "La cantidad de apoderados no puede ser negativa.",
              },
            })}
          />
          <FieldError message={errors.cantidad_apoderados?.message} />
        </label>
      </div>

      <div className="mt-8">
        <FuncionariosList register={register} errors={errors} fields={fields} append={append} remove={remove} />
      </div>
    </section>
  );
}