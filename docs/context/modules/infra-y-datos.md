# Módulo: Infraestructura, Datos y Seguridad

## Objetivo
Agrupar las piezas transversales que sostienen la aplicación: clientes Supabase, esquema de datos, validaciones, normalización y servicios externos.

## Archivos clave
- `src/lib/supabase/server.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/admin/trips.ts`
- `src/lib/admin/whitelist.ts`
- `src/app/actions/whitelist.ts`
- `src/lib/validations/salida.ts`
- `src/lib/input-normalization.ts`
- `src/lib/rate-limit.ts`
- `src/types/index.ts`
- `supabase/phase-1-schema.sql`
- `supabase/phase-2-eid-schema.sql`
- `supabase/phase-2-salidas-pme-persistence.sql`

## Tablas y vistas relevantes
- `whitelist_usuarios`: control de acceso por correo y rol. Incluye trigger `whitelist_usuarios_normalize_email` que normaliza email en INSERT/UPDATE, e índice único sobre `lower(btrim(email))`.
- `salidas_pedagogicas`: entidad principal de negocio.
- `eid`: catálogo PME consumido por el formulario.
- `ruta_publica`: vista pública proyectada desde `salidas_pedagogicas`.
- `BASE DE DATOS ESCUELAS SLEP`: tabla maestra externa usada para establecimientos. El campo `RBD` es FK en `whitelist_usuarios`.

## Esquema de whitelist_usuarios
```sql
id        uuid        PK default gen_random_uuid()
email     text        NOT NULL UNIQUE (normalizado por trigger)
rol       text        NOT NULL CHECK (rol IN ('director','admin'))
rbd       text        NULL FK → "BASE DE DATOS ESCUELAS SLEP"."RBD"
activo    boolean     DEFAULT true
created_at timestamptz DEFAULT now()
```

## Servicios externos
- Supabase Auth y Postgres.
- Google OAuth vía Supabase.
- Google Directions API.
- Google Static Maps API.
- Google Apps Script (webhook de notificación por correo al director tras registrar una salida). Código en `apps-script/code.gs`. Se comunica mediante `POST` con payload JSON + PDF en base64. Protegido con `WEBHOOK_SECRET` compartido.

## Reglas técnicas importantes
- La lectura de la tabla maestra de escuelas y todas las escrituras sobre `whitelist_usuarios` se hacen con service role (`createAdminClient()`) desde servidor.
- Las mutaciones de whitelist usan server actions (`src/app/actions/whitelist.ts`) con `revalidatePath` para disparar re-render automático de la página.
- El middleware debe fallar de forma segura en Edge.
- La normalización de entrada evita depender de sanitizadores DOM en servidor.
- El rate limit cuenta formularios en la última hora directamente en Supabase.
- La notificación por correo es fire-and-forget: si falla, la salida ya quedó guardada y el error no impacta al usuario.

## Variables de entorno críticas
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `GOOGLE_MAPS_SERVER_KEY`
- `APPS_SCRIPT_WEBHOOK_URL` — URL de despliegue del Apps Script (Ejecutar como: Yo · Acceso: Cualquier persona)
- `APPS_SCRIPT_WEBHOOK_SECRET` — string secreto compartido con `WEBHOOK_SECRET` en `code.gs`; si no está configurado en producción la notificación retorna 503 silenciosamente

## Dependencias con otros módulos
- [Autenticación y control de acceso](./auth.md)
- [Operación de salidas pedagógicas](./operacion-salidas.md)
- [Administración y exportaciones](./admin.md)

## Páginas relacionadas
- [Nueva salida](../pages/nueva-salida.md)
- [Panel administrativo](../pages/panel-admin.md)
- [Gestión de acceso (whitelist)](../pages/whitelist.md)
- [Ruta pública](../pages/ruta-publica.md)
