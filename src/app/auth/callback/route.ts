import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function resolveAppUrl(requestUrl: URL) {
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (configuredAppUrl) {
    return configuredAppUrl.replace(/\/$/, "");
  }

  return requestUrl.origin;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const appUrl = resolveAppUrl(requestUrl);
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, appUrl));
    }
  }

  return NextResponse.redirect(
    new URL("/login?message=No%20se%20pudo%20completar%20el%20ingreso", appUrl),
  );
}