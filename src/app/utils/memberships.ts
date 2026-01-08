import { supabase } from '../../lib/supabase'
import { Membership } from '../types'

// Agregar nueva membresía al gimnasio
export async function addMembershipGym(gymId: string, membershipData: Omit<Membership, 'id'>): Promise<{ success: boolean; error?: string; membership?: Membership }> {
  try {
    // Validar que gymId esté presente
    if (!gymId || gymId.trim() === '') {
      return { success: false, error: 'gym_id es requerido para agregar una membresía' }
    }

    console.log('Agregando membresía con gym_id:', gymId)

    const { data, error } = await supabase
      .from('membresia_gym')
      .insert({
        gym_id: gymId,
        name: membershipData.name,
        price: membershipData.price,
        description: membershipData.description || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error agregando membresía:', error)
      return { success: false, error: error.message }
    }

    // Convertir el formato de la base de datos al formato Membership
    const membership: Membership = {
      id: data.id,
      name: data.name,
      price: parseFloat(data.price),
      description: data.description || ''
    }

    return { success: true, membership }
  } catch (error: any) {
    console.error('Error en addMembershipGym:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Obtener todas las membresías de un gimnasio
export async function getMembershipsGym(gymId: string): Promise<{ success: boolean; error?: string; memberships?: Membership[] }> {
  try {
    if (!gymId || gymId.trim() === '') {
      return { success: false, error: 'gym_id es requerido para obtener membresías' }
    }

    const { data, error } = await supabase
      .from('membresia_gym')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error obteniendo membresías:', error)
      return { success: false, error: error.message }
    }

    // Convertir el formato de la base de datos al formato Membership
    const memberships: Membership[] = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price),
      description: item.description || ''
    }))

    return { success: true, memberships }
  } catch (error: any) {
    console.error('Error en getMembershipsGym:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Actualizar membresía
export async function updateMembershipGym(membershipId: string, membershipData: Partial<Membership>): Promise<{ success: boolean; error?: string; membership?: Membership }> {
  try {
    const updateData: any = {}

    if (membershipData.name !== undefined) updateData.name = membershipData.name
    if (membershipData.price !== undefined) updateData.price = membershipData.price
    if (membershipData.description !== undefined) updateData.description = membershipData.description

    const { data, error } = await supabase
      .from('membresia_gym')
      .update(updateData)
      .eq('id', membershipId)
      .select()
      .single()

    if (error) {
      console.error('Error actualizando membresía:', error)
      return { success: false, error: error.message }
    }

    const membership: Membership = {
      id: data.id,
      name: data.name,
      price: parseFloat(data.price),
      description: data.description || ''
    }

    return { success: true, membership }
  } catch (error: any) {
    console.error('Error en updateMembershipGym:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Eliminar membresía
export async function deleteMembershipGym(membershipId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('membresia_gym')
      .delete()
      .eq('id', membershipId)

    if (error) {
      console.error('Error eliminando membresía:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error en deleteMembershipGym:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}
