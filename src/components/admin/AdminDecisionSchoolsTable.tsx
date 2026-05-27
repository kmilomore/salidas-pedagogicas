"use client";

import { useState, useTransition } from "react";

interface AdminDecisionSchoolRow {
  rbd: string;
  schoolName: string;
  directorName: string;
  emails: string[];
  tripCount: number;
}

interface AdminDecisionSchoolsTableProps {
  title: string;
  description: string;
  emptyMessage: string;
  badgeClassName: string;
  badgeLabel: string;
  rows: AdminDecisionSchoolRow[];
}

export default function AdminDecisionSchoolsTable({
  title,
  description,
  emptyMessage,
  badgeClassName,
  badgeLabel,
  rows,
}: AdminDecisionSchoolsTableProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCopyAllEmails() {
    const allEmails = Array.from(new Set(rows.flatMap((row) => row.emails).filter(Boolean)));

    if (!allEmails.length) {
      setFeedback("No hay correos disponibles para copiar.");
      return;
    }

    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(allEmails.join("; "));
        setFeedback(`${allEmails.length} correo(s) copiados.`);
      } catch {
        setFeedback("No fue posible copiar los correos.");
      }
    });
  }

  return (
    <section className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className={badgeClassName}>{badgeLabel}</span>
          <button
            type="button"
            onClick={handleCopyAllEmails}
            disabled={isPending || !rows.some((row) => row.emails.length)}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slep hover:text-slep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Copiando..." : "Copiar todos los correos"}
          </button>
        </div>
      </div>

      {feedback ? <p className={`mt-3 text-sm ${feedback.includes("copiados") ? "text-emerald-700" : "text-red-600"}`}>{feedback}</p> : null}

      <div className="portal-table mt-4">
        <div className="portal-table__head grid min-w-[1080px] grid-cols-[1.1fr_0.55fr_1fr_1.2fr_0.55fr] gap-4 px-5 py-4">
          <span>Establecimiento</span>
          <span>RBD</span>
          <span>Directora(o)</span>
          <span>Correo(s)</span>
          <span>Salidas</span>
        </div>

        {rows.length ? (
          <div className="portal-table__body max-h-[24rem] overflow-y-auto">
            {rows.map((row) => (
              <div key={`${row.rbd}-${title}`} className="grid min-w-[1080px] grid-cols-[1.1fr_0.55fr_1fr_1.2fr_0.55fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
                <div>
                  <p className="font-semibold text-slate-950">{row.schoolName}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-950">{row.rbd}</p>
                </div>
                <div>
                  <p>{row.directorName || "Sin nombre disponible"}</p>
                </div>
                <div>
                  <p className="break-words">{row.emails.length ? row.emails.join(", ") : "Sin correo disponible"}</p>
                </div>
                <div>
                  <p className="font-medium text-slate-950">{row.tripCount}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="portal-table__empty">{emptyMessage}</div>
        )}
      </div>
    </section>
  );
}