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
- Enlaza a `/panel/whitelist` para gestión de acceso (ver navegación del layout admin).

## Dependencias
- [Administración y exportaciones](../modules/admin.md)
- [Infraestructura, datos y seguridad](../modules/infra-y-datos.md)
- [Autenticación y control de acceso](../modules/auth.md)

## Seguridad aplicada
- Todos los endpoints de exportación y PDF están protegidos en la capa de datos: `getAdminTrips()` y `getAuthorizedTripById()` llaman a `assertRoleAccess(["admin"])` antes de cualquier query.
- El middleware excluye `/api` explícitamente — cualquier nueva ruta en `/api/admin/` **debe** llamar a `assertAdminAccess()` o `assertRoleAccess([...])` al inicio del handler o a través de la función de datos que invoque.
- Formula injection prevenida: campos de texto libre (actividad, objetivo, destino, funcionarios) se sanitizan con prefijo `'` antes de escribir CSV y XLSX.
- `estado` validado explícitamente en las rutas de export (`"borrador" | "enviada"`, cualquier otro valor cae a `"all"`).
- IDOR en PDF prevenido: directores filtrados por `director_id`; admins con acceso transversal.
- `Cache-Control: no-store` en todas las exportaciones.

## Limitaciones actuales
- Sin paginación (página cap en 100 filas; exports sin límite).
- Sin ordenamiento por columna.
- Sin filtros avanzados por fecha o territorio.
