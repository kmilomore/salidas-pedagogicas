# Página: Panel Administrativo

## Ruta
- `/panel`

## Objetivo
Dar visibilidad transversal a las salidas registradas y habilitar filtros, revisión y exportación.

## Archivos relacionados
- `src/app/(admin)/panel/page.tsx`
- `src/app/(admin)/panel/analitica/page.tsx`
- `src/app/(admin)/layout.tsx`
- `src/lib/admin/permitted-directors.ts`
- `src/components/admin/AdminTripsTable.tsx`
- `src/components/admin/DetalleSalida.tsx`
- `src/app/globals.css`
- `src/app/api/admin/export-csv/route.ts`
- `src/app/api/admin/export-xlsx/route.ts`
- `src/app/(admin)/panel/auditoria/page.tsx`

## Qué hace hoy
- Carga salidas reales con enriquecimiento institucional.
- Aplica filtros básicos por búsqueda, RBD y estado.
- Aplica filtros básicos por búsqueda, RBD, estado, decisión administrativa y etapa administrativa.
- Muestra métricas y tabla principal.
- En la cabecera de métricas también resume monto total aceptado y porcentajes de salidas y escuelas aceptadas dentro del universo visible filtrado.
- El listado transversal incluye columna de total de pasajeros por salida y usa el ancho completo disponible del shell administrativo.
- Usa el shell administrativo compartido y un panel lateral oscuro con texto blanco reforzado para el resumen operacional.
- Reutiliza el contrato visual global para filtros, CTAs, tablas, chips de estado y tarjetas métricas.
- Mientras reúne salidas, filtros y resumen transversal, la ruta usa `src/app/(admin)/panel/loading.tsx` con métricas, filtros y tabla skeleton alineados a la composición real del panel.
- Abre modal con detalle completo.
- Debajo de la tabla principal incorpora un tablero tipo kanban con columnas `pendientes`, `en proceso`, `aceptadas` y `rechazadas` sobre el mismo universo filtrado del panel.
- Ese tablero permite arrastrar tarjetas entre columnas para actualizar rápidamente `decision_admin` y `etapa_admin`, además de abrir el detalle completo al hacer click en una tarjeta.
- El bloque de cobertura de respuesta cruza las salidas registradas contra un universo esperado de correos permitidos con rol director y escuela asociada en whitelist, aunque esos accesos hoy estén desactivados.
- Muestra una tabla de escuelas permitidas y luego separa escuelas que respondieron y escuelas que no respondieron según si registraron al menos una salida.
- En el detalle administrativo permite registrar y editar `tipo_transporte_referencial`, cantidad de buses, valor unitario y `monto_referencial` persistente por salida.
- En ese mismo detalle permite dejar `decision_admin`, `etapa_admin` y `observaciones_admin` persistentes por salida.
- El detalle administrativo ya no guarda cada bloque por separado: usa un único botón para persistir transporte, monto, etapa, decisión y observaciones en una sola acción.
- Bajo la tabla principal muestra una bandeja operativa de salidas con `decision_admin = pendiente` para revisión rápida.
- Exporta CSV y Excel, incluyendo cantidad de funcionarios y total de pasajeros por salida.
- Las exportaciones administrativas respetan también los filtros por decisión administrativa y etapa administrativa.
- Desde el modal o la tabla permite descargar PDF.
- Enlaza por navegación a `/panel/whitelist` y `/panel/auditoria` como vistas administrativas complementarias.
- Enlaza por navegación superior a `/panel/analitica` para revisar métricas y gráficos transversales del mismo universo administrativo.
- La bitácora de `/panel/auditoria` permite filtrar por actor usando correo electrónico parcial o completo.

## Dependencias
- [Administración y exportaciones](../modules/admin.md)
- [Infraestructura, datos y seguridad](../modules/infra-y-datos.md)
- [Autenticación y control de acceso](../modules/auth.md)

## Seguridad aplicada
- Las exportaciones administrativas están protegidas en la capa de datos: `getAdminTrips()` llama a `assertRoleAccess(["admin"])` antes de cualquier query y el acceso a detalle/PDF usa `getAuthorizedTripById()` con control por rol (`admin` transversal, `director` solo sobre sus propias salidas).
- El universo esperado de cobertura está hardcodeado en `src/lib/admin/permitted-directors.ts`; solo esos correos participan del cruce de escuelas esperadas vs. escuelas que efectivamente registraron salidas.
- La edición de transporte, `monto_referencial`, `decision_admin`, `etapa_admin` y `observaciones_admin` usa server actions con verificación explícita de whitelist admin antes de escribir en `salidas_pedagogicas`.
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
- La bandeja de pendientes se limita a las primeras 12 salidas visibles tras aplicar el resto de filtros del panel.
- La gestión administrativa completa solo se administra desde el modal de detalle del panel admin o desde el mismo modal reutilizado en analítica; no se expone en vistas de directores.

## Contrato visual relevante
- `AdminTripsTable` y `DetalleSalida` usan primitivas compartidas como `portal-table`, `portal-button`, `portal-chip` y `portal-card-subtle` para mantener consistencia con el resto del portal.
- El loader de esta ruta también reutiliza el contrato compartido: usa skeletons definidos sobre tokens del design system en `src/app/globals.css` y la misma composición general del panel real.

## Conexiones
- La supervisión operativa y la bitácora administrativa ya no viven en esta pantalla: se consultan desde `/panel/auditoria`.
- La lectura agregada de pasajeros, comunas destino, viajes totales y viajes por establecimiento se consulta desde `/panel/analitica`.
