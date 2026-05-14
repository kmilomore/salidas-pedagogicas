"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

interface LoginFormProps {
  statusMessage?: string;
}

function resolveAppUrl() {
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredAppUrl) {
    return configuredAppUrl.replace(/\/$/, "");
  }

  return window.location.origin;
}

export default function LoginForm({ statusMessage }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const redirectTo = `${resolveAppUrl()}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No fue posible iniciar sesion.");
      setIsLoading(false);
    }
  };

  return (
    <>
      {statusMessage ? (
        <div className="portal-status-card status-card-warning mt-6">
          {statusMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="portal-status-card status-card-danger mt-4">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="portal-button portal-button--primary portal-button--block mt-8"
      >
        {isLoading ? "Conectando con Google..." : "Ingresar con Google"}
      </button>
    </>
  );
}