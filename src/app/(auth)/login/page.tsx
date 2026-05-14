import Link from "next/link";
import Image from "next/image";

import PlatformFooter from "@/components/branding/PlatformFooter";
import PortalLogo from "@/components/branding/PortalLogo";
import LoginForm from "./login-form";

const ALLOWED_MESSAGES = new Set([
  "No se pudo completar el ingreso",
  "Sesion cerrada correctamente.",
  "No fue posible cerrar la sesion correctamente.",
  "Configuracion de servidor incompleta",
  "No se pudo verificar la sesion",
]);

interface LoginPageProps {
  searchParams?: {
    message?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const statusMessage = searchParams?.message && ALLOWED_MESSAGES.has(searchParams.message)
    ? searchParams.message
    : undefined;

  return (
    <>
      <main className="login-auth-shell flex items-center justify-center">
        <a className="skip-link" href="#main-content">Saltar al contenido</a>
        <section className="portal-auth-frame">
          <div className="portal-auth-hero">
            <Image
              src="/auth.webp"
              alt="Acceso institucional SLEP Colchagua"
              fill
              priority
              className="object-cover opacity-20"
              sizes="(min-width: 1280px) 50vw, 100vw"
            />
            <div className="portal-auth-hero-inner">
              <div className="mb-10">
                <PortalLogo size="lg" priority showText={false} />
              </div>
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-white/90">
                Acceso institucional
              </p>
              <h1 className="max-w-lg text-white">
                Portal oficial para la gestion de salidas pedagogicas de SLEP Colchagua.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-50 sm:text-lg">
                Accede con tu cuenta autorizada para registrar, revisar y administrar solicitudes institucionales dentro del portal.
              </p>
              <div className="mt-10 grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-white/15 bg-white/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Usuarios</p>
                  <p className="font-display mt-3 text-2xl font-semibold text-white">Directores</p>
                  <p className="mt-2 text-sm leading-6 text-slate-50">Registro y seguimiento de salidas por establecimiento.</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Usuarios</p>
                  <p className="font-display mt-3 text-2xl font-semibold text-white">Administracion</p>
                  <p className="mt-2 text-sm leading-6 text-slate-50">Supervision centralizada y exportacion de registros institucionales.</p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Operacion</p>
                  <p className="font-display mt-3 text-2xl font-semibold text-white">Trazabilidad</p>
                  <p className="mt-2 text-sm leading-6 text-slate-50">Control de rutas, destino y antecedentes asociados a cada salida.</p>
                </div>
              </div>
            </div>
          </div>

          <div id="main-content" className="portal-auth-panel">
            <div className="w-full">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] xl:items-start">
                <div>
                  <PortalLogo size="md" priority />
                  <p className="mt-6 portal-kicker">Ingreso institucional</p>
                  <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
                    Iniciar sesion con Google
                  </h2>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                    Usa tu correo institucional autorizado. Si tu cuenta no esta habilitada, el portal te redirigira a acceso denegado.
                  </p>
                </div>

                <div className="portal-auth-note text-sm leading-6 text-slate-600">
                  <p className="font-semibold text-slate-950">Acceso controlado</p>
                  <p className="mt-2">
                    El ingreso depende de autenticacion con Google y autorizacion previa del correo dentro del registro institucional habilitado.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
                <div className="portal-auth-note bg-white">
                  <LoginForm statusMessage={statusMessage} />
                </div>

                <div className="portal-auth-note text-sm leading-6 text-slate-600">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Orientacion de acceso</p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="font-semibold text-slate-950">1. Autenticacion</p>
                      <p className="mt-1">Ingresa con la cuenta Google autorizada para tu rol institucional.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">2. Autorizacion</p>
                      <p className="mt-1">El sistema verifica permisos antes de habilitar el acceso al portal correspondiente.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">3. Acceso denegado</p>
                      <p className="mt-1">
                        Si tu ingreso no fue autorizado, revisa la pagina de <Link href="/acceso-denegado" className="font-semibold text-slep">acceso denegado</Link>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <PlatformFooter />
    </>
  );
}