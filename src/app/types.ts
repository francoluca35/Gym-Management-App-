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
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  checkIn: string;
  checkOut?: string;
}