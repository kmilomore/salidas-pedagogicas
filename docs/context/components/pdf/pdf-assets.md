# Módulo auxiliar: pdf-assets

## Archivo
- `src/lib/trips/pdf-assets.ts`

## Rol
Capa server-side que prepara todos los assets auxiliares del PDF antes de renderizar `TripSummaryPdf`.

## Responsabilidades
- Construir la URL de apertura directa en Google Maps.
- Generar QR institucional de la ruta.
- Convertir el logo WebP del portal a PNG embebible.
- Pedir Google Static Maps cuando existe llave server-side.
- Generar un fallback SVG local cuando la API externa no está disponible.
- Dibujar segmentos coloreados persistidos (`ruta_segmentos`) para reflejar ida, retorno y tramos múltiples en la exportación.

## Dependencias directas
- `qrcode`
- `sharp`
- `@mapbox/polyline`
- `AdminTripRecord`

## Puntos delicados
- Si `GOOGLE_MAPS_SERVER_KEY` no existe o falla, el módulo debe seguir respondiendo con un SVG local válido.
- El fallback local debe leer los segmentos persistidos y no inventar la semántica de ida/vuelta.
- La paleta de colores del PDF debe mantenerse sincronizada con la paleta operacional del mapa interactivo para evitar contradicciones visuales.