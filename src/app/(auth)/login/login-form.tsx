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
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
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
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {statusMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          {errorMessage}
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-slep px-5 py-4 text-base font-semibold text-white transition hover:bg-slep-dark disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Conectando con Google..." : "Ingresar con Google"}
      </button>
    </>
  );
}