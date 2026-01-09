import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Member, PaymentMethod, Membership } from "../types";
import { formatCurrency } from "../utils/helpers";
import { connectRFIDReader, readRFIDCard, disconnectRFIDReader, isRFIDReaderConnected } from "../utils/rfid";
import { CreditCard, Loader2, Wifi } from "lucide-react";

interface MemberFormProps {
  initialData?: Member;
  memberships: Membership[];
  onSubmit: (member: Omit<Member, 'id'>) => void;
  onCancel: () => void;
}

export function MemberForm({ initialData, memberships, onSubmit, onCancel }: MemberFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    membershipStart: initialData?.membershipStart || new Date().toISOString().split('T')[0],
    membershipExpiry: initialData?.membershipExpiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    membershipId: initialData?.membershipId || '',
    paymentMethod: initialData?.paymentMethod || 'cash' as PaymentMethod,
    lastPaymentDate: initialData?.lastPaymentDate || new Date().toISOString().split('T')[0],
    registrationFee: initialData?.registrationFee || 0,
    registrationFeePaid: initialData?.registrationFeePaid || false,
    rfidCardId: initialData?.rfidCardId || '',
  });

  const [isReadingCard, setIsReadingCard] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [cardRegistered, setCardRegistered] = useState(!!initialData?.rfidCardId);

  const selectedMembership = memberships.find(m => m.id === formData.membershipId);

  React.useEffect(() => {
    // Verificar conexión al montar
    setIsConnected(isRFIDReaderConnected());
  }, []);

  const handleConnectReader = async () => {
    const result = await connectRFIDReader();
    if (result.success) {
      setIsConnected(true);
      alert('Lector RFID conectado exitosamente');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleReadCard = async () => {
    if (!isConnected) {
      const connectResult = await handleConnectReader();
      if (!isRFIDReaderConnected()) {
        return;
      }
    }

    setIsReadingCard(true);
    try {
      const result = await readRFIDCard();
      if (result.success && result.cardId) {
        setFormData({ ...formData, rfidCardId: result.cardId });
        setCardRegistered(true);
        alert(`¡Tarjeta RFID registrada exitosamente! ID: ${result.cardId}`);
      } else {
        alert(`Error: ${result.error || 'No se pudo leer la tarjeta'}`);
      }
    } catch (error: any) {
      console.error('Error leyendo tarjeta:', error);
      alert(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsReadingCard(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre Completo *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="membershipId">Plan de Membresía *</Label>
          <Select
            value={formData.membershipId}
            onValueChange={(value) => setFormData({ ...formData, membershipId: value })}
          >
            <SelectTrigger id="membershipId">
              <SelectValue placeholder="Selecciona un plan" />
            </SelectTrigger>
            <SelectContent>
              {memberships.map(membership => (
                <SelectItem key={membership.id} value={membership.id}>
                  {membership.name} - {formatCurrency(membership.price)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedMembership && (
            <p className="text-xs text-muted-foreground">
              {selectedMembership.description}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="membershipStart">Inicio de Membresía *</Label>
          <Input
            id="membershipStart"
            type="date"
            value={formData.membershipStart}
            onChange={(e) => setFormData({ ...formData, membershipStart: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="membershipExpiry">Vencimiento de Membresía *</Label>
          <Input
            id="membershipExpiry"
            type="date"
            value={formData.membershipExpiry}
            onChange={(e) => setFormData({ ...formData, membershipExpiry: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMethod">Método de Pago *</Label>
          <Select
            value={formData.paymentMethod}
            onValueChange={(value: PaymentMethod) => setFormData({ ...formData, paymentMethod: value })}
          >
            <SelectTrigger id="paymentMethod">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Efectivo</SelectItem>
              <SelectItem value="transfer">Transferencia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastPaymentDate">Último Pago *</Label>
          <Input
            id="lastPaymentDate"
            type="date"
            value={formData.lastPaymentDate}
            onChange={(e) => setFormData({ ...formData, lastPaymentDate: e.target.value })}
            required
          />
        </div>

        {/* Ficha de Inscripción - para nuevos miembros */}
        {!initialData && (
          <>
            <div className="space-y-2">
              <Label htmlFor="registrationFee">Ficha de Inscripción *</Label>
              <Input
                id="registrationFee"
                type="text"
                value={formData.registrationFee || ''}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
                  const numValue = parseFloat(value) || 0;
                  setFormData({ ...formData, registrationFee: numValue });
                }}
                placeholder="0.00"
                required
              />
              <p className="text-xs text-muted-foreground">
                Monto de la ficha de inscripción (se cobra una sola vez al agregar el miembro)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="registrationFeePaid"
                  checked={formData.registrationFeePaid}
                  onChange={(e) => setFormData({ ...formData, registrationFeePaid: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="registrationFeePaid" className="cursor-pointer">
                  Ficha de inscripción pagada
                </Label>
              </div>
            </div>
          </>
        )}

        {/* Estado de Pago de Inscripción - para edición de miembros existentes */}
        {initialData && initialData.registrationFee != null && initialData.registrationFee > 0 && (
          <div className="space-y-2">
            <Label>Estado de Inscripción</Label>
            <div className="p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Ficha de Inscripción</p>
                  <p className="text-xs text-muted-foreground">
                    Monto: {formatCurrency(initialData.registrationFee)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {initialData.registrationFeePaid ? (
                    <span className="text-sm text-green-600 font-medium">✓ Pagada</span>
                  ) : (
                    <span className="text-sm text-amber-600 font-medium">Pendiente</span>
                  )}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="editRegistrationFeePaid"
                      checked={formData.registrationFeePaid}
                      onChange={(e) => setFormData({ ...formData, registrationFeePaid: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="editRegistrationFeePaid" className="cursor-pointer text-sm">
                      Marcar como pagada
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Registro de Tarjeta RFID/NFC */}
        <div className="col-span-full space-y-4 p-4 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            <Label className="text-base font-semibold">Registro de Tarjeta RFID/NFC</Label>
          </div>
          
          {!isConnected && (
            <div className="space-y-2">
              <p className="text-sm text-amber-600">
                ⚠️ El lector RFID no está conectado. Conéctalo primero.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleConnectReader}
                className="gap-2"
              >
                <Wifi className="w-4 h-4" />
                Conectar Lector RFID
              </Button>
            </div>
          )}

          {isConnected && (
            <>
              {cardRegistered ? (
                <div className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CreditCard className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-400">
                    ✓ Tarjeta registrada: {formData.rfidCardId}
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Acerca la tarjeta o llavero RFID al lector para registrarlo.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReadCard}
                    disabled={isReadingCard}
                    className="gap-2"
                  >
                    {isReadingCard ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Leyendo tarjeta...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Leer Tarjeta RFID
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {initialData ? 'Actualizar' : 'Crear'} Miembro
        </Button>
      </div>
    </form>
  );
}