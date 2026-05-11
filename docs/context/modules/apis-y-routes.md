# Módulo: APIs y Route Handlers

## Objetivo
Documentar las rutas server-side que exponen exportaciones, autenticación y generación documental, para iterar sin mezclar lógica de UI con contratos HTTP.

## Rutas cubiertas
- `/auth/callback`
- `/api/admin/export-csv`
- `/api/admin/export-xlsx`
- `/api/trips/[id]/pdf`

## Archivos clave
- `src/app/auth/callback/route.ts`
- `src/app/api/admin/export-csv/route.ts`
- `src/app/api/admin/export-xlsx/route.ts`
- `src/app/api/trips/[id]/pdf/route.ts`
- `src/lib/admin/trips.ts`
- `src/lib/trips/pdf-assets.ts`
- `src/components/pdf/TripSummaryPdf.tsx`

## Callback OAuth
### Ruta
- `/auth/callback`

### Responsabilidad
- Intercambiar el `code` devuelto por Supabase/Google por una sesión válida.
- Redirigir a la ruta final usando `NEXT_PUBLIC_APP_URL` cuando está configurada.

### Dependencias
- `createClient()` server-side de Supabase.
- Lógica de fallback por `request.origin`.

## Exportación CSV admin
### Ruta
- `/api/admin/export-csv`

### Responsabilidad
- Obtener salidas administrativas reales.
- Reaplicar filtros por `search`, `rbd` y `estado`.
- Serializar el resultado como CSV descargable.

### Fuente de datos
- `getAdminTrips()`
- `filterTrips()`
- `buildTripsCsv()`

## Exportación Excel admin
### Ruta
- `/api/admin/export-xlsx`

### Responsabilidad
- Obtener las mismas salidas visibles para admin.
- Construir un workbook con hoja `Salidas` y hoja `Funcionarios`.
- Responder como archivo `.xlsx`.

### Fuente de datos
- `getAdminTrips()`
- `filterTrips()`
- `xlsx`

## PDF por salida
### Ruta
- `/api/trips/[id]/pdf`

### Responsabilidad
- Verificar que el usuario autenticado pueda acceder a esa salida.
- Cargar assets del PDF: logo, QR y mapa estático.
- Generar un comprobante PDF bajo demanda.

### Fuente de datos
- `getAuthorizedTripById()`
- `loadTripPdfAssets()`
- `TripSummaryPdf`

## Relaciones con otros contextos
- [Administración y exportaciones](./admin.md)
- [Autenticación y control de acceso](./auth.md)
- [Panel administrativo](../pages/panel-admin.md)

## Riesgos típicos
- Filtros inconsistentes entre UI y route handlers.
- Problemas de permisos si el PDF se solicita para una salida ajena.
- Dependencia de `GOOGLE_MAPS_SERVER_KEY` para incrustar imagen estática en PDF.