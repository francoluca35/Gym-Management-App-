import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { loginGym } from "../utils/auth";
import { Shift } from "../types";

interface LoginFormNewProps {
  shift: Shift;
  gymName?: string;
  onLoginSuccess: (gymId: string, user: any, shift: Shift) => void;
  onBack: () => void;
}

export function LoginFormNew({ shift, gymName, onLoginSuccess, onBack }: LoginFormNewProps) {
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const getShiftLabel = (s: Shift) => {
    switch (s) {
      case 'morning': return 'Mañana';
      case 'afternoon': return 'Tarde';
      case 'night': return 'Noche';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginGym(usuario, contraseña);

      if (result.success && result.gymData) {
        // Buscar el usuario logueado
        const user = result.gymData.users.find(u => u.usuario === usuario);
        if (user) {
          // Guardar el turno seleccionado
          localStorage.setItem('selected_shift', shift);
          onLoginSuccess(result.gymData.gym_id, user, shift);
        } else {
          setError("Error al obtener datos del usuario");
        }
      } else {
        setError(result.error || "Error al iniciar sesión");
      }
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
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

      <div className="text-center pb-2">
        <p className="text-sm text-muted-foreground">
          Turno: <span className="text-primary font-medium">{getShiftLabel(shift)}</span>
        </p>
        {gymName && (
          <p className="text-xs text-muted-foreground mt-1">{gymName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="usuario">Usuario</Label>
        <Input
          id="usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          placeholder="Ingresa tu usuario"
          required
          disabled={loading}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contraseña">Contraseña</Label>
        <Input
          id="contraseña"
          type="password"
          value={contraseña}
          onChange={(e) => setContraseña(e.target.value)}
          placeholder="Ingresa tu contraseña"
          required
          disabled={loading}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2" disabled={loading}>
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar Sesión"
          )}
        </Button>
      </div>
    </form>
  );
}
