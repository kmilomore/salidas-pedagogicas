# Módulo: Operación de Salidas Pedagógicas

## Objetivo
Resolver el núcleo operacional del sistema: selección de establecimiento, captura de datos, cálculo de rutas, participantes y persistencia.

## Archivos clave
- `src/app/(director)/nueva-salida/page.tsx`
- `src/app/(director)/nueva-salida/exito/page.tsx`
- `src/components/nueva-salida/NuevaSalidaWizard.tsx`
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
5. `guardarSalidaPedagogica()` normaliza, valida y persiste el registro en `salidas_pedagogicas`.
6. Tras guardar, la UI redirige a `/nueva-salida/exito?id=<tripId>`.
7. La pantalla de éxito monta `<TripNotifier id={tripId}>`, componente cliente que dispara `POST /api/trips/[id]/notify` en `useEffect` (fire-and-forget).
8. La route handler genera el PDF con `renderToBuffer`, lo convierte a base64 y lo envía al webhook de Apps Script junto con los datos de la salida.
9. Apps Script envía el correo al director (CC: emma.diaz@slepcolchagua.cl) con el PDF adjunto y el aviso de que la postulación no confirma la realización de la salida.

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

## Dependencias con otros módulos
- [Autenticación y control de acceso](./auth.md): define quién entra al formulario.
- [Infraestructura, datos y seguridad](./infra-y-datos.md): provee Supabase, validaciones y manejo de entorno.
- [Administración y exportaciones](./admin.md): consume las salidas ya persistidas.

## Páginas relacionadas
- [Nueva salida](../pages/nueva-salida.md)
- [Mis salidas](../pages/mis-salidas.md)
- [Panel administrativo](../pages/panel-admin.md)