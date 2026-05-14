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

  return <p className="portal-field-error">{message}</p>;
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
          className="portal-button portal-button--secondary portal-button--sm"
        >
          Agregar funcionario
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={field.id} className="portal-card-subtle sm:p-5">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(180px,0.8fr)_minmax(0,1fr)_auto]">
              <label className="portal-field">
                <span className="portal-field-label">Nombre completo</span>
                <input
                  type="text"
                  className="portal-input"
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

              <label className="portal-field">
                <span className="portal-field-label">RUT</span>
                <input
                  type="text"
                  placeholder="12345678-9"
                  className="portal-input"
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

              <label className="portal-field">
                <span className="portal-field-label">Cargo</span>
                <input
                  type="text"
                  className="portal-input"
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
                  className="portal-button portal-button--secondary h-[44px] px-4 text-sm hover:border-[var(--border-danger)] hover:text-[var(--fg-danger)]"
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