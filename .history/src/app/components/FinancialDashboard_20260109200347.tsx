import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Users, CreditCard, AlertCircle } from "lucide-react";
import { Member, Membership } from "../types";
import { getPaymentStatus, formatCurrency } from "../utils/helpers";

interface FinancialDashboardProps {
  members: Member[];
  memberships: Membership[];
}

export function FinancialDashboard({ members, memberships }: FinancialDashboardProps) {
  // Función helper para obtener el precio de la membresía
  const getMembershipPrice = (membershipId: string) => {
    return memberships.find(m => m.id === membershipId)?.price || 0;
  };

  // Cálculos financieros
  const totalActiveMembers = members.filter(m => getPaymentStatus(m.membershipExpiry) === 'active').length;
  const totalExpiredMembers = members.filter(m => getPaymentStatus(m.membershipExpiry) === 'expired').length;
  const totalExpiringSoon = members.filter(m => getPaymentStatus(m.membershipExpiry) === 'expiring-soon').length;

  const monthlyRevenue = members
    .filter(m => getPaymentStatus(m.membershipExpiry) === 'active')
    .reduce((sum, m) => sum + getMembershipPrice(m.membershipId), 0);

  const potentialRevenue = members.reduce((sum, m) => sum + getMembershipPrice(m.membershipId), 0);
  const lostRevenue = members
    .filter(m => getPaymentStatus(m.membershipExpiry) === 'expired')
    .reduce((sum, m) => sum + getMembershipPrice(m.membershipId), 0);

  // Distribución por método de pago
  const cashPayments = members.filter(m => m.paymentMethod === 'cash').length;
  const transferPayments = members.filter(m => m.paymentMethod === 'transfer').length;

  const paymentMethodData = [
    { name: 'Efectivo', value: cashPayments, color: '#fbbf24' },
    { name: 'Transferencia', value: transferPayments, color: '#f59e0b' },
  ];

  // Datos de ingresos mensuales (simulado para los últimos 6 meses)
  const monthlyData = [
    { month: 'Ago', revenue: monthlyRevenue * 0.85, members: totalActiveMembers * 0.85 },
    { month: 'Sep', revenue: monthlyRevenue * 0.90, members: totalActiveMembers * 0.90 },
    { month: 'Oct', revenue: monthlyRevenue * 0.95, members: totalActiveMembers * 0.95 },
    { month: 'Nov', revenue: monthlyRevenue * 0.92, members: totalActiveMembers * 0.92 },
    { month: 'Dic', revenue: monthlyRevenue * 0.97, members: totalActiveMembers * 0.97 },
    { month: 'Ene', revenue: monthlyRevenue, members: totalActiveMembers },
  ];

  // Estado de membresías
  const membershipStatusData = [
    { name: 'Activas', value: totalActiveMembers, color: '#10b981' },
    { name: 'Por Vencer', value: totalExpiringSoon, color: '#f59e0b' },
    { name: 'Vencidas', value: totalExpiredMembers, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ingresosf Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              De {totalActiveMembers} miembros activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ingresos Potenciales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(potentialRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Si todos pagaran ({members.length} miembros)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ingresos Perdidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(lostRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              De {totalExpiredMembers} cuotas vencidas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Tasa de Retención</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {members.length > 0 ? Math.round((totalActiveMembers / members.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Miembros con cuota al día
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
            <CardDescription>Evolución de ingresos en los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="month" stroke="#a1a1a1" />
                <YAxis stroke="#a1a1a1" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#252525', border: '1px solid #404040' }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line type="monotone" dataKey="revenue" stroke="#fbbf24" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado de Membresías</CardTitle>
            <CardDescription>Distribución actual de membresías</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={membershipStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {membershipStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#252525', border: '1px solid #404040' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pago</CardTitle>
            <CardDescription>Preferencias de pago de los miembros</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentMethodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="name" stroke="#a1a1a1" />
                <YAxis stroke="#a1a1a1" />
                <Tooltip contentStyle={{ backgroundColor: '#252525', border: '1px solid #404040' }} />
                <Bar dataKey="value" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Crecimiento de Miembros</CardTitle>
            <CardDescription>Evolución de la base de miembros</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                <XAxis dataKey="month" stroke="#a1a1a1" />
                <YAxis stroke="#a1a1a1" />
                <Tooltip contentStyle={{ backgroundColor: '#252525', border: '1px solid #404040' }} />
                <Bar dataKey="members" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de alertas */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas de Pagos</CardTitle>
          <CardDescription>Miembros que requieren atención</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {totalExpiredMembers > 0 && (
              <div className="flex items-center gap-3 p-4 border border-destructive rounded-lg bg-destructive/10">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-medium">
                    {totalExpiredMembers} miembros con cuota vencida
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ingresos perdidos: {formatCurrency(lostRevenue)}
                  </p>
                </div>
              </div>
            )}
            
            {totalExpiringSoon > 0 && (
              <div className="flex items-center gap-3 p-4 border border-amber-600 rounded-lg bg-amber-600/10">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <div>
                  <p className="font-medium">
                    {totalExpiringSoon} miembros con cuota por vencer
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Realizar seguimiento para renovación
                  </p>
                </div>
              </div>
            )}

            {totalExpiredMembers === 0 && totalExpiringSoon === 0 && (
              <p className="text-center text-muted-foreground py-8">
                ¡Excelente! No hay alertas pendientes
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}