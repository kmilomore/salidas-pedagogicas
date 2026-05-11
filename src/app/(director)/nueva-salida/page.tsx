import { redirect } from "next/navigation";
import Link from "next/link";

import NuevaSalidaWizard from "@/components/nueva-salida/NuevaSalidaWizard";
import { createClient } from "@/lib/supabase/server";
import type { DirectorSchoolProfile, SchoolRecord, UserRole } from "@/types";

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

async function getSchoolProfileByRbd(rbd: string, supabase: ReturnType<typeof createClient>) {
  const { data: schoolRecord, error: schoolError } = await supabase
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

async function getAdminSchoolOptions(supabase: ReturnType<typeof createClient>) {
  const { data: schools } = await supabase
    .from("BASE DE DATOS ESCUELAS SLEP")
    .select('RBD,"NOMBRE ESTABLECIMIENTO",COMUNA,LATITUD,LONGITUD')
    .not("RBD", "is", null)
    .order("NOMBRE ESTABLECIMIENTO", { ascending: true })
    .limit(200);

  return (schools ?? []).filter((school) => school.RBD && school["NOMBRE ESTABLECIMIENTO"]);
}

interface NewTripPageProps {
  searchParams?: {
    rbd?: string;
  };
}

export default async function NewTripPage({ searchParams }: NewTripPageProps) {
  const { supabase, whitelistUser, whitelistError } = await getDirectorSchoolProfile();

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
  const requestedRbd = searchParams?.rbd?.trim();
  const rbdToLoad = role === "admin" ? requestedRbd || whitelistUser.rbd || null : whitelistUser.rbd;

  if (role === "admin" && !rbdToLoad) {
    const schools = await getAdminSchoolOptions(supabase);

    return (
      <section className="space-y-6">
        <div className="rounded-[28px] bg-white p-8 shadow-soft">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Administracion</p>
          <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950">Seleccionar establecimiento</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            Como administrador puedes abrir el mismo formulario operativo de directores usando un establecimiento real del padron institucional.
          </p>
        </div>

        <section className="rounded-[28px] bg-white p-8 shadow-soft">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {schools.map((school) => (
              <Link
                key={school.RBD}
                href={`/nueva-salida?rbd=${encodeURIComponent(school.RBD as string)}`}
                className="rounded-[24px] border border-slate-200 px-5 py-4 transition hover:border-slep hover:bg-slep/5"
              >
                <p className="text-sm font-semibold text-slate-950">{school["NOMBRE ESTABLECIMIENTO"]}</p>
                <p className="mt-1 text-sm text-slate-600">RBD {school.RBD}</p>
                <p className="mt-1 text-sm text-slate-600">{school.COMUNA ?? "Comuna no disponible"}</p>
              </Link>
            ))}
          </div>
        </section>
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

  const { profile, reason } = await getSchoolProfileByRbd(rbdToLoad, supabase);

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

  return <NuevaSalidaWizard schoolProfile={profile} viewerRole={role} />;
}