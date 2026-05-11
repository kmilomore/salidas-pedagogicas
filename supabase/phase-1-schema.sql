-- Fase 1: whitelist, salidas pedagogicas y vista publica.

CREATE TABLE IF NOT EXISTS public.whitelist_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('director', 'admin')),
  rbd TEXT REFERENCES public."BASE DE DATOS ESCUELAS SLEP"("RBD"),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.normalize_whitelist_email()
RETURNS trigger AS $$
BEGIN
  NEW.email := lower(btrim(NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS whitelist_usuarios_normalize_email ON public.whitelist_usuarios;

CREATE TRIGGER whitelist_usuarios_normalize_email
BEFORE INSERT OR UPDATE ON public.whitelist_usuarios
FOR EACH ROW
EXECUTE FUNCTION public.normalize_whitelist_email();

CREATE UNIQUE INDEX IF NOT EXISTS whitelist_usuarios_email_lower_idx
  ON public.whitelist_usuarios ((lower(btrim(email))));

CREATE TABLE IF NOT EXISTS public.salidas_pedagogicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  director_id UUID NOT NULL REFERENCES auth.users(id),
  rbd TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora_salida TIME NOT NULL,
  hora_regreso TIME,
  pme_dimension TEXT NOT NULL,
  pme_subdimension TEXT NOT NULL,
  objetivo TEXT NOT NULL,
  actividad TEXT NOT NULL,
  lugar_nombre TEXT NOT NULL,
  lugar_direccion TEXT NOT NULL,
  lugar_lat DECIMAL(10, 8) NOT NULL,
  lugar_lng DECIMAL(11, 8) NOT NULL,
  lugar_place_id TEXT NOT NULL,
  lugar_comuna TEXT NOT NULL,
  lugar_region TEXT NOT NULL,
  distancia_km DECIMAL(8, 2) NOT NULL,
  duracion_minutos INTEGER NOT NULL,
  ruta_polyline TEXT NOT NULL,
  ruta_resumen TEXT NOT NULL,
  ruta_imagen_url TEXT,
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviada')),
  cantidad_estudiantes INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_estudiantes >= 0),
  cantidad_apoderados INTEGER NOT NULL DEFAULT 0 CHECK (cantidad_apoderados >= 0),
  funcionarios JSONB NOT NULL DEFAULT '[]',
  pdf_url TEXT,
  email_enviado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE VIEW public.ruta_publica AS
  SELECT
    id,
    lugar_nombre,
    lugar_direccion,
    lugar_lat,
    lugar_lng,
    lugar_comuna,
    lugar_region,
    distancia_km,
    duracion_minutos,
    ruta_polyline,
    ruta_resumen,
    ruta_imagen_url,
    fecha,
    rbd
  FROM public.salidas_pedagogicas;

GRANT SELECT ON public.ruta_publica TO anon;

ALTER TABLE public.salidas_pedagogicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whitelist_usuarios ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_user_rol()
RETURNS TEXT AS $$
  SELECT rol FROM public.whitelist_usuarios
  WHERE lower(btrim(email)) = lower(btrim(auth.jwt() ->> 'email')) AND activo = true;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "director_select_own" ON public.salidas_pedagogicas
  FOR SELECT USING (director_id = auth.uid() AND public.get_user_rol() = 'director');

CREATE POLICY "director_insert_own" ON public.salidas_pedagogicas
  FOR INSERT WITH CHECK (director_id = auth.uid() AND public.get_user_rol() = 'director');

CREATE POLICY "admin_all" ON public.salidas_pedagogicas
  FOR ALL USING (public.get_user_rol() = 'admin');

CREATE POLICY "whitelist_self_read" ON public.whitelist_usuarios
  FOR SELECT USING (lower(btrim(email)) = lower(btrim(auth.jwt() ->> 'email')));

-- Seed inicial de administradores.
INSERT INTO public.whitelist_usuarios (email, rol, rbd, activo)
VALUES
  ('camilo.serra@slepcolchagua.cl', 'admin', NULL, true),
  ('cesar.mayo@slepcolchagua.cl', 'admin', NULL, true),
  ('fabian.montaner@slepcolchagua.cl', 'admin', NULL, true)
ON CONFLICT (email) DO UPDATE
SET rol = EXCLUDED.rol,
    rbd = EXCLUDED.rbd,
    activo = EXCLUDED.activo;

-- Seed inicial de directores desde la tabla maestra de establecimientos.
INSERT INTO public.whitelist_usuarios (email, rol, rbd, activo)
SELECT
  seeded.email,
  'director' AS rol,
  seeded.rbd,
  true AS activo
FROM (
  SELECT DISTINCT ON (lower(btrim("CORREO ELECTRÓNICO")))
    lower(btrim("CORREO ELECTRÓNICO")) AS email,
    "RBD" AS rbd
  FROM public."BASE DE DATOS ESCUELAS SLEP"
  WHERE "CORREO ELECTRÓNICO" IS NOT NULL
    AND btrim("CORREO ELECTRÓNICO") <> ''
    AND "RBD" IS NOT NULL
  ORDER BY lower(btrim("CORREO ELECTRÓNICO")), "RBD"
) AS seeded
ON CONFLICT (email) DO UPDATE
SET rol = EXCLUDED.rol,
    rbd = EXCLUDED.rbd,
    activo = EXCLUDED.activo;