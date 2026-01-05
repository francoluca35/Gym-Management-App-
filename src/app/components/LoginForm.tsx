import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dumbbell, AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { Employee, Shift } from "../types";

interface LoginFormProps {
  shift: Shift;
  employees: Employee[];
  onLogin: (employee: Employee) => void;
  onBack: () => void;
}

export function LoginForm({ shift, employees, onLogin, onBack }: LoginFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const getShiftLabel = (s: Shift) => {
    switch (s) {
      case 'morning': return 'Mañana';
      case 'afternoon': return 'Tarde';
      case 'night': return 'Noche';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const employee = employees.find(
      emp => emp.username === username && emp.password === password
    );

    if (employee) {
      onLogin(employee);
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-4 rounded-full">
              <Dumbbell className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <CardTitle>Iniciar Sesión</CardTitle>
          <CardDescription>
            Turno: <span className="text-primary font-medium">{getShiftLabel(shift)}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onBack} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              <Button type="submit" className="flex-1">
                Iniciar Sesión
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center pt-4 border-t">
              <p>Usuarios de prueba:</p>
              <p>admin / admin123 | empleado1 / emp123</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
