import type { FieldErrors, UseFieldArrayAppend, UseFieldArrayRemove, UseFieldArrayReturn, UseFormRegister, UseFormSetValue } from "react-hook-form";

import type { TripDraftFormValues } from "@/types";

import FuncionariosList from "./FuncionariosList";

interface StepParticipantesProps {
  register: UseFormRegister<TripDraftFormValues>;
  setValue: UseFormSetValue<TripDraftFormValues>;
  errors: FieldErrors<TripDraftFormValues>;
  fields: UseFieldArrayReturn<TripDraftFormValues, "funcionarios", "id">["fields"];
  append: UseFieldArrayAppend<TripDraftFormValues, "funcionarios">;
  remove: UseFieldArrayRemove;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="portal-field-error">{message}</p>;
}

export default function StepParticipantes({ register, setValue, errors, fields, append, remove }: StepParticipantesProps) {
  return (
    <section className="portal-section-card">
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Paso 3</p>
      <h3 className="font-display mt-3 text-2xl font-semibold text-slate-950">Participantes y envio</h3>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
        Completa los participantes de la salida antes de guardar el registro definitivo. El sistema exige al menos un funcionario y una cantidad valida de estudiantes.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <label className="portal-field">
          <span className="portal-field-label">Cantidad de estudiantes</span>
          <input
            type="number"
            min={1}
            className="portal-input"
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

        <label className="portal-field">
          <span className="portal-field-label">Cantidad de apoderados</span>
          <input
            type="number"
            min={0}
            className="portal-input"
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
        <FuncionariosList register={register} setValue={setValue} errors={errors} fields={fields} append={append} remove={remove} />
      </div>
    </section>
  );
}