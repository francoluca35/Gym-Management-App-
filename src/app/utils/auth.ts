import { supabase } from '../../lib/supabase'

export interface GymRegistrationData {
  propietario: string
  nombre_gym: string
  direccion: string
  telefono: string
  email: string
  usuario: string
  contraseña: string
}

export interface GymUser {
  usuario: string
  contraseña: string
  rol: 'admin' | 'empleado'
}

export interface GymData {
  gym_id: string
  nombre_gym: string
  users: GymUser[]
}

// Obtener IP del usuario
export async function getUserIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.error('Error obteniendo IP:', error)
    return 'unknown'
  }
}

// Generar ID único para el gimnasio
export function generateGymId(): string {
  return `gym_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Registrar nuevo gimnasio
export async function registerGym(data: GymRegistrationData): Promise<{ success: boolean; error?: string; gym_id?: string }> {
  try {
    const ip = await getUserIP()
    const gym_id = generateGymId()

    // Crear usuarios predeterminados
    // El admin tiene control total
    // Los empleados tienen nombres empleadoM/T/N pero todos con rol 'empleado'
    const defaultUsers: GymUser[] = [
      {
        usuario: data.usuario,
        contraseña: data.contraseña,
        rol: 'admin'
      },
      {
        usuario: 'empleadoM',
        contraseña: '12345',
        rol: 'empleado'
      },
      {
        usuario: 'empleadoT',
        contraseña: '12345',
        rol: 'empleado'
      },
      {
        usuario: 'empleadoN',
        contraseña: '12345',
        rol: 'empleado'
      }
    ]

    // Insertar en tabla gimnasios
    const { error: gimnasiosError } = await supabase
      .from('gimnasios')
      .insert({
        gym_id,
        nombre_gym: data.nombre_gym,
        direccion: data.direccion,
        telefono: data.telefono,
        email: data.email,
        propietario: data.propietario,
        ip_registro: ip,
        activo: true
      })

    if (gimnasiosError) {
      console.error('Error insertando en gimnasios:', gimnasiosError)
      return { success: false, error: gimnasiosError.message }
    }

    // Insertar en tabla gyms
    const { error: gymsError } = await supabase
      .from('gyms')
      .insert({
        gym_id,
        nombre_gym: data.nombre_gym,
        users: defaultUsers
      })

    if (gymsError) {
      console.error('Error insertando en gyms:', gymsError)
      // Intentar eliminar el registro de gimnasios si falla gyms
      await supabase.from('gimnasios').delete().eq('gym_id', gym_id)
      return { success: false, error: gymsError.message }
    }

    // Guardar IP y gym_id en localStorage para auto-login
    localStorage.setItem('gym_ip', ip)
    localStorage.setItem('gym_id', gym_id)

    return { success: true, gym_id }
  } catch (error: any) {
    console.error('Error en registerGym:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Login de gimnasio
export async function loginGym(usuario: string, contraseña: string): Promise<{ success: boolean; error?: string; gymData?: GymData }> {
  try {
    const ip = await getUserIP()
    console.log('Login - IP obtenida:', ip)
    
    // Buscar gimnasio por IP (sin .single() para evitar errores)
    const { data: gimnasioData, error: gimnasioError } = await supabase
      .from('gimnasios')
      .select('gym_id, nombre_gym, ip_registro')
      .eq('ip_registro', ip)
      .eq('activo', true)

    if (gimnasioError) {
      console.error('Error en consulta gimnasios:', gimnasioError)
      return { success: false, error: 'Error al buscar gimnasio. Revisa la consola para más detalles.' }
    }

    if (!gimnasioData || gimnasioData.length === 0) {
      console.error('No se encontró gimnasio con IP:', ip)
      return { success: false, error: 'No se encontró un gimnasio registrado con esta IP' }
    }

    const gimnasio = gimnasioData[0]

    // Buscar usuarios del gimnasio (sin .single())
    const { data: gymDataArray, error: gymError } = await supabase
      .from('gyms')
      .select('*')
      .eq('gym_id', gimnasio.gym_id)

    if (gymError) {
      console.error('Error en consulta gyms:', gymError)
      return { success: false, error: 'Error al cargar datos del gimnasio' }
    }

    if (!gymDataArray || gymDataArray.length === 0) {
      console.error('No se encontraron datos de gym para gym_id:', gimnasio.gym_id)
      return { success: false, error: 'Error al cargar datos del gimnasio' }
    }

    const gymData = gymDataArray[0]

    // Verificar usuario y contraseña
    const users: GymUser[] = gymData.users || []
    const user = users.find(u => u.usuario === usuario && u.contraseña === contraseña)

    if (!user) {
      console.log('Usuario no encontrado. Usuarios disponibles:', users.map(u => u.usuario))
      return { success: false, error: 'Usuario o contraseña incorrectos' }
    }

    // Guardar datos en localStorage
    localStorage.setItem('gym_ip', ip)
    localStorage.setItem('gym_id', gimnasio.gym_id)
    localStorage.setItem('current_user', JSON.stringify(user))

    return {
      success: true,
      gymData: {
        gym_id: gimnasio.gym_id,
        nombre_gym: gymData.nombre_gym,
        users: users
      }
    }
  } catch (error: any) {
    console.error('Error en loginGym:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Verificar si hay sesión guardada
export async function checkSavedSession(): Promise<{ hasSession: boolean; gymData?: GymData }> {
  try {
    const savedIP = localStorage.getItem('gym_ip')
    const savedGymId = localStorage.getItem('gym_id')

    if (!savedIP || !savedGymId) {
      return { hasSession: false }
    }

    const currentIP = await getUserIP()

    // Verificar que la IP coincida
    if (savedIP !== currentIP) {
      localStorage.removeItem('gym_ip')
      localStorage.removeItem('gym_id')
      localStorage.removeItem('current_user')
      return { hasSession: false }
    }

    // Verificar que el gimnasio exista y esté activo
    const { data: gimnasioData, error: gimnasioError } = await supabase
      .from('gimnasios')
      .select('gym_id, nombre_gym')
      .eq('gym_id', savedGymId)
      .eq('ip_registro', currentIP)
      .eq('activo', true)
      .single()

    if (gimnasioError || !gimnasioData) {
      localStorage.removeItem('gym_ip')
      localStorage.removeItem('gym_id')
      localStorage.removeItem('current_user')
      return { hasSession: false }
    }

    // Obtener datos del gym
    const { data: gymData, error: gymError } = await supabase
      .from('gyms')
      .select('*')
      .eq('gym_id', savedGymId)
      .single()

    if (gymError || !gymData) {
      return { hasSession: false }
    }

    return {
      hasSession: true,
      gymData: {
        gym_id: gimnasioData.gym_id,
        nombre_gym: gymData.nombre_gym,
        users: gymData.users || []
      }
    }
  } catch (error) {
    console.error('Error en checkSavedSession:', error)
    return { hasSession: false }
  }
}

// Verificar si existe un gimnasio registrado por IP (sin login)
export async function checkGymByIP(): Promise<{ exists: boolean; gym_id?: string; nombre_gym?: string }> {
  try {
    const ip = await getUserIP()
    console.log('IP actual obtenida:', ip)
    
    const { data: gimnasioData, error: gimnasioError } = await supabase
      .from('gimnasios')
      .select('gym_id, nombre_gym, ip_registro')
      .eq('ip_registro', ip)
      .eq('activo', true)

    if (gimnasioError) {
      console.error('Error en consulta Supabase:', gimnasioError)
      // Error 406 generalmente significa que RLS está bloqueando la consulta
      if (gimnasioError.code === 'PGRST116' || gimnasioError.message?.includes('406')) {
        console.error('Error 406: RLS (Row Level Security) puede estar habilitado. Ejecuta en Supabase SQL Editor: ALTER TABLE gimnasios DISABLE ROW LEVEL SECURITY;')
      }
      return { exists: false }
    }

    // Si hay datos, tomar el primero
    if (gimnasioData && gimnasioData.length > 0) {
      const gym = gimnasioData[0]
      console.log('Gimnasio encontrado:', gym)
      return {
        exists: true,
        gym_id: gym.gym_id,
        nombre_gym: gym.nombre_gym
      }
    }

    // Si no hay datos, verificar todas las IPs guardadas para debug
    const { data: allGyms } = await supabase
      .from('gimnasios')
      .select('gym_id, nombre_gym, ip_registro')
      .eq('activo', true)
    
    console.log('IP buscada:', ip)
    console.log('Todos los gimnasios activos:', allGyms)
    
    return { exists: false }
  } catch (error) {
    console.error('Error verificando gimnasio por IP:', error)
    return { exists: false }
  }
}

// Validar IP y obtener usuario automáticamente (para acceso dentro del gimnasio)
export async function validateIPAndLogin(): Promise<{ success: boolean; error?: string; gymData?: GymData; user?: GymUser }> {
  try {
    const ip = await getUserIP()
    console.log('Validación IP - IP obtenida:', ip)
    
    // Buscar gimnasio por IP
    const { data: gimnasioData, error: gimnasioError } = await supabase
      .from('gimnasios')
      .select('gym_id, nombre_gym, ip_registro')
      .eq('ip_registro', ip)
      .eq('activo', true)

    if (gimnasioError) {
      console.error('Error en consulta gimnasios:', gimnasioError)
      return { success: false, error: 'Error al buscar gimnasio por IP' }
    }

    if (!gimnasioData || gimnasioData.length === 0) {
      return { success: false, error: 'No se encontró un gimnasio registrado con esta dirección IP' }
    }

    const gimnasio = gimnasioData[0]

    // Obtener usuarios del gimnasio
    const { data: gymDataArray, error: gymError } = await supabase
      .from('gyms')
      .select('*')
      .eq('gym_id', gimnasio.gym_id)

    if (gymError || !gymDataArray || gymDataArray.length === 0) {
      return { success: false, error: 'Error al cargar datos del gimnasio' }
    }

    const gymData = gymDataArray[0]
    const users: GymUser[] = gymData.users || []

    if (users.length === 0) {
      return { success: false, error: 'No hay usuarios disponibles en este gimnasio' }
    }

    // Buscar primero un usuario admin, si no existe, tomar el primero disponible
    let selectedUser = users.find(u => u.rol === 'admin') || users[0]

    // Guardar datos en localStorage
    localStorage.setItem('gym_ip', ip)
    localStorage.setItem('gym_id', gimnasio.gym_id)
    localStorage.setItem('current_user', JSON.stringify(selectedUser))

    return {
      success: true,
      gymData: {
        gym_id: gimnasio.gym_id,
        nombre_gym: gymData.nombre_gym,
        users: users
      },
      user: selectedUser
    }
  } catch (error: any) {
    console.error('Error en validateIPAndLogin:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Cerrar sesión
export function logoutGym() {
  // NO eliminamos gym_ip y gym_id del localStorage para mantener la referencia al gimnasio
  // Solo eliminamos la sesión del usuario
  localStorage.removeItem('current_user')
  localStorage.removeItem('selected_shift')
}
