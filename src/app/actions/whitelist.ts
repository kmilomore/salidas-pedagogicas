"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

async function assertAdminForAction() {
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

export async function addWhitelistUser(formData: FormData): Promise<{ error: string | null }> {
  const adminClient = await assertAdminForAction();

  const email = (formData.get("email") as string | null)?.trim().toLowerCase();
  const rol = formData.get("rol") as UserRole | null;
  const rbd = (formData.get("rbd") as string | null)?.trim() || null;

  if (!email || !rol) return { error: "Correo y rol son requeridos." };
  if (!["director", "admin"].includes(rol)) return { error: "Rol inválido." };
  if (rol === "director" && !rbd) return { error: "El RBD es requerido para directores." };

  const { error } = await adminClient.from("whitelist_usuarios").insert({
    email,
    rol,
    rbd: rol === "director" ? rbd : null,
    activo: true,
  });

  if (error) {
    if (error.code === "23505") return { error: "Este correo ya está en la lista de acceso." };
    if (error.code === "23503") return { error: "El establecimiento seleccionado no es válido." };
    return { error: `No se pudo agregar el usuario. (${error.message})` };
  }

  revalidatePath("/panel/whitelist");
  return { error: null };
}

export async function toggleWhitelistUser(id: string, activo: boolean): Promise<{ error: string | null }> {
  const adminClient = await assertAdminForAction();

  const { error } = await adminClient.from("whitelist_usuarios").update({ activo }).eq("id", id);

  if (error) return { error: "No se pudo actualizar el estado." };

  revalidatePath("/panel/whitelist");
  return { error: null };
}

export async function deleteWhitelistUser(id: string): Promise<{ error: string | null }> {
  const adminClient = await assertAdminForAction();

  const { error } = await adminClient.from("whitelist_usuarios").delete().eq("id", id);

  if (error) return { error: "No se pudo eliminar el usuario." };

  revalidatePath("/panel/whitelist");
  return { error: null };
}
