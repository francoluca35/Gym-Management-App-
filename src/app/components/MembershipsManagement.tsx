import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Membership } from "../types";
import { formatCurrency } from "../utils/helpers";

interface MembershipsManagementProps {
  memberships: Membership[];
  onAddMembership: (membership: Omit<Membership, 'id'>) => void;
  onUpdateMembership: (id: string, membership: Partial<Membership>) => void;
  onDeleteMembership: (id: string) => void;
}

export function MembershipsManagement({ 
  memberships, 
  onAddMembership, 
  onUpdateMembership, 
  onDeleteMembership 
}: MembershipsManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    description: '',
  });

  const handleOpenAdd = () => {
    setFormData({ name: '', price: 0, description: '' });
    setIsAddDialogOpen(true);
  };

  const handleOpenEdit = (membership: Membership) => {
    setFormData({
      name: membership.name,
      price: membership.price,
      description: membership.description,
    });
    setEditingMembership(membership);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMembership) {
      onUpdateMembership(editingMembership.id, formData);
      setEditingMembership(null);
    } else {
      onAddMembership(formData);
      setIsAddDialogOpen(false);
    }
    
    setFormData({ name: '', price: 0, description: '' });
  };

  const handleCancel = () => {
    setIsAddDialogOpen(false);
    setEditingMembership(null);
    setFormData({ name: '', price: 0, description: '' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Gestión de Membresías</CardTitle>
              <CardDescription>Administra los planes de membresía del gimnasio</CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (open) {
                setFormData({ name: '', price: 0, description: '' });
              }
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nueva Membresía
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Membresía</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="ej: Clásica, Pro, Premium"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Precio Mensual *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      placeholder="20000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe los beneficios de esta membresía..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button type="submit">Crear Membresía</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {memberships.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No hay membresías creadas. Crea una nueva membresía para comenzar.
              </p>
            ) : (
              memberships.map((membership) => (
                <Card key={membership.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{membership.name}</CardTitle>
                      <Badge variant="outline">{formatCurrency(membership.price)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{membership.description}</p>
                    
                    <div className="flex gap-2">
                      <Dialog open={editingMembership?.id === membership.id} onOpenChange={(open) => {
                        if (!open) {
                          setEditingMembership(null);
                        } else {
                          handleOpenEdit(membership);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Membresía</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name">Nombre *</Label>
                              <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-price">Precio Mensual *</Label>
                              <Input
                                id="edit-price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                required
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-description">Descripción *</Label>
                              <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                required
                              />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                              <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancelar
                              </Button>
                              <Button type="submit">Actualizar</Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar esta membresía?')) {
                            onDeleteMembership(membership.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
