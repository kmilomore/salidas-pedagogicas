import { redirect } from "next/navigation";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { UserRole, WhitelistUser } from "@/types";

export interface WhitelistUserEnriched extends WhitelistUser {
  school_name: string | null;
}

export interface SchoolForWhitelist {
  rbd: string;
  nombre: string;
  comuna: string;
}

async function assertAdminForWhitelist() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect("/login");

  const { data: wUser } = await supabase
    .from("whitelist_usuarios")
    .select("rol")
    .eq("email", user.email.trim().toLowerCase())
    .eq("activo", true)
    .maybeSingle<{ rol: UserRole }>();

  if (!wUser || wUser.rol !== "admin") redirect("/acceso-denegado");

  return createAdminClient();
}

export async function getWhitelistUsers(): Promise<WhitelistUserEnriched[]> {
  const adminClient = await assertAdminForWhitelist();

  const { data: users } = await adminClient
    .from("whitelist_usuarios")
    .select("id, email, rol, rbd, activo, created_at")
    .order("created_at", { ascending: false })
    .returns<WhitelistUser[]>();

  if (!users?.length) return [];

  const rbds = [...new Set(users.filter((u) => u.rbd).map((u) => u.rbd as string))];
  const schoolMap = new Map<string, string>();

  if (rbds.length) {
    const { data: schools } = await adminClient
      .from("BASE DE DATOS ESCUELAS SLEP")
      .select('RBD,"NOMBRE ESTABLECIMIENTO"')
      .in("RBD", rbds);

    for (const school of schools ?? []) {
      const s = school as { RBD: string | null; "NOMBRE ESTABLECIMIENTO": string | null };
      if (s.RBD) {
        schoolMap.set(s.RBD, s["NOMBRE ESTABLECIMIENTO"]?.trim() ?? `RBD ${s.RBD}`);
      }
    }
  }

  return users.map((u) => ({
    ...u,
    school_name: u.rbd ? (schoolMap.get(u.rbd) ?? `RBD ${u.rbd}`) : null,
  }));
}

export async function getSchoolsForWhitelist(): Promise<SchoolForWhitelist[]> {
  const adminClient = await assertAdminForWhitelist();

  const { data } = await adminClient
    .from("BASE DE DATOS ESCUELAS SLEP")
    .select('RBD,"NOMBRE ESTABLECIMIENTO",COMUNA');

  if (!data) return [];

  return (data as Array<{ RBD: string | null; "NOMBRE ESTABLECIMIENTO": string | null; COMUNA: string | null }>)
    .filter((s) => s.RBD)
    .map((s) => ({
      rbd: s.RBD as string,
      nombre: s["NOMBRE ESTABLECIMIENTO"]?.trim() ?? `RBD ${s.RBD}`,
      comuna: s.COMUNA?.trim() ?? "",
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}
