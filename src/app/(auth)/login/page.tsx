import Link from "next/link";
import LoginForm from "./login-form";

interface LoginPageProps {
  searchParams?: {
    message?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {

  return (
    <main className="flex min-h-screen items-center justify-center px-3 py-4 sm:px-5 sm:py-6 xl:px-8">
      <section className="surface-card grid w-full max-w-[1680px] overflow-hidden rounded-[36px] border border-white/70 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-[linear-gradient(180deg,var(--slep-blue-dark)_0%,var(--slep-blue)_100%)] px-8 py-12 text-white sm:px-12 lg:px-14 xl:px-16 xl:py-16">
          <div className="mb-10 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-semibold shadow-lg shadow-slate-950/10">
            SC
          </div>
          <p className="mb-4 text-sm uppercase tracking-[0.28em] text-slate-200/80">
            SLEP Colchagua
          </p>
          <h1 className="font-display max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
            Plataforma de salidas pedagogicas con acceso seguro para directivos.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-100/90 sm:text-lg">
            Registra recorridos, centraliza la autorizacion institucional y comparte rutas publicas con datos validados desde Supabase y Google Maps.
          </p>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200/75">Acceso</p>
              <p className="font-display mt-3 text-2xl font-semibold">Directores</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/80">Acceso por whitelist y rutas protegidas por rol.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200/75">Cobertura</p>
              <p className="font-display mt-3 text-2xl font-semibold">Administracion</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/80">Acceso administrativo institucional con control por rol.</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-200/75">Trazabilidad</p>
              <p className="font-display mt-3 text-2xl font-semibold">Rutas validadas</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/80">Integracion con Supabase y Google para recorridos institucionales.</p>
            </div>
          </div>
        </div>

        <div className="portal-tint flex items-center px-8 py-12 sm:px-12 lg:px-14 xl:px-16 xl:py-16">
          <div className="w-full">
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] xl:items-start">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Ingreso institucional</p>
                <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">
                  Iniciar sesion con Google
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Usa tu correo autorizado en Supabase. Si tu cuenta no esta en la whitelist, seras redirigido a acceso denegado.
                </p>
              </div>

              <div className="portal-outline rounded-[24px] bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">
                <p className="font-semibold text-slate-950">Acceso restringido</p>
                <p className="mt-2">
                  La autenticacion confirma identidad. La autorizacion final depende del registro en la tabla <span className="font-semibold text-slate-900">whitelist_usuarios</span>.
                </p>
            </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)]">
              <div className="portal-outline rounded-[28px] bg-white p-6 shadow-sm sm:p-7">
                <LoginForm statusMessage={searchParams?.message} />
              </div>

              <div className="portal-outline rounded-[28px] bg-white p-6 text-sm leading-6 text-slate-600 shadow-sm sm:p-7">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Orientacion de acceso</p>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="font-semibold text-slate-950">1. Autenticacion</p>
                    <p className="mt-1">Google valida identidad y redirige al callback institucional configurado.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">2. Autorizacion</p>
                    <p className="mt-1">El portal verifica whitelist, rol y establecimiento asociado antes de habilitar navegacion.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">3. Acceso denegado</p>
                    <p className="mt-1">
                      Si tu acceso fue rechazado, revisa la pagina de <Link href="/acceso-denegado" className="font-semibold text-slep">acceso denegado</Link>.
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