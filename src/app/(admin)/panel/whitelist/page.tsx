import WhitelistPanel from "@/components/admin/WhitelistPanel";
import { getSchoolsForWhitelist, getWhitelistUsers } from "@/lib/admin/whitelist";

export default async function WhitelistPage() {
  const [users, schools] = await Promise.all([getWhitelistUsers(), getSchoolsForWhitelist()]);

  return (
    <section className="grid gap-6 xl:grid-cols-12">
      <article className="portal-panel rounded-[28px] p-8 xl:col-span-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Administracion</p>
        <h2 className="font-display mt-4 text-3xl font-semibold text-slate-950 sm:text-4xl">Gestión de acceso</h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Administra la lista de directores y administradores autorizados para ingresar al portal. Solo los correos registrados
          aquí pueden autenticarse con Google.
        </p>
      </article>

      <aside className="rounded-[28px] bg-slep-dark p-8 text-white shadow-soft xl:col-span-4">
        <h3 className="font-display text-2xl font-semibold">Resumen</h3>
        <p className="mt-5 text-sm leading-6 text-slate-100/85">
          {users.length
            ? `${users.filter((u) => u.activo).length} usuario${users.filter((u) => u.activo).length !== 1 ? "s" : ""} activo${users.filter((u) => u.activo).length !== 1 ? "s" : ""} de ${users.length} registrado${users.length !== 1 ? "s" : ""}. ${users.filter((u) => u.rol === "director" && u.activo).length} director${users.filter((u) => u.rol === "director" && u.activo).length !== 1 ? "es" : ""} habilitado${users.filter((u) => u.rol === "director" && u.activo).length !== 1 ? "s" : ""}.`
            : "No hay usuarios registrados en la lista de acceso."}
        </p>
      </aside>

      <article className="portal-panel rounded-[28px] p-8 xl:col-span-12">
        <WhitelistPanel users={users} schools={schools} />
      </article>
    </section>
  );
}
