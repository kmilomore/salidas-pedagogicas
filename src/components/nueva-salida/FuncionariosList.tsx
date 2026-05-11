import type { FieldErrors, UseFieldArrayAppend, UseFieldArrayRemove, UseFieldArrayReturn, UseFormRegister, UseFormSetValue } from "react-hook-form";

import { formatRut, isValidRut } from "@/lib/validations/salida";
import { normalizeSingleLineText } from "@/lib/input-normalization";
import type { TripDraftFormValues } from "@/types";

interface FuncionariosListProps {
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

  return <p className="mt-2 text-sm text-rose-600">{message}</p>;
}

export default function FuncionariosList({ register, setValue, errors, fields, append, remove }: FuncionariosListProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">Funcionarios responsables</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">Registra al menos un funcionario con nombre, RUT y cargo.</p>
        </div>
        <button
          type="button"
          onClick={() => append({ nombre_completo: "", rut: "", cargo: "" })}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slep hover:text-slep"
        >
          Agregar funcionario
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(180px,0.8fr)_minmax(0,1fr)_auto]">
              <label className="block">
                <span className="text-sm font-semibold text-slate-800">Nombre completo</span>
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
                  {...register(`funcionarios.${index}.nombre_completo` as const, {
                    setValueAs: (value) => normalizeSingleLineText(String(value ?? "")),
                    required: "Ingresa el nombre del funcionario.",
                    minLength: {
                      value: 5,
                      message: "El nombre del funcionario debe tener al menos 5 caracteres.",
                    },
                    onBlur: (event) => {
                      const normalized = normalizeSingleLineText(event.target.value);
                      setValue(`funcionarios.${index}.nombre_completo`, normalized, { shouldDirty: true, shouldValidate: true });
                      event.target.value = normalized;
                    },
                  })}
                />
                <FieldError message={errors.funcionarios?.[index]?.nombre_completo?.message} />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-800">RUT</span>
                <input
                  type="text"
                  placeholder="12345678-9"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
                  {...register(`funcionarios.${index}.rut` as const, {
                    setValueAs: (value) => formatRut(String(value ?? "")),
                    required: "Ingresa el RUT del funcionario.",
                    validate: (value) => isValidRut(value) || "Ingresa un RUT chileno valido.",
                    onBlur: (event) => {
                      const formatted = formatRut(event.target.value);
                      setValue(`funcionarios.${index}.rut`, formatted, { shouldDirty: true, shouldValidate: true });
                      event.target.value = formatted;
                    },
                  })}
                />
                <FieldError message={errors.funcionarios?.[index]?.rut?.message} />
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-800">Cargo</span>
                <input
                  type="text"
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
                  {...register(`funcionarios.${index}.cargo` as const, {
                    setValueAs: (value) => normalizeSingleLineText(String(value ?? "")),
                    required: "Ingresa el cargo del funcionario.",
                    minLength: {
                      value: 3,
                      message: "El cargo debe tener al menos 3 caracteres.",
                    },
                    onBlur: (event) => {
                      const normalized = normalizeSingleLineText(event.target.value);
                      setValue(`funcionarios.${index}.cargo`, normalized, { shouldDirty: true, shouldValidate: true });
                      event.target.value = normalized;
                    },
                  })}
                />
                <FieldError message={errors.funcionarios?.[index]?.cargo?.message} />
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="inline-flex h-[50px] items-center justify-center rounded-2xl border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:border-rose-300 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <FieldError message={errors.funcionarios?.message as string | undefined} />
    </div>
  );
}