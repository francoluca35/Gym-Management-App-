-- Migración: Agregar tabla de configuración del gimnasio
-- Esta tabla almacena configuraciones específicas de cada gimnasio

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

-- Trigger para actualizar updated_at
CREATE TRIGGER update_gym_config_updated_at BEFORE UPDATE ON gym_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Deshabilitar RLS para desarrollo
ALTER TABLE IF EXISTS gym_config DISABLE ROW LEVEL SECURITY;
