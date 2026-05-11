# Contexto del Portal

Este directorio organiza el contexto funcional y técnico del portal para iterar por slices pequeños sin perder el mapa general.

## Punto de partida
- [Contexto general](./app-general.md)

## Contextos por módulo
- [Autenticación y control de acceso](./modules/auth.md)
- [Operación de salidas pedagógicas](./modules/operacion-salidas.md)
- [Administración y exportaciones](./modules/admin.md)
- [APIs y route handlers](./modules/apis-y-routes.md)
- [Infraestructura, datos y seguridad](./modules/infra-y-datos.md)

## Contextos por componentes
- [Índice de componentes](./components/README.md)
- [Wizard de nueva salida](./components/nueva-salida/README.md)

## Contextos por página
- [Login](./pages/login.md)
- [Nueva salida](./pages/nueva-salida.md)
- [Mis salidas](./pages/mis-salidas.md)
- [Panel administrativo](./pages/panel-admin.md)
- [Ruta pública](./pages/ruta-publica.md)

## Cómo usar estos archivos
- Empieza por [Contexto general](./app-general.md) para ubicar roles, flujos y dependencias.
- Entra luego al módulo correspondiente para entender reglas compartidas, acciones server-side y componentes.
- Baja después al archivo de página para iterar UI, validación, datos y estados de una vista concreta.
- Si una tarea cruza varias pantallas, usa los enlaces entre módulos y páginas para seguir el flujo completo.