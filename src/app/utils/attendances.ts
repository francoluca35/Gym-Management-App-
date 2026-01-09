import { supabase } from '../../lib/supabase'
import { AttendanceGym, Member } from '../types'

// Obtener o crear registro de asistencia para un miembro
async function getOrCreateAttendanceRecord(gymId: string, member: Member): Promise<{ success: boolean; error?: string; record?: AttendanceGym }> {
  try {
    // Buscar si ya existe un registro para este miembro
    const { data: existing, error: searchError } = await supabase
      .from('asistencia_gym')
      .select('*')
      .eq('gym_id', gymId)
      .eq('member_id', member.id)
      .single()

    if (searchError && searchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error buscando registro de asistencia:', searchError)
      return { success: false, error: searchError.message }
    }

    // Si existe, retornarlo
    if (existing) {
      const record: AttendanceGym = {
        id: existing.id,
        gym_id: existing.gym_id,
        member_id: existing.member_id,
        member_name: existing.member_name,
        membership_id: existing.membership_id,
        entrada: existing.entrada || [],
        salida: existing.salida || [],
        created_at: existing.created_at,
        updated_at: existing.updated_at
      }
      return { success: true, record }
    }

    // Si no existe, crear uno nuevo
    const { data: newRecord, error: createError } = await supabase
      .from('asistencia_gym')
      .insert({
        gym_id: gymId,
        member_id: member.id,
        member_name: member.name,
        membership_id: member.membershipId,
        entrada: [],
        salida: []
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creando registro de asistencia:', createError)
      return { success: false, error: createError.message }
    }

    const record: AttendanceGym = {
      id: newRecord.id,
      gym_id: newRecord.gym_id,
      member_id: newRecord.member_id,
      member_name: newRecord.member_name,
      membership_id: newRecord.membership_id,
      entrada: newRecord.entrada || [],
      salida: newRecord.salida || [],
      created_at: newRecord.created_at,
      updated_at: newRecord.updated_at
    }

    return { success: true, record }
  } catch (error: any) {
    console.error('Error en getOrCreateAttendanceRecord:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Fichar entrada de un miembro
export async function checkInMember(gymId: string, member: Member): Promise<{ success: boolean; error?: string; record?: AttendanceGym }> {
  try {
    if (!gymId || gymId.trim() === '') {
      return { success: false, error: 'gym_id es requerido para fichar entrada' }
    }

    // Obtener o crear el registro de asistencia
    const recordResult = await getOrCreateAttendanceRecord(gymId, member)
    if (!recordResult.success || !recordResult.record) {
      return recordResult
    }

    const record = recordResult.record
    const now = new Date().toISOString()

    // Agregar la nueva entrada al array
    const newEntradas = [...(record.entrada || []), now]

    // Actualizar el registro
    const { data: updated, error } = await supabase
      .from('asistencia_gym')
      .update({
        entrada: newEntradas,
        member_name: member.name, // Actualizar nombre por si cambió
        membership_id: member.membershipId // Actualizar membresía por si cambió
      })
      .eq('id', record.id)
      .select()
      .single()

    if (error) {
      console.error('Error fichando entrada:', error)
      return { success: false, error: error.message }
    }

    const updatedRecord: AttendanceGym = {
      id: updated.id,
      gym_id: updated.gym_id,
      member_id: updated.member_id,
      member_name: updated.member_name,
      membership_id: updated.membership_id,
      entrada: updated.entrada || [],
      salida: updated.salida || [],
      created_at: updated.created_at,
      updated_at: updated.updated_at
    }

    return { success: true, record: updatedRecord }
  } catch (error: any) {
    console.error('Error en checkInMember:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Fichar salida de un miembro
export async function checkOutMember(gymId: string, member: Member): Promise<{ success: boolean; error?: string; record?: AttendanceGym }> {
  try {
    if (!gymId || gymId.trim() === '') {
      return { success: false, error: 'gym_id es requerido para fichar salida' }
    }

    // Obtener o crear el registro de asistencia
    const recordResult = await getOrCreateAttendanceRecord(gymId, member)
    if (!recordResult.success || !recordResult.record) {
      return recordResult
    }

    const record = recordResult.record
    const now = new Date().toISOString()

    // Agregar la nueva salida al array
    const newSalidas = [...(record.salida || []), now]

    // Actualizar el registro
    const { data: updated, error } = await supabase
      .from('asistencia_gym')
      .update({
        salida: newSalidas,
        member_name: member.name, // Actualizar nombre por si cambió
        membership_id: member.membershipId // Actualizar membresía por si cambió
      })
      .eq('id', record.id)
      .select()
      .single()

    if (error) {
      console.error('Error fichando salida:', error)
      return { success: false, error: error.message }
    }

    const updatedRecord: AttendanceGym = {
      id: updated.id,
      gym_id: updated.gym_id,
      member_id: updated.member_id,
      member_name: updated.member_name,
      membership_id: updated.membership_id,
      entrada: updated.entrada || [],
      salida: updated.salida || [],
      created_at: updated.created_at,
      updated_at: updated.updated_at
    }

    return { success: true, record: updatedRecord }
  } catch (error: any) {
    console.error('Error en checkOutMember:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Obtener todas las asistencias de un gimnasio
export async function getAttendancesGym(gymId: string): Promise<{ success: boolean; error?: string; attendances?: AttendanceGym[] }> {
  try {
    if (!gymId || gymId.trim() === '') {
      return { success: false, error: 'gym_id es requerido para obtener asistencias' }
    }

    const { data, error } = await supabase
      .from('asistencia_gym')
      .select('*')
      .eq('gym_id', gymId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error obteniendo asistencias:', error)
      return { success: false, error: error.message }
    }

    const attendances: AttendanceGym[] = (data || []).map(item => ({
      id: item.id,
      gym_id: item.gym_id,
      member_id: item.member_id,
      member_name: item.member_name,
      membership_id: item.membership_id,
      entrada: item.entrada || [],
      salida: item.salida || [],
      created_at: item.created_at,
      updated_at: item.updated_at
    }))

    return { success: true, attendances }
  } catch (error: any) {
    console.error('Error en getAttendancesGym:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Obtener asistencias de un miembro específico
export async function getMemberAttendances(gymId: string, memberId: string): Promise<{ success: boolean; error?: string; attendance?: AttendanceGym }> {
  try {
    if (!gymId || gymId.trim() === '') {
      return { success: false, error: 'gym_id es requerido' }
    }

    if (!memberId || memberId.trim() === '') {
      return { success: false, error: 'member_id es requerido' }
    }

    const { data, error } = await supabase
      .from('asistencia_gym')
      .select('*')
      .eq('gym_id', gymId)
      .eq('member_id', memberId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No existe registro, retornar null
        return { success: true, attendance: undefined }
      }
      console.error('Error obteniendo asistencias del miembro:', error)
      return { success: false, error: error.message }
    }

    const attendance: AttendanceGym = {
      id: data.id,
      gym_id: data.gym_id,
      member_id: data.member_id,
      member_name: data.member_name,
      membership_id: data.membership_id,
      entrada: data.entrada || [],
      salida: data.salida || [],
      created_at: data.created_at,
      updated_at: data.updated_at
    }

    return { success: true, attendance }
  } catch (error: any) {
    console.error('Error en getMemberAttendances:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}
