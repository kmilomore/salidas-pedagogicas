"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addWhitelistUser, deleteWhitelistUser, toggleWhitelistUser } from "@/app/actions/whitelist";
import type { SchoolForWhitelist, WhitelistUserEnriched } from "@/lib/admin/whitelist";
import type { UserRole } from "@/types";

interface WhitelistPanelProps {
  users: WhitelistUserEnriched[];
  schools: SchoolForWhitelist[];
}

export default function WhitelistPanel({ users, schools }: WhitelistPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formRol, setFormRol] = useState<UserRole>("director");
  const [formRbd, setFormRbd] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function openForm() {
    setShowForm(true);
    setFormError(null);
    setFormEmail("");
    setFormRbd("");
    setFormRol("director");
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData();
    fd.set("email", formEmail);
    fd.set("rol", formRol);
    if (formRol === "director") fd.set("rbd", formRbd);

    startTransition(async () => {
      try {
        const result = await addWhitelistUser(fd);
        if (result.error) {
          setFormError(result.error);
        } else {
          setShowForm(false);
          router.refresh();
        }
      } catch {
        setFormError("Ocurrió un error inesperado. Intenta nuevamente.");
      }
    });
  }

  function handleToggle(id: string, currentActivo: boolean) {
    setPendingId(id);
    startTransition(async () => {
      try {
        await toggleWhitelistUser(id, !currentActivo);
      } catch {
        // silently ignore — the list will reflect actual state on next render
      } finally {
        setPendingId(null);
        router.refresh();
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("¿Eliminar este usuario de la lista de acceso? Esta acción es irreversible.")) return;
    setPendingId(id);
    startTransition(async () => {
      try {
        await deleteWhitelistUser(id);
      } catch {
        // silently ignore
      } finally {
        setPendingId(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slep">Control de acceso</p>
          <h3 className="font-display mt-4 text-2xl font-semibold text-slate-950">Usuarios autorizados</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Gestiona los directores y administradores con acceso al portal. Solo los correos registrados aquí pueden ingresar.
          </p>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={openForm}
            className="inline-flex items-center justify-center rounded-2xl bg-slep px-5 py-3 text-sm font-semibold text-white transition hover:bg-slep-dark"
          >
            + Agregar usuario
          </button>
        )}
      </div>

      {showForm && (
        <form
          onSubmit={handleAdd}
          className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
        >
          <p className="mb-4 text-sm font-semibold text-slate-800">Nuevo usuario</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Correo electrónico</span>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
                placeholder="director@slep.cl"
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
              />
            </label>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Rol</span>
              <select
                value={formRol}
                onChange={(e) => {
                  setFormRol(e.target.value as UserRole);
                  setFormRbd("");
                }}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
              >
                <option value="director">Director</option>
                <option value="admin">Administrador</option>
              </select>
            </label>

            {formRol === "director" && (
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Establecimiento (RBD)</span>
                <select
                  value={formRbd}
                  onChange={(e) => setFormRbd(e.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slep focus:ring-2 focus:ring-slep/20"
                >
                  <option value="">Seleccionar establecimiento</option>
                  {schools.map((s) => (
                    <option key={s.rbd} value={s.rbd}>
                      {s.nombre} — RBD {s.rbd} ({s.comuna})
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-2xl bg-slep px-5 py-3 text-sm font-semibold text-white transition hover:bg-slep-dark disabled:opacity-50"
            >
              {isPending ? "Guardando..." : "Agregar"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slep hover:text-slep"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-[24px] border border-slate-200">
        <div className="min-w-[780px]">
          <div className="grid grid-cols-[1.6fr_0.6fr_1.5fr_0.6fr_0.8fr_1fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            <span>Correo</span>
            <span>Rol</span>
            <span>Establecimiento</span>
            <span>Estado</span>
            <span>Creación</span>
            <span>Acciones</span>
          </div>

          {users.length ? (
            <div className="divide-y divide-slate-200 bg-white">
              {users.map((user) => {
                const isRowPending = isPending && pendingId === user.id;
                return (
                  <div
                    key={user.id}
                    className={`grid grid-cols-[1.6fr_0.6fr_1.5fr_0.6fr_0.8fr_1fr] gap-4 px-5 py-4 text-sm leading-6 text-slate-700 transition ${isRowPending ? "opacity-50" : ""}`}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-950">{user.email}</p>
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          user.rol === "admin"
                            ? "border-violet-200 bg-violet-50 text-violet-700"
                            : "border-sky-200 bg-sky-50 text-sky-700"
                        }`}
                      >
                        {user.rol === "admin" ? "Admin" : "Director"}
                      </span>
                    </div>

                    <div className="min-w-0">
                      {user.school_name ? (
                        <>
                          <p className="truncate font-medium text-slate-950">{user.school_name}</p>
                          <p className="text-slate-500">RBD {user.rbd}</p>
                        </>
                      ) : (
                        <p className="text-slate-400">—</p>
                      )}
                    </div>

                    <div>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                          user.activo
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-500"
                        }`}
                      >
                        {user.activo ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <div>
                      <p className="text-slate-500">
                        {new Date(user.created_at).toLocaleDateString("es-CL")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isRowPending}
                        onClick={() => handleToggle(user.id, user.activo)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slep hover:text-slep disabled:opacity-50"
                      >
                        {user.activo ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        type="button"
                        disabled={isRowPending}
                        onClick={() => handleDelete(user.id)}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:border-red-400 hover:bg-red-100 disabled:opacity-50"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white px-5 py-12 text-center text-sm text-slate-500">
              No hay usuarios en la lista de acceso aún.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
