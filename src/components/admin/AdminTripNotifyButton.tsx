"use client";

import { useMemo, useState } from "react";

import type { AdminDecisionStatus } from "@/types";

interface AdminTripNotifyButtonProps {
  tripId: string;
  decision: AdminDecisionStatus;
  directorEmail: string | null;
  alreadyNotified?: boolean;
  className?: string;
  label?: string;
}

function buildDecisionLabel(decision: AdminDecisionStatus) {
  if (decision === "aceptada") {
    return "aprobada";
  }

  if (decision === "rechazada") {
    return "rechazada";
  }

  return "pendiente";
}

export default function AdminTripNotifyButton({ tripId, decision, directorEmail, alreadyNotified = false, className, label }: AdminTripNotifyButtonProps) {
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [sent, setSent] = useState(alreadyNotified);

  const canSend = decision === "aceptada" || decision === "rechazada";
  const missingDirectorEmail = !directorEmail?.trim();
  const disabled = isSending || !canSend || missingDirectorEmail || sent;

  const helperText = useMemo(() => {
    if (missingDirectorEmail) {
      return "Sin correo de director asociado";
    }

    if (!canSend) {
      return "Disponible solo para salidas aceptadas o rechazadas";
    }

    if (sent) {
      return "Correo de decision ya enviado";
    }

    return null;
  }, [canSend, missingDirectorEmail, sent]);

  async function handleSend() {
    if (disabled) {
      return;
    }

    const decisionLabel = buildDecisionLabel(decision);
    const confirmed = window.confirm(`Se enviara un correo al director informando que la salida fue ${decisionLabel}. Deseas continuar?`);

    if (!confirmed) {
      return;
    }

    setFeedback(null);
    setIsSending(true);

    try {
      const response = await fetch(`/api/trips/${tripId}/notify-decision?decisionAdmin=${decision}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-decision-admin": decision,
        },
        body: JSON.stringify({
          decisionAdmin: decision,
        }),
      });

      if (!response.ok) {
        const errorText = (await response.text().catch(() => "")).trim();
        setFeedback(errorText || "No fue posible enviar el correo.");
        return;
      }

      setFeedback("Correo enviado correctamente.");
      setSent(true);
    } catch {
      setFeedback("No fue posible enviar el correo.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <button type="button" onClick={handleSend} disabled={disabled} className={className ?? "portal-button portal-button--secondary portal-button--sm"}>
        {isSending ? "Enviando notificacion..." : label ?? "Enviar notificacion"}
      </button>
      {helperText ? <p className="text-xs text-slate-500">{helperText}</p> : null}
      {feedback ? <p className={`text-xs ${feedback.includes("correctamente") ? "text-emerald-700" : "text-red-600"}`}>{feedback}</p> : null}
    </div>
  );
}
