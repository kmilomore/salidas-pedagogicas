# Página: Nueva Salida

## Ruta
- `/nueva-salida`

## Objetivo
Concentrar la creación completa de una salida pedagógica con datos PME, destino, ruta, participantes y persistencia. Accesible por `director` y `admin`.

## Archivos relacionados
- `src/app/(director)/nueva-salida/page.tsx`
- `src/components/nueva-salida/NuevaSalidaWizard.tsx`
- `src/app/actions/maps.ts`
- `src/app/actions/trips.ts`

## Qué hace hoy
- Resuelve rol y establecimiento antes de renderizar el wizard.
- Para `director`: carga el RBD desde `whitelist_usuarios` — el director no puede cambiar su establecimiento ni a través de la URL (`?rbd=` es ignorado para este rol).
- Para `admin`: muestra un selector de establecimiento con todos los RBDs del catálogo SLEP; admite `?rbd=` como parámetro de query.
- Carga el catálogo PME desde `public.eid`.
- Calcula rutas reales con Google Maps.
- Guarda salidas reales en Supabase vía `guardarSalidaPedagogica`.

## Aislamiento de datos del director

El modelo de aislamiento es de defensa en profundidad: opera en tres capas independientes.

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
Esto garantiza que aunque un director conozca el endpoint y manipule el cuerpo de la petición, el `rbd` guardado en `salidas_pedagogicas` siempre corresponde a su escuela asignada. Para admins se respeta `payload.rbd`.

### Capa 4 — Lectura de historial (mis-salidas / PDF)
`getDirectorTrips()` filtra por `.eq("director_id", userId)`.
`getAuthorizedTripById()` agrega `.eq("director_id", userId)` para el rol `director`.
Un director no puede leer ni descargar salidas de otros directores, incluso conociendo un UUID válido.

## Estados relevantes
- Usuario sin whitelist activa → mensaje de configuración pendiente.
- Usuario sin RBD o sin establecimiento válido → mensaje de configuración pendiente.
- Escuela sin coordenadas operativas → bloqueo con detalle del motivo.
- Ruta calculada correctamente → wizard habilitado.
- Error controlado de Google Maps o de persistencia.

## Dependencias directas
- [Operación de salidas pedagógicas](../modules/operacion-salidas.md)
- [Infraestructura, datos y seguridad](../modules/infra-y-datos.md)
- [Autenticación y control de acceso](../modules/auth.md)

## Conexiones
- Después del guardado, impacta [Mis salidas](./mis-salidas.md) y [Panel administrativo](./panel-admin.md).
