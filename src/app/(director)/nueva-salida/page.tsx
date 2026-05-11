import { redirect } from "next/navigation";

import NuevaSalidaWizard from "@/components/nueva-salida/NuevaSalidaWizard";
import { createClient } from "@/lib/supabase/server";
import type { DirectorSchoolProfile, SchoolRecord } from "@/types";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseCoordinate(value: string | null) {
  if (!value) {
    return null;
  }

  const normalized = Number(value.replace(",", "."));

  return Number.isFinite(normalized) ? normalized : null;
}

function mapSchoolRecord(record: SchoolRecord): DirectorSchoolProfile | null {
  const rbd = record.RBD?.trim();
  const nombre = record["NOMBRE ESTABLECIMIENTO"]?.trim();
  const comuna = record.COMUNA?.trim();
  const direccion = record.DIRECCIÓN?.trim();
  const director = record["DIRECTOR/A"]?.trim();
  const email = record["CORREO ELECTRÓNICO"]?.trim();
  const latitud = parseCoordinate(record.LATITUD);
  const longitud = parseCoordinate(record.LONGITUD);

  if (!rbd || !nombre || !comuna || !direccion || !director || !email || latitud === null || longitud === null) {
    return null;
  }

  return {
    rbd,
    nombre,
    comuna,
    direccion,
    director,
    email,
    latitud,
    longitud,
  };
}

async function getDirectorSchoolProfile() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/login");
  }

  const normalizedEmail = normalizeEmail(user.email);

  const { data: whitelistUser, error: whitelistError } = await supabase
    .from("whitelist_usuarios")
    .select("rbd, rol, activo")
    .eq("email", normalizedEmail)
    .eq("activo", true)
    .maybeSingle();

  if (whitelistError || !whitelistUser) {
    return { profile: null, reason: "No se encontro una relacion activa en whitelist_usuarios para este usuario." };
  }

  if (whitelistUser.rol !== "director") {
    redirect("/panel");
  }

  if (!whitelistUser.rbd) {
    return { profile: null, reason: "El usuario director no tiene un RBD asignado en whitelist_usuarios." };
  }

  const { data: schoolRecord, error: schoolError } = await supabase
    .from("BASE DE DATOS ESCUELAS SLEP")
    .select('RBD,"NOMBRE ESTABLECIMIENTO",COMUNA,"DIRECTOR/A","CORREO ELECTRÓNICO",LATITUD,LONGITUD,"DIRECCIÓN"')
    .eq("RBD", whitelistUser.rbd)
    .maybeSingle<SchoolRecord>();

  if (schoolError || !schoolRecord) {
    return { profile: null, reason: "No se pudo obtener el establecimiento asociado al RBD del director." };
  }

  const profile = mapSchoolRecord(schoolRecord);

  if (!profile) {
    return {
      profile: null,
      reason: "El establecimiento existe, pero faltan datos obligatorios como direccion o coordenadas para calcular la ruta.",
    };
  }

  return { profile, reason: null };
}

export default async function NewTripPage() {
  const { profile, reason } = await getDirectorSchoolProfile();

  if (!profile) {
    return (
      <section className="rounded-[28px] bg-white p-8 shadow-soft">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Fase 2</p>
        <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950">Nueva salida</h2>
        <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]">Configuracion pendiente</p>
          <p className="mt-3 max-w-2xl text-base leading-7">{reason}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-900/80">
            Para habilitar el formulario, el director debe existir en whitelist_usuarios con un RBD valido y ese establecimiento debe tener direccion, latitud y longitud en la tabla maestra.
          </p>
        </div>
      </section>
    );
  }

  return <NuevaSalidaWizard schoolProfile={profile} />;
}