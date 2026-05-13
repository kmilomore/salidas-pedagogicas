# Módulo: Operación de Salidas Pedagógicas

## Objetivo
Resolver el núcleo operacional del sistema: selección de establecimiento, captura de datos, cálculo de rutas, participantes y persistencia.

## Archivos clave
- `src/app/(director)/nueva-salida/page.tsx`
- `src/app/(director)/nueva-salida/exito/page.tsx`
- `src/components/nueva-salida/NuevaSalidaWizard.tsx`
- `src/components/nueva-salida/ConfirmacionModal.tsx`
- `src/components/nueva-salida/TripNotifier.tsx`
- `src/components/nueva-salida/StepDatosViaje.tsx`
- `src/components/nueva-salida/StepDestino.tsx`
- `src/components/nueva-salida/StepParticipantes.tsx`
- `src/components/nueva-salida/MapaRuta.tsx`
- `src/components/nueva-salida/DistanciaResumen.tsx`
- `src/app/actions/maps.ts`
- `src/app/actions/trips.ts`
- `src/app/api/trips/[id]/notify/route.ts`
- `src/lib/validations/salida.ts`
- `src/lib/input-normalization.ts`
- `src/lib/pme/eid.ts`
- `apps-script/code.gs`

## Flujo del módulo
1. El server component de `/nueva-salida` resuelve usuario, rol y establecimiento.
2. Para admin, permite seleccionar establecimiento mediante query param `rbd`.
3. El wizard pide datos PME, destino, ruta y participantes.
4. `calcularRuta()` consulta Google Directions y devuelve kilómetros, duración, polyline y segmentos.
5. Al completar el paso 3 (participantes) y pulsar "Revisar y confirmar", se abre `ConfirmacionModal` con el resumen completo: establecimiento, PME, destino, ruta, participantes desglosados y **total pasajeros**. El usuario puede cerrar para modificar.
6. Solo al pulsar "Confirmar y guardar" en el modal, `guardarSalidaPedagogica()` normaliza, valida y persiste el registro en `salidas_pedagogicas`.
7. Tras guardar, la UI redirige a `/nueva-salida/exito?id=<tripId>`.
7. La pantalla de éxito monta `<TripNotifier id={tripId}>`, componente cliente que dispara `POST /api/trips/[id]/notify` en `useEffect` (fire-and-forget).
9. La route handler genera el PDF con `renderToBuffer`, lo convierte a base64 y lo envía al webhook de Apps Script junto con los datos de la salida.
10. Apps Script envía el correo al director (CC: emma.diaz@slepcolchagua.cl) con el PDF adjunto y el aviso de que la postulación no confirma la realización de la salida.

## Subdominios internos
- Datos del viaje: fecha, horarios, dimensión/subdimensión PME, actividad y objetivo.
- Ruta: uno o múltiples destinos, ida y vuelta, resumen vial y mapa.
- Participantes: estudiantes, apoderados y funcionarios con RUT validado.
- Contexto institucional: establecimiento asociado al rol o seleccionado por admin.

## Reglas importantes
- No se usan datos mock visibles.
- El establecimiento necesita coordenadas válidas para operar.
- La normalización de texto y RUT ocurre en cliente y servidor.
- El rate limit es nativo sobre Supabase, sin servicios externos.
- La notificación es desacoplada: si `APPS_SCRIPT_WEBHOOK_URL` no está configurada o el webhook falla, la salida ya está guardada y el error no bloquea al usuario.
- `getAuthorizedTripById` en la route de notify garantiza que un director solo puede disparar notificaciones de sus propias salidas.
- El **total de pasajeros** (`cantidad_estudiantes + cantidad_apoderados + funcionarios.length`) se calcula automáticamente y se muestra en: `ConfirmacionModal`, `DetalleSalida` (detalle admin) y `TripSummaryPdf` (card destacado azul).
- El PDF tiene márgenes y espaciados reducidos para evitar páginas en blanco intermedias; el mapa ocupa 250pt de alto y el padding de página es 22pt.
- `rbdToSave` en `guardarSalidaPedagogica` se calcula **después** de `payload = salidaSchema.parse(...)` porque el path de admin requiere `payload.rbd`; no mover ese bloque antes del parse.
- La route `/api/trips/[id]/notify` declara `maxDuration = 60` para tolerar la generación de PDF en Vercel. Incluye `console.error`/`console.log` en cada punto de fallo; los logs son visibles en Vercel → Functions.
- Si se cambia `WEBHOOK_SECRET` en `code.gs`, se debe crear una nueva implementación en Apps Script (no basta con editar el código de la versión existente).

## Dependencias con otros módulos
- [Autenticación y control de acceso](./auth.md): define quién entra al formulario.
- [Infraestructura, datos y seguridad](./infra-y-datos.md): provee Supabase, validaciones y manejo de entorno.
- [Administración y exportaciones](./admin.md): consume las salidas ya persistidas.

## Páginas relacionadas
- [Nueva salida](../pages/nueva-salida.md)
- [Mis salidas](../pages/mis-salidas.md)
- [Panel administrativo](../pages/panel-admin.md)