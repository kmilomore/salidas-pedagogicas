# Página: Login

## Ruta
- `/login`

## Objetivo
Ser el punto de ingreso institucional del portal y preparar al usuario para autenticación y autorización por rol.

## Archivos relacionados
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/login/login-form.tsx`
- `src/components/branding/PortalLogo.tsx`
- `src/app/auth/callback/route.ts`

## Qué hace hoy
- Muestra identidad visual institucional con logo y fondo fotográfico.
- Explica el acceso con cuenta autorizada.
- Inicia OAuth con Google usando Supabase.
- Recibe mensajes de error por query string desde middleware o callback.

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