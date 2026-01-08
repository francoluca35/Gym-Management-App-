import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Dumbbell, LogOut } from "lucide-react";
import { Shift } from "../types";

interface ShiftSelectionProps {
  gymName?: string;
  onSelectShift: (shift: Shift) => void;
  onExitIP?: () => void;
}

export function ShiftSelection({ gymName, onSelectShift, onExitIP }: ShiftSelectionProps) {
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
          <CardDescription>
            {gymName ? `Bienvenido a ${gymName}` : "Selecciona tu turno para continuar"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => onSelectShift('morning')} 
            className="w-full"
            size="lg"
          >
            Turno Mañana
          </Button>
          <Button 
            onClick={() => onSelectShift('afternoon')} 
            className="w-full"
            size="lg"
            variant="outline"
          >
            Turno Tarde
          </Button>
          <Button 
            onClick={() => onSelectShift('night')} 
            className="w-full"
            size="lg"
            variant="secondary"
          >
            Turno Noche
          </Button>
          
          {onExitIP && (
            <>
              <div className="pt-2">
                <Button 
                  onClick={onExitIP} 
                  className="w-full"
                  size="lg"
                  variant="ghost"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Salir de IP
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
