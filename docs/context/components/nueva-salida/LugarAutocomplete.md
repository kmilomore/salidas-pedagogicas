# Componente: LugarAutocomplete

## Archivo
- `src/components/nueva-salida/LugarAutocomplete.tsx`

## Rol
Resolver búsqueda de lugares reales con Google Places y confirmar una selección válida para el flujo operacional.

## Responsabilidades
- Consultar sugerencias con `usePlacesAutocomplete`.
- Confirmar detalles con `PlacesService.getDetails`.
- Exigir comuna, región, coordenadas y `place_id`.
- Permitir reset de la selección confirmada.

## Dependencia externa
- Librería `use-places-autocomplete`.
- Disponibilidad de `window.google.maps.places`.