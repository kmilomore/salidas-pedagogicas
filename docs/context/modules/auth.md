# Módulo: Autenticación y Control de Acceso

## Objetivo
Controlar el ingreso institucional con Google, verificar whitelist y resolver acceso por rol.

## Archivos clave
- `src/middleware.ts`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/login/login-form.tsx`
- `src/app/auth/callback/route.ts`
- `src/app/(auth)/acceso-denegado/page.tsx`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`

## Flujo del módulo
1. `/login` renderiza la pantalla de acceso institucional.
2. `login-form.tsx` inicia OAuth con Supabase y Google.
3. `/auth/callback` intercambia el `code` por sesión.
4. `src/middleware.ts` valida sesión y busca el correo en `whitelist_usuarios`.
5. Según el rol, redirige a `/dashboard` o `/panel`.
6. Si el correo no está autorizado, redirige a `/acceso-denegado`.

## Reglas de acceso actuales
- `/dashboard`, `/nueva-salida` y `/mis-salidas`: accesibles por `director` y `admin`.
- `/panel`: accesible solo por `admin`.
- `/ruta/[id]`: pública a nivel de routing, pero hoy no implementada.

## Dependencias con otros módulos
- [Operación de salidas pedagógicas](./operacion-salidas.md): depende del rol para abrir el formulario.
- [Administración y exportaciones](./admin.md): depende de acceso `admin`.
- [Infraestructura, datos y seguridad](./infra-y-datos.md): provee clientes Supabase y manejo de entorno.

## Riesgos típicos
- `NEXT_PUBLIC_APP_URL` mal configurada rompe retornos OAuth.
- Faltas en `whitelist_usuarios` generan acceso denegado aunque la autenticación sea válida.
- Si faltan variables Supabase, el middleware debe degradar sin romper Edge.

## Páginas relacionadas
- [Login](../pages/login.md)
- [Panel administrativo](../pages/panel-admin.md)
- [Nueva salida](../pages/nueva-salida.md)