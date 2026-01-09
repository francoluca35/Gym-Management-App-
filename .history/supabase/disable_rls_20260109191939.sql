-- Script para deshabilitar Row Level Security (RLS) en todas las tablas
-- Ejecuta este script en el SQL Editor de Supabase si recibes errores 406

-- Deshabilitar RLS en todas las tablas del sistema
ALTER TABLE IF EXISTS gimnasios DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS gyms DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS client_gym DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS membresia_gym DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS asistencia_gym DISABLE ROW LEVEL SECURITY;

-- Verificar que RLS está deshabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('gimnasios', 'gyms', 'client_gym', 'membresia_gym', 'asistencia_gym')
ORDER BY tablename;
