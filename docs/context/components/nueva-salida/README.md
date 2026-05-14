# Wizard de Nueva Salida

Este directorio documenta componente por componente el flujo del wizard operacional de `/nueva-salida`.

## Orden de lectura recomendado
1. [NuevaSalidaWizard](./NuevaSalidaWizard.md)
2. [StepDatosViaje](./StepDatosViaje.md)
3. [StepDestino](./StepDestino.md)
4. [LugarAutocomplete](./LugarAutocomplete.md)
5. [MapaRuta](./MapaRuta.md)
6. [DistanciaResumen](./DistanciaResumen.md)
7. [StepParticipantes](./StepParticipantes.md)
8. [FuncionariosList](./FuncionariosList.md)
9. [Stepper](./Stepper.md)

## Relación con otros contextos
- [Operación de salidas pedagógicas](../../modules/operacion-salidas.md)
- [Nueva salida](../../pages/nueva-salida.md)

## Contrato visual compartido
- El wizard quedó alineado al design system oficial mediante primitivas globales compartidas para cards, formularios, botones, tablas, chips y alertas.
- Los componentes visuales del flujo deben seguir reutilizando `src/app/globals.css` antes de introducir nuevas combinaciones utilitarias por componente.