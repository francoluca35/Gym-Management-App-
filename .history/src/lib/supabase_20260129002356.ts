import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan variables de Supabase. Crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY (ver .env.example).'
  )
}

// Validar que la URL sea la API URL de Supabase (no la conexión PostgreSQL)
if (
  supabaseUrl.includes('postgresql://') ||
  supabaseUrl.includes('@db.') ||
  supabaseUrl === 'tu_url_de_supabase'
) {
  throw new Error(
    'VITE_SUPABASE_URL debe ser la URL de la API (ej: https://TU_PROYECTO.supabase.co), no la cadena de conexión PostgreSQL. Cópiala desde Supabase → Project Settings → API.'
  )
}

if (!supabaseUrl.startsWith('https://') || !supabaseUrl.endsWith('.supabase.co')) {
  console.warn(
    '[Supabase] La URL no tiene el formato esperado (https://xxx.supabase.co). Si ves ERR_NAME_NOT_RESOLVED, tu proyecto puede estar pausado: entra en https://supabase.com/dashboard y restaura el proyecto.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)