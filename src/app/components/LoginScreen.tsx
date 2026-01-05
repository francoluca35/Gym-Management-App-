import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dumbbell } from "lucide-react";

interface LoginScreenProps {
  onLogin: (shift: 'morning' | 'afternoon' | 'night') => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-4 rounded-full">
              <Dumbbell className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <CardTitle>Sistema de Gestión de Gimnasio</CardTitle>
          <CardDescription>Selecciona tu turno para ingresar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => onLogin('morning')} 
            className="w-full"
            size="lg"
          >
            Turno Mañana
          </Button>
          <Button 
            onClick={() => onLogin('afternoon')} 
            className="w-full"
            size="lg"
            variant="outline"
          >
            Turno Tarde
          </Button>
          <Button 
            onClick={() => onLogin('night')} 
            className="w-full"
            size="lg"
            variant="secondary"
          >
            Turno Noche
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
