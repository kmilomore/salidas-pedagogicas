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
- Tabla con columnas: correo, rol, establecimiento (nombre + RBD), estado (activo/inactivo), fecha de creación y acciones. Las cinco primeras columnas tienen cabecera clicable para ordenar ascendente/descendente; el indicador ↕/↑/↓ muestra la dirección activa. Por defecto ordena por fecha de creación descendente.
- Barra de filtros client-side sobre los datos ya cargados: buscador por nombre de escuela o RBD (texto libre) y selector de rol (todos / director / administrador). Botón "Limpiar" resetea ambos filtros. Los filtros no generan nueva petición a Supabase.
- Formulario de alta inline: email, rol y — si el rol es `director` — selector de establecimiento poblado desde la tabla maestra. Para rol `admin` el campo RBD no aparece y se guarda como `null`.
- Botón de activar/desactivar por fila (toggle sobre el campo `activo`).
- Botón de eliminar por fila con confirmación nativa.
- Las mutaciones usan server actions; el cliente llama a `router.refresh()` tras cada operación exitosa para garantizar que la tabla refleje el estado real.

## Manejo de errores en el formulario de alta
- Error 23505 (email duplicado): "Este correo ya está en la lista de acceso."
- Error 23503 (RBD inválido / FK violation): "El establecimiento seleccionado no es válido."
- Cualquier otro error de Supabase: muestra el mensaje real del error para facilitar diagnóstico.
- Excepción inesperada en el cliente (server action que lanza en lugar de retornar): capturada con `try/catch` en `startTransition`, muestra "Ocurrió un error inesperado."

## Seguridad aplicada
- La page y el data layer (`getWhitelistUsers`, `getSchoolsForWhitelist`) verifican rol `admin` antes de cualquier query.
- Las server actions (`addWhitelistUser`, `toggleWhitelistUser`, `deleteWhitelistUser`) también verifican rol `admin` al inicio.
- Todas las escrituras sobre `whitelist_usuarios` usan `createAdminClient()` (service role key), nunca la sesión del usuario.
- El email se normaliza a minúsculas antes de insertar; el trigger `whitelist_usuarios_normalize_email` de la tabla lo normaliza adicionalmente en la base de datos.
- La unicidad se garantiza por el índice `whitelist_usuarios_email_lower_idx` en Supabase.
- La FK sobre `RBD` previene agregar directores a establecimientos inexistentes; el error 23503 se traduce a mensaje legible.

## Notas de mantenimiento
- El selector de establecimiento solo se muestra cuando `formRol === "director"`. Para admins, `rbd` se inserta como `null` (la FK lo permite explícitamente en Postgres).
- `router.refresh()` se llama desde el cliente como respaldo porque `revalidatePath` en server actions invocadas desde `startTransition` no garantiza re-render del RSC padre en todas las versiones.
- Los errores que lanzan excepción desde la server action (vs. los que retornan `{ error }`) se capturan con `try/catch` en el callback de `startTransition` para evitar que el formulario quede en estado `isPending` indefinido.

## Dependencias
- [Administración y exportaciones](../modules/admin.md)
- [Infraestructura, datos y seguridad](../modules/infra-y-datos.md)
- [Autenticación y control de acceso](../modules/auth.md)
- [WhitelistPanel (componente)](../components/admin/WhitelistPanel.md)
