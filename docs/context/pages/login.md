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

## Riesgos frecuentes
- `NEXT_PUBLIC_APP_URL` incorrecta.
- Usuario autenticado pero no autorizado en whitelist.
- Mensajes de error poco claros si el callback falla.