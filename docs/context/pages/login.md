# Página: Login

## Ruta
- `/login`

## Objetivo
Ser el punto de ingreso institucional del portal y preparar al usuario para autenticación y autorización por rol.

## Archivos relacionados
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/login/login-form.tsx`
- `src/components/branding/PortalLogo.tsx`
- `src/components/branding/PlatformFooter.tsx`
- `src/app/globals.css`
- `src/app/auth/callback/route.ts`

## Qué hace hoy
- Muestra identidad visual institucional con logo y fondo fotográfico.
- Usa el shell de autenticación normalizado del portal (`portal-auth-frame`, `portal-auth-hero`, `portal-auth-panel`) y el footer institucional compartido.
- Explica el acceso con cuenta autorizada.
- Refuerza contraste en títulos, copys y tarjetas del hero con texto blanco de alta legibilidad sobre superficie oscura.
- Inicia OAuth con Google usando Supabase.
- Recibe mensajes de error por query string desde middleware o callback.

## Contrato visual relevante
- La tipografía y los tokens provienen del design system oficial SLEP cargado desde `src/app/layout.tsx`.
- Los botones, tarjetas de apoyo y notas de acceso reutilizan clases globales compartidas en lugar de utilidades ad-hoc por página.

## Entradas y salidas
- Entrada: usuario no autenticado o sesión inválida.
- Salida esperada: Google OAuth y redirección posterior al callback.

## Dependencias
- [Autenticación y control de acceso](../modules/auth.md)
- [Contexto general](../app-general.md)

## Seguridad aplicada
- `?message=` en query string se valida contra whitelist de 5 valores predefinidos en `page.tsx`; cualquier valor externo se descarta silenciosamente.
- El parámetro `next` del callback se restringe a paths relativos (`/...`); URLs absolutas o protocol-relative (`//`) se ignoran y caen a `/`.
- OAuth no solicita `access_type: offline` ni `prompt: consent`; Google no emite refresh tokens.

## Riesgos residuales
- `NEXT_PUBLIC_APP_URL` incorrecta rompe el `redirectTo` OAuth.
- Usuario autenticado pero no autorizado en whitelist resulta en acceso denegado.
- `/ruta/[id]` es pública por hardcode en middleware — cualquier implementación futura nace desprotegida por defecto.