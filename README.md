# Gym Management App

This is a code bundle for Gym Management App. The original project is available at https://www.figma.com/design/if9q1l6mwgb59LJQ04RaBx/Gym-Management-App.

## Requisitos Previos

- Node.js (v18 o superior)
- MongoDB (instalado y corriendo localmente o URI de MongoDB Atlas)
- npm o yarn

## Instalación

### 1. Instalar todas las dependencias (frontend + backend)

```bash
npm run install:all
```

O manualmente:

```bash
# Instalar dependencias del frontend
npm install

# Instalar dependencias del backend
cd server
npm install
cd ..
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la carpeta `server/`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/gym-management
NODE_ENV=development
```

O para MongoDB Atlas:

```env
PORT=3001
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/gym-management?retryWrites=true&w=majority
NODE_ENV=development
```

## Ejecución

### Opción 1: Ejecutar todo junto (recomendado)

```bash
npm run dev:all
```

Esto ejecutará tanto el servidor backend (puerto 3001) como el frontend (puerto 5173) simultáneamente.

### Opción 2: Ejecutar por separado

**Terminal 1 - Backend:**
```bash
npm run dev:server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Configuración del Proxy

El frontend está configurado para usar un proxy de Vite que redirige automáticamente todas las peticiones `/api/*` al backend en el puerto 3001. Esto significa que:

- El frontend corre en: `http://localhost:5173`
- El backend corre en: `http://localhost:3001`
- Las peticiones del frontend a `/api/*` se redirigen automáticamente al backend
- **Desde el punto de vista del frontend, todo funciona en un solo puerto (5173)**

## Funcionalidades

### Pre-Login
- **Registro**: Permite registrar un nuevo gimnasio con:
  - Nombre del gimnasio
  - Nombre del dueño
  - Dirección
  - Teléfono
  - Email
  - Usuario y contraseña
  
  Al registrarse, se guarda automáticamente la IP de la máquina y se crean:
  - Un usuario admin con las credenciales proporcionadas
  - 3 usuarios empleados predeterminados: `empleadoM`, `empleadoT`, `empleadoN` (contraseña: `12345`)

- **Login**: Permite iniciar sesión con usuario y contraseña

### Flujo de la Aplicación

1. **Pre-Login**: Login o Registro del gimnasio
2. **Selección de Turno**: Mañana, Tarde o Noche
3. **Login de Empleado**: Usuario y contraseña del empleado
4. **Dashboard**: Gestión completa del gimnasio

## Estructura de Base de Datos

### Colección: gimnasios
Almacena la información de cada gimnasio registrado.

### Colección: usuarios
Almacena los usuarios (admin y empleados) asociados a cada gimnasio.

Para más detalles sobre la estructura, consulta `server/README.md`.

## Solución de Problemas

### Error: "ERR_CONNECTION_REFUSED"
- Asegúrate de que el servidor backend esté corriendo en el puerto 3001
- Verifica que MongoDB esté corriendo (si usas MongoDB local)
- Ejecuta `npm run dev:all` para iniciar ambos servidores

### Error: "Cannot find module"
- Ejecuta `npm run install:all` para instalar todas las dependencias
