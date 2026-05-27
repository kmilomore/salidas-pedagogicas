# Módulo: Administración y Exportaciones

## Objetivo
Entregar visibilidad transversal para administradores: métricas, filtros, detalle de salidas, analítica de demanda, exportación de datos y gestión de la whitelist de acceso.

## Archivos clave
- `src/app/(admin)/panel/page.tsx`
- `src/app/(admin)/panel/analitica/page.tsx`
- `src/app/(admin)/panel/analitica/loading.tsx`
- `src/components/admin/AdminAnalyticsCharts.tsx`
- `src/components/admin/AdminSchoolTripsExplorer.tsx`
- `src/app/(admin)/panel/whitelist/page.tsx`
- `src/components/admin/AdminTripsTable.tsx`
- `src/components/admin/DetalleSalida.tsx`
- `src/components/admin/WhitelistPanel.tsx`
- `src/lib/admin/permitted-directors.ts`
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
6. El cruce de cobertura ya no depende de `activo=true`: usa el universo esperado de correos permitidos con rol `director` y RBD asociado en la whitelist, aunque hoy el acceso al portal esté deshabilitado.
7. Luego desglosa escuelas permitidas, escuelas con respuesta y escuelas sin respuesta en tablas independientes con establecimiento, RBD y directores esperados asociados.
8. Las exportaciones CSV y Excel respetan los filtros actuales.
9. `/panel/analitica` reutiliza `getAdminTrips()` para consolidar métricas, rankings y gráficos de pasajeros, comunas destino, viajes totales y viajes por establecimiento.
10. La analítica admite filtros server-side por rango de fechas, establecimiento y estado del viaje.
11. Los gráficos principales de la analítica se renderizan con una librería dedicada (`recharts`) en un componente cliente desacoplado de la agregación server-side.
12. El resumen “Viajes por escuela” de la analítica vive en un componente cliente que permite seleccionar un establecimiento y abrir sus salidas asociadas con drill-down a detalle.
13. El menú superior administrativo enlaza panel, analítica, auditoría y gestión de acceso como vistas hermanas.
14. El PDF de una salida se genera bajo demanda desde una route handler protegida.
15. `/panel/whitelist` carga usuarios de `whitelist_usuarios` enriquecidos con nombre de establecimiento.
16. El componente `WhitelistPanel` ejecuta altas, activaciones/desactivaciones y eliminaciones vía server actions.

## Capacidades actuales
- Métricas base del panel.
- Filtros básicos por texto, RBD y estado.
- Tabla administrativa con scroll interno para revisar registros sin desplazar toda la página.
- Bloque de cobertura de respuesta apilado bajo la tabla principal, con KPI superiores en columnas.
- Tabla adicional de escuelas permitidas para cruzar el universo esperado con el estado real de registro.
- Tablas separadas para escuelas que respondieron y escuelas que no respondieron.
- Cobertura calculada sobre el universo esperado de correos permitidos con rol director y RBD asociado en `whitelist_usuarios`, no sobre el estado activo de acceso.
- Página analítica separada accesible desde el menú superior del shell admin.
- Filtros analíticos por fecha desde/hasta, establecimiento y estado del viaje.
- Gráficos interactivos y rankings para viajes totales, pasajeros acumulados, comunas de destino, regiones más visitadas, lugares más visitados, estados de viaje y viajes por escuela.
- Explorador interactivo de viajes por escuela con tabla clickeable y listado de salidas asociadas por establecimiento.
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
- [Panel analítico](../pages/panel-analitica.md)
- [Gestión de acceso (whitelist)](../pages/whitelist.md)
- [Mis salidas](../pages/mis-salidas.md)
- [Ruta pública](../pages/ruta-publica.md)
