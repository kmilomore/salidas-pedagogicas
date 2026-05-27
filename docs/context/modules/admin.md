# Módulo: Administración y Exportaciones

## Objetivo
Entregar visibilidad transversal para administradores: métricas, filtros, detalle de salidas, exportación de datos y gestión de la whitelist de acceso.

## Archivos clave
- `src/app/(admin)/panel/page.tsx`
- `src/app/(admin)/panel/whitelist/page.tsx`
- `src/components/admin/AdminTripsTable.tsx`
- `src/components/admin/DetalleSalida.tsx`
- `src/components/admin/WhitelistPanel.tsx`
- `src/lib/admin/trips.ts`
- `src/lib/admin/trip-formatting.ts`
- `src/lib/admin/whitelist.ts`
- `src/app/actions/whitelist.ts`
- `src/app/api/admin/export-csv/route.ts`
- `src/app/api/admin/export-xlsx/route.ts`
- `src/app/api/trips/[id]/pdf/route.ts`
- `src/components/pdf/TripSummaryPdf.tsx`
- `src/lib/trips/pdf-assets.ts`

## Flujo del módulo
1. `/panel` obtiene el universo administrativo con `getAdminTrips()`.
2. Aplica filtros en memoria por búsqueda, establecimiento y estado.
3. Renderiza métricas, tabla con scroll interno vertical y modal de detalle.
4. Debajo de la tabla muestra un bloque de cobertura de respuesta apilado verticalmente.
5. Ese bloque usa KPI en columnas para escuelas consideradas, escuelas que respondieron y escuelas que no respondieron.
6. Luego desglosa escuelas con respuesta y sin respuesta en tablas independientes con establecimiento, RBD y directores activos asociados.
7. Las exportaciones CSV y Excel respetan los filtros actuales.
8. El PDF de una salida se genera bajo demanda desde una route handler protegida.
9. `/panel/whitelist` carga usuarios de `whitelist_usuarios` enriquecidos con nombre de establecimiento.
10. El componente `WhitelistPanel` ejecuta altas, activaciones/desactivaciones y eliminaciones vía server actions.

## Capacidades actuales
- Métricas base del panel.
- Filtros básicos por texto, RBD y estado.
- Tabla administrativa con scroll interno para revisar registros sin desplazar toda la página.
- Bloque de cobertura de respuesta apilado bajo la tabla principal, con KPI superiores en columnas.
- Tablas separadas para escuelas que respondieron y escuelas que no respondieron.
- Cobertura calculada sobre el universo de directores activos asociados por RBD en `whitelist_usuarios`.
- Modal con detalle operativo, mapa y visor previo del PDF.
- Exportación CSV.
- Exportación Excel con hoja de salidas y hoja de funcionarios.
- PDF por salida con QR, logo institucional y mapa estático.
- Persistencia de métricas separadas de ida/vuelta y segmentos de ruta para reutilización documental.
- Gestión CRUD de la whitelist de acceso: altas con validación de RBD, activación/desactivación y eliminación.

## Pendientes dentro del módulo
- Paginación.
- Ordenamiento por columna.
- Filtros avanzados por fecha, comuna o región.

## Dependencias con otros módulos
- [Operación de salidas pedagógicas](./operacion-salidas.md): provee el dato fuente.
- [Infraestructura, datos y seguridad](./infra-y-datos.md): resuelve acceso, enriquecimiento y consultas a Supabase.
- [Autenticación y control de acceso](./auth.md): restringe el acceso al panel.

## Páginas relacionadas
- [Panel administrativo](../pages/panel-admin.md)
- [Gestión de acceso (whitelist)](../pages/whitelist.md)
- [Mis salidas](../pages/mis-salidas.md)
- [Ruta pública](../pages/ruta-publica.md)
