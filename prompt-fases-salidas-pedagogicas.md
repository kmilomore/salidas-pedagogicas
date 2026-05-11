# PROMPT DE DESARROLLO POR FASES
# Aplicación "Salidas Pedagógicas" — SLEP Colchagua
# Stack: Next.js 14 · TypeScript · Tailwind CSS · Supabase · Vercel

---

## INSTRUCCIÓN GENERAL AL AGENTE

Eres un desarrollador senior especializado en Next.js, TypeScript, Supabase y Google Maps API.
Vas a construir esta aplicación **fase por fase**.

**REQUISITO OPERATIVO NO NEGOCIABLE:** la implementación, instalación, configuración y despliegue deben quedar **listas para producción**. No se permiten datos mock, seeds ficticios, credenciales inventadas, respuestas simuladas, componentes de demo ni contenido de ejemplo que no corresponda a datos reales del proyecto. Si falta un dato sensible o de negocio, se debe dejar la integración preparada y solicitar el dato real al usuario, sin inventarlo.

**REGLA NO NEGOCIABLE DE CONTENIDO VISIBLE:** no puede quedar ningun texto demo, placeholder, checklist de desarrollo, mensaje de "fase", copy de staging, texto de "proximamente", ni referencias a que algo sera implementado despues dentro de la interfaz visible al usuario final. Si una funcionalidad aun no existe, debe mostrarse un estado vacio real, un `notFound()`, o directamente no exponerse en navegacion, pero nunca texto de maqueta o roadmap.

**REGLA CRÍTICA:** Al terminar cada fase, DEBES:
1. Listar exactamente qué archivos creaste o modificaste.
2. Hacer las preguntas de validación indicadas al final de cada fase.
3. NO avanzar a la siguiente fase hasta recibir confirmación explícita del usuario.

## ESTADO ACTUAL DEL REPOSITORIO

### Fase 1
- Completada a nivel de código base.
- Ya existe scaffolding Next.js 14 con TypeScript, Tailwind y App Router.
- Ya existe integración base con Supabase SSR.
- Ya existe login con Google vía Supabase Auth.
- Ya existe callback OAuth.
- Ya existe middleware de autenticación, whitelist y redirección por rol.
- Ya existen layouts base para director y administrador.
- Ya existe SQL de fase 1 en `supabase/phase-1-schema.sql`.

### Fase 2
- Implementada en código y validada localmente con credenciales reales.
- Ya están instaladas las dependencias de Google Maps, React Hook Form y polyline.
- Ya existe `src/app/actions/maps.ts` para cálculo de ruta con Google Directions API desde servidor.
- Ya existe el flujo de `nueva-salida` con stepper, paso 1, paso 2, autocomplete, mapa y resumen de ruta.
- El paso 2 ya soporta flujo de un destino o multiples destinos, con cálculo de ida, vuelta y total usando Google Directions con waypoints y regreso al establecimiento.
- El mapa ya diferencia visualmente cada tramo del circuito y el retorno mediante colores por segmento.
- El establecimiento de origen ya se resuelve automáticamente desde la whitelist y la tabla maestra de escuelas.
- Los administradores ya pueden abrir el mismo formulario operativo que usan los directores y cambiar el establecimiento dentro del formulario.
- Si el usuario es administrador y entra al formulario compartido, ya existe un botón visible para volver al panel administrativo.
- Ya existe cierre de sesión operativo en los layouts autenticados.
- Ya existe lectura de la tabla maestra mediante `SUPABASE_SERVICE_ROLE_KEY` para evitar bloqueos por permisos al cargar establecimientos desde administración.
- Ya se validó localmente el cálculo real de rutas contra Google Maps con una `GOOGLE_MAPS_SERVER_KEY` funcional.
- Ya se amplió el ancho útil del portal en director, admin, login y pantallas principales para mejorar la lectura en escritorio y rangos intermedios.
- Ya se centralizó una paleta reutilizable de colores para portal, estados y rutas en `globals.css` y `tailwind.config.ts`.
- Los headers autenticados ya muestran una etiqueta visual del rol activo para que el usuario identifique de inmediato si navega como director o administrador.
- Sigue pendiente validar el mismo flujo en Vercel con las variables de entorno de producción correctamente cargadas.

### Hallazgos operativos verificados
- La tabla maestra de escuelas guarda `LATITUD` y `LONGITUD` como texto y en varios casos usa formato con comas múltiples, por ejemplo `-34,709,095`; el parser del proyecto ya fue ajustado para normalizar ese formato antes de convertirlo a número.
- Para calcular la ruta no se debe bloquear una escuela real por faltar `DIRECTOR/A`, `CORREO ELECTRÓNICO` o `DIRECCIÓN`; el origen operativo de Fase 2 solo requiere RBD, nombre, comuna y coordenadas válidas.
- La `GOOGLE_MAPS_SERVER_KEY` no puede tener restricción por `HTTP referrers` si se usa desde el servidor; en ese caso Google responde `REQUEST_DENIED`.
- La acción `calcularRuta` ya no rompe el render con un 500 opaco cuando Google falla; ahora devuelve errores controlados para mostrar el motivo real en UI.
- El loader de cálculo de ruta ya fue mejorado para mostrar un estado visual más sólido durante la consulta a Google Maps.
- Varias pantallas compartían clases repetidas de navegación y contenedores; ya se empezó a consolidar esa base en utilidades globales reutilizables para reducir divergencia visual y deuda de mantenimiento.

### Restricción vigente para todas las fases
- No reemplazar datos reales por mocks para destrabar desarrollo.
- No agregar seeds de prueba con correos ficticios.
- No dejar placeholders funcionales en entregables que se marquen como listos.
- No dejar texto demo, texto de fase, checklist tecnico, copy de desarrollo o mensajes de roadmap visibles en produccion.
- Si falta una API key, secreto, logo oficial, dominio o webhook real, dejar la integración preparada y documentar exactamente qué falta.

---

## CONTEXTO DEL PROYECTO

Aplicación web institucional para **SLEP Colchagua** (Servicio Local de Educación Pública, Chile).
Permite a directores de establecimientos educacionales registrar salidas pedagógicas,
con cálculo automático de rutas via Google Maps, generación de PDF y enlace público compartible.

---

## CREDENCIALES Y ACCESO

```env
NEXT_PUBLIC_SUPABASE_URL=https://vnxtgqjejjaugixajcfv.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_0Wnmd8JeIqTvh2ld-ekpDA_qX59nEGu
```

> Estas credenciales deben coincidir siempre con el entorno real del repositorio. Si `.env.local` cambia, este documento debe actualizarse para no mezclar proyectos.

---

## TABLA EXISTENTE EN SUPABASE (NO modificar, solo leer)

```sql
-- Esta tabla ya existe. Es de solo lectura para la aplicación.
-- Se usará como fuente de datos de los establecimientos.
create table public."BASE DE DATOS ESCUELAS SLEP" (
  "N°"                          bigint null,
  "RBD"                         text null,
  "NOMBRE ESTABLECIMIENTO"      text null,
  "COMUNA"                      text null,
  "REPRESENTANTE CONSEJO ESCOLAR" text null,
  "CORREO REPRESENTANTE"        text null,
  "ASESOR UATP"                 text null,
  "CORREO ASESOR"               text null,
  "DIRECCIÓN"                   text null,
  "COMUNA_1"                    text null,
  "RURAL/URBANO"                text null,
  "DIRECTOR/A"                  text null,
  "RUT"                         text null,
  "TELEFONO FIJO/ANEXOS"        text null,
  "TELEFONO CELULAR"            text null,
  "CORREO ELECTRÓNICO"          text null,
  "CORREO SUBROGANTE"           text null,
  "FUNCIONARIO SUBROGANTE POR LM" text null,
  "CELULAR"                     text null,
  "OBSERVACIONES"               text null,
  "TIPO"                        text null,
  "NOMBRE PRESIDENTE CGPMA"     text null,
  "CORREO"                      text null,
  "TELEFONO"                    bigint null,
  "OBSERVACION CGPMA"           text null,
  "LATITUD"                     text null,
  "LONGITUD"                    text null,
  "ALTITUD"                     text null
);
```

**Campos clave que usará la app:**
| Campo original | Uso en la app |
|---|---|
| `"RBD"` | Identificador único del establecimiento |
| `"NOMBRE ESTABLECIMIENTO"` | Nombre visible |
| `"COMUNA"` | Comuna del establecimiento |
| `"DIRECTOR/A"` | Nombre del director (para verificar whitelist) |
| `"CORREO ELECTRÓNICO"` | Email del director (clave para whitelist) |
| `"LATITUD"` / `"LONGITUD"` | Coordenadas de origen para calcular ruta |
| `"DIRECCIÓN"` | Dirección del establecimiento |

---

# ═══════════════════════════════════════
# FASE 1 — Scaffolding y configuración base
# ═══════════════════════════════════════

## Objetivo
Crear el proyecto Next.js con toda la configuración base, conexión a Supabase,
autenticación con Google, middleware de whitelist y las rutas principales base.

## Tareas

### 1.1 Inicializar el proyecto
```bash
npx create-next-app@latest salidas-pedagogicas \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### 1.2 Instalar dependencias de esta fase
```bash
npm install \
  @supabase/supabase-js \
  @supabase/ssr \
  zod \
  dompurify \
  @types/dompurify
```

### 1.3 Variables de entorno — crear `.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=https://vnxtgqjejjaugixajcfv.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_0Wnmd8JeIqTvh2ld-ekpDA_qX59nEGu
SUPABASE_SERVICE_ROLE_KEY=        # El usuario completará esto desde Supabase Dashboard
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 1.4 Estructura de carpetas a crear
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # Página de login con Google
│   │   └── acceso-denegado/
│   │       └── page.tsx          # Página de acceso denegado
│   ├── (director)/
│   │   ├── layout.tsx            # Layout con nav del director
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard base operativo
│   │   ├── nueva-salida/
│   │   │   └── page.tsx          # Formulario multi paso desde Fase 2
│   │   └── mis-salidas/
│   │       └── page.tsx          # Vista base
│   ├── (admin)/
│   │   ├── layout.tsx            # Layout con nav de admin
│   │   └── panel/
│   │       └── page.tsx          # Panel base operativo
│   ├── ruta/
│   │   └── [id]/
│   │       └── page.tsx          # Ruta pública real o notFound hasta su implementación
│   ├── layout.tsx
│   └── page.tsx                  # Redirect a /login
├── lib/
│   └── supabase/
│       ├── client.ts             # createBrowserClient
│       ├── server.ts             # createServerClient
│       └── middleware.ts         # createMiddlewareClient
├── middleware.ts                 # Protección de rutas + whitelist
└── types/
    └── index.ts                  # Tipos base
```

### 1.5 Crear tablas nuevas en Supabase (ejecutar en SQL Editor)

**Regla de producción para esta fase:** cualquier seed permitido debe usar únicamente datos institucionales reales. No inventar administradores, establecimientos, correos ni RBD de ejemplo.

```sql
-- Tabla de usuarios autorizados (whitelist)
CREATE TABLE IF NOT EXISTS public.whitelist_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('director', 'admin')),
  rbd TEXT REFERENCES public."BASE DE DATOS ESCUELAS SLEP"("RBD"),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de salidas pedagógicas
CREATE TABLE IF NOT EXISTS public.salidas_pedagogicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  director_id UUID NOT NULL REFERENCES auth.users(id),
  rbd TEXT NOT NULL,

  -- Datos del viaje
  fecha DATE NOT NULL,
  hora_salida TIME NOT NULL,
  hora_regreso TIME,
  objetivo TEXT NOT NULL,
  actividad TEXT NOT NULL,

  -- Destino (solo válido si viene de Google Places)
  lugar_nombre TEXT NOT NULL,
  lugar_direccion TEXT NOT NULL,
  lugar_lat DECIMAL(10, 8) NOT NULL,
  lugar_lng DECIMAL(11, 8) NOT NULL,
  lugar_place_id TEXT NOT NULL,
  lugar_comuna TEXT NOT NULL,
  lugar_region TEXT NOT NULL,

  -- Ruta calculada
  distancia_km DECIMAL(8, 2) NOT NULL,
  duracion_minutos INTEGER NOT NULL,
  ruta_polyline TEXT NOT NULL,
  ruta_resumen TEXT NOT NULL,
  ruta_imagen_url TEXT,

  -- Participantes
  cantidad_estudiantes INTEGER NOT NULL CHECK (cantidad_estudiantes > 0),
  cantidad_apoderados INTEGER NOT NULL DEFAULT 0,
  funcionarios JSONB NOT NULL DEFAULT '[]',

  -- Trazabilidad
  pdf_url TEXT,
  email_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Vista pública (sin datos sensibles) para el enlace compartible
CREATE OR REPLACE VIEW public.ruta_publica AS
  SELECT
    id, lugar_nombre, lugar_direccion,
    lugar_lat, lugar_lng, lugar_comuna, lugar_region,
    distancia_km, duracion_minutos,
    ruta_polyline, ruta_resumen, ruta_imagen_url,
    fecha, rbd
  FROM public.salidas_pedagogicas;

GRANT SELECT ON public.ruta_publica TO anon;

-- RLS
ALTER TABLE public.salidas_pedagogicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whitelist_usuarios ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_user_rol()
RETURNS TEXT AS $$
  SELECT rol FROM public.whitelist_usuarios
  WHERE email = auth.jwt() ->> 'email' AND activo = true;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "director_select_own" ON public.salidas_pedagogicas
  FOR SELECT USING (director_id = auth.uid() AND public.get_user_rol() = 'director');

CREATE POLICY "director_insert_own" ON public.salidas_pedagogicas
  FOR INSERT WITH CHECK (director_id = auth.uid() AND public.get_user_rol() = 'director');

CREATE POLICY "admin_all" ON public.salidas_pedagogicas
  FOR ALL USING (public.get_user_rol() = 'admin');

CREATE POLICY "whitelist_self_read" ON public.whitelist_usuarios
  FOR SELECT USING (email = auth.jwt() ->> 'email');
```

### 1.6 Middleware de autenticación y whitelist

```typescript
// src/middleware.ts
// - Excluir: /ruta/*, /login, /acceso-denegado, /_next, /favicon
// - Para rutas protegidas: verificar sesión → verificar whitelist → redirigir por rol
// - director → /dashboard
// - admin → /panel
// - no whitelist → /acceso-denegado
```

### 1.7 Página de login
- Botón "Ingresar con Google" usando Supabase Auth
- Diseño institucional: azul SLEP (#1B4F8A), sin usar branding ficticio
- Tipografía: Plus Jakarta Sans + DM Sans (Google Fonts)
- Mensaje claro si el acceso es denegado

## Estado de implementación de Fase 1

- Implementada en el repositorio actual.
- Si se detecta una diferencia entre este documento y el código, prevalece el objetivo de producción: corregir el código o actualizar este documento, pero no introducir mocks.

## ✅ PREGUNTAS DE VALIDACIÓN — FASE 1

Antes de continuar a la Fase 2, responde:

1. **¿Ya tienes la `SUPABASE_SERVICE_ROLE_KEY`?**  
   (Se encuentra en Supabase Dashboard → Settings → API → service_role)

2. **¿Ya configuraste Google OAuth en Supabase?**  
   (Supabase Dashboard → Authentication → Providers → Google)  
   ¿Tienes el Client ID y Client Secret de Google Cloud Console?

3. **¿Quieres que el login redirija directamente desde la raíz `/` hacia `/login`,  
   o prefieres una landing page institucional con el botón de ingreso?**

4. **¿Cuántos administradores necesitas en la whitelist para las pruebas iniciales?**  
   ¿Puedes proveer sus emails institucionales reales ahora para incluirlos en el seed?

5. **¿El correo del director en la whitelist debe coincidir exactamente con  
   `"CORREO ELECTRÓNICO"` de la tabla de escuelas, o puede ser diferente?**

---

# ═══════════════════════════════════════
# FASE 2 — Formulario Paso 1 y 2 (Google Maps)
# ═══════════════════════════════════════

## Objetivo
Construir el formulario de salida pedagógica con el stepper visual,
los primeros dos pasos funcionales, y la integración completa con Google Maps.

**Criterio de producción para esta fase:** el formulario debe funcionar contra Google Maps real y contra datos reales del establecimiento del director. No se permite autocomplete falso, rutas simuladas, mapas estáticos locales ni respuestas hardcodeadas.

## Dependencias a instalar
```bash
npm install \
  @react-google-maps/api \
  @mapbox/polyline \
  @types/mapbox__polyline \
  react-hook-form \
  @hookform/resolvers \
  use-places-autocomplete \
  date-fns
```

## Variables de entorno a agregar
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=    # Places API + Maps JS API (cliente)
GOOGLE_MAPS_SERVER_KEY=             # Directions API + Static Maps API (servidor)
```

**Estado real actual de instalación y configuración:**
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: ya configurada localmente y utilizada por el autocomplete y el mapa.
- `GOOGLE_MAPS_SERVER_KEY`: ya validada localmente contra Google Directions API.
- `SUPABASE_SERVICE_ROLE_KEY`: requerida para cargar establecimientos desde administración leyendo la tabla maestra real.
- `NEXT_PUBLIC_APP_URL`: debe mantenerse alineada con el dominio real de Vercel para evitar redirecciones a localhost.

## Tareas

**Nota de estado:** las tareas 2.1 a 2.7 ya quedaron implementadas en el repositorio actual. Lo pendiente en esta fase no es de desarrollo base, sino de validación funcional con credenciales reales, navegación en navegador y ajuste fino según reglas de negocio finales.

### 2.1 Componente `Stepper.tsx`
- Indicador visual de 3 pasos en la parte superior
- Paso activo resaltado, pasos completados con check verde
- Botones "Anterior" / "Siguiente" / "Enviar"
- "Siguiente" deshabilitado si el paso actual tiene errores de validación
- Estado actual: implementado

### 2.2 Paso 1 del formulario — `StepDatosViaje.tsx`
Campos:
- `fecha` (date picker, no fechas anteriores a hoy)
- `hora_salida` (time picker)
- `hora_regreso` (time picker, opcional)
- `objetivo` (textarea, mín. 10 chars)
- `actividad` (input text, mín. 5 chars)
- Estado actual: implementado

### 2.3 Componente `LugarAutocomplete.tsx` — Paso 2
- Input con debounce 300ms → Google Places Autocomplete
- Bias geográfico: región O'Higgins (lat: -34.5, lng: -71.0, radius: 150km)
- Al seleccionar: llamar Places Details → extraer lat, lng, `locality` (comuna),
  `administrative_area_level_1` (región)
- Mostrar badge verde de confirmación
- Campo guardián: `lugar_place_id` (solo se llena al seleccionar del dropdown)
- Botón "Cambiar lugar" para resetear
- Estado actual: implementado y validado localmente con Google Places real

### 2.4 Server Action `calcularRuta` — `src/app/actions/maps.ts`
```typescript
// Recibe: { origen: {lat, lng}, destino: {lat, lng} }
// Llama a Google Directions API con GOOGLE_MAPS_SERVER_KEY (nunca al cliente)
// Retorna: { distancia_km, duracion_minutos, polyline, resumen }
// NUNCA exponer GOOGLE_MAPS_SERVER_KEY al bundle del cliente
```
- Estado actual: implementado y validado localmente con `GOOGLE_MAPS_SERVER_KEY` real
- Hallazgo aplicado: la action devuelve errores controlados cuando Google responde error, para evitar 500 opacos en producción

### 2.5 Componente `MapaRuta.tsx`
- Aparece con animación slide-down al confirmar el lugar
- Pin rojo: establecimiento de origen (coordenadas desde "BASE DE DATOS ESCUELAS SLEP")
- Pin azul: destino seleccionado
- Polyline decodificado con `@mapbox/polyline` (color: #1B4F8A, grosor: 4px)
- `fitBounds` automático
- Card superpuesta con: nombre ruta, distancia, duración, vía, región/comuna destino
- Estado actual: implementado y acompañado por loader visual mejorado durante el cálculo de ruta

### 2.6 Card `DistanciaResumen.tsx`
```
✅ Destino confirmado
📍 [Lugar], [Región]
🛣️  [X] km desde [Nombre Establecimiento]
⏱️  Tiempo estimado: [Xh Xmin]
🗺️  Vía: [resumen de ruta]
```
- Estado actual: implementado

### 2.7 Paso 2 del formulario — `StepDestino.tsx`
- `LugarAutocomplete.tsx`
- Al confirmar: disparar `calcularRuta` → mostrar `MapaRuta.tsx` + `DistanciaResumen.tsx`
- Estado de carga: loader visual institucional con feedback de progreso durante la consulta de Google Maps
- Campos hidden en el formulario: todos los datos de ruta generados por el servidor
- Botón "Siguiente" deshabilitado hasta que `lugar_place_id` esté presente
- Estado actual: implementado

### 2.8 Acceso administrativo al formulario operativo
- El rol `admin` puede entrar a rutas de director cuando corresponde a supervisión operativa del formulario.
- Administración puede abrir `/nueva-salida`, seleccionar un establecimiento real y revisar el mismo flujo que usa un director.
- La lista de establecimientos para administración se obtiene desde la tabla maestra real usando cliente server-side con service role.
- Estado actual: implementado

## Pendientes reales para cerrar Fase 2

- Replicar en Vercel las mismas variables reales que ya fueron validadas localmente (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_SERVER_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`).
- Probar en navegador el flujo completo de paso 1 y paso 2 en producción con un director real y con un administrador.
- Confirmar que el establecimiento se detecta automáticamente por email y no requiere selector manual.
- Confirmar que el bias de 150 km es suficiente o ajustarlo según el alcance real de las salidas.
- Validar si el mapa debe quedar interactivo o restringido a solo visualización.
- Ajustar cualquier detalle visual o de negocio detectado en esa prueba, sin introducir mocks ni desactivar validaciones.

## Estado de implementación de Fase 2

- Ya implementado en código: `Stepper.tsx`, `StepDatosViaje.tsx`, `LugarAutocomplete.tsx`, `MapaRuta.tsx`, `DistanciaResumen.tsx`, `StepDestino.tsx`, `NuevaSalidaWizard.tsx` y `src/app/actions/maps.ts`.
- Ya instaladas las dependencias de esta fase.
- Ya configuradas localmente las variables `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` y `GOOGLE_MAPS_SERVER_KEY` con credenciales reales de trabajo.
- Ya implementada la detección automática del establecimiento de origen desde `whitelist_usuarios` y la tabla `BASE DE DATOS ESCUELAS SLEP`.
- Ya implementado el acceso administrativo al mismo formulario operativo, con selector de establecimiento real.
- Ya corregido el parseo de coordenadas para formatos de tabla maestra como `-34,709,095`.
- Ya validada localmente una ruta real con Google Directions API.
- Pendiente de validación externa: prueba end-to-end en navegador sobre Vercel con las variables productivas definitivas.
- Fase 3 ya quedó implementada sobre el wizard real: participantes, funcionarios, validación, rate limiting condicional por Upstash, sanitización server-side y pantalla de éxito.

## ✅ PREGUNTAS DE VALIDACIÓN — FASE 2

1. **¿Ya replicaste en Vercel las mismas variables que funcionan localmente?**  
   Deben existir al menos `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_SERVER_KEY`, `SUPABASE_SERVICE_ROLE_KEY` y `NEXT_PUBLIC_APP_URL`.

2. **Al cargar el formulario, ¿el sistema debe detectar automáticamente  
   qué establecimiento es del director según su email en la whitelist,  
   o el director debe seleccionar su establecimiento de una lista?**

3. **¿El bias geográfico de búsqueda de 150km desde O'Higgins es suficiente,  
   o los directores podrían realizar salidas más lejos (Santiago, por ejemplo)?**

4. **¿El mapa debe mostrar solo la ruta principal sugerida por Google,  
   o quieres mostrar también rutas alternativas para que el director elija?**

5. **¿Quieres que el mapa sea interactivo (el director puede hacer zoom/pan)  
   o solo de visualización (no interactivo)?**

---

# ═══════════════════════════════════════
# FASE 3 — Formulario Paso 3 y envío
# ═══════════════════════════════════════

## Objetivo
Completar el formulario con el paso de participantes, la lista dinámica de funcionarios,
la validación completa con Zod y el Server Action de creación de la salida.

## Estado actual validado en el repositorio
- `FuncionariosList.tsx` ya existe con filas dinámicas, mínimo una fila, validación de RUT y eliminación controlada.
- `StepParticipantes.tsx` ya existe e incorpora `cantidad_estudiantes`, `cantidad_apoderados` y lista de funcionarios.
- `src/lib/validations/salida.ts` ya centraliza la validación del payload completo de los 3 pasos.
- `src/lib/rate-limit.ts` ya aplica límite de 10 formularios por hora por usuario cuando `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` están configuradas.
- El guardado final se resuelve hoy en `src/app/actions/trips.ts` mediante `guardarSalidaPedagogica`, con sanitización server-side, validación Zod e insert en `salidas_pedagogicas` con `estado = 'enviada'`.
- Ya existe pantalla de éxito en `src/app/(director)/nueva-salida/exito/page.tsx`.
- Validación técnica confirmada: `npm run build` exitoso tras integrar Fase 3.

## Dependencias a instalar
```bash
npm install \
  @upstash/ratelimit \
  @upstash/redis
```

## Variables de entorno a agregar
```env
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

## Tareas

### 3.1 Componente `FuncionariosList.tsx`
- Lista dinámica con botón "Agregar funcionario"
- Cada fila: Nombre completo | RUT | Cargo
- Validación RUT chileno en tiempo real (algoritmo dígito verificador)
- Botón eliminar por fila (mínimo 1 fila siempre presente)
- Animación de entrada/salida (Tailwind transition)

### 3.2 Paso 3 del formulario — `StepParticipantes.tsx`
- `cantidad_estudiantes` (número, mín. 1)
- `cantidad_apoderados` (número, mín. 0)
- `FuncionariosList.tsx` (mín. 1 funcionario)

### 3.3 Schema Zod completo — `src/lib/validations/salida.ts`
```typescript
// Incluir todos los campos de los 3 pasos.
// Los campos de ruta (polyline, place_id, etc.) son z.string().min(1)
// y se validan en el servidor — si vienen vacíos, rechazar el submit.
```

### 3.4 Rate Limiting — `src/lib/rate-limit.ts`
- 10 formularios por hora por usuario
- Retornar error claro si se supera el límite
- Si Upstash no está configurado aún, el helper no rompe la aplicación y deja pasar el guardado para no bloquear ambientes incompletos.

### 3.5 Server Action `crearSalida` — `src/app/actions/trips.ts`
```typescript
// 1. Verificar sesión y rol (director) desde el servidor
// 2. Aplicar rate limiting por userId
// 3. Sanitizar inputs con DOMPurify (server-side)
// 4. Validar con Zod schema
// 5. INSERT en salidas_pedagogicas
// 6. Retornar { id, success } → el cliente redirige a la pantalla de éxito
// (Los pasos de PDF, imagen y correo van en Fase 4)
```

### 3.6 Pantalla de éxito — `src/app/(director)/nueva-salida/exito/page.tsx`
- Mensaje de confirmación visual (check animado)
- Botones: "Ver mis salidas" | "Registrar otra salida"
- (El botón "Descargar PDF" y "Copiar enlace de ruta" se añaden en Fase 4)

## ✅ PREGUNTAS DE VALIDACIÓN — FASE 3

1. **¿Necesitas Upstash para el rate limiting, o prefieres una alternativa  
   más simple para la fase de pruebas (como un contador en Supabase)?**

2. **Para el campo "Cargo" del funcionario, ¿debe ser texto libre  
   o un dropdown con opciones predefinidas?**  
   (Ej: Director/a, Docente, Asistente de la educación, Paradocente)

3. **¿El formulario debe poder guardarse como borrador entre pasos,  
   o solo se guarda al hacer submit completo?**

4. **¿Necesitas algún campo adicional que no esté contemplado?**  
   (Ej: nivel educativo de los estudiantes, asignatura relacionada,  
   nombre del evento o actividad oficial)

5. **¿La pantalla de éxito debe mostrar un resumen de lo que se registró,  
   o solo el mensaje de confirmación?**

---

# ═══════════════════════════════════════
# FASE 4 — PDF, imagen del mapa y correo
# ═══════════════════════════════════════

## Objetivo
Generar el comprobante PDF con el mapa incrustado, subir los archivos a Supabase Storage,
y enviar el correo al director vía Google Apps Script.

## Dependencias a instalar
```bash
npm install \
  @react-pdf/renderer \
  qrcode \
  @types/qrcode
```

## Tareas

### 4.1 Imagen estática del mapa — `src/app/api/mapa-estatico/route.ts`
```typescript
// Recibe: { polyline, origen_lat, origen_lng, dest_lat, dest_lng }
// Construye URL de Static Maps API con GOOGLE_MAPS_SERVER_KEY
// Descarga el PNG y lo sube a Supabase Storage bucket 'mapas'
// Retorna: { url }
// Static Maps URL pattern:
// https://maps.googleapis.com/maps/api/staticmap
//   ?size=800x400
//   &path=color:0x1B4F8Aff|weight:4|enc:[POLYLINE]
//   &markers=color:red|[ORIGEN_LAT],[ORIGEN_LNG]
//   &markers=color:blue|[DEST_LAT],[DEST_LNG]
//   &key=[GOOGLE_MAPS_SERVER_KEY]
```

### 4.2 Componente PDF — `src/components/pdf/ComprobantePDF.tsx`
Secciones del PDF (usar @react-pdf/renderer):
1. Header: Logo SLEP Colchagua + "Comprobante de Salida Pedagógica" + N° correlativo
2. Datos establecimiento: Nombre, RBD, Comuna, Dirección
3. Datos del viaje: Fecha, horas, objetivo, actividad
4. Destino: Nombre lugar, dirección, comuna, región
5. **Imagen del mapa** (PNG de Static Maps, 100% ancho)
6. Datos de ruta: distancia km · duración · vía
7. Tabla de participantes: funcionarios (nombre, RUT, cargo) + n° estudiantes + n° apoderados
8. Footer: timestamp de registro + QR apuntando a `[APP_URL]/ruta/[UUID]`

### 4.3 Actualizar Server Action `crearSalida`
```typescript
// Después del INSERT exitoso:
// 1. POST a /api/mapa-estatico → obtener ruta_imagen_url → UPDATE BD
// 2. Generar PDF con @react-pdf/renderer (pasar ruta_imagen_url)
// 3. Subir PDF a Storage bucket 'comprobantes' → UPDATE pdf_url en BD
// 4. POST a /api/enviar-correo → UPDATE email_enviado = true
```

### 4.4 Webhook de correo — `src/app/api/enviar-correo/route.ts`
```typescript
// POST hacia APPS_SCRIPT_WEBHOOK_URL
// Payload: { destinatario, asunto, datos: { ...resumen }, secret }
// datos incluye: pdf_url, ruta_url ([APP_URL]/ruta/[UUID]), mapa_imagen_url
```

### 4.5 Actualizar pantalla de éxito
- Botón "Descargar PDF" (URL firmada de Supabase Storage)
- Botón "Copiar enlace de ruta" (copia `[APP_URL]/ruta/[UUID]` al portapapeles)
- Mensaje "Se envió un comprobante a tu correo institucional"

## Variables de entorno a agregar
```env
APPS_SCRIPT_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
APPS_SCRIPT_SECRET=
```

## ✅ PREGUNTAS DE VALIDACIÓN — FASE 4

1. **¿Ya tienes el Google Apps Script creado y desplegado como Web App?**  
   ¿Tienes la URL del script? ¿El correo de envío será tu correo institucional SLEP?

2. **¿Tienes el logo de SLEP Colchagua en formato PNG para incluirlo en el PDF?**  
   (Debe usarse el logo oficial real. Si aun no existe el archivo final, detener la entrega visual de produccion y solicitarlo.)

3. **¿El PDF debe tener número correlativo automático (001, 002, 003...),  
   o puede usar los primeros 8 caracteres del UUID como identificador?**

4. **¿Quieres que el Storage de Supabase sea privado (URL firmada que expira)  
   o público para los buckets de mapas y comprobantes?**  
   (Privado es más seguro; público es más simple para compartir)

5. **Si falla el envío del correo, ¿la salida igual debe quedar registrada  
   y mostrar éxito al director, o debe mostrar un error?**

---

# ═══════════════════════════════════════
# FASE 5 — Página pública de ruta
# ═══════════════════════════════════════

## Objetivo
Construir la página pública `/ruta/[id]` sin autenticación,
accesible por cualquier persona con el enlace.

## Tareas

### 5.1 Server Component — `src/app/ruta/[id]/page.tsx`
```typescript
// Consultar vista `ruta_publica` con anon key
// Si no existe el UUID: notFound() (sin revelar info)
// Obtener también el establecimiento de origen desde "BASE DE DATOS ESCUELAS SLEP"
// usando el campo rbd
```

### 5.2 Componente `VistaRutaPublica.tsx`
Layout:
- Header: "SLEP Colchagua — Trayecto de Salida Pedagógica" (sin nav de la app)
- Mapa interactivo a ancho completo con la ruta dibujada (polyline decodificado)
- Panel inferior con: origen, destino, distancia, duración, vía, fecha
- Botón "Ver en Google Maps" (construir URL con coords de origen y destino)
- Botón "Descargar imagen del trayecto" (descargar el PNG del mapa)
- Footer: "Sistema de Salidas Pedagógicas · SLEP Colchagua"
- NO mostrar: nombre director, RUT funcionarios, cantidad estudiantes, datos personales

### 5.3 Metadata dinámica para SEO/compartir
```typescript
export async function generateMetadata({ params }) {
  // og:title: "Trayecto a [lugar_nombre] — SLEP Colchagua"
  // og:image: ruta_imagen_url (PNG del mapa)
  // og:description: "[X] km · [Xh Xmin] · [fecha]"
}
```

## ✅ PREGUNTAS DE VALIDACIÓN — FASE 5

1. **¿Quieres que la página pública muestre el nombre del establecimiento de origen  
   (ej: "Escuela La Tuna") o solo la dirección/coords genéricas?**

2. **¿La imagen OG del enlace al compartir debe ser el mapa estático ya generado,  
   o quieres una imagen diferente?**

3. **¿Necesitas algún aviso legal o de privacidad en la página pública?**  
   (Ej: "Esta información corresponde a un trayecto escolar oficial de SLEP Colchagua")

4. **¿El botón "Ver en Google Maps" debe abrir la ruta completa con indicaciones,  
   o solo mostrar el destino en el mapa?**

---

# ═══════════════════════════════════════
# FASE 6 — Panel de administración
# ═══════════════════════════════════════

## Objetivo
Construir el panel completo para los administradores SLEP:
tabla de registros, filtros, detalle con mapa y exportación.

## Dependencias a instalar
```bash
npm install xlsx
```

## Tareas

### 6.1 Layout de admin — `src/app/(admin)/layout.tsx`
- Sidebar o navbar con: Todas las salidas | Exportar | (futuro: gestión whitelist)
- Indicador del usuario admin logueado

### 6.2 Tabla de registros — `src/app/(admin)/panel/page.tsx`
Filtros:
- Establecimiento (dropdown desde "BASE DE DATOS ESCUELAS SLEP")
- Comuna (dropdown)
- Rango de fechas (date range picker)
- Región destino (dropdown)

Columnas de la tabla:
Fecha | Establecimiento | Director | Destino | Distancia | Duración | Estudiantes | Funcionarios | Acciones

Comportamiento:
- Paginación: 25 registros por página
- Ordenamiento por columna (click en header)
- Búsqueda rápida por nombre de lugar o establecimiento

### 6.3 Modal de detalle — `src/components/admin/DetalleSalida.tsx`
- Todos los datos de la salida
- Mapa con la ruta (MapaRuta.tsx reutilizado)
- Tabla de funcionarios completa
- Botón "Descargar PDF"
- Botón "Copiar enlace de ruta"

### 6.4 Exportación — `src/app/actions/exportar.ts`
**CSV:** todas las columnas, funcionarios como JSON string
**Excel (xlsx):** 
- Hoja 1: una fila por salida
- Hoja 2: funcionarios expandidos (una fila por funcionario, con datos de la salida repetidos)
- Columna extra en ambas: "Enlace Ruta" con la URL pública

## ✅ PREGUNTAS DE VALIDACIÓN — FASE 6

1. **¿El panel de admin debe tener estadísticas/resumen en la parte superior?**  
   (Ej: total de salidas este mes, km totales, estudiantes beneficiados)

2. **¿Necesitas gestión de la whitelist desde el panel admin (agregar/desactivar usuarios)  
   o eso se hará directamente en Supabase por ahora?**

3. **¿La exportación Excel debe incluir la imagen del mapa incrustada,  
   o solo los datos tabulares con el enlace?**

4. **¿Quieres filtrar también por rango de distancia (ej: salidas de más de 50km)?**

5. **¿El admin puede ver salidas de todos los establecimientos SLEP,  
   o algunos admins deberían tener acceso restringido a ciertas comunas?**

---

# ═══════════════════════════════════════
# FASE 7 — Pulido, seguridad y despliegue
# ═══════════════════════════════════════

## Objetivo
Finalizar la aplicación con todas las capas de seguridad, optimización de rendimiento
y despliegue en Vercel conectado al Supabase de producción.

## Tareas

### 7.1 Seguridad final
- Configurar CORS en `next.config.ts` (solo dominio propio)
- Agregar headers de seguridad: CSP, X-Frame-Options, X-Content-Type-Options
- Verificar que ninguna API key de servidor llega al bundle del cliente
- Revisar todos los Server Actions: re-verifican sesión y rol
- Sanitización DOMPurify en todos los campos de texto

### 7.2 Optimización
- `loading.tsx` en cada ruta protegida (skeleton loaders)
- `error.tsx` para manejo de errores controlado
- Lazy loading del componente de mapa (dynamic import con `ssr: false`)
- Optimización de imágenes con `next/image`

### 7.3 Despliegue en Vercel
```bash
# Conectar repo a Vercel
# Agregar todas las variables de entorno en Vercel Dashboard
# Configurar dominio personalizado (si aplica)
# Restringir Google Maps API keys por dominio de producción en GCloud
```

### 7.4 Checklist final de pruebas
- [ ] Login con Google de un director de la whitelist
- [ ] Login con Google de un admin
- [ ] Intento de login con email no en whitelist
- [ ] Formulario completo paso a paso con lugar seleccionado
- [ ] Intento de submit sin seleccionar lugar del autocomplete (debe fallar)
- [ ] Generación y descarga del PDF
- [ ] Recepción del correo en el email del director
- [ ] Acceso a la URL pública `/ruta/[UUID]` sin sesión
- [ ] Filtros y exportación desde el panel admin

## ✅ PREGUNTAS DE VALIDACIÓN — FASE 7

1. **¿Tienes dominio propio para la app (`salidas.slepcolchagua.cl`),  
   o se desplegará en el subdominio de Vercel (`salidas-pedagogicas.vercel.app`)?**

2. **¿Necesitas configurar variables de entorno diferentes para  
   desarrollo (localhost) y producción (Vercel)?**

3. **¿Quieres agregar Google Analytics o algún otro sistema de telemetría  
   para monitorear el uso de la aplicación?**

4. **¿Hay alguna funcionalidad adicional que quieras incluir antes del despliegue?**

---

## RESUMEN DE TODAS LAS VARIABLES DE ENTORNO

```env
# ── Supabase ───────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=                    # Supabase Dashboard → Settings → API

# ── Google Maps ────────────────────────────────────────
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=              # Fase 2 — cliente
GOOGLE_MAPS_SERVER_KEY=                       # Fase 2 — servidor

# ── Google Apps Script ─────────────────────────────────
APPS_SCRIPT_WEBHOOK_URL=                      # Fase 4
APPS_SCRIPT_SECRET=                           # Fase 4

# ── Rate Limiting (Upstash) ────────────────────────────
UPSTASH_REDIS_REST_URL=                       # Fase 3
UPSTASH_REDIS_REST_TOKEN=                     # Fase 3

# ── App ────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000      # Cambiar a URL de Vercel en prod
```

---

## NOTA FINAL PARA EL AGENTE

- Cada fase debe construirse sobre la anterior. No asumir que la siguiente está lista.
- El nombre de la tabla existente `"BASE DE DATOS ESCUELAS SLEP"` tiene espacios y mayúsculas — siempre usar comillas dobles en las queries SQL.
- Los campos de esa tabla también tienen espacios y acentos — siempre entre comillas dobles.
- Ejemplo correcto: `SELECT "NOMBRE ESTABLECIMIENTO", "LATITUD", "LONGITUD" FROM public."BASE DE DATOS ESCUELAS SLEP" WHERE "RBD" = $1`
