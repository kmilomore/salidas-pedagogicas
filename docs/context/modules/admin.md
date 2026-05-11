# Módulo: Administración y Exportaciones

## Objetivo
Entregar visibilidad transversal para administradores: métricas, filtros, detalle de salidas y exportación de datos.

## Archivos clave
- `src/app/(admin)/panel/page.tsx`
- `src/components/admin/AdminTripsTable.tsx`
- `src/components/admin/DetalleSalida.tsx`
- `src/lib/admin/trips.ts`
- `src/lib/admin/trip-formatting.ts`
- `src/app/api/admin/export-csv/route.ts`
- `src/app/api/admin/export-xlsx/route.ts`
- `src/app/api/trips/[id]/pdf/route.ts`
- `src/components/pdf/TripSummaryPdf.tsx`
- `src/lib/trips/pdf-assets.ts`

## Flujo del módulo
1. `/panel` obtiene el universo administrativo con `getAdminTrips()`.
2. Aplica filtros en memoria por búsqueda, establecimiento y estado.
3. Renderiza métricas, tabla y modal de detalle.
4. Las exportaciones CSV y Excel respetan los filtros actuales.
5. El PDF de una salida se genera bajo demanda desde una route handler protegida.

## Capacidades actuales
- Métricas base del panel.
- Filtros básicos por texto, RBD y estado.
- Modal con detalle operativo y mapa.
- Exportación CSV.
- Exportación Excel con hoja de salidas y hoja de funcionarios.
- PDF por salida con QR, logo institucional y mapa estático.

## Pendientes dentro del módulo
- Paginación.
- Ordenamiento por columna.
- Filtros avanzados por fecha, comuna o región.
- Acciones administrativas adicionales más allá de visualización y exportación.

## Dependencias con otros módulos
- [Operación de salidas pedagógicas](./operacion-salidas.md): provee el dato fuente.
- [Infraestructura, datos y seguridad](./infra-y-datos.md): resuelve acceso, enriquecimiento y consultas a Supabase.
- [Autenticación y control de acceso](./auth.md): restringe el acceso al panel.

## Páginas relacionadas
- [Panel administrativo](../pages/panel-admin.md)
- [Mis salidas](../pages/mis-salidas.md)
- [Ruta pública](../pages/ruta-publica.md)