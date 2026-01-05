import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, DollarSign, TrendingUp, Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Member, AttendanceRecord, Membership } from "../types";
import { getPaymentStatus, formatCurrency } from "../utils/helpers";

interface DashboardProps {
  members: Member[];
  attendanceRecords: AttendanceRecord[];
  memberships: Membership[];
}

export function Dashboard({ members, attendanceRecords, memberships }: DashboardProps) {
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

  const potentialRevenue = members.reduce((sum, m) => sum + getMembershipPrice(m.membershipId), 0);

  // Estadísticas de asistencia
  const today = new Date().toDateString();
  const todayAttendance = attendanceRecords.filter(r => 
    new Date(r.checkIn).toDateString() === today
  ).length;

  const activeSessions = attendanceRecords.filter(r => !r.checkOut).length;

  // Gráfico de membresías por tipo
  const membershipDistribution = memberships.map(membership => ({
    name: membership.name,
    count: members.filter(m => m.membershipId === membership.id).length,
  }));

  // Datos para gráfico de últimos 7 días
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toDateString();
    const count = attendanceRecords.filter(r => 
      new Date(r.checkIn).toDateString() === dateStr
    ).length;
    
    return {
      day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      asistencias: count,
    };
  });

  return (
    <div className="space-y-6">
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
            <CardTitle className="text-sm">Ingresos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              de {formatCurrency(potentialRevenue)} potencial
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
            <div className="text-2xl">
              {totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {expiredMembers} cuotas vencidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas rápidas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-600/50 bg-green-600/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Cuotas al Día</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{activeMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">Miembros activos</p>
          </CardContent>
        </Card>

        <Card className="border-amber-600/50 bg-amber-600/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Por Vencer</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{expiringSoon}</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren seguimiento</p>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Vencidas</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{expiredMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren atención urgente</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
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

      {/* Resumen de membresías */}
      <Card>
        <CardHeader>
          <CardTitle>Planes de Membresía</CardTitle>
          <CardDescription>Información de planes disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {memberships.map(membership => {
              const memberCount = members.filter(m => m.membershipId === membership.id).length;
              const revenue = memberCount * membership.price;
              
              return (
                <div key={membership.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4>{membership.name}</h4>
                    <Badge>{memberCount} miembros</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{membership.description}</p>
                  <div className="space-y-1">
                    <p className="text-lg text-primary">{formatCurrency(membership.price)}/mes</p>
                    <p className="text-xs text-muted-foreground">
                      Ingresos: {formatCurrency(revenue)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
