# Servicio de Notificaciones en Go

Este servicio maneja el envío de notificaciones por email para el sistema de empleados.

## Características

- ✅ Envío de emails de bienvenida para usuarios del boletín
- ✅ Notificaciones cuando se crea un empleado
- ✅ Notificaciones cuando se actualiza un empleado
- ✅ Simulación de envíos cuando no hay configuración SMTP
- ✅ API REST con endpoints JSON
- ✅ Soporte para CORS

## Endpoints

### GET /api/notifications/health
Verifica el estado del servicio.

**Respuesta:**
```json
{
  "status": "healthy",
  "service": "notification-service", 
  "timestamp": "2025-01-02T10:30:00Z",
  "smtp_configured": true
}
```

### POST /api/notifications/send
Envía una notificación por email.

**Parámetros:**
```json
{
  "type": "welcome|employee_created|employee_updated",
  "email": "usuario@ejemplo.com",
  "subject": "Asunto personalizado (opcional)",
  "data": {
    "nombre_completo": "Juan Pérez",
    "area": "Tecnología"
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Notificación enviada exitosamente",
  "id": "123e4567-e89b-12d3-a456-426614174000"
}
```

## Configuración

### Variables de Entorno (Opcionales)

```bash
# Puerto del servicio
PORT=8080

# Configuración SMTP (si no se configura, se simularán los envíos)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_de_aplicacion

# Configuración del remitente
FROM_EMAIL=noreply@formulario.com
FROM_NAME=Sistema de Empleados
```

## Ejecución

```bash
# Desde el directorio notification-service
go run cmd/main.go

# O compilar y ejecutar
go build -o notification-service cmd/main.go
./notification-service
```

El servicio estará disponible en `http://localhost:8080`

## Integración

Este servicio se integra automáticamente con el backend Node.js del sistema de empleados. Cuando se crea o actualiza un empleado, el backend Node.js envía una solicitud HTTP a este servicio para enviar las notificaciones correspondientes. 