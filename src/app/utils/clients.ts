import { supabase } from '../../lib/supabase'
import { Member, PaymentMethod } from '../types'

// Agregar nuevo cliente al gimnasio
export async function addClientGym(gymId: string, memberData: Omit<Member, 'id'>): Promise<{ success: boolean; error?: string; client?: Member }> {
  try {
    // Validar que gymId esté presente
    if (!gymId || gymId.trim() === '') {
      return { success: false, error: 'gym_id es requerido para agregar un cliente' }
    }

    console.log('Agregando cliente con gym_id:', gymId)
    
    const { data, error } = await supabase
      .from('client_gym')
      .insert({
        gym_id: gymId,
        name: memberData.name,
        email: memberData.email,
        phone: memberData.phone,
        membership_start: memberData.membershipStart,
        membership_expiry: memberData.membershipExpiry,
        membership_id: memberData.membershipId,
        payment_method: memberData.paymentMethod,
        last_payment_date: memberData.lastPaymentDate,
        registration_fee: memberData.registrationFee || 0,
        registration_fee_paid: memberData.registrationFeePaid || false,
        image_url: memberData.imageUrl || null,
        rfid_card_id: memberData.rfidCardId || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error agregando cliente:', error)
      return { success: false, error: error.message }
    }

    // Convertir el formato de la base de datos al formato Member
    const client: Member = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      membershipStart: data.membership_start,
      membershipExpiry: data.membership_expiry,
      membershipId: data.membership_id,
      paymentMethod: data.payment_method as PaymentMethod,
      lastPaymentDate: data.last_payment_date,
      registrationFee: data.registration_fee || 0,
      registrationFeePaid: data.registration_fee_paid || false,
      imageUrl: data.image_url || undefined,
      rfidCardId: data.rfid_card_id || undefined
    }

    return { success: true, client }
  } catch (error: any) {
    console.error('Error en addClientGym:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Obtener todos los clientes de un gimnasio
export async function getClientsGym(gymId: string): Promise<{ success: boolean; error?: string; clients?: Member[] }> {
  try {
    // Validar que gymId esté presente
    if (!gymId || gymId.trim() === '') {
      return { success: false, error: 'gym_id es requerido para obtener clientes' }
    }

    console.log('Obteniendo clientes para gym_id:', gymId)
    
    const { data, error } = await supabase
      .from('client_gym')
      .select('*')
      .eq('gym_id', gymId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error obteniendo clientes:', error)
      return { success: false, error: error.message }
    }

    // Convertir el formato de la base de datos al formato Member
    const clients: Member[] = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      membershipStart: item.membership_start,
      membershipExpiry: item.membership_expiry,
      membershipId: item.membership_id,
      paymentMethod: item.payment_method as PaymentMethod,
      lastPaymentDate: item.last_payment_date,
      registrationFee: item.registration_fee || 0,
      registrationFeePaid: item.registration_fee_paid || false,
      imageUrl: item.image_url || undefined,
      rfidCardId: item.rfid_card_id || undefined
    }))

    return { success: true, clients }
  } catch (error: any) {
    console.error('Error en getClientsGym:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Actualizar cliente
export async function updateClientGym(clientId: string, memberData: Partial<Member>): Promise<{ success: boolean; error?: string; client?: Member }> {
  try {
    const updateData: any = {}
    
    if (memberData.name !== undefined) updateData.name = memberData.name
    if (memberData.email !== undefined) updateData.email = memberData.email
    if (memberData.phone !== undefined) updateData.phone = memberData.phone
    if (memberData.membershipStart !== undefined) updateData.membership_start = memberData.membershipStart
    if (memberData.membershipExpiry !== undefined) updateData.membership_expiry = memberData.membershipExpiry
    if (memberData.membershipId !== undefined) updateData.membership_id = memberData.membershipId
    if (memberData.paymentMethod !== undefined) updateData.payment_method = memberData.paymentMethod
    if (memberData.lastPaymentDate !== undefined) updateData.last_payment_date = memberData.lastPaymentDate
    if (memberData.registrationFee !== undefined) updateData.registration_fee = memberData.registrationFee
    if (memberData.registrationFeePaid !== undefined) updateData.registration_fee_paid = memberData.registrationFeePaid
    if (memberData.imageUrl !== undefined) updateData.image_url = memberData.imageUrl
    if (memberData.rfidCardId !== undefined) updateData.rfid_card_id = memberData.rfidCardId

    const { data, error } = await supabase
      .from('client_gym')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      console.error('Error actualizando cliente:', error)
      return { success: false, error: error.message }
    }

    // Convertir el formato de la base de datos al formato Member
    const client: Member = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      membershipStart: data.membership_start,
      membershipExpiry: data.membership_expiry,
      membershipId: data.membership_id,
      paymentMethod: data.payment_method as PaymentMethod,
      lastPaymentDate: data.last_payment_date,
      registrationFee: data.registration_fee || 0,
      registrationFeePaid: data.registration_fee_paid || false,
      imageUrl: data.image_url || undefined,
      rfidCardId: data.rfid_card_id || undefined
    }

    return { success: true, client }
  } catch (error: any) {
    console.error('Error en updateClientGym:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Eliminar cliente
export async function deleteClientGym(clientId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('client_gym')
      .delete()
      .eq('id', clientId)

    if (error) {
      console.error('Error eliminando cliente:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error en deleteClientGym:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}

// Pagar cuota de membresía (actualizar fechas de pago y vencimiento)
export async function payMembership(clientId: string, months: number = 1): Promise<{ success: boolean; error?: string; client?: Member }> {
  try {
    const today = new Date()
    const newExpiryDate = new Date(today)
    // Agregar meses a la fecha actual
    newExpiryDate.setMonth(today.getMonth() + months)

    const todayStr = today.toISOString().split('T')[0]
    const expiryStr = newExpiryDate.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('client_gym')
      .update({
        last_payment_date: todayStr,
        membership_expiry: expiryStr
      })
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      console.error('Error pagando membresía:', error)
      return { success: false, error: error.message }
    }

    // Convertir el formato de la base de datos al formato Member
    const client: Member = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      membershipStart: data.membership_start,
      membershipExpiry: data.membership_expiry,
      membershipId: data.membership_id,
      paymentMethod: data.payment_method as PaymentMethod,
      lastPaymentDate: data.last_payment_date,
      registrationFee: data.registration_fee || 0,
      registrationFeePaid: data.registration_fee_paid || false,
      imageUrl: data.image_url || undefined,
      rfidCardId: data.rfid_card_id || undefined
    }

    return { success: true, client }
  } catch (error: any) {
    console.error('Error en payMembership:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}
