import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, DollarSign, TrendingUp, Activity, AlertCircle, CheckCircle, Clock, Wifi, WifiOff, ArrowRight, Database } from "lucide-react";
import { Member, AttendanceRecord, Membership, AttendanceGym } from "../types";
import { getPaymentStatus, formatCurrency } from "../utils/helpers";
import { supabase } from "../../lib/supabase";

interface DashboardProps {
  members: Member[];
  attendanceRecords: AttendanceRecord[];
  attendancesGym: AttendanceGym[]; // Datos de asistencia desde la BD
  memberships: Membership[];
  onNavigateToMembers: (filter: 'expiring-soon' | 'expired' | null) => void;
}

export function Dashboard({ members, attendanceRecords, attendancesGym, memberships, onNavigateToMembers }: DashboardProps) {
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  // Verificar conexión a la base de datos
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsCheckingConnection(true);
        const { data, error } = await supabase
          .from('gimnasios')
          .select('gym_id')
          .limit(1);
        
        setDbConnected(!error && data !== null);
      } catch (error) {
        console.error('Error verificando conexión:', error);
        setDbConnected(false);
      } finally {
        setIsCheckingConnection(false);
      }
    };

    checkConnection();
  }, []);

  // Estadísticas de miembros
  const totalMembers = members.length;
  const activeMembers = members.filter(m => getPaymentStatus(m.membershipExpiry) === 'active').length;
  const expiredMembers = members.filter(m => getPaymentStatus(m.membershipExpiry) === 'expired').length;
  const expiringSoon = members.filter(m => getPaymentStatus(m.membershipExpiry) === 'expiring-soon').length;

  // Estadísticas financieras
  const getMembershipPrice = (membershipId: string) => {
    return memberships.find(m => m.id === membershipId)?.price || 0;
  };

  const monthlyRevenue = members
    .filter(m => getPaymentStatus(m.membershipExpiry) === 'active')
    .reduce((sum, m) => sum + getMembershipPrice(m.membershipId), 0);

  // Calcular ingresos mensuales reales basado en pagos efectivos (últimos 30 días)
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  // Ingresos totales del mes: suma membresías + inscripciones por cada miembro
  // Si un miembro pagó membresía Y inscripción en el mismo mes, ambos se suman
  const totalMonthlyRevenue = members.reduce((total, m) => {
    let memberRevenue = 0;
    
    // Verificar si pagó membresía en los últimos 30 días
    const lastPayment = new Date(m.lastPaymentDate);
    if (lastPayment >= thirtyDaysAgo && lastPayment <= today && m.lastPaymentAmount && m.lastPaymentAmount > 0) {
      memberRevenue += m.lastPaymentAmount || 0;
    }
    
    // Verificar si pagó inscripción en los últimos 30 días
    // Si pagó inscripción en el mismo mes que la membresía (o cuando se registró), se suma
    if (m.registrationFeePaid && m.registrationFeePaymentDate && m.registrationFee) {
      const registrationPayment = new Date(m.registrationFeePaymentDate);
      if (registrationPayment >= thirtyDaysAgo && registrationPayment <= today) {
        memberRevenue += m.registrationFee || 0;
      }
    }
    
    return total + memberRevenue;
  }, 0);

  // Calcular desglose por separado para mostrar en el tooltip
  const monthlyRevenueFromMemberships = members
    .filter(m => {
      const lastPayment = new Date(m.lastPaymentDate);
      return lastPayment >= thirtyDaysAgo && lastPayment <= today && m.lastPaymentAmount && m.lastPaymentAmount > 0;
    })
    .reduce((sum, m) => sum + (m.lastPaymentAmount || 0), 0);

  const monthlyRegistrationRevenue = members
    .filter(m => {
      if (!m.registrationFeePaid || !m.registrationFeePaymentDate || !m.registrationFee) return false;
      const registrationPayment = new Date(m.registrationFeePaymentDate);
      return registrationPayment >= thirtyDaysAgo && registrationPayment <= today;
    })
    .reduce((sum, m) => sum + (m.registrationFee || 0), 0);

  // Calcular tasa de retención (miembros activos / total miembros)
  const retentionRate = totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  // Calcular asistencias del día actual usando AttendanceGym
  const todayStr = today.toISOString().split('T')[0];
  const todayAttendance = attendancesGym.reduce((count, attendance) => {
    const entradasHoy = (attendance.entrada || []).filter(entrada => {
      return entrada.split('T')[0] === todayStr;
    }).length;
    return count + entradasHoy;
  }, 0);

  // Sesiones activas (entradas sin salida correspondiente)
  const activeSessions = attendancesGym.reduce((count, attendance) => {
    const entradas = attendance.entrada || [];
    const salidas = attendance.salida || [];
    // Si hay más entradas que salidas, hay sesiones activas
    return count + Math.max(0, entradas.length - salidas.length);
  }, 0);

  // Miembros con cuotas al día (activos)
  const cuotasAlDia = activeMembers;

  // Miembros con cuotas por vencer
  const cuotasPorVencer = expiringSoon;

  // Miembros con cuotas vencidas (ordenados de más reciente a más antigua)
  const cuotasVencidas = members
    .filter(m => getPaymentStatus(m.membershipExpiry) === 'expired')
    .sort((a, b) => {
      // Ordenar por fecha de vencimiento: más reciente primero
      const dateA = new Date(a.membershipExpiry).getTime();
      const dateB = new Date(b.membershipExpiry).getTime();
      return dateB - dateA; // Orden descendente
    });

  // Gráfico de membresías por tipo
  const membershipDistribution = memberships.map(membership => ({
    name: membership.name,
    count: members.filter(m => m.membershipId === membership.id).length,
  }));

  // Datos para gráfico de asistencias últimos 7 días usando AttendanceGym
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    
    // Contar asistencias del día en todos los registros
    const count = attendancesGym.reduce((total, attendance) => {
      const entradasDia = (attendance.entrada || []).filter(entrada => {
        return entrada.split('T')[0] === dateStr;
      }).length;
      return total + entradasDia;
    }, 0);
    
    return {
      day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      asistencias: count,
    };
  });

  // Calcular pérdidas y ganancias mes a mes (basado en pagos reales)
  // Por cada miembro, suma membresía + inscripción si ambos se pagaron en el mismo mes
  const profitLossData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Calcular ingresos por miembro: suma membresía + inscripción si se pagaron en el mismo mes
    const ingresos = members.reduce((total, m) => {
      let memberRevenue = 0;
      
      // Verificar si pagó membresía en ese mes
      const paymentDate = new Date(m.lastPaymentDate);
      if (paymentDate.getFullYear() === year && paymentDate.getMonth() === month && m.lastPaymentAmount && m.lastPaymentAmount > 0) {
        memberRevenue += m.lastPaymentAmount || 0;
      }
      
      // Verificar si pagó inscripción en ese mismo mes (se suma al ingreso del mes)
      if (m.registrationFeePaid && m.registrationFeePaymentDate && m.registrationFee) {
        const registrationPayment = new Date(m.registrationFeePaymentDate);
        if (registrationPayment.getFullYear() === year && registrationPayment.getMonth() === month) {
          memberRevenue += m.registrationFee || 0;
        }
      }
      
      return total + memberRevenue;
    }, 0);

    // Calcular pérdidas (miembros que vencieron en ese mes y están actualmente vencidos)
    const membersExpiredThisMonth = members.filter(m => {
      const expiryDate = new Date(m.membershipExpiry);
      const status = getPaymentStatus(m.membershipExpiry);
      // Solo contar como pérdida si está vencida y venció en ese mes específico
      return status === 'expired' && expiryDate.getFullYear() === year && expiryDate.getMonth() === month;
    });

    const perdidas = membersExpiredThisMonth.reduce((sum, m) => {
      return sum + getMembershipPrice(m.membershipId);
    }, 0);

    return {
      mes: date.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      ingresos: ingresos,
      perdidas: perdidas,
      ganancia: ingresos - perdidas,
    };
  });

  return (
    <div className="space-y-6">
      {/* Estado de conexión a base de datos */}
      <Card className={`border-2 ${dbConnected ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className={`w-5 h-5 ${dbConnected ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="font-medium">
                  {dbConnected ? 'Base de datos conectada' : 'Base de datos desconectada'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isCheckingConnection 
                    ? 'Verificando conexión...' 
                    : dbConnected 
                    ? 'Todos los datos se están sincronizando correctamente'
                    : 'Error al conectar con la base de datos'}
                </p>
              </div>
            </div>
            {dbConnected ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Miembros</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{totalMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeMembers} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Asistencia Hoy</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{todayAttendance}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeSessions} en el gimnasio ahora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Tasa de Retención</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{retentionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeMembers} de {totalMembers} miembros activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ingresos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(totalMonthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Membresías: {formatCurrency(monthlyRevenueFromMemberships)} | Inscripciones: {formatCurrency(monthlyRegistrationRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas rápidas de cuotas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-600/50 bg-green-600/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Cuotas al Día</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{cuotasAlDia}</div>
            <p className="text-xs text-muted-foreground mt-1">Miembros activos</p>
          </CardContent>
        </Card>

        <Card className="border-amber-600/50 bg-amber-600/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Por Vencer</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl">{cuotasPorVencer}</div>
                <p className="text-xs text-muted-foreground mt-1">Requieren seguimiento</p>
              </div>
              {cuotasPorVencer > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onNavigateToMembers('expiring-soon')}
                  className="gap-1"
                >
                  Ver <ArrowRight className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl">{expiredMembers}</div>
                <p className="text-xs text-muted-foreground mt-1">Requieren atención urgente</p>
              </div>
              {expiredMembers > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onNavigateToMembers('expired')}
                  className="gap-1"
                >
                  Ver <ArrowRight className="w-3 h-3" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de estadísticas comunes */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asistencia Últimos 7 Días</CardTitle>
            <CardDescription>Registro de visitas diarias</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="day" stroke="#a1a1a1" />
                <YAxis stroke="#a1a1a1" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#252525', border: '1px solid #404040' }}
                />
                <Line type="monotone" dataKey="asistencias" stroke="#fbbf24" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Membresías</CardTitle>
            <CardDescription>Miembros por tipo de plan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={membershipDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="name" stroke="#a1a1a1" />
                <YAxis stroke="#a1a1a1" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#252525', border: '1px solid #404040' }}
                />
                <Bar dataKey="count" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Pérdidas y Ganancias mes a mes */}
      <Card>
        <CardHeader>
          <CardTitle>Pérdidas y Ganancias Mensuales</CardTitle>
          <CardDescription>Evolución de ingresos y pérdidas mes a mes (últimos 12 meses)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={profitLossData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis dataKey="mes" stroke="#a1a1a1" />
              <YAxis stroke="#a1a1a1" />
              <Tooltip
                contentStyle={{ backgroundColor: '#252525', border: '1px solid #404040' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="ingresos" 
                stroke="#10b981" 
                strokeWidth={2} 
                name="Ingresos"
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="perdidas" 
                stroke="#ef4444" 
                strokeWidth={2} 
                name="Pérdidas"
                dot={{ fill: '#ef4444', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="ganancia" 
                stroke="#fbbf24" 
                strokeWidth={2} 
                name="Ganancia Neta"
                dot={{ fill: '#fbbf24', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
