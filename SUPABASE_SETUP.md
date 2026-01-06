# Configuración de Supabase

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

## Pasos para Configurar Supabase

1. **Crear un proyecto en Supabase**
   - Ve a https://supabase.com
   - Crea una nueva cuenta o inicia sesión
   - Crea un nuevo proyecto

2. **Obtener las credenciales**
   - En el panel de Supabase, ve a Settings > API
   - Copia la URL del proyecto (Project URL)
   - Copia la clave anónima (anon/public key)

3. **Configurar la base de datos**
   - Ve a SQL Editor en el panel de Supabase
   - Ejecuta el script que está en `supabase/schema.sql`
   - Esto creará las tablas `gimnasios` y `gyms`

4. **Configurar las políticas de seguridad (RLS)**
   
   Por ahora, para desarrollo, puedes desactivar RLS temporalmente:
   
   ```sql
   ALTER TABLE gimnasios DISABLE ROW LEVEL SECURITY;
   ALTER TABLE gyms DISABLE ROW LEVEL SECURITY;
   ```
   
   Para producción, deberás crear políticas específicas según tus necesidades.

5. **Configurar el archivo .env**
   - Crea el archivo `.env` en la raíz del proyecto
   - Agrega las variables con tus credenciales de Supabase

## Estructura de la Base de Datos

### Tabla: gimnasios
Almacena la información de cada gimnasio registrado.

### Tabla: gyms
Almacena los usuarios de cada gimnasio en formato JSONB. Cada gimnasio tiene:
- Un usuario admin (creado durante el registro)
- Tres empleados predeterminados: empleadoM, empleadoT, empleadoN (todos con contraseña "12345")

## Funcionalidades Implementadas

- **Registro de Gimnasios**: Permite registrar un nuevo gimnasio con todos los datos requeridos
- **Login por IP**: El sistema detecta automáticamente el gimnasio según la IP registrada
- **Auto-login**: Si la IP coincide, el usuario no necesita iniciar sesión nuevamente
- **Aislamiento de Datos**: Cada gimnasio tiene sus datos completamente separados
