# Página: Ruta Pública

## Ruta
- `/ruta/[id]`

## Objetivo esperado
Publicar una vista compartible del trayecto sin requerir sesión, con datos acotados y sin exponer información sensible.

## Estado actual
- La ruta existe en el árbol de App Router.
- Hoy la página ejecuta `notFound()` y no tiene implementación funcional.

## Archivos relacionados
- `src/app/ruta/[id]/page.tsx`
- `supabase/phase-1-schema.sql`
- `src/components/pdf/TripSummaryPdf.tsx`

## Dependencias esperadas
- [Administración y exportaciones](../modules/admin.md)
- [Infraestructura, datos y seguridad](../modules/infra-y-datos.md)
- [Contexto general](../app-general.md)

## Notas para implementación futura
- Consumir la vista `ruta_publica` o una consulta equivalente.
- Mostrar trayecto, destino y resumen vial.
- Mantener fuera datos personales y operativos internos.
- Reutilizar el mismo identificador que hoy alimenta PDF y potencial correo.