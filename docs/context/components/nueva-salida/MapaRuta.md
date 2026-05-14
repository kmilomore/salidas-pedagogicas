# Componente: MapaRuta

## Archivo
- `src/components/nueva-salida/MapaRuta.tsx`

## Rol
Mostrar el circuito completo sobre Google Maps con segmentos coloreados, origen institucional y destinos numerados.

## Responsabilidades
- Ajustar bounds automáticamente.
- Pintar segmentos de ida y retorno con paletas distintas.
- Mostrar una leyenda operacional por tramo.

## Dependencias
- `GoogleMap`, `PolylineF`, `PortalAdvancedMarker`.
- `route.segmentos` devuelto por `calcularRuta()`.

## Notas de mantenimiento
- El componente ya no usa `MarkerF`; los puntos del mapa se dibujan mediante `AdvancedMarkerElement` para alinearse con la recomendacion actual de Google Maps.

## Contrato visual relevante
- El contenedor del mapa y la leyenda operacional quedaron alineados al sistema visual del portal usando superficies compartidas, evitando que el bloque cartográfico se vea desconectado del resto del wizard.