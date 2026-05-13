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
Gestión interactiva de la whitelist de acceso al portal. Recibe datos del server component padre y ejecuta mutaciones vía server actions, confiando en `revalidatePath` para refrescar los props automáticamente.

## Estado local
- `showForm`: visibilidad del formulario de alta.
- `formEmail / formRol / formRbd`: campos controlados del formulario.
- `formError`: error de validación o servidor en el formulario.
- `isPending / pendingId`: estado de transición para deshabilitar la fila en operación.
- `filterRol`: filtro por rol (`"all" | "director" | "admin"`), aplicado en memoria sobre `users`.
- `filterEscuela`: texto libre para buscar por nombre de escuela o RBD, aplicado en memoria.

## Interacciones
- **Alta**: valida email + rol + RBD (condicional), llama `addWhitelistUser(formData)`.
- **Toggle**: llama `toggleWhitelistUser(id, !activo)` con confirmación visual implícita (la fila se opacifica).
- **Eliminar**: `confirm()` nativo antes de llamar `deleteWhitelistUser(id)`.

## Notas de mantenimiento
- El selector de establecimientos solo aparece cuando `formRol === "director"`.
- Cuando `revalidatePath("/panel/whitelist")` se ejecuta en la server action, Next.js re-renderiza el server component padre y el cliente recibe props actualizadas sin `router.refresh()`.
- `useTransition` asegura que la UI no se bloquee durante las mutaciones.

## Dependencias
- `src/app/actions/whitelist.ts`
- `src/lib/admin/whitelist.ts` (tipos)
- `src/types/index.ts` (UserRole)
