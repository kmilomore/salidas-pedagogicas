# Contexto General de la Aplicación

## Propósito
Portal institucional para registrar, revisar y administrar salidas pedagógicas de establecimientos SLEP Colchagua.

## Stack actual
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase SSR + Supabase Auth
- Google Maps API para rutas, Places y mapa estático
- React Hook Form + Zod
- `@react-pdf/renderer` para comprobantes PDF
- `xlsx` para exportación Excel

## Roles del sistema
- `director`: registra salidas de su establecimiento y revisa su historial.
- `admin`: accede al panel transversal y también puede abrir el formulario operacional.

## Flujo principal
1. La app redirige `/` a `/login`.
2. El usuario inicia sesión con Google y vuelve por `/auth/callback`.
3. `src/middleware.ts` valida sesión, whitelist y rol.
4. Según el rol, la navegación cae en `/dashboard` o `/panel`.
5. El flujo operativo central ocurre en `/nueva-salida`.
6. Los registros guardados aparecen en `/mis-salidas` y `/panel`.
7. Desde ambos contextos se puede exportar PDF; desde admin además CSV y Excel.

## Puntos de entrada importantes
- `src/app/layout.tsx`: metadata global, favicon y shell base.
- `src/middleware.ts`: control de acceso transversal.
- `src/app/(auth)/login/page.tsx`: acceso institucional.
- `src/app/(director)/nueva-salida/page.tsx`: controlador server-side del formulario.
- `src/app/(director)/mis-salidas/page.tsx`: historial real del director.
- `src/app/(admin)/panel/page.tsx`: panel administrativo con filtros y exportaciones.

## Módulos principales
- [Autenticación y control de acceso](./modules/auth.md)
- [Operación de salidas pedagógicas](./modules/operacion-salidas.md)
- [Administración y exportaciones](./modules/admin.md)
- [APIs y route handlers](./modules/apis-y-routes.md)
- [Infraestructura, datos y seguridad](./modules/infra-y-datos.md)

## Desglose por componentes
- [Índice de componentes](./components/README.md)
- [Wizard de nueva salida](./components/nueva-salida/README.md)

## Páginas clave
- [Login](./pages/login.md)
- [Nueva salida](./pages/nueva-salida.md)
- [Mis salidas](./pages/mis-salidas.md)
- [Panel administrativo](./pages/panel-admin.md)
- [Ruta pública](./pages/ruta-publica.md)

## Estado actual relevante
- El sistema ya opera con datos reales y sin mocks visibles.
- El formulario guarda salidas reales en Supabase.
- El panel admin ya tiene filtros básicos, detalle y exportación.
- El PDF ya incluye logo institucional, QR y mapa estático de la ruta.
- La ruta pública `/ruta/[id]` sigue pendiente de implementación funcional.

## Regla de iteración recomendada
- Si el cambio es visual o de copy, parte por el archivo de página.
- Si afecta varias vistas o exportaciones, parte por el módulo.
- Si toca roles, sesión, tablas o APIs externas, revisa primero infraestructura y middleware.