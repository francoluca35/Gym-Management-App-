-- Tabla para gimnasios
-- Estructura: gymId como primary key, todos los datos de registro
CREATE TABLE IF NOT EXISTS gimnasios (
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
CREATE TABLE IF NOT EXISTS gyms (
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
CREATE INDEX IF NOT EXISTS idx_gimnasios_ip_registro ON gimnasios(ip_registro);
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

-- Tabla para clientes del gimnasio (clientGym)
-- Estructura: cada cliente está asociado a un gym_id específico
CREATE TABLE IF NOT EXISTS clientGym (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  membership_start DATE NOT NULL,
  membership_expiry DATE NOT NULL,
  membership_id TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'transfer')),
  last_payment_date DATE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_clientGym_gym_id FOREIGN KEY (gym_id) REFERENCES gimnasios(gym_id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_clientGym_gym_id ON clientGym(gym_id);
CREATE INDEX IF NOT EXISTS idx_clientGym_email ON clientGym(email);
CREATE INDEX IF NOT EXISTS idx_clientGym_membership_expiry ON clientGym(membership_expiry);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_clientGym_updated_at BEFORE UPDATE ON clientGym
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();