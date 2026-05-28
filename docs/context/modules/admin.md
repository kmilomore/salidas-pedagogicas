# Módulo: Administración y Exportaciones

## Objetivo
Entregar visibilidad transversal para administradores: métricas, filtros, detalle de salidas, analítica de demanda, decisiones operativas, auditoría, notificaciones, exportación de datos y gestión de la whitelist de acceso.

## Archivos clave
- `src/app/(admin)/panel/page.tsx`
- `src/app/(admin)/panel/analitica/page.tsx`
- `src/app/(admin)/panel/analitica/loading.tsx`
- `src/app/(admin)/panel/auditoria/page.tsx`
- `src/components/admin/AdminAnalyticsCharts.tsx`
- `src/components/admin/AdminDecisionSchoolsTable.tsx`
- `src/components/admin/AdminOperationalPanel.tsx`
- `src/components/admin/AdminSchoolTripsExplorer.tsx`
- `src/app/(admin)/panel/whitelist/page.tsx`
- `src/components/admin/AdminTripsTable.tsx`
- `src/components/admin/DetalleSalida.tsx`
- `src/components/admin/WhitelistPanel.tsx`
- `src/lib/admin/audit.ts`
- `src/lib/admin/permitted-directors.ts`
- `src/lib/admin/response-coverage.ts`
- `src/lib/admin/trips.ts`
- `src/lib/admin/trip-formatting.ts`
- `src/lib/admin/whitelist.ts`
- `src/app/actions/whitelist.ts`
- `src/app/actions/trips.ts`
- `src/app/api/admin/export-csv/route.ts`
- `src/app/api/admin/export-xlsx/route.ts`
- `src/app/api/trips/[id]/notify/route.ts`
- `src/app/api/trips/[id]/pdf/route.ts`
- `src/components/pdf/TripSummaryPdf.tsx`
- `src/lib/trips/pdf-assets.ts`
- `supabase/phase-7-admin-transporte-referencial.sql`

## Flujo del módulo
1. `/panel` obtiene el universo administrativo con `getAdminTrips()`.
2. Aplica filtros en memoria por búsqueda, establecimiento y estado.
3. Renderiza métricas, tabla con scroll interno vertical y modal de detalle; la tabla principal resume también el transporte referencial y el monto total administrativo por salida.
4. Debajo de la tabla muestra una bandeja priorizada de salidas pendientes de revisión administrativa y luego el bloque de cobertura de respuesta apilado verticalmente.
5. Ese bloque usa KPI en columnas para escuelas consideradas, escuelas que respondieron y escuelas que no respondieron.
6. El cruce de cobertura ya no depende de `activo=true`: usa el universo esperado de correos permitidos con rol `director` y RBD asociado en la whitelist, aunque hoy el acceso al portal esté deshabilitado.
7. Luego desglosa escuelas permitidas, escuelas con respuesta y escuelas sin respuesta en tablas independientes con establecimiento, RBD y directores esperados asociados.
8. Las exportaciones CSV y Excel respetan los filtros actuales.
9. Los filtros administrativos y las exportaciones ahora admiten también segmentación por `decision_admin` (`pendiente`, `aceptada`, `rechazada`).
10. `/panel/analitica` reutiliza `getAdminTrips()` para consolidar métricas, rankings y gráficos de pasajeros, comunas destino, viajes totales y viajes por establecimiento.
11. La analítica admite filtros server-side por rango de fechas, establecimiento, estado del viaje y decisión administrativa.
12. Los gráficos principales de la analítica se renderizan con una librería dedicada (`recharts`) en un componente cliente desacoplado de la agregación server-side.
13. El resumen “Viajes por escuela” de la analítica vive en un componente cliente que permite seleccionar un establecimiento y abrir sus salidas asociadas con drill-down a detalle.
14. El modal de detalle administrativo permite persistir la gestion administrativa de cada salida: tipo de transporte referencial (`bus` o `taxi_bus`), cantidad de buses, valor unitario, `monto_referencial` calculado y `decision_admin` (`pendiente`, `aceptada`, `rechazada`).
15. La analítica ahora consolida también la distribución de decisiones administrativas y KPI separados para salidas aceptadas y rechazadas.
16. Debajo de los indicadores rápidos y antes del resumen analítico, la analítica incluye un gráfico de torta de cobertura de respuesta que compara escuelas que respondieron versus escuelas que no respondieron, explicita el porcentaje de respuesta sobre el total esperado y despliega los nombres de los establecimientos en cada categoría.
17. La analítica agrega tablas de escuelas aprobadas y rechazadas con directora(o), correo de contacto y botón de copia masiva de correos para comunicación operativa.
18. El menú superior administrativo enlaza panel, analítica, auditoría y gestión de acceso como vistas hermanas.
19. `/panel/auditoria` consulta la bitácora reciente y controles operativos para revisar accesos, exportaciones, acciones administrativas y configuración sensible.
20. La ruta `/api/trips/[id]/notify` genera el PDF de la salida, lo envía a Apps Script para notificación y registra eventos `sent`, `failed` o `skipped` en la bitácora administrativa.
21. El PDF de una salida se genera bajo demanda desde una route handler protegida.
22. `/panel/whitelist` carga usuarios de `whitelist_usuarios` enriquecidos con nombre de establecimiento.
23. El componente `WhitelistPanel` ejecuta altas, activaciones/desactivaciones y eliminaciones vía server actions.

## Capacidades actuales
- Métricas base del panel.
- Filtros básicos por texto, RBD y estado.
- Filtros básicos por texto, RBD, estado y decisión administrativa en panel, analítica y exportaciones.
- Tabla administrativa con scroll interno para revisar registros sin desplazar toda la página.
- Tabla administrativa con resumen visible de transporte referencial, cantidad de buses y monto total por salida sin entrar al detalle.
- Bandeja priorizada de salidas pendientes de revisión administrativa dentro del panel principal.
- Bloque de cobertura de respuesta apilado bajo la tabla principal, con KPI superiores en columnas.
- Tabla adicional de escuelas permitidas para cruzar el universo esperado con el estado real de registro.
- Tablas separadas para escuelas que respondieron y escuelas que no respondieron.
- Cobertura calculada sobre el universo esperado de correos permitidos con rol director y RBD asociado en `whitelist_usuarios`, no sobre el estado activo de acceso.
- Página analítica separada accesible desde el menú superior del shell admin.
- Filtros analíticos por fecha desde/hasta, establecimiento y estado del viaje.
- Gráficos interactivos y rankings para viajes totales, pasajeros acumulados, comunas de destino, regiones más visitadas, lugares más visitados, estados de viaje y viajes por escuela.
- Gráfico de torta de cobertura de respuesta en analítica, ubicado bajo los indicadores rápidos y sobre el resumen analítico, con porcentaje de escuelas que respondieron frente al total esperado y listado visible de establecimientos que respondieron y pendientes.
- Explorador interactivo de viajes por escuela con tabla clickeable y listado de salidas asociadas por establecimiento.
- Modal con detalle operativo, mapa, visor previo del PDF y decision administrativa persistente por salida.
- Formulario de gestion administrativa con tipo de transporte, cantidad de buses, valor unitario y monto total calculado automaticamente a partir de esos valores.
- Gráfico y KPI para revisar cuántas salidas están aceptadas, rechazadas o pendientes de revisión administrativa.
- Tablas analíticas de escuelas aprobadas y rechazadas con copia masiva de correos visibles para notificación.
- Acciones por fila en analítica para copiar los correos de una escuela específica y una plantilla de mensaje contextualizada según aprobación o rechazo.
- Página de auditoría con bitácora reciente y controles operativos sobre variables/configuración sensible.
- Registro de eventos administrativos en exportaciones, navegación crítica, acciones de whitelist, decisiones sobre salidas, generación de PDF y notificaciones.
- Ruta de notificación que empaqueta PDF y delega el envío a Apps Script, con trazabilidad de éxito, rechazo o salto por falta de configuración/datos.
- Exportación CSV con campos administrativos de transporte referencial y etiquetas legibles para tipo de transporte y montos en CLP.
- Exportación Excel con hoja de salidas y hoja de funcionarios.
- PDF por salida con QR, logo institucional y mapa estático.
- Persistencia de métricas separadas de ida/vuelta y segmentos de ruta para reutilización documental.
- Gestión CRUD de la whitelist de acceso: altas con validación de RBD, activación/desactivación y eliminación.

## Iteraciones recientes
1. Iteración actual: la gestión administrativa del detalle de salida reemplazó el monto manual por un bloque persistente con tipo de transporte (`bus` o `taxi_bus`), cantidad de buses, valor unitario y monto total calculado automáticamente como multiplicación entre cantidad y valor unitario; además, la tabla principal administrativa ahora resume ese transporte y la exportación CSV expone esos datos con etiquetas legibles.
2. Iteración previa inmediata: el gráfico de cobertura de respuesta en analítica ahora no solo muestra proporciones, sino también el listado visible de establecimientos que respondieron y los que siguen pendientes, además de un tooltip enriquecido por categoría.
3. Iteración previa: la analítica incorporó tablas de escuelas aprobadas y rechazadas, con correo de contacto, copia masiva de destinatarios y acciones para preparar comunicación operativa según la decisión administrativa.
4. Iteración previa: el módulo administrativo consolidó `decision_admin` como eje transversal, permitiendo persistir la decisión por salida, filtrar panel/analítica/exportaciones y visualizar su distribución con KPI dedicados.
5. Iteración previa: se abrió la vista `/panel/auditoria`, con bitácora de eventos y controles operativos, y se integró la trazabilidad de acciones críticas como exportaciones, whitelist, decisiones administrativas, generación de PDF y notificaciones.
6. Iteración previa: la cobertura de respuesta del panel dejó de depender del estado `activo` en whitelist y pasó a calcularse sobre el universo esperado de directores permitidos con rol `director` y RBD asociado.

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
