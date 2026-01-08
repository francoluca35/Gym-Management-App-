import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Verificar si las variables de entorno están configuradas
const isConfigured = supabaseUrl && supabaseAnonKey && 
                     supabaseUrl !== 'tu_url_de_supabase' && 
                     supabaseAnonKey !== 'tu_clave_anonima_de_supabase'

if (!isConfigured) {
  const missingVars = []
  if (!supabaseUrl || supabaseUrl === 'tu_url_de_supabase') missingVars.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey || supabaseAnonKey === 'tu_clave_anonima_de_supabase') missingVars.push('VITE_SUPABASE_ANON_KEY')
  
  console.warn(
    '⚠️ CONFIGURACIÓN DE SUPABASE REQUERIDA\n\n' +
    `Faltan las variables de entorno: ${missingVars.join(', ')}\n\n` +
    'Por favor, edita el archivo .env en la raíz del proyecto y agrega tus credenciales:\n' +
    'VITE_SUPABASE_URL=https://tu-proyecto.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui\n\n' +
    'Para obtener tus credenciales:\n' +
    '1. Ve a https://supabase.com\n' +
    '2. Inicia sesión o crea una cuenta\n' +
    '3. Crea un nuevo proyecto\n' +
    '4. Ve a Settings > API\n' +
    '5. Copia la URL del proyecto y la clave anónima\n\n' +
    'Consulta SUPABASE_SETUP.md para más información.\n'
  )
}

// Crear el cliente de Supabase (usará valores vacíos si no están configurados)
// Las operaciones fallarán hasta que se configuren las credenciales correctas
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)