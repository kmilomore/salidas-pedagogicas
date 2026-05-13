# Componentes administrativos

## Índice
- [AdminTripsTable](./AdminTripsTable.md)
- [DetalleSalida](./DetalleSalida.md)
- [WhitelistPanel](./WhitelistPanel.md)

## Alcance
Estos componentes cubren la exploración administrativa de salidas guardadas (tabla, selección, modal de detalle, mapa, visor PDF) y la gestión de la whitelist de acceso al portal.

## Dependencias compartidas
- `src/lib/admin/trips.ts`
- `src/lib/admin/trip-formatting.ts`
- `src/lib/admin/whitelist.ts`
- `src/app/actions/whitelist.ts`
- `src/app/api/trips/[id]/pdf/route.ts`
- `src/lib/google-maps.ts`

## Notas de mantenimiento
- El detalle administrativo depende de datos ya persistidos. No debe recalcular rutas ni asumir estado efímero del wizard.
- El visor PDF usa la misma ruta protegida del archivo descargable, pero en modo `inline` para revisión previa.
- `WhitelistPanel` no llama a `router.refresh()`: confía en que `revalidatePath` en las server actions dispara el re-render RSC automáticamente.
