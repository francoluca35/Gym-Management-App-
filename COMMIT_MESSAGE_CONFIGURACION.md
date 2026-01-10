# Mensaje de Commit - Sección de Configuración

```
feat(configuracion): Agregar sección de configuración para administradores

- Crear componente Configuration con 4 pestañas (Usuarios, Mercado Pago, Notificaciones, Información del Gimnasio)
- Implementar gestión de usuarios empleados (editar nombre y contraseña)
- Agregar configuración de Mercado Pago (Public Key y Access Token)
- Implementar configuración de notificaciones (email, recordatorios, renovación automática)
- Agregar edición de información del gimnasio (nombre, dirección, teléfono, email, etc.)
- Crear tabla gym_config en base de datos para almacenar configuraciones
- Crear funciones de utilidad en config.ts para gestionar configuración y usuarios
- Agregar tab "Configuración" en App.tsx (solo visible para admin)
- Actualizar schema.sql y crear script de migración idempotente

Archivos nuevos:
- src/app/components/Configuration.tsx
- src/app/utils/config.ts
- supabase/migration_add_config.sql
- supabase/fix_config_trigger.sql

Archivos modificados:
- src/app/App.tsx
- supabase/schema.sql
```

## Comandos para el commit:

```bash
git add src/app/components/Configuration.tsx
git add src/app/utils/config.ts
git add src/app/App.tsx
git add supabase/migration_add_config.sql
git add supabase/fix_config_trigger.sql
git add supabase/schema.sql
git commit -m "feat(configuracion): Agregar sección de configuración para administradores

- Crear componente Configuration con 4 pestañas (Usuarios, Mercado Pago, Notificaciones, Información del Gimnasio)
- Implementar gestión de usuarios empleados (editar nombre y contraseña)
- Agregar configuración de Mercado Pago (Public Key y Access Token)
- Implementar configuración de notificaciones (email, recordatorios, renovación automática)
- Agregar edición de información del gimnasio (nombre, dirección, teléfono, email, etc.)
- Crear tabla gym_config en base de datos para almacenar configuraciones
- Crear funciones de utilidad en config.ts para gestionar configuración y usuarios
- Agregar tab Configuración en App.tsx (solo visible para admin)
- Actualizar schema.sql y crear script de migración idempotente"
```
