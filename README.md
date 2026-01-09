# 🏋️ GymManager Pro

Sistema web completo para la **gestión integral de gimnasios**, diseñado para soportar **múltiples gimnasios**, control de acceso por roles, gestión de miembros, membresías, asistencias, finanzas y **control automático mediante RFID/NFC**.

---

## 📌 Descripción general

**GymManager Pro** es una plataforma web moderna orientada a la administración operativa y administrativa de gimnasios.  
Permite a cada gimnasio gestionar sus propios datos, empleados y clientes de forma aislada y segura, con un sistema de autenticación dual basado en **IP + usuarios**.

---

## 🚀 Tecnologías utilizadas

### Frontend
- **React 18** + **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Shadcn UI** (Radix UI)
- **Lucide React** (iconos)

### Backend / Base de datos
- **Supabase**
  - PostgreSQL
  - Auth
  - Storage (opcional)

### Hardware / APIs
- **Web Serial API**
  - Integración con lectores **RFID/NFC USB**
  - Compatible con Chrome, Edge y Opera

---

## 🔐 Arquitectura de autenticación

### 1️⃣ Sistema de autenticación dual

#### 🔹 Opción A — Verificación por IP (empleados)
- Se valida la **IP pública** del gimnasio
- Si coincide:
  - Se muestra selección de turno
    - Mañana
    - Tarde
    - Noche
  - Login con credenciales de empleado

#### 🔹 Opción B — Login administrativo
- Acceso desde cualquier lugar
- Usuario y contraseña
- Acceso completo sin selección de turno

---

## 👥 Roles de usuario

### Administrador (`admin`)
- Acceso completo
- Tabs:
  - Inicio (Dashboard)
  - Miembros
  - Membresías
  - Asistencia
  - Finanzas

### Empleado (`empleado`)
- Acceso limitado
- Tabs:
  - Miembros
  - Asistencia

## 🗄️ Base de datos (Supabase / PostgreSQL)

### Tabla: `gimnasios`
- Datos del gimnasio
- IP registrada
- Capacidad
- Horarios
- Tipos de clases
- Planes

### Tabla: `gyms`
- Usuarios por gimnasio (JSONB)
- Relación 1:1 con `gimnasios`

### Tabla: `client_gym`
- Miembros del gimnasio
- Asociados a `gym_id`
- Incluye:
  - Datos personales
  - Fechas de membresía
  - Método de pago
  - Ficha de inscripción
  - `rfid_card_id` único

### Tabla: `membresia_gym`
- Planes de membresía
- Asociados a `gym_id`
- Precio, nombre y descripción

### Tabla: `asistencia_gym`
- Registro de asistencias
- Soporta múltiples entradas/salidas por día
- Almacena arrays de sesiones

---

## ⚙️ Funcionalidades principales

### 👤 Gestión de miembros
- Alta, edición y baja de miembros
- Asignación de membresías
- Registro de tarjetas RFID/NFC
- Ficha de inscripción (pago único)
- Renovación de cuotas (1 a 12 meses)
- Estados:
  - Activa
  - Por vencer
  - Vencida
- Búsqueda en tiempo real

---

### 💳 Gestión de membresías
- Crear, editar y eliminar planes
- Precio mensual
- Descripción
- Aislado por gimnasio

---

### 🕒 Control de asistencia

#### Modo manual
- Buscar miembro
- Fichar entrada / salida
- Ver sesiones activas
- Ver registros diarios

#### Modo automático (RFID/NFC)
- Conexión de lector USB
- Lectura continua
- Detección automática de entrada/salida
- Asociación de tarjeta a miembro

---

## 📊 Dashboard (solo administradores)
- Total de miembros
- Membresías activas, vencidas y por vencer
- Ingresos potenciales
- Asistencias del día
- Gráficos:
  - Distribución de membresías
  - Asistencias últimos 7 días

---

## 💰 Panel financiero (solo administradores)
- Resumen de ingresos
- Análisis por tipo de membresía
- Reportes de pagos

---
## 📡 Sistema RFID/NFC

### Implementación
Archivo:
### Características
- Conexión/desconexión del lector
- Lectura simple y continua
- Extracción automática del ID
- Control de asistencia automático

### Formatos soportados
- Hexadecimal: `ABCD1234`
- Decimal: `12345678`
- Con separadores: `12:34:56:78`
- Con prefijos/sufijos: `Card ID: 12345678`

---

## 🔄 Flujo completo de uso

### Registro inicial
1. Registro del gimnasio
2. Guardado de IP pública
3. Creación de:
   - 1 administrador
   - 3 empleados por turno
4. Generación de `gym_id`

### Acceso diario
- Empleados:
  - Verificación IP → Turno → Login
- Administradores:
  - Login directo

---

## 🧠 Características técnicas

### Seguridad
- Aislamiento total por `gym_id`
- Validación de IP
- Sesiones persistentes
- Control de roles

### Rendimiento
- Índices en campos clave
- Triggers `updated_at`
- Consultas optimizadas
- Carga eficiente de datos

### UX/UI
- Responsive
- Shadcn UI
- Validaciones de formularios
- Estados visuales claros

---

---

## ✅ Estado del proyecto

🟢 **Completo y funcional**

Incluye:
- Autenticación dual
- Gestión de miembros
- Gestión de membresías
- Control de asistencia manual y RFID
- Dashboard administrativo
- Panel financiero
- Sistema RFID/NFC integrado

---

## 📄 Licencia
Proyecto privado / uso interno (definir licencia si se publica).

---

Desarrollado por Deamon DD para la gestión profesional de gimnasios.

