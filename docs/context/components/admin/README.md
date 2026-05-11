# Componentes administrativos

## Índice
- [AdminTripsTable](./AdminTripsTable.md)
- [DetalleSalida](./DetalleSalida.md)

## Alcance
Estos componentes cubren la exploración administrativa de salidas guardadas: tabla, selección, modal de detalle, mapa y ahora visor previo del PDF protegido.

## Dependencias compartidas
- `src/lib/admin/trips.ts`
- `src/lib/admin/trip-formatting.ts`
- `src/app/api/trips/[id]/pdf/route.ts`
- `src/lib/google-maps.ts`

## Notas de mantenimiento
- El detalle administrativo depende de datos ya persistidos. No debe recalcular rutas ni asumir estado efímero del wizard.
- El visor PDF usa la misma ruta protegida del archivo descargable, pero en modo `inline` para revisión previa.