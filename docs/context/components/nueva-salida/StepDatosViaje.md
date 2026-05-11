# Componente: StepDatosViaje

## Archivo
- `src/components/nueva-salida/StepDatosViaje.tsx`

## Rol
Renderizar el primer paso del wizard: fecha, horarios, dimensión PME, subdimensión, nombre de la acción y objetivo pedagógico.

## Responsabilidades
- Exponer controles conectados a `react-hook-form`.
- Respetar dependencia entre dimensión y subdimensión PME.
- Aplicar normalización de texto en la entrada del usuario.

## Entradas principales
- `register`
- `errors`
- `watch`
- `setValue`
- `pmeDimensions`

## Dependencias
- Catálogo PME desde `public.eid` transformado por `buildPmeDimensions()`.