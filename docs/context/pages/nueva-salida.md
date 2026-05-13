# Página: Nueva Salida

## Ruta
- `/nueva-salida`
- `/nueva-salida/exito?id=<tripId>` — pantalla de confirmación post-guardado

## Objetivo
Concentrar la creación completa de una salida pedagógica con datos PME, destino, ruta, participantes y persistencia. Accesible por `director` y `admin`.

## Archivos relacionados
- `src/app/(director)/nueva-salida/page.tsx`
- `src/app/(director)/nueva-salida/exito/page.tsx`
- `src/components/nueva-salida/NuevaSalidaWizard.tsx`
- `src/components/nueva-salida/TripNotifier.tsx`
- `src/app/actions/maps.ts`
- `src/app/actions/trips.ts`
- `src/app/api/trips/[id]/notify/route.ts`
- `apps-script/code.gs`

## Qué hace hoy
- Resuelve rol y establecimiento antes de renderizar el wizard.
- Para `director`: carga el RBD desde `whitelist_usuarios` — el director no puede cambiar su establecimiento ni a través de la URL (`?rbd=` es ignorado para este rol).
- Para `admin`: muestra un selector de establecimiento con todos los RBDs del catálogo SLEP; admite `?rbd=` como parámetro de query.
- Carga el catálogo PME desde `public.eid`.
- Calcula rutas reales con Google Maps.
- Guarda salidas reales en Supabase vía `guardarSalidaPedagogica`.
- Al llegar a `/nueva-salida/exito`, monta `TripNotifier` que dispara `POST /api/trips/[id]/notify` (fire-and-forget desde el cliente).

## Flujo de notificación por correo

```
Director guarda salida
        ↓
guardarSalidaPedagogica  →  INSERT en salidas_pedagogicas  →  redirect /exito?id=<tripId>
        ↓
exito/page.tsx monta <TripNotifier id={tripId}>
        ↓
useEffect → fetch POST /api/trips/[id]/notify   (no bloquea la UI)
        ↓
notify/route.ts
  1. getAuthorizedTripById(id)   ← verifica sesión y propiedad
  2. loadTripPdfAssets(trip)
  3. renderToBuffer(TripSummaryPdf)
  4. POST a APPS_SCRIPT_WEBHOOK_URL con { payload JSON + pdfBase64 }
        ↓
apps-script/code.gs  doPost(e)
  → GmailApp.sendEmail(directorEmail, subject, htmlBody, {
      cc: "emma.diaz@slepcolchagua.cl",
      attachments: [pdfBlob]
    })
```

### Variables de entorno necesarias
| Variable | Descripción |
|---|---|
| `APPS_SCRIPT_WEBHOOK_URL` | URL de despliegue del script (Ejecutar como: Yo · Acceso: Cualquier persona) |
| `APPS_SCRIPT_WEBHOOK_SECRET` | String secreto; debe coincidir con `WEBHOOK_SECRET` en `code.gs` |

### Despliegue del Apps Script
1. Abrir [script.google.com](https://script.google.com) con el correo remitente.
2. Crear proyecto nuevo → pegar contenido de `apps-script/code.gs`.
3. Asignar `WEBHOOK_SECRET` en el script (línea 11) y en `.env.local`.
4. **Desplegar → Nueva implementación → Aplicación web**.
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier persona**
5. Copiar la URL generada → guardar como `APPS_SCRIPT_WEBHOOK_URL` en `.env.local`.
6. Autorizar los permisos de Gmail cuando se solicite.

### Contenido del correo
- **Para**: correo del director (campo `email` en `whitelist_usuarios`, resuelto a través de `director_email` en `AdminTripRecord`)
- **CC**: `emma.diaz@slepcolchagua.cl`
- **Asunto**: `[SLEP Colchagua] Postulación de salida pedagógica registrada – <Escuela> – <Fecha>`
- **Cuerpo HTML**: datos de la postulación en tabla + aviso destacado de que es una postulación, no una confirmación
- **Adjunto**: PDF del comprobante (mismo que genera `/api/trips/[id]/pdf`)

### Aviso obligatorio en el correo y en la pantalla de éxito
> "El registro de esta solicitud **no autoriza ni confirma** la realización de la salida pedagógica. La postulación será evaluada en términos de factibilidad presupuestaria. Una vez que se cuente con claridad operativa, nos comunicaremos con usted."

Este aviso aparece en:
- La pantalla `/nueva-salida/exito` (recuadro ámbar)
- El cuerpo HTML del correo (sección destacada en amarillo)
- El texto plano del correo (sección en mayúsculas)

## Aislamiento de datos del director

El modelo de aislamiento es de defensa en profundidad: opera en cuatro capas independientes.

### Capa 1 — Routing (middleware)
`/dashboard`, `/nueva-salida` y `/mis-salidas` son accesibles por `director` y `admin`.
`/panel` y `/panel/whitelist` solo por `admin`. El middleware redirige a directores que intenten acceder a rutas admin.

### Capa 2 — Server component (nueva-salida/page.tsx)
```ts
const rbdToLoad = role === "admin"
  ? requestedRbd || whitelistUser.rbd || fallbackAdminRbd
  : whitelistUser.rbd;   // director: siempre su propio RBD
```
El wizard recibe `schoolProfile` resuelto en el servidor. El director nunca ve un selector de escuelas.

### Capa 3 — Server action (guardarSalidaPedagogica)
`guardarSalidaPedagogica` consulta `rol` **y** `rbd` desde `whitelist_usuarios` y, para directores, impone el RBD del servidor sobre el valor del payload:
```ts
const rbdToSave = whitelistUser.rol === "director" ? whitelistUser.rbd : payload.rbd;
```
Esto garantiza que aunque un director conozca el endpoint y manipule el cuerpo de la petición, el `rbd` guardado en `salidas_pedagogicas` siempre corresponde a su escuela asignada.

### Capa 4 — Lectura de historial y documentos
`getDirectorTrips()` filtra por `.eq("director_id", userId)`.
`getAuthorizedTripById()` agrega `.eq("director_id", userId)` para el rol `director`.
Un director no puede leer ni descargar salidas de otros directores, incluso conociendo un UUID válido. La ruta `/api/trips/[id]/notify` usa la misma función, por lo que un director tampoco puede disparar notificaciones de salidas ajenas.

## Estados relevantes
- Usuario sin whitelist activa → mensaje de configuración pendiente.
- Usuario sin RBD o sin establecimiento válido → mensaje de configuración pendiente.
- Escuela sin coordenadas operativas → bloqueo con detalle del motivo.
- Ruta calculada correctamente → wizard habilitado.
- Error controlado de Google Maps o de persistencia.
- `APPS_SCRIPT_WEBHOOK_URL` no configurada → notificación omitida silenciosamente (503), la salida ya quedó guardada.

## Dependencias directas
- [Operación de salidas pedagógicas](../modules/operacion-salidas.md)
- [Infraestructura, datos y seguridad](../modules/infra-y-datos.md)
- [Autenticación y control de acceso](../modules/auth.md)

## Conexiones
- Después del guardado, impacta [Mis salidas](./mis-salidas.md) y [Panel administrativo](./panel-admin.md).
