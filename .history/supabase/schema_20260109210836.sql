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

-- Tabla para clientes del gimnasio (client_gym)
-- Estructura: cada cliente está asociado a un gym_id específico
CREATE TABLE IF NOT EXISTS client_gym (
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
  last_payment_amount NUMERIC(10, 2) DEFAULT 0, -- Monto total pagado en el último pago (precio * meses)
  registration_fee NUMERIC(10, 2) DEFAULT 0,
  registration_fee_paid BOOLEAN DEFAULT false,
  registration_fee_payment_date DATE, -- Fecha en que se pagó la inscripción
  image_url TEXT,
  rfid_card_id TEXT UNIQUE, -- ID único de la tarjeta RFID/NFC
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_client_gym_gym_id FOREIGN KEY (gym_id) REFERENCES gimnasios(gym_id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_client_gym_gym_id ON client_gym(gym_id);
CREATE INDEX IF NOT EXISTS idx_client_gym_email ON client_gym(email);
CREATE INDEX IF NOT EXISTS idx_client_gym_membership_expiry ON client_gym(membership_expiry);
CREATE INDEX IF NOT EXISTS idx_client_gym_rfid_card_id ON client_gym(rfid_card_id);
CREATE INDEX IF NOT EXISTS idx_client_gym_last_payment_date ON client_gym(last_payment_date);
CREATE INDEX IF NOT EXISTS idx_client_gym_registration_fee_payment_date ON client_gym(registration_fee_payment_date);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_client_gym_updated_at BEFORE UPDATE ON client_gym
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla para membresías del gimnasio (membresia_gym)
-- Estructura: cada membresía está asociada a un gym_id específico
CREATE TABLE IF NOT EXISTS membresia_gym (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_membresia_gym_gym_id FOREIGN KEY (gym_id) REFERENCES gimnasios(gym_id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_membresia_gym_gym_id ON membresia_gym(gym_id);
CREATE INDEX IF NOT EXISTS idx_membresia_gym_name ON membresia_gym(name);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_membresia_gym_updated_at BEFORE UPDATE ON membresia_gym
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla para asistencias del gimnasio (asistencia_gym)
-- Estructura: cada miembro tiene un registro con arrays de entradas y salidas
CREATE TABLE IF NOT EXISTS asistencia_gym (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id TEXT NOT NULL,
  member_id UUID NOT NULL,
  member_name TEXT NOT NULL,
  membership_id TEXT NOT NULL,
  entrada TIMESTAMP WITH TIME ZONE[] DEFAULT ARRAY[]::TIMESTAMP WITH TIME ZONE[],
  salida TIMESTAMP WITH TIME ZONE[] DEFAULT ARRAY[]::TIMESTAMP WITH TIME ZONE[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_asistencia_gym_gym_id FOREIGN KEY (gym_id) REFERENCES gimnasios(gym_id) ON DELETE CASCADE,
  CONSTRAINT fk_asistencia_gym_member_id FOREIGN KEY (member_id) REFERENCES client_gym(id) ON DELETE CASCADE
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_asistencia_gym_gym_id ON asistencia_gym(gym_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_gym_member_id ON asistencia_gym(member_id);
CREATE INDEX IF NOT EXISTS idx_asistencia_gym_member_name ON asistencia_gym(member_name);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_asistencia_gym_updated_at BEFORE UPDATE ON asistencia_gym
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Tabla para configuración del gimnasio
-- Almacena configuraciones específicas de cada gimnasio (Mercado Pago, notificaciones, etc.)
CREATE TABLE IF NOT EXISTS gym_config (
  gym_id TEXT PRIMARY KEY,
  mercado_pago_public_key TEXT,
  mercado_pago_access_token TEXT,
  mercado_pago_enabled BOOLEAN DEFAULT false,
  notification_email TEXT,
  notification_enabled BOOLEAN DEFAULT true,
  auto_renewal_enabled BOOLEAN DEFAULT false,
  membership_reminder_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_gym_config_gym_id FOREIGN KEY (gym_id) REFERENCES gimnasios(gym_id) ON DELETE CASCADE
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_gym_config_gym_id ON gym_config(gym_id);

-- Trigger para actualizar updated_at (idempotente)
DROP TRIGGER IF EXISTS update_gym_config_updated_at ON gym_config;
CREATE TRIGGER update_gym_config_updated_at BEFORE UPDATE ON gym_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Deshabilitar Row Level Security (RLS) en todas las tablas
-- Esto permite que la aplicación funcione sin políticas RLS configuradas
-- Para producción, puedes habilitar RLS y crear políticas específicas según tus necesidades
ALTER TABLE IF EXISTS gimnasios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gyms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS client_gym DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS membresia_gym DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS asistencia_gym DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gym_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gym_config DISABLE ROW LEVEL SECURITY;