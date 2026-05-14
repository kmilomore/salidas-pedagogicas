import Link from "next/link";

import PlatformFooter from "@/components/branding/PlatformFooter";

export default function AccessibilityPage() {
  return (
    <>
      <main className="flex min-h-[calc(100vh-120px)] items-center justify-center px-6 py-16">
        <section className="surface-card w-full max-w-3xl rounded-[32px] border border-white/70 px-8 py-12 sm:px-12">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Accesibilidad</p>
          <h1 className="font-display mt-4 text-4xl font-semibold text-slate-950">
            Compromiso de accesibilidad del portal
          </h1>
          <p className="mt-6 text-base leading-8 text-slate-600">
            Este portal busca mantener una experiencia clara, navegable por teclado y legible en los flujos principales de
            autenticacion, registro de salidas, seguimiento y administracion.
          </p>

          <div className="mt-8 space-y-6 text-sm leading-7 text-slate-700 sm:text-base">
            <section>
              <h2 className="font-display text-2xl font-semibold text-slate-950">Medidas implementadas</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Jerarquia semantica con encabezados y regiones principales en las pantallas clave.</li>
                <li>Enlaces de salto al contenido en shells autenticados.</li>
                <li>Estados de foco visibles y contrastes reforzados en superficies oscuras institucionales.</li>
                <li>Controles reutilizables para botones, campos, tablas, badges y mensajes de estado.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold text-slate-950">Canal de reporte</h2>
              <p className="mt-3">
                Si detectas una barrera de acceso, un problema de contraste, navegacion con teclado o lectura en tecnologias de
                asistencia, escríbenos a{" "}
                <a className="font-semibold text-slep" href="mailto:soporte@slepcolchagua.cl">
                  soporte@slepcolchagua.cl
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold text-slate-950">Alcance actual</h2>
              <p className="mt-3">
                El compromiso de accesibilidad aplica al portal web institucional de salidas pedagogicas y sera revisado a medida
                que evolucionen formularios, mapas y contenido operativo.
              </p>
            </section>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/login" className="portal-button portal-button--primary">
              Volver al ingreso
            </Link>
            <Link href="/privacidad" className="portal-button portal-button--secondary">
              Ver privacidad
            </Link>
          </div>
        </section>
      </main>
      <PlatformFooter />
    </>
  );
}