# Cambios en el Módulo de Finanzas

## Resumen
Se implementaron funcionalidades de exportación de reportes (PDF y Excel) y eliminación de datos por mes en el módulo de Finanzas del sistema de gestión de gimnasios.

## Cambios Implementados

### 1. Reemplazo de Tarjeta de Estado de Conexión
- **Archivo**: `src/app/components/FinancialDashboard.tsx`
- **Cambio**: Se eliminó la tarjeta que mostraba el estado de conexión a la base de datos
- **Reemplazo**: Se agregó una tarjeta con botones de acción (Generar PDF, Generar Excel, Borrar Datos por Mes)

### 2. Funcionalidad de Generación de PDF
- **Archivo**: `src/app/components/FinancialDashboard.tsx`
- **Función**: `handleGeneratePDF()`
- **Características**:
  - Genera un PDF con el reporte financiero completo
  - Incluye: título, fecha de generación, KPIs, transacciones recientes
  - Maneja múltiples páginas automáticamente
  - Nombre del archivo: `reporte-financiero-YYYY-MM-DD.pdf`

### 3. Funcionalidad de Generación de Excel
- **Archivo**: `src/app/components/FinancialDashboard.tsx`
- **Función**: `handleGenerateExcel()`
- **Características**:
  - Genera un archivo Excel con 3 hojas:
    - **Resumen**: KPIs y desglose de ingresos
    - **Transacciones**: Tabla de transacciones recientes
    - **Ingresos Mensuales**: Evolución de ingresos últimos 12 meses
  - Nombre del archivo: `reporte-financiero-YYYY-MM-DD.xlsx`

### 4. Funcionalidad de Borrado de Datos por Mes
- **Archivo**: `src/app/components/FinancialDashboard.tsx`
- **Función**: `handleDeleteMonthData()`
- **Características**:
  - Diálogo modal para seleccionar año y meses
  - Busca y borra clientes con `last_payment_date` en el mes/año seleccionado
  - Busca y borra clientes con `registration_fee_payment_date` en el mes/año seleccionado
  - Elimina duplicados usando Set
  - Borra en lotes de 100 registros para evitar límites de Supabase
  - Solo afecta la tabla `client_gym` del `gym_id` actual
  - Incluye confirmación antes de borrar
  - Actualiza automáticamente la lista de miembros después de borrar

### 5. Actualización de Props del Componente
- **Archivo**: `src/app/components/FinancialDashboard.tsx`
- **Cambios**:
  - Agregado prop `gymId?: string | null`
  - Agregado prop `onMembersUpdated?: () => void` para callback de actualización

### 6. Integración en App.tsx
- **Archivo**: `src/app/App.tsx`
- **Cambios**:
  - Se pasa `gymId` al componente `FinancialDashboard`
  - Se implementa `onMembersUpdated` que recarga los miembros después de borrar datos

### 7. Dependencias Agregadas
- **Archivo**: `package.json`
- **Dependencias nuevas**:
  - `jspdf`: ^4.0.0 (para generar PDFs)
  - `xlsx`: (para generar archivos Excel)

## Archivos Modificados

1. `src/app/components/FinancialDashboard.tsx`
   - Reemplazo de tarjeta de estado por botones de acción
   - Implementación de funciones de exportación (PDF y Excel)
   - Implementación de función de borrado por mes
   - Agregado estado para manejar diálogo de borrado
   - Agregado imports necesarios (jsPDF, XLSX, componentes UI)

2. `src/app/App.tsx`
   - Actualización de props pasados a `FinancialDashboard`
   - Implementación de callback `onMembersUpdated`

3. `package.json`
   - Agregadas dependencias `jspdf` y `xlsx`

## Instrucciones de Instalación

Para instalar las nuevas dependencias, ejecutar:
```bash
npm install
```

## Notas Importantes

- El borrado de datos solo afecta a la tabla `client_gym` del gimnasio actual
- Se requiere confirmación antes de borrar datos
- Los reportes se generan con datos en tiempo real de la base de datos
- El borrado se realiza en lotes para evitar límites de Supabase
