# Página: Nueva Salida

## Ruta
- `/nueva-salida`

## Objetivo
Concentrar la creación completa de una salida pedagógica con datos PME, destino, ruta, participantes y persistencia.

## Archivos relacionados
- `src/app/(director)/nueva-salida/page.tsx`
- `src/components/nueva-salida/NuevaSalidaWizard.tsx`
- `src/app/actions/maps.ts`
- `src/app/actions/trips.ts`

## Qué hace hoy
- Resuelve rol y establecimiento antes de renderizar el wizard.
- Permite a `admin` cambiar el establecimiento visible.
- Carga el catálogo PME desde `public.eid`.
- Calcula rutas reales con Google Maps.
- Guarda salidas reales en Supabase.

## Dependencias directas
- [Operación de salidas pedagógicas](../modules/operacion-salidas.md)
- [Infraestructura, datos y seguridad](../modules/infra-y-datos.md)
- [Autenticación y control de acceso](../modules/auth.md)

## Estados relevantes
- Usuario sin whitelist activa.
- Usuario sin RBD o sin establecimiento válido.
- Escuela sin coordenadas operativas.
- Ruta calculada correctamente.
- Error controlado de Google Maps o de persistencia.

## Conexiones
- Después del guardado, impacta [Mis salidas](./mis-salidas.md) y [Panel administrativo](./panel-admin.md).