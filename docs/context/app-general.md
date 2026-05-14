# Contexto General de la Aplicación

## Propósito
Portal institucional para registrar, revisar y administrar salidas pedagógicas de establecimientos SLEP Colchagua.

## Stack actual
- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- `@slep-colchagua/design-system` como base oficial de tokens, tipografía Museo Sans y utilidades visuales institucionales
- Supabase SSR + Supabase Auth
- Google Maps API para rutas, Places y mapa estático
- React Hook Form + Zod
- `@react-pdf/renderer` para comprobantes PDF
- `xlsx` para exportación Excel

## Contrato visual actual
- `src/app/layout.tsx` carga el design system oficial y reemplaza la tipografía web previa por Museo Sans institucional.
- `src/app/globals.css` actúa como capa de compatibilidad y normalización: remapea tokens legacy y concentra primitivas compartidas como `portal-button`, `portal-section-card`, `portal-subsection-card`, `portal-card-subtle`, `portal-input`, `portal-select`, `portal-textarea`, `portal-chip`, `portal-table` y `portal-status-card`.
- La experiencia de carga ya no depende solo del `loading.tsx` global: `mis-salidas`, `nueva-salida` y `panel` cuentan con loaders de sección que reutilizan `PortalSectionLoader`, mantienen branding SLEP y muestran skeletons contextuales de tabla, métricas o wizard según la ruta.
- Los shells de login, director y administración ya no dependen de estilos aislados por pantalla: usan clases compartidas para header, navegación, footer, paneles, formularios y estados.
- Las superficies oscuras institucionales de login, director y administración usan texto blanco reforzado para priorizar legibilidad en titulares y copys secundarios.

## Roles del sistema
- `director`: registra salidas de su establecimiento y revisa su historial.
- `admin`: accede al panel transversal, puede abrir el formulario operacional y gestiona la whitelist de acceso.

## Flujo principal
1. La app redirige `/` a `/login`.
2. El usuario inicia sesión con Google y vuelve por `/auth/callback`.
3. `src/middleware.ts` valida sesión, whitelist y rol.
4. Según el rol, la navegación cae en `/dashboard` o `/panel`.
5. El flujo operativo central ocurre en `/nueva-salida`.
6. Los registros guardados aparecen en `/mis-salidas` y `/panel`.
7. Desde ambos contextos se puede exportar PDF; desde admin además CSV y Excel.
8. El admin gestiona la whitelist de acceso desde `/panel/whitelist`.
9. El admin revisa controles operativos y bitácora reciente desde `/panel/auditoria`.

## Puntos de entrada importantes
- `src/app/layout.tsx`: metadata global, favicon y shell base.
- `src/app/globals.css`: capa central del contrato visual compartido.
- `src/components/branding/PortalSectionLoader.tsx`: loader reutilizable para secciones con skeletons y barra institucional.
- `src/middleware.ts`: control de acceso transversal.
- `src/app/(auth)/login/page.tsx`: acceso institucional.
- `src/app/(director)/layout.tsx`: shell común del portal director.
- `src/app/(admin)/layout.tsx`: shell común del portal administrador.
- `src/app/(director)/nueva-salida/page.tsx`: controlador server-side del formulario.
- `src/app/(director)/nueva-salida/loading.tsx`: loader contextual del wizard y preparación del establecimiento.
- `src/app/(director)/mis-salidas/page.tsx`: historial real del director.
- `src/app/(director)/mis-salidas/loading.tsx`: loader contextual del historial y métricas del director.
- `src/app/(admin)/panel/page.tsx`: panel administrativo con filtros y exportaciones.
- `src/app/(admin)/panel/loading.tsx`: loader contextual del panel administrativo y su tabla transversal.
- `src/app/(admin)/panel/auditoria/page.tsx`: auditoría operativa y controles de configuración.
- `src/app/(admin)/panel/whitelist/page.tsx`: gestión de la whitelist de acceso.
- `src/components/branding/PlatformFooter.tsx`: footer reutilizable del portal interno.

## Módulos principales
- [Autenticación y control de acceso](./modules/auth.md)
- [Operación de salidas pedagógicas](./modules/operacion-salidas.md)
- [Administración y exportaciones](./modules/admin.md)
- [APIs y route handlers](./modules/apis-y-routes.md)
- [Infraestructura, datos y seguridad](./modules/infra-y-datos.md)

## Desglose por componentes
- [Índice de componentes](./components/README.md)
- [Wizard de nueva salida](./components/nueva-salida/README.md)
- [Componentes administrativos](./components/admin/README.md)

## Páginas clave
- [Login](./pages/login.md)
- [Nueva salida](./pages/nueva-salida.md)
- [Mis salidas](./pages/mis-salidas.md)
- [Panel administrativo](./pages/panel-admin.md)
- [Gestión de acceso (whitelist)](./pages/whitelist.md)
- [Ruta pública](./pages/ruta-publica.md)

## Estado actual relevante
- El sistema ya opera con datos reales y sin mocks visibles.
- El formulario guarda salidas reales en Supabase.
- El panel admin ya tiene filtros básicos, detalle y exportación.
- La administración ya separa el panel operativo (`/panel`) de la vista de auditoría y controles (`/panel/auditoria`).
- El PDF ya incluye logo institucional, QR y mapa estático de la ruta.
- El admin puede gestionar la whitelist de acceso desde `/panel/whitelist`: altas, activación/desactivación y eliminación de usuarios.
- La interfaz ya quedó normalizada sobre el design system oficial SLEP: shells, tablas, campos, botones, modal administrativo y wizard operativo usan primitivas visuales compartidas en `globals.css`.
- El portal ya usa carga progresiva institucional: el fallback global cubre cambios amplios de navegación y las rutas de mayor peso (`/mis-salidas`, `/nueva-salida`, `/panel`) muestran loaders específicos con skeletons acordes al contenido esperado.
- Las fechas y horas visibles de auditoría y administración ya se formatean pensando en `America/Santiago`.
- Los mapas del portal ya migraron desde `google.maps.Marker`/`MarkerF` hacia `AdvancedMarkerElement` para evitar la API deprecada.
- El visor previo del PDF administrativo usa `iframe` en mismo origen; `X-Frame-Options` quedó en `SAMEORIGIN` para permitir esa revisión sin abrir el documento fuera del portal.
- La ruta pública `/ruta/[id]` sigue pendiente de implementación funcional.

## Regla de iteración recomendada
- Si el cambio es visual o de copy, parte por el archivo de página.
- Si afecta varias vistas o exportaciones, parte por el módulo.
- Si toca roles, sesión, tablas o APIs externas, revisa primero infraestructura y middleware.
- Si toca la whitelist, parte por `src/lib/admin/whitelist.ts` y `src/app/actions/whitelist.ts`.
