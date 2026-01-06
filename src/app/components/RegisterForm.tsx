import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { registerGym, GymRegistrationData } from "../utils/auth";

interface RegisterFormProps {
  onRegisterSuccess: (gymId: string, user: any) => void;
  onSwitchToLogin?: () => void;
}

export function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState<GymRegistrationData>({
    propietario: "",
    nombre_gym: "",
    direccion: "",
    telefono: "",
    email: "",
    usuario: "",
    contraseña: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validaciones
    if (!formData.propietario.trim()) {
      setError("El nombre del dueño es requerido");
      setLoading(false);
      return;
    }

    if (!formData.nombre_gym.trim()) {
      setError("El nombre del gimnasio es requerido");
      setLoading(false);
      return;
    }

    if (!formData.direccion.trim()) {
      setError("La dirección es requerida");
      setLoading(false);
      return;
    }

    if (!formData.telefono.trim()) {
      setError("El teléfono es requerido");
      setLoading(false);
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("El email es requerido y debe ser válido");
      setLoading(false);
      return;
    }

    if (!formData.usuario.trim()) {
      setError("El usuario es requerido");
      setLoading(false);
      return;
    }

    if (formData.contraseña.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres");
      setLoading(false);
      return;
    }

    if (formData.contraseña !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const result = await registerGym(formData);

      if (result.success && result.gym_id) {
        // Obtener el usuario admin creado
        const adminUser = {
          usuario: formData.usuario,
          contraseña: formData.contraseña,
          rol: 'admin' as const
        };
        onRegisterSuccess(result.gym_id, adminUser);
      } else {
        setError(result.error || "Error al registrar el gimnasio");
      }
    } catch (err: any) {
      setError(err.message || "Error al registrar el gimnasio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="propietario">Nombre del Dueño *</Label>
        <Input
          id="propietario"
          name="propietario"
          value={formData.propietario}
          onChange={handleChange}
          placeholder="Nombre completo del dueño"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nombre_gym">Nombre del Gimnasio *</Label>
        <Input
          id="nombre_gym"
          name="nombre_gym"
          value={formData.nombre_gym}
          onChange={handleChange}
          placeholder="Nombre del gimnasio"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="direccion">Dirección *</Label>
        <Input
          id="direccion"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Dirección completa"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="telefono">Teléfono *</Label>
        <Input
          id="telefono"
          name="telefono"
          type="tel"
          value={formData.telefono}
          onChange={handleChange}
          placeholder="Número de teléfono"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="email@ejemplo.com"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="usuario">Usuario *</Label>
        <Input
          id="usuario"
          name="usuario"
          value={formData.usuario}
          onChange={handleChange}
          placeholder="Nombre de usuario"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contraseña">Contraseña *</Label>
        <Input
          id="contraseña"
          name="contraseña"
          type="password"
          value={formData.contraseña}
          onChange={handleChange}
          placeholder="Mínimo 4 caracteres"
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirma tu contraseña"
          required
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registrando...
          </>
        ) : (
          "Registrarse"
        )}
      </Button>

    </form>
  );
}
