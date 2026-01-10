-- Migración: Agregar tabla de configuración del gimnasio
-- Esta tabla almacena configuraciones específicas de cada gimnasio
-- Este script es idempotente: puede ejecutarse múltiples veces sin errores

-- Crear tabla si no existe
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

-- Agregar columnas si no existen (por si la tabla ya existe sin estas columnas)
DO $$ 
BEGIN
    -- Agregar mercado_pago_public_key si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gym_config' AND column_name = 'mercado_pago_public_key') THEN
        ALTER TABLE gym_config ADD COLUMN mercado_pago_public_key TEXT;
    END IF;
    
    -- Agregar mercado_pago_access_token si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gym_config' AND column_name = 'mercado_pago_access_token') THEN
        ALTER TABLE gym_config ADD COLUMN mercado_pago_access_token TEXT;
    END IF;
    
    -- Agregar mercado_pago_enabled si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gym_config' AND column_name = 'mercado_pago_enabled') THEN
        ALTER TABLE gym_config ADD COLUMN mercado_pago_enabled BOOLEAN DEFAULT false;
    END IF;
    
    -- Agregar notification_email si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gym_config' AND column_name = 'notification_email') THEN
        ALTER TABLE gym_config ADD COLUMN notification_email TEXT;
    END IF;
    
    -- Agregar notification_enabled si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gym_config' AND column_name = 'notification_enabled') THEN
        ALTER TABLE gym_config ADD COLUMN notification_enabled BOOLEAN DEFAULT true;
    END IF;
    
    -- Agregar auto_renewal_enabled si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gym_config' AND column_name = 'auto_renewal_enabled') THEN
        ALTER TABLE gym_config ADD COLUMN auto_renewal_enabled BOOLEAN DEFAULT false;
    END IF;
    
    -- Agregar membership_reminder_days si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gym_config' AND column_name = 'membership_reminder_days') THEN
        ALTER TABLE gym_config ADD COLUMN membership_reminder_days INTEGER DEFAULT 7;
    END IF;
END $$;

-- Crear índice si no existe
CREATE INDEX IF NOT EXISTS idx_gym_config_gym_id ON gym_config(gym_id);

-- Eliminar trigger si existe y crear uno nuevo
DROP TRIGGER IF EXISTS update_gym_config_updated_at ON gym_config;
CREATE TRIGGER update_gym_config_updated_at BEFORE UPDATE ON gym_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Deshabilitar RLS para desarrollo
ALTER TABLE IF EXISTS gym_config DISABLE ROW LEVEL SECURITY;
