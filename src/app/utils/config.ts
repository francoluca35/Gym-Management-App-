import { supabase } from '../../lib/supabase'

export interface GymConfig {
  gym_id: string
  mercado_pago_public_key?: string
  mercado_pago_access_token?: string
  mercado_pago_enabled: boolean
  notification_email?: string
  notification_enabled: boolean
  auto_renewal_enabled: boolean
  membership_reminder_days: number
}

export interface GymUser {
  usuario: string
  contraseña: string
  rol: 'admin' | 'empleado'
}

// Obtener configuración del gimnasio
export async function getGymConfig(gymId: string): Promise<{ success: boolean; error?: string; config?: GymConfig }> {
  try {
    const { data, error } = await supabase
      .from('gym_config')
      .select('*')
      .eq('gym_id', gymId)
      .single()

    if (error) {
      // Si no existe, crear una configuración por defecto
      if (error.code === 'PGRST116') {
        return {
          success: true,
          config: {
            gym_id: gymId,
            mercado_pago_enabled: false,
            notification_enabled: true,
            auto_renewal_enabled: false,
            membership_reminder_days: 7
          }
        }
      }
      console.error('Error obteniendo configuración:', error)
      return { success: false, error: error.message }
    }

    return { success: true, config: data as GymConfig }
  } catch (error: any) {
    console.error('Error en getGymConfig:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Actualizar configuración del gimnasio
export async function updateGymConfig(gymId: string, config: Partial<GymConfig>): Promise<{ success: boolean; error?: string; config?: GymConfig }> {
  try {
    // Verificar si existe la configuración
    const { data: existing } = await supabase
      .from('gym_config')
      .select('gym_id')
      .eq('gym_id', gymId)
      .single()

    let result
    if (existing) {
      // Actualizar
      const { data, error } = await supabase
        .from('gym_config')
        .update({
          ...config,
          updated_at: new Date().toISOString()
        })
        .eq('gym_id', gymId)
        .select()
        .single()

      if (error) {
        console.error('Error actualizando configuración:', error)
        return { success: false, error: error.message }
      }
      result = data
    } else {
      // Crear nueva
      const { data, error } = await supabase
        .from('gym_config')
        .insert({
          gym_id: gymId,
          ...config,
          mercado_pago_enabled: config.mercado_pago_enabled ?? false,
          notification_enabled: config.notification_enabled ?? true,
          auto_renewal_enabled: config.auto_renewal_enabled ?? false,
          membership_reminder_days: config.membership_reminder_days ?? 7
        })
        .select()
        .single()

      if (error) {
        console.error('Error creando configuración:', error)
        return { success: false, error: error.message }
      }
      result = data
    }

    return { success: true, config: result as GymConfig }
  } catch (error: any) {
    console.error('Error en updateGymConfig:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Obtener usuarios del gimnasio
export async function getGymUsers(gymId: string): Promise<{ success: boolean; error?: string; users?: GymUser[] }> {
  try {
    const { data, error } = await supabase
      .from('gyms')
      .select('users')
      .eq('gym_id', gymId)
      .single()

    if (error) {
      console.error('Error obteniendo usuarios:', error)
      return { success: false, error: error.message }
    }

    return { success: true, users: data.users || [] }
  } catch (error: any) {
    console.error('Error en getGymUsers:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Actualizar usuario empleado
export async function updateEmployeeUser(
  gymId: string,
  oldUsername: string,
  newUsername: string,
  newPassword: string
): Promise<{ success: boolean; error?: string; users?: GymUser[] }> {
  try {
    // Obtener usuarios actuales
    const { data: gymData, error: fetchError } = await supabase
      .from('gyms')
      .select('users')
      .eq('gym_id', gymId)
      .single()

    if (fetchError) {
      console.error('Error obteniendo usuarios:', fetchError)
      return { success: false, error: fetchError.message }
    }

    const users: GymUser[] = gymData.users || []
    
    // Buscar y actualizar el usuario
    const userIndex = users.findIndex(u => u.usuario === oldUsername && u.rol === 'empleado')
    
    if (userIndex === -1) {
      return { success: false, error: 'Usuario empleado no encontrado' }
    }

    // Actualizar usuario
    users[userIndex] = {
      ...users[userIndex],
      usuario: newUsername,
      contraseña: newPassword
    }

    // Guardar usuarios actualizados
    const { data: updatedData, error: updateError } = await supabase
      .from('gyms')
      .update({ users })
      .eq('gym_id', gymId)
      .select('users')
      .single()

    if (updateError) {
      console.error('Error actualizando usuarios:', updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true, users: updatedData.users || [] }
  } catch (error: any) {
    console.error('Error en updateEmployeeUser:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Obtener información del gimnasio
export async function getGymInfo(gymId: string): Promise<{ success: boolean; error?: string; info?: any }> {
  try {
    const { data, error } = await supabase
      .from('gimnasios')
      .select('*')
      .eq('gym_id', gymId)
      .single()

    if (error) {
      console.error('Error obteniendo información del gimnasio:', error)
      return { success: false, error: error.message }
    }

    return { success: true, info: data }
  } catch (error: any) {
    console.error('Error en getGymInfo:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Actualizar información del gimnasio
export async function updateGymInfo(gymId: string, info: Partial<any>): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('gimnasios')
      .update(info)
      .eq('gym_id', gymId)

    if (error) {
      console.error('Error actualizando información del gimnasio:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error en updateGymInfo:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}
