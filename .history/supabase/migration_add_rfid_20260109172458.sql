-- Migración: Agregar columna rfid_card_id a la tabla client_gym
-- Ejecuta este script en el SQL Editor de Supabase

-- Agregar la columna rfid_card_id si no existe
ALTER TABLE client_gym 
ADD COLUMN IF NOT EXISTS rfid_card_id TEXT;

-- Agregar constraint UNIQUE si no existe
-- Primero eliminar el constraint si existe (por si acaso)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'client_gym_rfid_card_id_key'
    ) THEN
        ALTER TABLE client_gym DROP CONSTRAINT client_gym_rfid_card_id_key;
    END IF;
END $$;

-- Agregar el constraint UNIQUE
ALTER TABLE client_gym 
ADD CONSTRAINT client_gym_rfid_card_id_key UNIQUE (rfid_card_id);

-- Crear índice si no existe
CREATE INDEX IF NOT EXISTS idx_client_gym_rfid_card_id ON client_gym(rfid_card_id);

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'client_gym' AND column_name = 'rfid_card_id';
