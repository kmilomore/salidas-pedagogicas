# Página: Panel Administrativo

## Ruta
- `/panel`

## Objetivo
Dar visibilidad transversal a las salidas registradas y habilitar filtros, revisión y exportación.

## Archivos relacionados
- `src/app/(admin)/panel/page.tsx`
- `src/app/(admin)/layout.tsx`
- `src/components/admin/AdminTripsTable.tsx`
- `src/components/admin/DetalleSalida.tsx`
- `src/app/globals.css`
- `src/app/api/admin/export-csv/route.ts`
- `src/app/api/admin/export-xlsx/route.ts`
- `src/app/(admin)/panel/auditoria/page.tsx`

## Qué hace hoy
- Carga salidas reales con enriquecimiento institucional.
- Aplica filtros básicos por búsqueda, RBD y estado.
- Muestra métricas y tabla principal.
- Usa el shell administrativo compartido y un panel lateral oscuro con texto blanco reforzado para el resumen operacional.
- Reutiliza el contrato visual global para filtros, CTAs, tablas, chips de estado y tarjetas métricas.
- Mientras reúne salidas, filtros y resumen transversal, la ruta usa `src/app/(admin)/panel/loading.tsx` con métricas, filtros y tabla skeleton alineados a la composición real del panel.
- Abre modal con detalle completo.
- En el detalle administrativo permite registrar y editar un `monto_referencial` persistente por salida.
- Exporta CSV y Excel.
- Desde el modal o la tabla permite descargar PDF.
- Enlaza por navegación a `/panel/whitelist` y `/panel/auditoria` como vistas administrativas complementarias.
- La bitácora de `/panel/auditoria` permite filtrar por actor usando correo electrónico parcial o completo.

## Dependencias
- [Administración y exportaciones](../modules/admin.md)
- [Infraestructura, datos y seguridad](../modules/infra-y-datos.md)
- [Autenticación y control de acceso](../modules/auth.md)

## Seguridad aplicada
- Las exportaciones administrativas están protegidas en la capa de datos: `getAdminTrips()` llama a `assertRoleAccess(["admin"])` antes de cualquier query y el acceso a detalle/PDF usa `getAuthorizedTripById()` con control por rol (`admin` transversal, `director` solo sobre sus propias salidas).
- La edición del `monto_referencial` usa una server action con verificación explícita de whitelist admin antes de escribir en `salidas_pedagogicas`.
- El middleware excluye `/api` explícitamente — cualquier nueva ruta en `/api/admin/` **debe** llamar a `assertAdminAccess()` o `assertRoleAccess([...])` al inicio del handler o a través de la función de datos que invoque.
- Formula injection prevenida: campos de texto libre (actividad, objetivo, destino, funcionarios) se sanitizan con prefijo `'` antes de escribir CSV y XLSX.
- `estado` validado explícitamente en las rutas de export (`"borrador" | "enviada"`, cualquier otro valor cae a `"all"`).
- IDOR en PDF prevenido: directores filtrados por `director_id`; admins con acceso transversal.
- `Cache-Control: no-store` en todas las exportaciones.
- El visor previo del PDF administrativo depende de `Content-Disposition: inline` y de una política `X-Frame-Options: SAMEORIGIN`, ya que el documento se incrusta dentro del mismo dominio del portal.

## Limitaciones actuales
- Sin paginación (página cap en 100 filas; exports sin límite).
- Sin ordenamiento por columna.
- Sin filtros avanzados por fecha o territorio; la auditoría ya admite filtro por actor/correo.
- El `monto_referencial` solo se administra desde el modal de detalle del panel admin; no se expone en vistas de directores.

## Contrato visual relevante
- `AdminTripsTable` y `DetalleSalida` usan primitivas compartidas como `portal-table`, `portal-button`, `portal-chip` y `portal-card-subtle` para mantener consistencia con el resto del portal.
- El loader de esta ruta también reutiliza el contrato compartido: usa skeletons definidos sobre tokens del design system en `src/app/globals.css` y la misma composición general del panel real.

## Conexiones
- La supervisión operativa y la bitácora administrativa ya no viven en esta pantalla: se consultan desde `/panel/auditoria`.
