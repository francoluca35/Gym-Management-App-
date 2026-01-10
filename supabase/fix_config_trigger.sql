-- Script para corregir el error del trigger ya existente
-- Ejecuta este script si obtienes el error: "trigger update_gym_config_updated_at already exists"

-- Eliminar el trigger si existe
DROP TRIGGER IF EXISTS update_gym_config_updated_at ON gym_config;

-- Crear el trigger nuevamente
CREATE TRIGGER update_gym_config_updated_at BEFORE UPDATE ON gym_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
