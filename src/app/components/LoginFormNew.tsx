import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Loader2, ArrowLeft, Network, Shield } from "lucide-react";
import { loginGym, validateIPAndLogin } from "../utils/auth";
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
  const [showAdminForm, setShowAdminForm] = useState(false);

  const getShiftLabel = (s: Shift) => {
    switch (s) {
      case 'morning': return 'Mañana';
      case 'afternoon': return 'Tarde';
      case 'night': return 'Noche';
    }
  };

  const handleValidateIP = async () => {
    setError("");
    setLoading(true);

    try {
      const result = await validateIPAndLogin();

      if (result.success && result.gymData && result.user) {
        // Guardar el turno seleccionado
        localStorage.setItem('selected_shift', shift);
        onLoginSuccess(result.gymData.gym_id, result.user, shift);
      } else {
        setError(result.error || "No se pudo validar la dirección IP");
      }
    } catch (err: any) {
      setError(err.message || "Error al validar IP");
    } finally {
      setLoading(false);
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

  // Si no se ha seleccionado el modo, mostrar opciones
  if (!showAdminForm) {
    return (
      <div className="space-y-4">
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

        <div className="space-y-3">
          <Button
            type="button"
            onClick={handleValidateIP}
            className="w-full h-20 flex flex-col items-center justify-center gap-2"
            disabled={loading}
            variant="default"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Validando...</span>
              </>
            ) : (
              <>
                <Network className="h-6 w-6" />
                <div className="flex flex-col">
                  <span className="font-semibold">Validar Dirección IP</span>
                  <span className="text-xs opacity-90">Acceso dentro del gimnasio</span>
                </div>
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">O</span>
            </div>
          </div>

          <Button
            type="button"
            onClick={() => setShowAdminForm(true)}
            className="w-full h-20 flex flex-col items-center justify-center gap-2"
            disabled={loading}
            variant="outline"
          >
            <Shield className="h-6 w-6" />
            <div className="flex flex-col">
              <span className="font-semibold">Iniciar Sesión Administrador</span>
              <span className="text-xs opacity-90">Acceso con usuario y contraseña</span>
            </div>
          </Button>
        </div>

        <div className="pt-2">
          <Button type="button" variant="ghost" onClick={onBack} className="w-full gap-2" disabled={loading}>
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  // Mostrar formulario de administrador
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
        <Button type="button" variant="outline" onClick={() => setShowAdminForm(false)} className="gap-2" disabled={loading}>
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
