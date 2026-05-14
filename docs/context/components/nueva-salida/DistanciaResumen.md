# Componente: DistanciaResumen

## Archivo
- `src/components/nueva-salida/DistanciaResumen.tsx`

## Rol
Resumir métricas clave del trayecto calculado para apoyar la validación del usuario antes del guardado.

## Responsabilidades
- Mostrar distancia y duración total.
- Separar métricas de ida y vuelta.
- Cambiar el énfasis según exista uno o múltiples destinos.

## Contrato visual relevante
- El resumen de métricas usa `portal-section-card` y `portal-card-subtle`, por lo que cualquier ajuste futuro de spacing o contraste debe resolverse en las primitivas globales antes que en este componente.