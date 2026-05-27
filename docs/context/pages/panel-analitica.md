# Página: Panel Analítico

## Ruta
- `/panel/analitica`

## Objetivo
Entregar una lectura ejecutiva y visual de la demanda registrada en el portal mediante métricas y gráficos construidos sobre las salidas administrativas visibles.

## Archivos relacionados
- `src/app/(admin)/panel/analitica/page.tsx`
- `src/app/(admin)/panel/analitica/loading.tsx`
- `src/app/(admin)/layout.tsx`
- `src/lib/admin/trips.ts`
- `src/lib/admin/trip-formatting.ts`

## Qué hace hoy
- Reutiliza `getAdminTrips()` como fuente única para consolidar la analítica administrativa.
- Expone KPI de viajes totales, pasajeros acumulados, comunas de destino y establecimientos con actividad.
- Resume la composición de pasajeros entre estudiantes, apoderados y funcionarios.
- Muestra la distribución entre viajes enviados y borradores.
- Destaca indicadores rápidos como promedio de pasajeros por viaje, escuela con mayor carga y comuna más frecuente.
- Presenta ranking gráfico de viajes por escuela y de comunas de destino.
- Incluye una vista de tendencia mensual tipo columnas para los últimos meses con actividad.
- Cierra con una tabla de viajes por escuela con conteo y pasajeros acumulados.
- Usa un loader contextual mientras se consolidan las métricas.

## Dependencias
- [Administración y exportaciones](../modules/admin.md)
- [Infraestructura, datos y seguridad](../modules/infra-y-datos.md)
- [Autenticación y control de acceso](../modules/auth.md)

## Seguridad aplicada
- La página depende de `getAdminTrips()`, por lo que mantiene el mismo control de acceso administrativo basado en `assertRoleAccess(["admin"])`.
- No escribe datos ni expone acciones mutantes; solo consolida lectura agregada de las salidas visibles.

## Limitaciones actuales
- No hay filtros propios por fecha, estado o escuela dentro de la analítica.
- Los gráficos se renderizan en el servidor con composición visual HTML/CSS; no usan una librería especializada de charts.
- Los rankings muestran solo los establecimientos y comunas con mayor volumen visible.

## Conexiones
- Se accede desde el menú superior del shell administrativo junto a `/panel`, `/panel/auditoria` y `/panel/whitelist`.
- Complementa el panel administrativo principal, que sigue concentrando filtros operativos, detalle y exportaciones.