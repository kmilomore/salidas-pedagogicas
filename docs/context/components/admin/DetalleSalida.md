# Componente: DetalleSalida

## Archivo
- `src/components/admin/DetalleSalida.tsx`

## Rol
Modal administrativo con la ficha completa de una salida registrada. Consolida resumen operacional, PME, participantes, mapa y visor previo del PDF.

## Responsabilidades
- Mostrar datos persistidos de la salida sin recalcular la lógica del wizard.
- Renderizar el mapa de detalle cuando Google Maps está disponible.
- Exponer la descarga del PDF y su visor `inline` dentro del modal.
- Mostrar métricas separadas de ida y vuelta cuando existen en base de datos.

## Dependencias directas
- `usePortalGoogleMapsLoader()`
- `@mapbox/polyline`
- `/api/trips/[id]/pdf`
- `formatRut()`

## Estados críticos
- `trip`: controla la visibilidad y el contenido del modal.
- `isLoaded`: determina si el mapa interactivo puede dibujarse.

## Puntos delicados
- El visor previo depende de que la route handler responda con `Content-Disposition: inline` cuando recibe `?preview=1`.
- Si la salida solo tiene `ruta_polyline` y no `ruta_segmentos`, el detalle sigue funcionando, pero el PDF pierde diferenciación de colores por tramo.
- El mapa de detalle es de solo lectura y no debe divergir visualmente de la información persistida.