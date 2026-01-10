import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { 
  Settings, 
  Users, 
  CreditCard, 
  Bell, 
  Building2, 
  Key, 
  Eye, 
  EyeOff,
  Save,
  Edit,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { getGymConfig, updateGymConfig, getGymUsers, updateEmployeeUser, getGymInfo, updateGymInfo, GymConfig, GymUser } from "../utils/config";
import { supabase } from "../../lib/supabase";

interface ConfigurationProps {
  gymId?: string | null;
}

export function Configuration({ gymId }: ConfigurationProps) {
  const currentGymId = gymId || localStorage.getItem('gym_id');
  
  // Estados para configuración
  const [config, setConfig] = useState<GymConfig | null>(null);
  const [gymInfo, setGymInfo] = useState<any>(null);
  const [users, setUsers] = useState<GymUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados para edición de usuarios
  const [editingUser, setEditingUser] = useState<{ username: string; newUsername: string; newPassword: string; showPassword: boolean } | null>(null);
  
  // Estados para formularios
  const [mpPublicKey, setMpPublicKey] = useState('');
  const [mpAccessToken, setMpAccessToken] = useState('');
  const [mpEnabled, setMpEnabled] = useState(false);
  const [showMpToken, setShowMpToken] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [reminderDays, setReminderDays] = useState(7);
  
  // Estados para información del gimnasio
  const [gymName, setGymName] = useState('');
  const [gymAddress, setGymAddress] = useState('');
  const [gymPhone, setGymPhone] = useState('');
  const [gymEmail, setGymEmail] = useState('');
  const [gymOwner, setGymOwner] = useState('');
  const [gymDescription, setGymDescription] = useState('');
  const [gymInstagram, setGymInstagram] = useState('');
  const [gymIP, setGymIP] = useState('');

  // Cargar datos iniciales
  useEffect(() => {
    if (currentGymId) {
      loadData();
    }
  }, [currentGymId]);

  const loadData = async () => {
    if (!currentGymId) return;
    
    setLoading(true);
    try {
      // Cargar configuración
      const configResult = await getGymConfig(currentGymId);
      if (configResult.success && configResult.config) {
        setConfig(configResult.config);
        setMpPublicKey(configResult.config.mercado_pago_public_key || '');
        setMpAccessToken(configResult.config.mercado_pago_access_token || '');
        setMpEnabled(configResult.config.mercado_pago_enabled || false);
        setNotificationEmail(configResult.config.notification_email || '');
        setNotificationEnabled(configResult.config.notification_enabled ?? true);
        setAutoRenewal(configResult.config.auto_renewal_enabled || false);
        setReminderDays(configResult.config.membership_reminder_days || 7);
      }

      // Cargar usuarios
      const usersResult = await getGymUsers(currentGymId);
      if (usersResult.success && usersResult.users) {
        setUsers(usersResult.users);
      }

      // Cargar información del gimnasio
      const infoResult = await getGymInfo(currentGymId);
      if (infoResult.success && infoResult.info) {
        setGymInfo(infoResult.info);
        setGymName(infoResult.info.nombre_gym || '');
        setGymAddress(infoResult.info.direccion || '');
        setGymPhone(infoResult.info.telefono || '');
        setGymEmail(infoResult.info.email || '');
        setGymOwner(infoResult.info.propietario || '');
        setGymDescription(infoResult.info.descripcion || '');
        setGymInstagram(infoResult.info.instagram || '');
        setGymIP(infoResult.info.ip_registro || '');
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Guardar configuración de Mercado Pago
  const handleSaveMercadoPago = async () => {
    if (!currentGymId) return;
    
    setSaving(true);
    try {
      const result = await updateGymConfig(currentGymId, {
        mercado_pago_public_key: mpPublicKey,
        mercado_pago_access_token: mpAccessToken,
        mercado_pago_enabled: mpEnabled
      });

      if (result.success) {
        alert('Configuración de Mercado Pago guardada exitosamente');
        setConfig(result.config || null);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Guardar configuración de notificaciones
  const handleSaveNotifications = async () => {
    if (!currentGymId) return;
    
    setSaving(true);
    try {
      const result = await updateGymConfig(currentGymId, {
        notification_email: notificationEmail,
        notification_enabled: notificationEnabled,
        auto_renewal_enabled: autoRenewal,
        membership_reminder_days: reminderDays
      });

      if (result.success) {
        alert('Configuración de notificaciones guardada exitosamente');
        setConfig(result.config || null);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Guardar información del gimnasio
  const handleSaveGymInfo = async () => {
    if (!currentGymId) return;
    
    setSaving(true);
    try {
      const result = await updateGymInfo(currentGymId, {
        nombre_gym: gymName,
        direccion: gymAddress,
        telefono: gymPhone,
        email: gymEmail,
        propietario: gymOwner,
        descripcion: gymDescription,
        instagram: gymInstagram
      });

      if (result.success) {
        alert('Información del gimnasio actualizada exitosamente');
        await loadData();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Editar usuario empleado
  const handleEditUser = (username: string) => {
    const user = users.find(u => u.usuario === username && u.rol === 'empleado');
    if (user) {
      setEditingUser({
        username,
        newUsername: username,
        newPassword: '',
        showPassword: false
      });
    }
  };

  // Guardar cambios de usuario
  const handleSaveUser = async () => {
    if (!currentGymId || !editingUser) return;
    
    if (!editingUser.newUsername.trim()) {
      alert('El nombre de usuario no puede estar vacío');
      return;
    }

    if (!editingUser.newPassword.trim()) {
      alert('La contraseña no puede estar vacía');
      return;
    }

    setSaving(true);
    try {
      const result = await updateEmployeeUser(
        currentGymId,
        editingUser.username,
        editingUser.newUsername,
        editingUser.newPassword
      );

      if (result.success) {
        alert('Usuario actualizado exitosamente');
        setUsers(result.users || []);
        setEditingUser(null);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Filtrar solo usuarios empleados
  const employeeUsers = users.filter(u => u.rol === 'empleado');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Configuración</h2>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="mercadopago">Mercado Pago</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="gyminfo">Información del Gimnasio</TabsTrigger>
        </TabsList>

        {/* Tab: Gestión de Usuarios Empleados */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestión de Usuarios Empleados
              </CardTitle>
              <CardDescription>
                Modifica el nombre de usuario y contraseña de los empleados del gimnasio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {employeeUsers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay usuarios empleados configurados
                </p>
              ) : (
                employeeUsers.map((user) => (
                  <Card key={user.usuario} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Usuario: {user.usuario}</p>
                        <p className="text-sm text-muted-foreground">
                          Rol: {user.rol === 'empleado' ? 'Empleado' : 'Administrador'}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user.usuario)}
                        className="gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>

          {/* Diálogo para editar usuario */}
          {editingUser && (
            <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Usuario Empleado</DialogTitle>
                  <DialogDescription>
                    Modifica el nombre de usuario y contraseña para: {editingUser.username}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="newUsername">Nuevo Nombre de Usuario</Label>
                    <Input
                      id="newUsername"
                      value={editingUser.newUsername}
                      onChange={(e) => setEditingUser({ ...editingUser, newUsername: e.target.value })}
                      placeholder="empleadoM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <div className="flex gap-2">
                      <Input
                        id="newPassword"
                        type={editingUser.showPassword ? "text" : "password"}
                        value={editingUser.newPassword}
                        onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                        placeholder="Nueva contraseña"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setEditingUser({ ...editingUser, showPassword: !editingUser.showPassword })}
                      >
                        {editingUser.showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingUser(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveUser} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        {/* Tab: Configuración de Mercado Pago */}
        <TabsContent value="mercadopago" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Configuración de Mercado Pago
              </CardTitle>
              <CardDescription>
                Configura las credenciales de Mercado Pago para habilitar pagos en línea
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="mpEnabled">Habilitar Mercado Pago</Label>
                  <p className="text-sm text-muted-foreground">
                    Activa o desactiva los pagos con Mercado Pago
                  </p>
                </div>
                <Switch
                  id="mpEnabled"
                  checked={mpEnabled}
                  onCheckedChange={setMpEnabled}
                />
              </div>

              {mpEnabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="mpPublicKey">Public Key (Clave Pública)</Label>
                    <Input
                      id="mpPublicKey"
                      type="text"
                      value={mpPublicKey}
                      onChange={(e) => setMpPublicKey(e.target.value)}
                      placeholder="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    />
                    <p className="text-xs text-muted-foreground">
                      Clave pública de Mercado Pago (comienza con TEST- o APP_USR-)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mpAccessToken">Access Token (Token de Acceso)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="mpAccessToken"
                        type={showMpToken ? "text" : "password"}
                        value={mpAccessToken}
                        onChange={(e) => setMpAccessToken(e.target.value)}
                        placeholder="TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowMpToken(!showMpToken)}
                      >
                        {showMpToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Token de acceso privado de Mercado Pago (mantener en secreto)
                    </p>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          Importante
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Asegúrate de usar las credenciales correctas. En producción, usa las credenciales de producción, no las de prueba (TEST-).
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <Button
                onClick={handleSaveMercadoPago}
                disabled={saving}
                className="w-full gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configuración de Notificaciones */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Configuración de Notificaciones
              </CardTitle>
              <CardDescription>
                Configura las notificaciones y recordatorios automáticos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="notificationEnabled">Habilitar Notificaciones</Label>
                  <p className="text-sm text-muted-foreground">
                    Activa o desactiva las notificaciones por email
                  </p>
                </div>
                <Switch
                  id="notificationEnabled"
                  checked={notificationEnabled}
                  onCheckedChange={setNotificationEnabled}
                />
              </div>

              {notificationEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="notificationEmail">Email para Notificaciones</Label>
                  <Input
                    id="notificationEmail"
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="notificaciones@gimnasio.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email donde se enviarán las notificaciones y alertas
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="autoRenewal">Renovación Automática</Label>
                  <p className="text-sm text-muted-foreground">
                    Habilita la renovación automática de membresías
                  </p>
                </div>
                <Switch
                  id="autoRenewal"
                  checked={autoRenewal}
                  onCheckedChange={setAutoRenewal}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reminderDays">Días de Anticipación para Recordatorios</Label>
                <Input
                  id="reminderDays"
                  type="number"
                  min="1"
                  max="30"
                  value={reminderDays}
                  onChange={(e) => setReminderDays(parseInt(e.target.value) || 7)}
                />
                <p className="text-xs text-muted-foreground">
                  Días antes del vencimiento para enviar recordatorios (1-30 días)
                </p>
              </div>

              <Button
                onClick={handleSaveNotifications}
                disabled={saving}
                className="w-full gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Información del Gimnasio */}
        <TabsContent value="gyminfo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Información del Gimnasio
              </CardTitle>
              <CardDescription>
                Actualiza la información básica del gimnasio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gymName">Nombre del Gimnasio *</Label>
                  <Input
                    id="gymName"
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    placeholder="Gym & Box"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gymOwner">Propietario *</Label>
                  <Input
                    id="gymOwner"
                    value={gymOwner}
                    onChange={(e) => setGymOwner(e.target.value)}
                    placeholder="Juan Pérez"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gymAddress">Dirección *</Label>
                  <Input
                    id="gymAddress"
                    value={gymAddress}
                    onChange={(e) => setGymAddress(e.target.value)}
                    placeholder="Av. Principal 123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gymPhone">Teléfono *</Label>
                  <Input
                    id="gymPhone"
                    value={gymPhone}
                    onChange={(e) => setGymPhone(e.target.value)}
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gymEmail">Email *</Label>
                  <Input
                    id="gymEmail"
                    type="email"
                    value={gymEmail}
                    onChange={(e) => setGymEmail(e.target.value)}
                    placeholder="contacto@gimnasio.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gymInstagram">Instagram</Label>
                  <Input
                    id="gymInstagram"
                    value={gymInstagram}
                    onChange={(e) => setGymInstagram(e.target.value)}
                    placeholder="@gimnasio"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gymDescription">Descripción</Label>
                <Textarea
                  id="gymDescription"
                  value={gymDescription}
                  onChange={(e) => setGymDescription(e.target.value)}
                  placeholder="Descripción del gimnasio..."
                  rows={4}
                />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4" />
                  <Label>IP de Registro</Label>
                </div>
                <p className="text-sm font-mono text-muted-foreground">{gymIP}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Esta IP se usa para identificar el gimnasio. No se puede modificar.
                </p>
              </div>

              <Button
                onClick={handleSaveGymInfo}
                disabled={saving}
                className="w-full gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Guardando...' : 'Guardar Información'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
