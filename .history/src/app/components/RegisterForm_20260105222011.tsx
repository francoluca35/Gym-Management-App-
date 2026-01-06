import React, { useState } from "react"
import { Button } from "./ui/button" 
import { Input } from "./ui/input" 
import { Label } from "./ui/label"
import { Alert, AlertDescription } from "./ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { registerGym, Login } from "../../lib/auth"
import { AuthResponse } from "../types"

interface RegisterFormProps {
  onAuthSuccess: (authData: AuthResponse) => void
}

export function RegisterForm({ onAuthSuccess }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    nombreGym: "",
    propietario: "",
    direccion: "",
    telefono: "",
    email: "",
    usuario: "",
    contraseña: "",
    confirmarContraseña: ""
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validaciones
    if (!formData.nombreGym || !formData.propietario || !formData.direccion || 
        !formData.telefono || !formData.email || !formData.usuario || !formData.contraseña) {
      setError("Todos los campos son requeridos")
      setLoading(false)
      return
    }

    if (formData.contraseña !== formData.confirmarContraseña) {
      setError("Las contraseñas no coinciden")
      setLoading(false)
      return
    }

    if (formData.contraseña.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("El email no es válido")
      setLoading(false)
      return
    }

    try {
      // Registrar el gimnasio usando Supabase directamente
      const result = await registerGym({
        nombreGym: formData.nombreGym,
        propietario: formData.propietario,
        direccion: formData.direccion,
        telefono: formData.telefono,
        email: formData.email,
        usuario: formData.usuario,
        contraseña: formData.contraseña
      })

      console.log('Gimnasio registrado:', result)

      // Hacer login automático usando Supabase directamente
      const loginData = await login(formData.usuario, formData.contraseña)
      onAuthSuccess(loginData)

    } catch (err: any) {
      console.error('Error en registro:', err)
      const errorMessage = err.message || 'Error al registrar el gimnasio'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="nombreGym">Nombre del Gimnasio *</Label>
        <Input
          id="nombreGym"
          name="nombreGym"
          value={formData.nombreGym}
          onChange={handleChange}
          placeholder="Ej: PowerFit Center"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="propietario">Nombre del Dueño *</Label>
        <Input
          id="propietario"
          name="propietario"
          value={formData.propietario}
          onChange={handleChange}
          placeholder="Ej: Juan Pérez"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="direccion">Dirección *</Label>
        <Input
          id="direccion"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          placeholder="Ej: Av Siempre Viva 123"
          required
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
          placeholder="Ej: +54 351 555 5555"
          required
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
          placeholder="Ej: contacto@powerfit.com"
          required
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
          placeholder="Mínimo 6 caracteres"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmarContraseña">Confirmar Contraseña *</Label>
        <Input
          id="confirmarContraseña"
          name="confirmarContraseña"
          type="password"
          value={formData.confirmarContraseña}
          onChange={handleChange}
          placeholder="Repite la contraseña"
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Registrando...
          </>
        ) : (
          "Registrarse"
        )}
      </Button>

      <div className="text-xs text-muted-foreground text-center pt-2">
        <p>Al registrarte, se guardará la dirección IP de tu máquina</p>
      </div>
    </form>
  )
}
