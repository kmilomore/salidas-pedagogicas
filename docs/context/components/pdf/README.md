# Componentes y assets PDF

## Índice
- [TripSummaryPdf](./TripSummaryPdf.md)
- [pdf-assets](./pdf-assets.md)

## Alcance
Estos archivos cubren la generación del comprobante PDF: layout documental, QR, logo institucional, imagen de ruta y compatibilidad con descarga o vista previa.

## Dependencias compartidas
- `src/app/api/trips/[id]/pdf/route.ts`
- `src/lib/admin/trips.ts`
- `qrcode`
- `sharp`
- `@mapbox/polyline`

## Notas de mantenimiento
- La imagen exportada debe construirse desde datos persistidos. Si se requiere fidelidad visual con el mapa interactivo, la fuente prioritaria son `ruta_segmentos` y las métricas ida/vuelta guardadas en base de datos.
- La compatibilidad del renderer PDF es más restrictiva que el DOM; por eso se evita depender de WebP directo u opciones CSS no soportadas.