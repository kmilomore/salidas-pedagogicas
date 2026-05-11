import { redirect } from "next/navigation";

import NuevaSalidaWizard from "@/components/nueva-salida/NuevaSalidaWizard";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { DirectorSchoolProfile, SchoolOption, SchoolRecord, UserRole } from "@/types";

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

  return { supabase, whitelistUser, whitelistError };
}

async function getSchoolProfileByRbd(rbd: string) {
  const adminSupabase = createAdminClient();
  const { data: schoolRecord, error: schoolError } = await adminSupabase
    .from("BASE DE DATOS ESCUELAS SLEP")
    .select('RBD,"NOMBRE ESTABLECIMIENTO",COMUNA,"DIRECTOR/A","CORREO ELECTRÓNICO",LATITUD,LONGITUD,"DIRECCIÓN"')
    .eq("RBD", rbd)
    .maybeSingle<SchoolRecord>();

  if (schoolError || !schoolRecord) {
    return { profile: null, reason: "No se pudo obtener el establecimiento asociado al RBD seleccionado." };
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

async function getAdminSchoolOptions() {
  const adminSupabase = createAdminClient();
  const { data: schools } = await adminSupabase
    .from("BASE DE DATOS ESCUELAS SLEP")
    .select('RBD,"NOMBRE ESTABLECIMIENTO",COMUNA,LATITUD,LONGITUD')
    .not("RBD", "is", null)
    .order("NOMBRE ESTABLECIMIENTO", { ascending: true })
    .limit(200);

  return (schools ?? [])
    .filter((school) => school.RBD && school["NOMBRE ESTABLECIMIENTO"])
    .map(
      (school) =>
        ({
          rbd: school.RBD as string,
          nombre: school["NOMBRE ESTABLECIMIENTO"] as string,
          comuna: school.COMUNA ?? "Comuna no disponible",
        }) satisfies SchoolOption,
    );
}

interface NewTripPageProps {
  searchParams?: {
    rbd?: string;
  };
}

export default async function NewTripPage({ searchParams }: NewTripPageProps) {
  const { whitelistUser, whitelistError } = await getDirectorSchoolProfile();

  if (whitelistError || !whitelistUser) {
    return (
      <section className="rounded-[28px] bg-white p-8 shadow-soft">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Formulario de salida</p>
        <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950">Nueva salida</h2>
        <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]">Configuracion pendiente</p>
          <p className="mt-3 max-w-2xl text-base leading-7">No se encontro una relacion activa en whitelist_usuarios para este usuario.</p>
        </div>
      </section>
    );
  }

  const role = whitelistUser.rol as UserRole;
  const schoolOptions = role === "admin" ? await getAdminSchoolOptions() : [];
  const requestedRbd = searchParams?.rbd?.trim();
  const fallbackAdminRbd = schoolOptions[0]?.rbd ?? null;
  const rbdToLoad = role === "admin" ? requestedRbd || whitelistUser.rbd || fallbackAdminRbd : whitelistUser.rbd;

  if (role === "admin" && !rbdToLoad) {
    return (
      <section className="rounded-[28px] bg-white p-8 shadow-soft">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Formulario de salida</p>
        <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950">Nueva salida</h2>
        <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]">Sin establecimientos disponibles</p>
          <p className="mt-3 max-w-2xl text-base leading-7">No se encontraron establecimientos validos para abrir el formulario desde administracion.</p>
        </div>
      </section>
    );
  }

  if (!rbdToLoad) {
    return (
      <section className="rounded-[28px] bg-white p-8 shadow-soft">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Formulario de salida</p>
        <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950">Nueva salida</h2>
        <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]">Configuracion pendiente</p>
          <p className="mt-3 max-w-2xl text-base leading-7">El usuario no tiene un RBD asignado para cargar el formulario.</p>
        </div>
      </section>
    );
  }

  const { profile, reason } = await getSchoolProfileByRbd(rbdToLoad);

  if (!profile) {
    return (
      <section className="rounded-[28px] bg-white p-8 shadow-soft">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Formulario de salida</p>
        <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950">Nueva salida</h2>
        <div className="mt-6 rounded-[24px] border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]">Configuracion pendiente</p>
          <p className="mt-3 max-w-2xl text-base leading-7">{reason}</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-amber-900/80">
            Para habilitar el formulario, el establecimiento seleccionado debe existir en la tabla maestra con direccion, latitud y longitud validas.
          </p>
        </div>
      </section>
    );
  }

  return <NuevaSalidaWizard schoolProfile={profile} viewerRole={role} schoolOptions={schoolOptions} />;
}