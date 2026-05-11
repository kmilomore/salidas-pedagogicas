# Componente: NuevaSalidaWizard

## Archivo
- `src/components/nueva-salida/NuevaSalidaWizard.tsx`

## Rol
Componente orquestador del formulario completo. Maneja estado global, pasos, cálculo de ruta, validación transversal y guardado final.

## Responsabilidades
- Inicializar `react-hook-form`.
- Sincronizar destino(s) seleccionados con hidden fields persistibles.
- Controlar el paso actual y la posibilidad de avanzar.
- Cargar Google Maps con un loader compartido.
- Invocar `calcularRuta()` y `guardarSalidaPedagogica()`.

## Dependencias directas
- `StepDatosViaje`
- `StepDestino`
- `StepParticipantes`
- `Stepper`
- `calcularRuta()`
- `guardarSalidaPedagogica()`

## Estados críticos
- `currentStep`
- `selectedPlaces`
- `routeResult`
- `routeError`
- `saveError`
- `isRouteLoading`
- `isSaveLoading`

## Puntos delicados
- El loader de Google Maps debe mantenerse centralizado para evitar opciones incompatibles entre componentes.
- Los destinos se persisten también como strings y JSON para simplificar el insert actual.