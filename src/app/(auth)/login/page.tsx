import Link from "next/link";
import LoginForm from "./login-form";

interface LoginPageProps {
  searchParams?: {
    message?: string;
  };
}

export default function LoginPage({ searchParams }: LoginPageProps) {

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <section className="surface-card grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-white/70 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="bg-slep px-8 py-12 text-white sm:px-12 lg:px-14">
          <div className="mb-10 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-lg font-semibold">
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
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="font-display text-2xl font-semibold">Directores</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/80">
                Acceso por whitelist y rutas protegidas por rol.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5">
              <p className="font-display text-2xl font-semibold">Administracion</p>
              <p className="mt-2 text-sm leading-6 text-slate-100/80">
                Panel inicial listo para trazabilidad y supervision.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-white px-8 py-12 sm:px-12 lg:px-14">
          <div className="w-full">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Ingreso institucional</p>
            <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950">
              Iniciar sesion con Google
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Usa tu correo autorizado en Supabase. Si tu cuenta no esta en la whitelist, seras redirigido a acceso denegado.
            </p>

            <LoginForm statusMessage={searchParams?.message} />

            <div className="mt-8 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
              <p className="font-medium text-slate-900">Acceso restringido</p>
              <p className="mt-2">
                La autenticacion confirma identidad. La autorizacion final depende del registro en
                la tabla <span className="font-semibold text-slate-900">whitelist_usuarios</span>.
              </p>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              Si tu acceso fue rechazado, revisa la pagina de <Link href="/acceso-denegado" className="font-semibold text-slep">acceso denegado</Link>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}