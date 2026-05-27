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
  decisionType: "aceptada" | "rechazada";
  rows: AdminDecisionSchoolRow[];
}

function buildTemplate(decisionType: "aceptada" | "rechazada", row?: AdminDecisionSchoolRow) {
  const schoolName = row?.schoolName ?? "[Nombre del establecimiento]";
  const directorName = row?.directorName || "Directora(o)";
  const tripCount = row?.tripCount ?? "[cantidad]";

  if (decisionType === "aceptada") {
    return [
      `Asunto: Confirmacion de salida pedagogica aprobada - ${schoolName}`,
      "",
      `Estimada/o ${directorName},`,
      "",
      `Informamos que la revision administrativa de ${tripCount} salida(s) pedagogica(s) asociada(s) a ${schoolName} ha sido aprobada.`,
      "",
      "Favor considerar esta confirmacion para la coordinacion interna del establecimiento.",
      "",
      "Saludos cordiales,",
      "Equipo administrativo SLEP",
    ].join("\n");
  }

  return [
    `Asunto: Observaciones sobre salida pedagogica rechazada - ${schoolName}`,
    "",
    `Estimada/o ${directorName},`,
    "",
    `Informamos que la revision administrativa de ${tripCount} salida(s) pedagogica(s) asociada(s) a ${schoolName} ha sido rechazada.`,
    "",
    "Se solicita revisar las observaciones correspondientes y regularizar la informacion para un nuevo ingreso o seguimiento.",
    "",
    "Saludos cordiales,",
    "Equipo administrativo SLEP",
  ].join("\n");
}

export default function AdminDecisionSchoolsTable({
  title,
  description,
  emptyMessage,
  badgeClassName,
  badgeLabel,
  decisionType,
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

  function handleCopyBaseTemplate() {
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(buildTemplate(decisionType));
        setFeedback("Plantilla base copiada.");
      } catch {
        setFeedback("No fue posible copiar la plantilla.");
      }
    });
  }

  function handleCopyRowEmails(row: AdminDecisionSchoolRow) {
    if (!row.emails.length) {
      setFeedback(`La escuela ${row.schoolName} no tiene correos disponibles.`);
      return;
    }

    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(Array.from(new Set(row.emails)).join("; "));
        setFeedback(`Correos de ${row.schoolName} copiados.`);
      } catch {
        setFeedback("No fue posible copiar los correos de la escuela.");
      }
    });
  }

  function handleCopyRowTemplate(row: AdminDecisionSchoolRow) {
    startTransition(async () => {
      try {
        await navigator.clipboard.writeText(buildTemplate(decisionType, row));
        setFeedback(`Plantilla para ${row.schoolName} copiada.`);
      } catch {
        setFeedback("No fue posible copiar la plantilla de la escuela.");
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
            onClick={handleCopyBaseTemplate}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slep hover:text-slep disabled:cursor-not-allowed disabled:opacity-60"
          >
            Copiar plantilla base
          </button>
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

      <div className="mt-4 rounded-[20px] border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Plantilla base sugerida</p>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-slate-700">{buildTemplate(decisionType)}</pre>
      </div>

      <div className="portal-table mt-4">
        <div className="portal-table__head grid min-w-[1280px] grid-cols-[1.1fr_0.55fr_1fr_1.2fr_0.45fr_0.95fr] gap-4 px-5 py-4">
          <span>Establecimiento</span>
          <span>RBD</span>
          <span>Directora(o)</span>
          <span>Correo(s)</span>
          <span>Salidas</span>
          <span>Acciones</span>
        </div>

        {rows.length ? (
          <div className="portal-table__body max-h-[24rem] overflow-y-auto">
            {rows.map((row) => (
              <div key={`${row.rbd}-${title}`} className="grid min-w-[1280px] grid-cols-[1.1fr_0.55fr_1fr_1.2fr_0.45fr_0.95fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700">
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
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyRowEmails(row)}
                    disabled={isPending || !row.emails.length}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slep hover:text-slep disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Copiar correos
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyRowTemplate(row)}
                    disabled={isPending}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slep hover:text-slep disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Copiar mensaje
                  </button>
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