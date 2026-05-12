import Link from "next/link";
import Image from "next/image";

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
    <main className="login-auth-shell flex min-h-screen items-center justify-center px-3 py-4 sm:px-5 sm:py-6 xl:px-8">
      <section className="surface-card grid w-full max-w-[1680px] overflow-hidden rounded-[36px] border border-white/70 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden px-8 py-12 text-white sm:px-12 lg:px-14 xl:px-16 xl:py-16">
          <Image
            src="/auth.webp"
            alt="Acceso institucional SLEP Colchagua"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1280px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,38,66,0.28)_0%,rgba(15,76,129,0.78)_34%,rgba(11,29,49,0.9)_100%)]" />
          <div className="relative">
          <div className="mb-10">
            <PortalLogo size="lg" priority showText={false} />
          </div>
          <p className="mb-4 text-sm uppercase tracking-[0.28em] text-slate-200/80">
            Acceso institucional
          </p>
          <h1 className="font-display max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
            Portal oficial para la gestion de salidas pedagogicas de SLEP Colchagua.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-100/90 sm:text-lg">
            Accede con tu cuenta autorizada para registrar, revisar y administrar solicitudes institucionales dentro del portal.
          </p>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200/75">Usuarios</p>
              <p className="font-display mt-3 text-2xl font-semibold">Directores</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/80">Registro y seguimiento de salidas por establecimiento.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200/75">Usuarios</p>
              <p className="font-display mt-3 text-2xl font-semibold">Administracion</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/80">Supervision centralizada y exportacion de registros institucionales.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200/75">Operacion</p>
              <p className="font-display mt-3 text-2xl font-semibold">Trazabilidad</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/80">Control de rutas, destino y antecedentes asociados a cada salida.</p>
            </div>
          </div>
          </div>
        </div>

        <div className="portal-tint flex items-center px-8 py-12 sm:px-12 lg:px-14 xl:px-16 xl:py-16">
          <div className="w-full">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] xl:items-start">
              <div>
                <PortalLogo size="md" priority />
                <p className="mt-6 text-sm font-medium uppercase tracking-[0.24em] text-slep">Ingreso institucional</p>
                <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
                  Iniciar sesion con Google
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Usa tu correo institucional autorizado. Si tu cuenta no esta habilitada, el portal te redirigira a acceso denegado.
                </p>
              </div>

              <div className="portal-outline rounded-[24px] bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
                <p className="font-semibold text-slate-950">Acceso controlado</p>
                <p className="mt-2">
                  El ingreso depende de autenticacion con Google y autorizacion previa del correo dentro del registro institucional habilitado.
                </p>
            </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
              <div className="portal-outline rounded-[28px] bg-white p-6 shadow-sm sm:p-7">
                <LoginForm statusMessage={statusMessage} />
              </div>

              <div className="portal-outline rounded-[28px] bg-white p-6 text-sm leading-6 text-slate-600 shadow-sm sm:p-7">
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
  );
}