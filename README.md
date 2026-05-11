# Salidas Pedagógicas · SLEP Colchagua

Portal institucional para registrar, revisar y administrar salidas pedagógicas con autenticación Google, control por roles, cálculo de rutas con Google Maps, persistencia en Supabase y exportación documental.

## Estado actual
- Login institucional con Google y whitelist por rol.
- Formulario operativo real para directores y administradores.
- Cálculo de rutas con Google Directions y soporte de uno o múltiples destinos.
- Persistencia en Supabase con validación, normalización y rate limit nativo.
- Historial real para directores en `/mis-salidas`.
- Panel administrativo con filtros básicos, detalle y exportación CSV, Excel y PDF.
- PDF por salida con logo institucional, QR a Google Maps y mapa estático del trayecto.

## Stack
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase SSR + Supabase Auth
- React Hook Form + Zod
- Google Maps APIs
- `@react-pdf/renderer`
- `xlsx`

## Estructura principal
```text
src/
	app/
		(auth)/
		(director)/
		(admin)/
		actions/
		api/
		auth/
		ruta/
	components/
		admin/
		auth/
		branding/
		nueva-salida/
		pdf/
	lib/
		admin/
		pme/
		supabase/
		trips/
		validations/
supabase/
docs/context/
```

## Flujos principales
### Acceso
1. `/` redirige a `/login`.
2. Google OAuth vuelve por `/auth/callback`.
3. `src/middleware.ts` valida sesión, whitelist y rol.
4. El usuario entra a `/dashboard` o `/panel`.

### Operación
1. `/nueva-salida` resuelve el establecimiento del usuario.
2. El wizard captura PME, destino, ruta y participantes.
3. `src/app/actions/maps.ts` calcula la ruta.
4. `src/app/actions/trips.ts` valida y guarda la salida.

### Seguimiento y exportación
- El director revisa sus registros en `/mis-salidas`.
- El admin revisa todo en `/panel`.
- Exportaciones disponibles: CSV, Excel y PDF.

## Variables de entorno críticas
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_SERVER_KEY=
```

## Comandos
```bash
npm install
npm run dev
npm run build
```

## Base de datos y SQL
Archivos principales de referencia:
- `supabase/phase-1-schema.sql`
- `supabase/phase-2-eid-schema.sql`
- `supabase/phase-2-salidas-pme-persistence.sql`

## Documentación de contexto
Para iterar por secciones del portal sin reconstruir todo el mapa cada vez, revisa:
- `docs/context/README.md`
- `docs/context/app-general.md`
- `docs/context/modules/`
- `docs/context/components/`
- `docs/context/pages/`

## Pendientes relevantes
- Implementar la ruta pública `/ruta/[id]`.
- Completar persistencia en Storage y envío de correo del comprobante.
- Extender filtros avanzados y paginación del panel admin.

## Validación recomendada antes de desplegar
```bash
npm run build
```
