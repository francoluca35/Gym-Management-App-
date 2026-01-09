export type PaymentMethod = 'cash' | 'transfer';

export type Shift = 'morning' | 'afternoon' | 'night';

export type PaymentStatus = 'active' | 'expiring-soon' | 'expired';

export interface Employee {
  id: string;
  username: string;
  password: string;
  name: string;
}

export interface EmployeeSession {
  id: string;
  employeeId: string;
  shift: Shift;
  loginTime: string;
  logoutTime?: string;
}

export interface Membership {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipStart: string;
  membershipExpiry: string;
  membershipId: string;
  paymentMethod: PaymentMethod;
  lastPaymentDate: string;
  lastPaymentAmount?: number; // Monto total pagado en el último pago (precio * meses)
  registrationFee?: number;
  registrationFeePaid?: boolean;
  registrationFeePaymentDate?: string; // Fecha en que se pagó la inscripción
  imageUrl?: string;
  rfidCardId?: string; // ID único de la tarjeta RFID/NFC
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  checkIn: string;
  checkOut?: string;
}

// Nueva estructura para asistencias en la base de datos
export interface AttendanceGym {
  id: string;
  gym_id: string;
  member_id: string;
  member_name: string;
  membership_id: string;
  entrada: string[]; // Array de timestamps de entrada
  salida: string[]; // Array de timestamps de salida
  created_at?: string;
  updated_at?: string;
}