import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = []
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY')
  
  throw new Error(
    `Faltan las variables de entorno de Supabase: ${missingVars.join(', ')}\n\n` +
    'Por favor, crea un archivo .env en la raíz del proyecto con:\n' +
    'VITE_SUPABASE_URL=tu_url_de_supabase\n' +
    'VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase\n\n' +
    'Consulta SUPABASE_SETUP.md para más información.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)