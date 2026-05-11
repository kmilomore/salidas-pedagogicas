# Página: Panel Administrativo

## Ruta
- `/panel`

## Objetivo
Dar visibilidad transversal a las salidas registradas y habilitar filtros, revisión y exportación.

## Archivos relacionados
- `src/app/(admin)/panel/page.tsx`
- `src/components/admin/AdminTripsTable.tsx`
- `src/components/admin/DetalleSalida.tsx`
- `src/app/api/admin/export-csv/route.ts`
- `src/app/api/admin/export-xlsx/route.ts`

## Qué hace hoy
- Carga salidas reales con enriquecimiento institucional.
- Aplica filtros básicos por búsqueda, RBD y estado.
- Muestra métricas y tabla principal.
- Abre modal con detalle completo.
- Exporta CSV y Excel.
- Desde el modal o la tabla permite descargar PDF.

## Dependencias
- [Administración y exportaciones](../modules/admin.md)
- [Infraestructura, datos y seguridad](../modules/infra-y-datos.md)
- [Autenticación y control de acceso](../modules/auth.md)

## Limitaciones actuales
- Sin paginación.
- Sin ordenamiento por columna.
- Sin filtros avanzados por fecha o territorio.
- Sin gestión de whitelist u otras herramientas administrativas.