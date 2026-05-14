# Componente: AdminTripsTable

## Archivo
- `src/components/admin/AdminTripsTable.tsx`

## Rol
Tabla cliente del panel administrativo. Presenta el conjunto de salidas ya enriquecidas y permite abrir el detalle de una salida concreta.

## Responsabilidades
- Renderizar filas con establecimiento, fecha, actividad, distancia y estado.
- Mantener el estado local de `selectedTrip`.
- Abrir y cerrar `DetalleSalida`.

## Dependencias directas
- `DetalleSalida`
- `formatTripDate()`
- `formatDistance()`
- `getStatusClasses()`
- `getStatusLabel()`

## Estados críticos
- `selectedTrip`: controla el modal activo.

## Puntos delicados
- Este componente no consulta datos ni aplica filtros; consume el resultado final del server component `/panel`.
- Si cambian columnas visibles o badges de estado, el helper `trip-formatting.ts` debe seguir siendo la única fuente de formato reutilizable.

## Contrato visual relevante
- La tabla se apoya en `portal-table` y los estados en `getStatusClasses()`, que ahora devuelven combinaciones de `portal-chip` en lugar de colores hardcodeados por vista.
- Las acciones secundarias reutilizan `portal-button portal-button--secondary portal-button--sm` para mantener consistencia con el resto del portal administrativo.