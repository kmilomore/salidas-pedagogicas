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
- `src/lib/admin/trips.ts`
- `src/lib/admin/trip-formatting.ts`

## Qué hace hoy
- Reutiliza `getAdminTrips()` como fuente única para consolidar la analítica administrativa.
- Acepta filtros por fecha desde/hasta, establecimiento y estado; cada cambio recalcula la lectura en el servidor.
- Expone KPI de viajes totales, pasajeros acumulados, comunas de destino y establecimientos con actividad.
- Resume la composición de pasajeros entre estudiantes, apoderados y funcionarios con gráfico interactivo.
- Muestra la distribución entre viajes enviados y borradores con gráfico interactivo.
- Destaca indicadores rápidos como promedio de pasajeros por viaje, escuela con mayor carga y comuna más frecuente.
- Presenta ranking gráfico interactivo de viajes por escuela y de comunas de destino.
- Agrega gráficos específicos para regiones más visitadas y lugares más visitados.
- Incluye una vista de tendencia mensual interactiva para los últimos meses con actividad.
- Cierra con una tabla de viajes por escuela a ancho completo, con conteo y pasajeros acumulados.
- Usa un loader contextual mientras se consolidan las métricas.

## Dependencias
- [Administración y exportaciones](../modules/admin.md)
- [Infraestructura, datos y seguridad](../modules/infra-y-datos.md)
- [Autenticación y control de acceso](../modules/auth.md)

## Seguridad aplicada
- La página depende de `getAdminTrips()`, por lo que mantiene el mismo control de acceso administrativo basado en `assertRoleAccess(["admin"])`.
- No escribe datos ni expone acciones mutantes; solo consolida lectura agregada de las salidas visibles.

## Limitaciones actuales
- Los filtros viven en la URL y recalculan toda la vista; aún no hay interacción client-side incremental entre gráficos.
- Los gráficos dependen de `recharts`, pero todavía no exponen exportación de imagen o drill-down por clic.
- Los rankings muestran solo los establecimientos y comunas con mayor volumen visible.

## Conexiones
- Se accede desde el menú superior del shell administrativo junto a `/panel`, `/panel/auditoria` y `/panel/whitelist`.
- Complementa el panel administrativo principal, que sigue concentrando filtros operativos, detalle y exportaciones.