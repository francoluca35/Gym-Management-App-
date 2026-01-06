import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { checkGymByIP } from "../utils/auth";

interface LoginFormSimpleProps {
  onGymDetected: () => void;
}

export function LoginFormSimple({ onGymDetected }: LoginFormSimpleProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Verificar si hay un gimnasio registrado por IP
      const gymCheck = await checkGymByIP();
      if (gymCheck.exists) {
        onGymDetected();
      } else {
        setError("No se encontró un gimnasio registrado con esta IP. Si ves un error 406 en la consola, necesitas desactivar RLS en Supabase (ver consola para instrucciones).");
      }
    } catch (err: any) {
      console.error('Error en handleCheckGym:', err);
      setError(err.message || "Error al verificar gimnasio. Revisa la consola para más detalles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCheckGym} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          El sistema detectará automáticamente tu gimnasio mediante tu IP. 
          Si ya tienes un gimnasio registrado, haz clic en continuar.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verificando...
          </>
        ) : (
          "Continuar"
        )}
      </Button>
    </form>
  );
}
