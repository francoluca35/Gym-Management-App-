# Mensaje de Commit - Funcionalidades de Finanzas

```
feat(finanzas): Agregar exportación de reportes y borrado de datos por mes

- Reemplazar tarjeta de estado de conexión con botones de acción
- Implementar generación de PDF con reporte financiero completo
- Implementar generación de Excel con múltiples hojas (Resumen, Transacciones, Ingresos Mensuales)
- Agregar funcionalidad de borrado de datos de clientes por mes/año seleccionado
- Agregar diálogo modal para selección de meses a borrar
- Implementar actualización automática de miembros después de borrar datos
- Agregar dependencias: jspdf y xlsx para exportación

Archivos modificados:
- src/app/components/FinancialDashboard.tsx
- src/app/App.tsx
- package.json

Dependencias nuevas:
- jspdf: ^4.0.0
- xlsx: (última versión)
```

## Comandos para el commit:

```bash
git add src/app/components/FinancialDashboard.tsx
git add src/app/App.tsx
git add package.json
git add package-lock.json
git commit -m "feat(finanzas): Agregar exportación de reportes y borrado de datos por mes

- Reemplazar tarjeta de estado de conexión con botones de acción
- Implementar generación de PDF con reporte financiero completo
- Implementar generación de Excel con múltiples hojas (Resumen, Transacciones, Ingresos Mensuales)
- Agregar funcionalidad de borrado de datos de clientes por mes/año seleccionado
- Agregar diálogo modal para selección de meses a borrar
- Implementar actualización automática de miembros después de borrar datos
- Agregar dependencias: jspdf y xlsx para exportación"
```
