import { Member, AttendanceRecord, Employee, Membership } from "../types";

export const mockEmployees: Employee[] = [
  {
    id: 'emp1',
    username: 'admin',
    password: 'admin123',
    name: 'Juan Administrador',
  },
  {
    id: 'emp2',
    username: 'empleado1',
    password: 'emp123',
    name: 'María Empleada',
  },
];

export const mockMemberships: Membership[] = [
  {
    id: 'mem1',
    name: 'Clásica',
    price: 20000,
    description: 'Acceso a todas las máquinas y clases grupales básicas',
  },
  {
    id: 'mem2',
    name: 'Pro',
    price: 40000,
    description: 'Incluye todo lo de Clásica + clases personalizadas + nutricionista',
  },
  {
    id: 'mem3',
    name: 'Premium',
    price: 60000,
    description: 'Acceso VIP + entrenador personal + spa + todas las clases',
  },
];

export const mockMembers: Member[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    phone: '+54 11 1234-5678',
    membershipStart: '2025-12-01',
    membershipExpiry: '2026-02-01',
    membershipId: 'mem1',
    paymentMethod: 'cash',
    lastPaymentDate: '2026-01-01',
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria.gonzalez@email.com',
    phone: '+54 11 2345-6789',
    membershipStart: '2025-11-15',
    membershipExpiry: '2026-01-15',
    membershipId: 'mem2',
    paymentMethod: 'transfer',
    lastPaymentDate: '2025-12-15',
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    phone: '+54 11 3456-7890',
    membershipStart: '2025-10-01',
    membershipExpiry: '2025-12-31',
    membershipId: 'mem1',
    paymentMethod: 'cash',
    lastPaymentDate: '2025-11-01',
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana.martinez@email.com',
    phone: '+54 11 4567-8901',
    membershipStart: '2025-12-10',
    membershipExpiry: '2026-02-10',
    membershipId: 'mem3',
    paymentMethod: 'transfer',
    lastPaymentDate: '2026-01-10',
  },
  {
    id: '5',
    name: 'Roberto Silva',
    email: 'roberto.silva@email.com',
    phone: '+54 11 5678-9012',
    membershipStart: '2025-11-20',
    membershipExpiry: '2026-01-08',
    membershipId: 'mem1',
    paymentMethod: 'cash',
    lastPaymentDate: '2025-12-20',
  },
  {
    id: '6',
    name: 'Laura Fernández',
    email: 'laura.fernandez@email.com',
    phone: '+54 11 6789-0123',
    membershipStart: '2025-12-05',
    membershipExpiry: '2026-02-05',
    membershipId: 'mem2',
    paymentMethod: 'transfer',
    lastPaymentDate: '2026-01-05',
  },
];

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: 'a1',
    memberId: '1',
    checkIn: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    checkOut: undefined,
  },
  {
    id: 'a2',
    memberId: '2',
    checkIn: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    checkOut: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'a3',
    memberId: '4',
    checkIn: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    checkOut: undefined,
  },
];