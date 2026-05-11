# Componente: StepDestino

## Archivo
- `src/components/nueva-salida/StepDestino.tsx`

## Rol
Gestionar el segundo paso: tipo de flujo, selección de destinos, cálculo de ruta y visualización cartográfica.

## Responsabilidades
- Elegir entre un destino o múltiples destinos.
- Mostrar `LugarAutocomplete` para cada parada.
- Disparar recálculo cuando cambia el conjunto de destinos.
- Renderizar `MapaRuta` y `DistanciaResumen` cuando la ruta existe.

## Dependencias
- `LugarAutocomplete`
- `MapaRuta`
- `DistanciaResumen`

## Riesgos típicos
- Google Maps no cargado.
- Lugares incompletos sin comuna o región.
- Ruta vacía al cambiar flujo o destinos.