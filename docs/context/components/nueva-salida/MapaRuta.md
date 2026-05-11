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
- `GoogleMap`, `MarkerF`, `PolylineF`.
- `route.segmentos` devuelto por `calcularRuta()`.