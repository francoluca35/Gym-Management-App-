-- Primero eliminar las tablas si existen (para recrearlas)
-- IMPORTANTE: Esto eliminará todos los datos existentes
-- Descomenta las siguientes líneas si quieres eliminar las tablas existentes:
-- DROP TABLE IF EXISTS gyms CASCADE;
-- DROP TABLE IF EXISTS gimnasios CASCADE;

-- Tabla para gimnasios
-- Estructura: gymId como primary key, todos los datos de registro
CREATE TABLE gimnasios (
  gym_id TEXT PRIMARY KEY,
  nombre_gym TEXT NOT NULL,
  direccion TEXT NOT NULL,
  telefono TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  propietario TEXT NOT NULL,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  activo BOOLEAN DEFAULT true,
  ip_registro TEXT NOT NULL,
  capacidad_maxima INTEGER,
  horarios TEXT,
  tipos_clases TEXT[],
  planes JSONB,
  instagram TEXT,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para usuarios (gyms)
-- Estructura: gym_id como primary key (relacionado con gimnasios), array de usuarios
CREATE TABLE gyms (
  gym_id TEXT PRIMARY KEY,
  nombre_gym TEXT NOT NULL,
  users JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_gym_id FOREIGN KEY (gym_id) REFERENCES gimnasios(gym_id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_gimnasios_email ON gimnasios(email);
CREATE INDEX IF NOT EXISTS idx_gimnasios_activo ON gimnasios(activo);
CREATE INDEX IF NOT EXISTS idx_gimnasios_gym_id ON gimnasios(gym_id);
CREATE INDEX IF NOT EXISTS idx_gyms_gym_id ON gyms(gym_id);
CREATE INDEX IF NOT EXISTS idx_gyms_nombre_gym ON gyms(nombre_gym);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_gimnasios_updated_at BEFORE UPDATE ON gimnasios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON gyms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
