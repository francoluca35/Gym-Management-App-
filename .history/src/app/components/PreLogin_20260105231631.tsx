import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dumbbell } from "lucide-react";
import { RegisterForm } from "./RegisterForm";
import { LoginFormSimple } from "./LoginFormSimple";

interface PreLoginProps {
  onLoginSuccess: (gymId: string, user: any) => void;
  onGymDetected: () => void;
}

export function PreLogin({ onLoginSuccess, onGymDetected }: PreLoginProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

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
            Inicia sesión o regístrate para comenzar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              <LoginFormSimple onGymDetected={onGymDetected} />
            </TabsContent>
            <TabsContent value="register" className="mt-6">
              <RegisterForm onRegisterSuccess={onLoginSuccess} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
