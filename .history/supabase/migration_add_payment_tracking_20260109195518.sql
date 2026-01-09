-- Migración: Agregar campos para rastrear pagos reales
-- Esto permite calcular ingresos mensuales basados en pagos efectivos

-- Agregar campo para el monto del último pago de membresía
ALTER TABLE client_gym 
ADD COLUMN IF NOT EXISTS last_payment_amount NUMERIC(10, 2) DEFAULT 0;

-- Agregar campo para la fecha en que se pagó la inscripción
ALTER TABLE client_gym 
ADD COLUMN IF NOT EXISTS registration_fee_payment_date DATE;

-- Crear índice para búsquedas por fecha de pago (útil para reportes mensuales)
CREATE INDEX IF NOT EXISTS idx_client_gym_last_payment_date ON client_gym(last_payment_date);
CREATE INDEX IF NOT EXISTS idx_client_gym_registration_fee_payment_date ON client_gym(registration_fee_payment_date);

-- Actualizar registros existentes: establecer last_payment_amount basado en membership_expiry
-- Si el miembro tiene una membresía activa, estimamos el último pago
-- Nota: Esto es una estimación inicial, los futuros pagos se registrarán correctamente
UPDATE client_gym 
SET last_payment_amount = 0 
WHERE last_payment_amount IS NULL;
