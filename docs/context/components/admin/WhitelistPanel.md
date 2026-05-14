# Componente: WhitelistPanel

## Ruta
`src/components/admin/WhitelistPanel.tsx`

## Tipo
Client component (`"use client"`)

## Props
```ts
interface WhitelistPanelProps {
  users: WhitelistUserEnriched[];   // de src/lib/admin/whitelist.ts
  schools: SchoolForWhitelist[];    // de src/lib/admin/whitelist.ts
}
```

## Responsabilidad
Gestión interactiva de la whitelist de acceso al portal. Recibe datos del server component padre y ejecuta mutaciones vía server actions, usando `revalidatePath` y `router.refresh()` para asegurar refresco visible de la tabla.

## Estado local
- `showForm`: visibilidad del formulario de alta.
- `formEmail / formRol / formRbd`: campos controlados del formulario.
- `formError`: error de validación o servidor en el formulario.
- `isPending / pendingId`: estado de transición para deshabilitar la fila en operación.
- `filterRol`: filtro por rol (`"all" | "director" | "admin"`), aplicado en memoria sobre `users`.
- `filterEscuela`: texto libre para buscar por nombre de escuela o RBD, aplicado en memoria.
- `sortKey`: columna activa de ordenamiento (`"email" | "rol" | "school_name" | "activo" | "created_at"`). Defecto: `"created_at"`.
- `sortDir`: dirección del orden (`"asc" | "desc"`). Defecto: `"desc"`. Clicar la misma columna togglea la dirección; clicar otra columna resetea a `"asc"`.

## Interacciones
- **Alta**: valida email + rol + RBD (condicional), llama `addWhitelistUser(formData)`.
- **Toggle**: llama `toggleWhitelistUser(id, !activo)` con confirmación visual implícita (la fila se opacifica).
- **Eliminar**: `confirm()` nativo antes de llamar `deleteWhitelistUser(id)`.

## Notas de mantenimiento
- El selector de establecimientos solo aparece cuando `formRol === "director"`.
- Tras cada mutación exitosa el cliente llama a `router.refresh()` como respaldo adicional a `revalidatePath("/panel/whitelist")`, evitando estados visuales obsoletos en el RSC padre.
- `useTransition` asegura que la UI no se bloquee durante las mutaciones.

## Contrato visual relevante
- El componente reutiliza el sistema visual compartido del portal para formulario inline, filtros, chips y tabla, en vez de definir estilos locales para cada bloque.

## Dependencias
- `src/app/actions/whitelist.ts`
- `src/lib/admin/whitelist.ts` (tipos)
- `src/types/index.ts` (UserRole)
