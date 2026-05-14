import Link from "next/link";

import PlatformFooter from "@/components/branding/PlatformFooter";

export default function PrivacyPage() {
  return (
    <>
      <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-6 py-16">
        <section className="surface-card w-full max-w-3xl rounded-[32px] border border-white/70 px-8 py-12 sm:px-12">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Privacidad</p>
          <h1 className="font-display mt-4 text-4xl font-semibold text-slate-950">
            Tratamiento de datos del portal
          </h1>
          <p className="mt-6 text-base leading-8 text-slate-600">
            Este portal procesa datos institucionales necesarios para autenticar usuarios autorizados, registrar solicitudes de
            salida pedagogica y emitir comprobantes asociados al proceso operativo.
          </p>

          <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700 sm:text-base">
            <section>
              <h2 className="font-display text-2xl font-semibold text-slate-950">Datos tratados</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Correo institucional, rol y establecimiento autorizado para control de acceso.</li>
                <li>Datos operativos de la salida: destino, fechas, horarios, kilometraje y participantes.</li>
                <li>Metadatos tecnicos necesarios para mantener sesion y trazabilidad minima del proceso.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold text-slate-950">Finalidad</h2>
              <p className="mt-3">
                La informacion se utiliza exclusivamente para administracion del portal, validacion por rol, persistencia de
                solicitudes, generacion de PDF y notificaciones institucionales asociadas a cada registro.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold text-slate-950">Contacto</h2>
              <p className="mt-3">
                Para consultas sobre tratamiento de datos o correccion de informacion, contacta al equipo institucional en{" "}
                <a className="font-semibold text-slep" href="mailto:soporte@slepcolchagua.cl">
                  soporte@slepcolchagua.cl
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/login" className="portal-button portal-button--primary">
              Volver al ingreso
            </Link>
            <Link href="/accesibilidad" className="portal-button portal-button--secondary">
              Ver accesibilidad
            </Link>
          </div>
        </section>
      </main>
      <PlatformFooter />
    </>
  );
}