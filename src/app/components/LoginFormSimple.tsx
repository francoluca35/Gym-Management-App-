import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Loader2, Network, Shield, ArrowLeft } from "lucide-react";
import { checkGymByIP, loginGym } from "../utils/auth";

interface LoginFormSimpleProps {
  onGymDetected: () => void;
  onAdminLoginSuccess?: (gymId: string, user: any) => void;
}

export function LoginFormSimple({ onGymDetected, onAdminLoginSuccess }: LoginFormSimpleProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");

  const handleVerifyIP = async () => {
    setError("");
    setLoading(true);

    try {
      // Verificar si hay un gimnasio registrado por IP
      const gymCheck = await checkGymByIP();
      if (gymCheck.exists) {
        onGymDetected();
      } else {
        setError("No se encontró un gimnasio registrado con esta dirección IP.");
      }
    } catch (err: any) {
      console.error('Error en handleVerifyIP:', err);
      setError(err.message || "Error al verificar IP. Revisa la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginGym(usuario, contraseña);
      if (result.success && result.gymData) {
        // Buscar el usuario logueado
        const user = result.gymData.users.find(u => u.usuario === usuario);
        if (user && onAdminLoginSuccess) {
          onAdminLoginSuccess(result.gymData.gym_id, user);
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

  // Si se seleccionó "Entrar como administrador", mostrar formulario
  if (showAdminForm) {
    return (
      <form onSubmit={handleAdminLogin} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

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

  // Mostrar opciones iniciales
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        <Button
          type="button"
          onClick={handleVerifyIP}
          className="w-full h-20 flex flex-col items-center justify-center gap-2"
          disabled={loading}
          variant="default"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verificando...</span>
            </>
          ) : (
            <>
              <Network className="h-6 w-6" />
              <div className="flex flex-col">
                <span className="font-semibold">Verificar IP</span>
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
            <span className="font-semibold">Entrar como Administrador</span>
            <span className="text-xs opacity-90">Acceso con usuario y contraseña</span>
          </div>
        </Button>
      </div>
    </div>
  );
}
