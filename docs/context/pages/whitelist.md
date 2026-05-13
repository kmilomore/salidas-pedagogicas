# Página: Gestión de acceso (whitelist)

## Ruta
- `/panel/whitelist`

## Objetivo
Permitir al administrador gestionar en tiempo real qué correos tienen acceso al portal, con qué rol y a qué establecimiento están asociados.

## Archivos relacionados
- `src/app/(admin)/panel/whitelist/page.tsx`
- `src/components/admin/WhitelistPanel.tsx`
- `src/lib/admin/whitelist.ts`
- `src/app/actions/whitelist.ts`

## Qué hace hoy
- Carga todos los usuarios de `whitelist_usuarios` enriquecidos con el nombre del establecimiento desde `BASE DE DATOS ESCUELAS SLEP`.
- Muestra métricas de resumen (usuarios activos, directores habilitados).
- Tabla con columnas: correo, rol, establecimiento (nombre + RBD), estado (activo/inactivo), fecha de creación y acciones.
- Formulario de alta inline: email, rol y — si el rol es `director` — selector de establecimiento poblado desde la tabla maestra.
- Botón de activar/desactivar por fila (toggle sobre el campo `activo`).
- Botón de eliminar por fila con confirmación.
- Las mutaciones usan server actions con `revalidatePath` para recargar datos sin `router.refresh()` explícito.

## Seguridad aplicada
- La page y el data layer (`getWhitelistUsers`, `getSchoolsForWhitelist`) verifican rol `admin` antes de cualquier query.
- Las server actions (`addWhitelistUser`, `toggleWhitelistUser`, `deleteWhitelistUser`) también verifican rol `admin` al inicio.
- Todas las escrituras sobre `whitelist_usuarios` usan `createAdminClient()` (service role key), nunca la sesión del usuario.
- El email se normaliza a minúsculas antes de insertar; el trigger de la tabla lo normaliza adicionalmente en la base de datos.
- La unicidad se garantiza por el índice `whitelist_usuarios_email_lower_idx` en Supabase; el error 23505 se traduce a mensaje legible para el admin.
- La FK sobre `RBD` previene agregar directores a establecimientos inexistentes; el error de FK se captura con mensaje genérico.

## Dependencias
- [Administración y exportaciones](../modules/admin.md)
- [Infraestructura, datos y seguridad](../modules/infra-y-datos.md)
- [Autenticación y control de acceso](../modules/auth.md)
- [WhitelistPanel (componente)](../components/admin/WhitelistPanel.md)
