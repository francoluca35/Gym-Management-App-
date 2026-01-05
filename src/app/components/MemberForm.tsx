import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Member, PaymentMethod, Membership } from "../types";
import { formatCurrency } from "../utils/helpers";

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
  });

  const selectedMembership = memberships.find(m => m.id === formData.membershipId);

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