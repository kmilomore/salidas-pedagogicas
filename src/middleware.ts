import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/middleware";
import type { UserRole } from "@/types";

const PUBLIC_PATHS = ["/login", "/acceso-denegado"];
const DIRECTOR_PATHS = ["/dashboard", "/nueva-salida", "/mis-salidas"];
const ADMIN_PATHS = ["/panel"];

function isPublicPath(pathname: string) {
  if (pathname === "/" || pathname.startsWith("/ruta/")) {
    return true;
  }

  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function resolveHomeByRole(role: UserRole) {
  return role === "admin" ? "/panel" : "/dashboard";
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/auth/callback")
  ) {
    return NextResponse.next();
  }

  const { supabase, response } = createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (pathname === "/") {
    if (!user?.email) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (isPublicPath(pathname)) {
    if (!user?.email || pathname === "/acceso-denegado") {
      return response;
    }

    const normalizedEmail = normalizeEmail(user.email);

    const { data: whitelistUser } = await supabase
      .from("whitelist_usuarios")
      .select("rol, activo")
      .eq("email", normalizedEmail)
      .eq("activo", true)
      .maybeSingle();

    if (!whitelistUser) {
      return NextResponse.redirect(new URL("/acceso-denegado", request.url));
    }

    if (pathname === "/login" || pathname === "/") {
      return NextResponse.redirect(new URL(resolveHomeByRole(whitelistUser.rol as UserRole), request.url));
    }

    return response;
  }

  if (!user?.email) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const normalizedEmail = normalizeEmail(user.email);

  const { data: whitelistUser } = await supabase
    .from("whitelist_usuarios")
    .select("rol, activo")
    .eq("email", normalizedEmail)
    .eq("activo", true)
    .maybeSingle();

  if (!whitelistUser) {
    return NextResponse.redirect(new URL("/acceso-denegado", request.url));
  }

  const role = whitelistUser.rol as UserRole;
  const isDirectorArea = DIRECTOR_PATHS.some((path) => pathname.startsWith(path));
  const isAdminArea = ADMIN_PATHS.some((path) => pathname.startsWith(path));

  if (isDirectorArea && role !== "director") {
    return NextResponse.redirect(new URL(resolveHomeByRole(role), request.url));
  }

  if (isAdminArea && role !== "admin") {
    return NextResponse.redirect(new URL(resolveHomeByRole(role), request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};