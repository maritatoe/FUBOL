-- schema.sql

-- Enable pgcrypto for UUID generation if not already enabled (Supabase usually has this enabled by default)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Tabla de Jugadores
CREATE TABLE IF NOT EXISTS jugadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  posiciones text[] NOT NULL,
  puntaje_base numeric NOT NULL DEFAULT 5,
  rating numeric NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamp DEFAULT now()
);

-- 2. Tabla de Partidos
CREATE TABLE IF NOT EXISTS partidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha timestamp DEFAULT now(),
  formacion text NOT NULL DEFAULT '5v5'
);

-- 3. Tabla de Equipos / Partido
CREATE TABLE IF NOT EXISTS equipos_partido (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id uuid REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id uuid REFERENCES jugadores(id),
  equipo text NOT NULL CHECK (equipo IN ('A', 'B')),
  posicion_asignada text NOT NULL
);

-- 4. Tabla de Rendimiento (Calificaciones)
CREATE TABLE IF NOT EXISTS rendimiento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partido_id uuid REFERENCES partidos(id) ON DELETE CASCADE,
  jugador_id uuid REFERENCES jugadores(id),
  puntaje numeric NOT NULL CHECK (puntaje BETWEEN 1 AND 10),
  UNIQUE(partido_id, jugador_id)
);

-- Configuración opcional de RLS (Row Level Security)
-- Si necesitas habilitar acceso público total mediante API para el MVP:
ALTER TABLE jugadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos_partido ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendimiento ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público irrestricto (para facilitar el desarrollo)
-- IMPORTANTE: en producción, esto debería cambiarse para requerir autenticación
CREATE POLICY "Public profiles are viewable by everyone" ON jugadores FOR SELECT USING (true);
CREATE POLICY "Public profiles can be created by everyone" ON jugadores FOR INSERT WITH CHECK (true);
CREATE POLICY "Public profiles can be updated by everyone" ON jugadores FOR UPDATE USING (true);

CREATE POLICY "Matches are viewable by everyone" ON partidos FOR SELECT USING (true);
CREATE POLICY "Matches can be created by everyone" ON partidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Matches can be updated by everyone" ON partidos FOR UPDATE USING (true);

CREATE POLICY "Teams are viewable by everyone" ON equipos_partido FOR SELECT USING (true);
CREATE POLICY "Teams can be created by everyone" ON equipos_partido FOR INSERT WITH CHECK (true);
CREATE POLICY "Teams can be updated by everyone" ON equipos_partido FOR UPDATE USING (true);

CREATE POLICY "Performance is viewable by everyone" ON rendimiento FOR SELECT USING (true);
CREATE POLICY "Performance can be created by everyone" ON rendimiento FOR INSERT WITH CHECK (true);
CREATE POLICY "Performance can be updated by everyone" ON rendimiento FOR UPDATE USING (true);

-- Drop policies if running multiple times (uncomment to reset):
-- DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON jugadores;
-- DROP POLICY ...
