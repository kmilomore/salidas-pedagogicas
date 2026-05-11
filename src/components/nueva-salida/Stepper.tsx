interface StepperProps {
  steps: Array<{
    id: number;
    title: string;
    description: string;
  }>;
  currentStep: number;
  canGoBack: boolean;
  canGoForward: boolean;
  isFinalStep: boolean;
  isBusy?: boolean;
  busyLabel?: string;
  helperText?: string;
  nextLabel?: string;
  onPrevious: () => void;
  onNext: () => void;
}

export default function Stepper({
  steps,
  currentStep,
  canGoBack,
  canGoForward,
  isFinalStep,
  isBusy = false,
  busyLabel = "Procesando paso actual...",
  helperText,
  nextLabel,
  onPrevious,
  onNext,
}: StepperProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;

          return (
            <div
              key={step.id}
              className={[
                "rounded-[24px] border p-4 transition",
                isActive ? "border-slep bg-white shadow-sm" : "border-slate-200 bg-white/70",
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isActive
                        ? "bg-slep text-white"
                        : "bg-slate-200 text-slate-600",
                  ].join(" ")}
                >
                  {isCompleted ? "✓" : `0${step.id}`}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{step.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{step.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isBusy ? (
        <div className="mt-5 flex items-center gap-3 rounded-[20px] border border-slep/15 bg-slep/5 px-4 py-3 text-sm text-slate-700">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slep/20 border-t-slep" />
          <p>{busyLabel}</p>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          {helperText ?? (isFinalStep ? "Revisa el resumen y ejecuta la accion final del formulario." : "Completa los datos obligatorios del paso actual para continuar.")}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canGoBack || isBusy}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slep hover:text-slep disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canGoForward || isBusy}
            className="inline-flex items-center justify-center rounded-2xl bg-slep px-5 py-3 text-sm font-semibold text-white transition hover:bg-slep-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? "Procesando..." : nextLabel ?? (isFinalStep ? "Finalizar" : "Siguiente")}
          </button>
        </div>
      </div>
    </div>
  );
}