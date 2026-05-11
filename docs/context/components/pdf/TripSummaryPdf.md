# Componente: TripSummaryPdf

## Archivo
- `src/components/pdf/TripSummaryPdf.tsx`

## Rol
Documento `react-pdf` que materializa una salida pedagógica en un comprobante descargable de dos páginas.

## Responsabilidades
- Presentar resumen institucional y operativo.
- Mostrar participantes y funcionarios registrados.
- Incorporar la imagen estática de la ruta, el QR y el enlace directo a Google Maps.
- Exponer métricas separadas de ida y vuelta usando datos persistidos.

## Dependencias directas
- `@react-pdf/renderer`
- `formatRut()`
- `AdminTripRecord`
- assets cargados por `loadTripPdfAssets()`

## Estados críticos
- `staticMapDataUrl`: imagen final de la ruta a incrustar.
- `portalLogoDataUrl`: logo institucional preconvertido para compatibilidad.
- `qrCodeDataUrl`: acceso móvil a la ruta.

## Puntos delicados
- El PDF no debe asumir disponibilidad de Google Static Maps; siempre debe tolerar fallback local.
- Los estilos deben mantenerse dentro del subset soportado por `react-pdf`.
- Si cambia el contrato de `AdminTripRecord`, este componente debe ajustarse junto con `pdf-assets.ts` y la route handler del PDF.