import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, TrendingUp, Users, AlertCircle, TrendingDown, FileText, FileSpreadsheet, Trash2, Calendar } from "lucide-react";
import { Member, Membership } from "../types";
import { getPaymentStatus, formatCurrency, formatDate } from "../utils/helpers";
import { supabase } from "../../lib/supabase";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

interface FinancialDashboardProps {
  members: Member[];
  memberships: Membership[];
  gymId?: string | null;
  onMembersUpdated?: () => void; // Callback para actualizar la lista de miembros después de borrar
}

export function FinancialDashboard({ members, memberships, gymId, onMembersUpdated }: FinancialDashboardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Obtener gymId del localStorage si no se pasa como prop
  const currentGymId = gymId || localStorage.getItem('gym_id');

  // Meses del año
  const months = [
    { value: '0', label: 'Enero' },
    { value: '1', label: 'Febrero' },
    { value: '2', label: 'Marzo' },
    { value: '3', label: 'Abril' },
    { value: '4', label: 'Mayo' },
    { value: '5', label: 'Junio' },
    { value: '6', label: 'Julio' },
    { value: '7', label: 'Agosto' },
    { value: '8', label: 'Septiembre' },
    { value: '9', label: 'Octubre' },
    { value: '10', label: 'Noviembre' },
    { value: '11', label: 'Diciembre' },
  ];

  const toggleMonth = (monthValue: string) => {
    setSelectedMonths(prev => 
      prev.includes(monthValue)
        ? prev.filter(m => m !== monthValue)
        : [...prev, monthValue]
    );
  };

  const toggleMonth = (monthValue: string) => {
    setSelectedMonths(prev => 
      prev.includes(monthValue)
        ? prev.filter(m => m !== monthValue)
        : [...prev, monthValue]
    );
  };

  // Función helper para obtener el precio de la membresía
  const getMembershipPrice = (membershipId: string) => {
    return memberships.find(m => m.id === membershipId)?.price || 0;
  };

  // Cálculos financieros basados en datos reales
  const totalActiveMembers = members.filter(m => getPaymentStatus(m.membershipExpiry) === 'active').length;
  const totalExpiredMembers = members.filter(m => getPaymentStatus(m.membershipExpiry) === 'expired').length;
  const totalExpiringSoon = members.filter(m => getPaymentStatus(m.membershipExpiry) === 'expiring-soon').length;

  // Calcular ingresos mensuales reales (últimos 30 días) basados en pagos efectivos
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // Ingresos totales del mes: suma membresías + inscripciones por cada miembro
  const monthlyRevenue = members.reduce((total, m) => {
    let memberRevenue = 0;
    
    // Verificar si pagó membresía en los últimos 30 días
    const lastPayment = new Date(m.lastPaymentDate);
    if (lastPayment >= thirtyDaysAgo && lastPayment <= today && m.lastPaymentAmount && m.lastPaymentAmount > 0) {
      memberRevenue += m.lastPaymentAmount || 0;
    }
    
    // Verificar si pagó inscripción en los últimos 30 días
    if (m.registrationFeePaid && m.registrationFeePaymentDate && m.registrationFee) {
      const registrationPayment = new Date(m.registrationFeePaymentDate);
      if (registrationPayment >= thirtyDaysAgo && registrationPayment <= today) {
        memberRevenue += m.registrationFee || 0;
      }
    }
    
    return total + memberRevenue;
  }, 0);

  // Desglose de ingresos mensuales
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

  // Ingresos potenciales (si todos los miembros activos pagaran)
  const potentialRevenue = totalActiveMembers > 0
    ? members
        .filter(m => getPaymentStatus(m.membershipExpiry) === 'active')
        .reduce((sum, m) => sum + getMembershipPrice(m.membershipId), 0)
    : 0;

  // Ingresos perdidos (de miembros con cuota vencida)
  const lostRevenue = members
    .filter(m => getPaymentStatus(m.membershipExpiry) === 'expired')
    .reduce((sum, m) => sum + getMembershipPrice(m.membershipId), 0);

  // Total de ingresos por inscripciones (todas las inscripciones pagadas)
  const totalRegistrationRevenue = members
    .filter(m => m.registrationFeePaid && m.registrationFee)
    .reduce((sum, m) => sum + (m.registrationFee || 0), 0);

  // Total de ingresos por membresías (suma de todos los lastPaymentAmount)
  const totalMembershipRevenue = members
    .filter(m => m.lastPaymentAmount && m.lastPaymentAmount > 0)
    .reduce((sum, m) => sum + (m.lastPaymentAmount || 0), 0);

  // Total de ingresos históricos
  const totalRevenue = totalMembershipRevenue + totalRegistrationRevenue;

  // Distribución por método de pago (basado en paymentMethod real)
  const cashPayments = members.filter(m => m.paymentMethod === 'cash').length;
  const transferPayments = members.filter(m => m.paymentMethod === 'transfer').length;

  const paymentMethodData = [
    { name: 'Efectivo', value: cashPayments, color: '#fbbf24' },
    { name: 'Transferencia', value: transferPayments, color: '#f59e0b' },
  ];

  // Calcular ingresos mensuales reales para los últimos 12 meses
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Calcular ingresos por miembro: suma membresía + inscripción si se pagaron en el mismo mes
    const monthlyRevenue = members.reduce((total, m) => {
      let memberRevenue = 0;
      
      // Verificar si pagó membresía en ese mes
      const paymentDate = new Date(m.lastPaymentDate);
      if (paymentDate.getFullYear() === year && paymentDate.getMonth() === month && m.lastPaymentAmount && m.lastPaymentAmount > 0) {
        memberRevenue += m.lastPaymentAmount || 0;
      }
      
      // Verificar si pagó inscripción en ese mismo mes
      if (m.registrationFeePaid && m.registrationFeePaymentDate && m.registrationFee) {
        const registrationPayment = new Date(m.registrationFeePaymentDate);
        if (registrationPayment.getFullYear() === year && registrationPayment.getMonth() === month) {
          memberRevenue += m.registrationFee || 0;
        }
      }
      
      return total + memberRevenue;
    }, 0);

    // Contar miembros activos al final de ese mes
    const activeMembersAtMonth = members.filter(m => {
      const expiryDate = new Date(m.membershipExpiry);
      return expiryDate.getFullYear() > year || (expiryDate.getFullYear() === year && expiryDate.getMonth() >= month);
    }).length;

    return {
      month: date.toLocaleDateString('es-ES', { month: 'short' }),
      revenue: monthlyRevenue,
      members: activeMembersAtMonth,
    };
  });

  // Estado de membresías
  const membershipStatusData = [
    { name: 'Activas', value: totalActiveMembers, color: '#10b981' },
    { name: 'Por Vencer', value: totalExpiringSoon, color: '#f59e0b' },
    { name: 'Vencidas', value: totalExpiredMembers, color: '#ef4444' },
  ];

  // Tasa de retención
  const retentionRate = members.length > 0 ? Math.round((totalActiveMembers / members.length) * 100) : 0;

  // Transacciones recientes (últimos pagos)
  const recentPayments = members
    .filter(m => {
      if (m.lastPaymentAmount && m.lastPaymentAmount > 0) {
        const paymentDate = new Date(m.lastPaymentDate);
        const daysDiff = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 30; // Últimos 30 días
      }
      return false;
    })
    .sort((a, b) => {
      const dateA = new Date(a.lastPaymentDate).getTime();
      const dateB = new Date(b.lastPaymentDate).getTime();
      return dateB - dateA; // Más reciente primero
    })
    .slice(0, 10) // Últimas 10 transacciones
    .map(m => ({
      member: m.name,
      type: 'Membresía',
      amount: m.lastPaymentAmount || 0,
      date: m.lastPaymentDate,
      method: m.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia',
    }));

  // Agregar inscripciones pagadas recientes
  const recentRegistrations = members
    .filter(m => {
      if (m.registrationFeePaid && m.registrationFeePaymentDate && m.registrationFee) {
        const paymentDate = new Date(m.registrationFeePaymentDate);
        const daysDiff = Math.floor((today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 30; // Últimos 30 días
      }
      return false;
    })
    .sort((a, b) => {
      const dateA = new Date(a.registrationFeePaymentDate || '').getTime();
      const dateB = new Date(b.registrationFeePaymentDate || '').getTime();
      return dateB - dateA;
    })
    .slice(0, 10)
    .map(m => ({
      member: m.name,
      type: 'Inscripción',
      amount: m.registrationFee || 0,
      date: m.registrationFeePaymentDate || '',
      method: m.paymentMethod === 'cash' ? 'Efectivo' : 'Transferencia',
    }));

  // Combinar y ordenar todas las transacciones recientes
  const allRecentTransactions = [...recentPayments, ...recentRegistrations]
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    })
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Botones de acción */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <Button 
              onClick={handleGeneratePDF}
              variant="outline"
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Generar PDF
            </Button>
            
            <Button 
              onClick={handleGenerateExcel}
              variant="outline"
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Generar Excel
            </Button>
            
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Borrar Datos por Mes
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Borrar Datos de Clientes por Mes</DialogTitle>
                  <DialogDescription>
                    Selecciona el año y los meses de los cuales deseas borrar los datos de clientes. 
                    Esta acción solo borrará los datos de la tabla client_gym, no afectará otras tablas.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="year">Año</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Selecciona el año" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 5 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Meses a borrar</Label>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                      {months.map((month) => (
                        <div key={month.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`month-${month.value}`}
                            checked={selectedMonths.includes(month.value)}
                            onChange={() => toggleMonth(month.value)}
                            className="rounded border-gray-300"
                          />
                          <Label 
                            htmlFor={`month-${month.value}`}
                            className="text-sm cursor-pointer"
                          >
                            {month.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {selectedMonths.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {selectedMonths.length} mes(es) seleccionado(s)
                      </p>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDeleteDialogOpen(false);
                      setSelectedMonths([]);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteMonthData}
                    disabled={isDeleting || selectedMonths.length === 0}
                  >
                    {isDeleting ? 'Borrando...' : 'Borrar Datos'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ingresos Mensuales</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Membresías: {formatCurrency(monthlyRevenueFromMemberships)} | Inscripciones: {formatCurrency(monthlyRegistrationRevenue)}
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
              De {totalActiveMembers} miembros activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ingresos Perdidos</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
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
              {retentionRate}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalActiveMembers} de {members.length} miembros activos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumen financiero adicional */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Ingresos Totales Históricos</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Membresías: {formatCurrency(totalMembershipRevenue)} | Inscripciones: {formatCurrency(totalRegistrationRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Miembros Totales</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{members.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalActiveMembers} activos, {totalExpiringSoon} por vencer, {totalExpiredMembers} vencidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Promedio Mensual</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {formatCurrency(monthlyData.length > 0 
                ? monthlyData.reduce((sum, m) => sum + m.revenue, 0) / monthlyData.length 
                : 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Promedio de los últimos 12 meses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ingresos Mensuales</CardTitle>
            <CardDescription>Evolución de ingresos reales en los últimos 12 meses</CardDescription>
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
                <Line type="monotone" dataKey="revenue" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24', r: 4 }} />
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
            <CardDescription>Distribución de métodos de pago utilizados</CardDescription>
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
            <CardDescription>Evolución de miembros activos en los últimos 12 meses</CardDescription>
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

      {/* Transacciones recientes */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones Recientes</CardTitle>
          <CardDescription>Últimos pagos registrados (últimos 30 días)</CardDescription>
        </CardHeader>
        <CardContent>
          {allRecentTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Miembro</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRecentTransactions.map((transaction, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{transaction.member}</TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'Membresía' ? 'default' : 'secondary'}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.method}</TableCell>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No hay transacciones recientes en los últimos 30 días
            </p>
          )}
        </CardContent>
      </Card>

      {/* Alertas de pagos */}
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
