import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dumbbell } from "lucide-react"
import { AuthLoginForm } from "./AuthLoginForm"
import { RegisterForm } from "./RegisterForm"
import { AuthResponse } from "../types"

interface PreLoginProps {
  onAuthSuccess: (authData: AuthResponse) => void
}

export function PreLogin({ onAuthSuccess }: PreLoginProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")

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
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-4">
              <AuthLoginForm onAuthSuccess={onAuthSuccess} />
            </TabsContent>
            <TabsContent value="register" className="mt-4">
              <RegisterForm onAuthSuccess={onAuthSuccess} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
