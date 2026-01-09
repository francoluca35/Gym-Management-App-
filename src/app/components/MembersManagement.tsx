import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Search, UserPlus, Edit, Calendar, Trash2, CreditCard } from "lucide-react";
import { Member, Membership } from "../types";
import { MemberForm } from "./MemberForm";
import { formatDate, getDaysUntilExpiry, getPaymentStatus, formatCurrency } from "../utils/helpers";
import { Label } from "./ui/label";
import { connectRFIDReader, readRFIDCard, isRFIDReaderConnected, disconnectRFIDReader } from "../utils/rfid";
import { updateClientGym } from "../utils/clients";

interface MembersManagementProps {
  members: Member[];
  memberships: Membership[];
  onAddMember: (member: Omit<Member, 'id'>) => void;
  onUpdateMember: (id: string, member: Partial<Member>) => void;
  onDeleteMember: (id: string) => void;
  onPayMembership: (id: string, months: number) => void;
}

export function MembersManagement({ members, memberships, onAddMember, onUpdateMember, onDeleteMember, onPayMembership }: MembersManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [payingMember, setPayingMember] = useState<Member | null>(null);
  const [paymentMonths, setPaymentMonths] = useState(1);
  const [registeringCardFor, setRegisteringCardFor] = useState<string | null>(null);

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  const handleAddMember = (memberData: Omit<Member, 'id'>) => {
    onAddMember(memberData);
    setIsAddDialogOpen(false);
  };

  const handleEditMember = (memberData: Omit<Member, 'id'>) => {
    if (editingMember) {
      onUpdateMember(editingMember.id, memberData);
      setEditingMember(null);
    }
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar a ${name}?`)) {
      onDeleteMember(id);
    }
  };

  const getMembershipName = (membershipId: string) => {
    return memberships.find(m => m.id === membershipId)?.name || 'N/A';
  };

  const getMembershipPrice = (membershipId: string) => {
    return memberships.find(m => m.id === membershipId)?.price || 0;
  };

  const handlePayClick = (member: Member) => {
    setPayingMember(member);
    setPaymentMonths(1);
  };

  const handleConfirmPayment = () => {
    if (payingMember) {
      onPayMembership(payingMember.id, paymentMonths);
      setPayingMember(null);
      setPaymentMonths(1);
    }
  };

  const getStatusBadge = (member: Member) => {
    const status = getPaymentStatus(member.membershipExpiry);
    
    if (status === 'expired') {
      return <Badge variant="destructive">Vencida</Badge>;
    } else if (status === 'expiring-soon') {
      const days = getDaysUntilExpiry(member.membershipExpiry);
      return <Badge className="bg-amber-600 text-white">Vence en {days} días</Badge>;
    }
    return <Badge className="bg-green-600 text-white">Activa</Badge>;
  };

  const calculateTotalPrice = () => {
    if (!payingMember) return 0;
    const monthlyPrice = getMembershipPrice(payingMember.membershipId);
    return monthlyPrice * paymentMonths;
  };

  const handleRegisterCard = async (member: Member) => {
    setRegisteringCardFor(member.id);
    
    try {
      // Verificar/conectar el lector
      if (!isRFIDReaderConnected()) {
        const connectResult = await connectRFIDReader();
        if (!connectResult.success) {
          alert(`Error: ${connectResult.error}`);
          setRegisteringCardFor(null);
          return;
        }
      }

      // Leer la tarjeta
      const result = await readRFIDCard();
      
      if (result.success && result.cardId) {
        // Actualizar el miembro con el card_id
        const updateResult = await updateClientGym(member.id, { rfidCardId: result.cardId });
        
        if (updateResult.success && updateResult.client) {
          // Actualizar el miembro en la lista local
          onUpdateMember(member.id, { rfidCardId: result.cardId });
          alert(`¡Tarjeta RFID registrada exitosamente para ${member.name}! ID: ${result.cardId}`);
        } else {
          alert(`Error al actualizar el miembro: ${updateResult.error || 'Error desconocido'}`);
        }
      } else {
        alert(`Error al leer tarjeta: ${result.error || 'Error desconocido'}`);
      }
    } catch (error: any) {
      console.error('Error registrando tarjeta:', error);
      alert(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setRegisteringCardFor(null);
    }
  };

  const handlePayRegistrationFee = async (member: Member) => {
    if (confirm(`¿Confirmar pago de inscripción de ${formatCurrency(member.registrationFee || 0)} para ${member.name}?`)) {
      onUpdateMember(member.id, { registrationFeePaid: true });
      alert(`Inscripción marcada como pagada para ${member.name}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Diálogo de pago */}
      <Dialog open={payingMember !== null} onOpenChange={(open) => !open && setPayingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagar Cuota</DialogTitle>
          </DialogHeader>
          {payingMember && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Miembro:</p>
                <p className="font-semibold">{payingMember.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plan de Membresía:</p>
                <p className="font-semibold">{getMembershipName(payingMember.membershipId)}</p>
                <p className="text-xs text-muted-foreground">
                  Precio mensual: {formatCurrency(getMembershipPrice(payingMember.membershipId))}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMonths">Cantidad de Meses *</Label>
                <Input
                  id="paymentMonths"
                  type="number"
                  min="1"
                  max="12"
                  value={paymentMonths}
                  onChange={(e) => setPaymentMonths(Math.max(1, parseInt(e.target.value) || 1))}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Selecciona cuántos meses deseas pagar (1-12 meses)
                </p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total a pagar:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(calculateTotalPrice())}
                  </span>
                </div>
                {paymentMonths > 1 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatCurrency(getMembershipPrice(payingMember.membershipId))} × {paymentMonths} meses
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setPayingMember(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleConfirmPayment} className="bg-green-600 hover:bg-green-700">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Confirmar Pago
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gestión de Miembros</CardTitle>
              <CardDescription>Administra los miembros del gimnasio</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Agregar Miembro
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Nuevo Miembro</DialogTitle>
                </DialogHeader>
                <MemberForm 
                  memberships={memberships}
                  onSubmit={handleAddMember} 
                  onCancel={() => setIsAddDialogOpen(false)} 
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Teléfono</TableHead>
                  <TableHead>Membresía</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="hidden lg:table-cell">Vencimiento</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No se encontraron miembros
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{member.email}</TableCell>
                      <TableCell className="hidden sm:table-cell">{member.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getMembershipName(member.membershipId)}</Badge>
                        {member.registrationFee != null && member.registrationFee > 0 && (
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              Inscripción: {formatCurrency(member.registrationFee)}
                              {member.registrationFeePaid ? (
                                <span className="text-green-600 ml-1">✓</span>
                              ) : (
                                <span className="text-amber-600 ml-1">Pendiente</span>
                              )}
                            </span>
                            {!member.registrationFeePaid && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePayRegistrationFee(member)}
                                className="h-5 px-2 text-xs bg-green-600 hover:bg-green-700 text-white border-0"
                                title="Pagar inscripción"
                              >
                                Pagar
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(member)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {formatDate(member.membershipExpiry)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          {/* Botón Pagar Cuota - solo si está por vencer o vencida */}
                          {(getPaymentStatus(member.membershipExpiry) === 'expiring-soon' || 
                            getPaymentStatus(member.membershipExpiry) === 'expired') && (
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handlePayClick(member)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              title="Pagar cuota"
                            >
                              <CreditCard className="w-4 h-4 mr-1" />
                              Pagar
                            </Button>
                          )}
                          {/* Botón Registrar Tarjeta RFID - solo si no tiene tarjeta registrada */}
                          {!member.rfidCardId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRegisterCard(member)}
                              disabled={registeringCardFor === member.id}
                              className="gap-1"
                              title="Registrar tarjeta RFID"
                            >
                              <CreditCard className="w-4 h-4" />
                              {registeringCardFor === member.id ? '...' : 'RFID'}
                            </Button>
                          )}
                          <Dialog open={editingMember?.id === member.id} onOpenChange={(open) => {
                            if (!open) {
                              setEditingMember(null);
                            } else {
                              setEditingMember(member);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Editar Miembro</DialogTitle>
                              </DialogHeader>
                              <MemberForm 
                                initialData={editingMember || undefined}
                                memberships={memberships}
                                onSubmit={handleEditMember} 
                                onCancel={() => setEditingMember(null)} 
                              />
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteMember(member.id, member.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-sm text-muted-foreground">Activas: {members.filter(m => getPaymentStatus(m.membershipExpiry) === 'active').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-600"></div>
              <span className="text-sm text-muted-foreground">Por vencer: {members.filter(m => getPaymentStatus(m.membershipExpiry) === 'expiring-soon').length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span className="text-sm text-muted-foreground">Vencidas: {members.filter(m => getPaymentStatus(m.membershipExpiry) === 'expired').length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}