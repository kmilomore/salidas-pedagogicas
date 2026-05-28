# Página: Panel Analítico

## Ruta
- `/panel/analitica`

## Objetivo
Entregar una lectura ejecutiva y visual de la demanda registrada en el portal mediante métricas y gráficos construidos sobre las salidas administrativas visibles.

## Archivos relacionados
- `src/app/(admin)/panel/analitica/page.tsx`
- `src/app/(admin)/panel/analitica/loading.tsx`
- `src/app/(admin)/layout.tsx`
- `src/components/admin/AdminAnalyticsCharts.tsx`
- `src/components/admin/AdminSchoolTripsExplorer.tsx`
- `src/lib/admin/trips.ts`
- `src/lib/admin/trip-formatting.ts`

## Qué hace hoy
- Reutiliza `getAdminTrips()` como fuente única para consolidar la analítica administrativa.
- Acepta filtros por fecha desde/hasta, establecimiento, estado y decisión administrativa; cada cambio recalcula la lectura en el servidor.p
- Expone KPI de viajes totales, pasajeros acumulados, comunas de destino y establecimientos con actividad.
- Expone también KPI específicos para salidas aceptadas y rechazadas según la revisión administrativa persistida.
- Resume la composición de pasajeros entre estudiantes, apoderados y funcionarios con gráfico interactivo.
- Muestra la distribución entre viajes enviados y borradores con gráfico interactivo.
- Muestra la distribución entre salidas aceptadas, rechazadas y pendientes con gráfico interactivo adicional.
- Incluye dos tablas operativas para escuelas aprobadas y rechazadas con RBD, nombre de directora(o), correo del establecimiento/directora y cantidad de salidas asociadas.
- Cada una de esas tablas permite copiar en bloque todos los correos visibles para comunicar aceptación o rechazo a las escuelas afectadas.
- Cada fila permite además copiar solo los correos de esa escuela y copiar una plantilla de mensaje personalizada para su resultado administrativo.
- Destaca indicadores rápidos como promedio de pasajeros por viaje, escuela con mayor carga y comuna más frecuente.
- Debajo de esos indicadores rápidos y antes del resumen analítico se muestra un gráfico de torta de cobertura de respuesta que compara escuelas que respondieron y escuelas que no respondieron, indicando el porcentaje de respuesta sobre el total esperado.
- Presenta ranking gráfico interactivo de viajes por escuela y de comunas de destino.
- Agrega gráficos específicos para regiones más visitadas y lugares más visitados.
- Incluye una vista de tendencia mensual interactiva para los últimos meses con actividad.
- Cierra con un explorador de viajes por escuela a ancho completo: la tabla superior permite seleccionar un establecimiento y debajo despliega sus salidas asociadas dentro de los filtros actuales.
- El listado de salidas asociadas permite abrir el modal de detalle administrativo sin salir de la analítica.
- Ese modal reutilizado desde analítica puede cambiar la `decision_admin`, y la página se revalida para refrescar KPI y gráficos.
- El filtro por decisión administrativa usa la misma lógica compartida del panel y las exportaciones para evitar divergencias de universo.
- Usa un loader contextual mientras se consolidan las métricas.

## Dependencias
- [Administración y exportaciones](../modules/admin.md)
- [Infraestructura, datos y seguridad](../modules/infra-y-datos.md)
- [Autenticación y control de acceso](../modules/auth.md)

## Seguridad aplicada
- La página depende de `getAdminTrips()`, por lo que mantiene el mismo control de acceso administrativo basado en `assertRoleAccess(["admin"])`.
- Aunque la agregación principal es de lectura, el modal reutilizado desde la analítica sí permite mutar `decision_admin` y `monto_referencial` bajo las mismas server actions protegidas del módulo admin.

## Limitaciones actuales
- Los filtros viven en la URL y recalculan toda la vista; aún no hay interacción client-side incremental entre gráficos.
- Los gráficos dependen de `recharts`, pero todavía no exponen exportación de imagen o drill-down por clic.
- Los rankings muestran solo los establecimientos y comunas con mayor volumen visible.
- El drill-down por escuela hoy vive en la tabla resumen, no en el gráfico de barras de viajes por escuela.

## Conexiones
- Se accede desde el menú superior del shell administrativo junto a `/panel`, `/panel/auditoria` y `/panel/whitelist`.
- Complementa el panel administrativo principal, que sigue concentrando filtros operativos, detalle y exportaciones.