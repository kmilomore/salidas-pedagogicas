# Página: Mis Salidas

## Ruta
- `/mis-salidas`

## Objetivo
Entregar al director una vista real de sus registros y acceso rápido a comprobantes PDF.

## Archivos relacionados
- `src/app/(director)/mis-salidas/page.tsx`
- `src/lib/admin/trips.ts`
- `src/app/api/trips/[id]/pdf/route.ts`

## Qué hace hoy
- Consulta solo las salidas del director autenticado.
- Muestra métricas simples: registradas, enviadas y borradores.
- Lista destino, fecha, kilometraje y estado.
- Permite abrir el PDF por registro.

## Dependencias
- [Operación de salidas pedagógicas](../modules/operacion-salidas.md)
- [Administración y exportaciones](../modules/admin.md)
- [Autenticación y control de acceso](../modules/auth.md)

## Limitaciones actuales
- No tiene filtros propios.
- No tiene vista de detalle interna.
- No permite edición o reenvío desde esta pantalla.