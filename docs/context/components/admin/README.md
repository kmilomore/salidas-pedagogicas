# Componentes administrativos

## Índice
- [AdminTripsTable](./AdminTripsTable.md)
- [DetalleSalida](./DetalleSalida.md)
- [WhitelistPanel](./WhitelistPanel.md)

## Alcance
Estos componentes cubren la exploración administrativa de salidas guardadas (tabla, selección, modal de detalle, mapa, visor PDF) y la gestión de la whitelist de acceso al portal. La auditoría operativa se consume desde una página administrativa dedicada (`/panel/auditoria`) apoyada en `src/lib/admin/audit.ts`.

## Contrato visual compartido
- La tabla principal, el modal de detalle y el panel de whitelist ya usan las mismas primitivas de `src/app/globals.css`: `portal-table`, `portal-button`, `portal-chip`, `portal-card-subtle`, `portal-section-card` y `portal-status-card`.
- Los paneles oscuros de resumen en `/panel` y `/panel/whitelist` refuerzan texto blanco para mantener contraste consistente con el shell administrativo.

## Dependencias compartidas
- `src/lib/admin/trips.ts`
- `src/lib/admin/trip-formatting.ts`
- `src/lib/admin/audit.ts`
- `src/lib/admin/whitelist.ts`
- `src/app/actions/whitelist.ts`
- `src/app/api/trips/[id]/pdf/route.ts`
- `src/lib/google-maps.ts`

## Notas de mantenimiento
- El detalle administrativo depende de datos ya persistidos. No debe recalcular rutas ni asumir estado efímero del wizard.
- El visor PDF usa la misma ruta protegida del archivo descargable, pero en modo `inline` para revisión previa.
- `WhitelistPanel` sí llama a `router.refresh()` tras mutaciones exitosas como respaldo para forzar que el server component padre refleje el estado actualizado.
