# Sistema de Empleados - React + Node.js + Go

Sistema completo de gestión de empleados con arquitectura de microservicios.

## 🏗️ Arquitectura

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Servicio de Notificaciones**: Go
- **Base de Datos**: MySQL

## 🚀 Características

- ✅ CRUD completo de empleados
- ✅ Validación de formularios
- ✅ Sistema de notificaciones por email
- ✅ Suscripción a boletín informativo
- ✅ Arquitectura de microservicios
- ✅ API REST

## 📋 Manual de Instalación

### 1. Crear la base de datos en MySQL:

```sql
-- 1. Crear la base de datos (si no existe)
CREATE DATABASE Formulario_Examen;

-- 2. Usar la base de datos creada
USE Formulario_Examen;

-- 3. Crear la tabla de empleados
CREATE TABLE IF NOT EXISTS empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    correo_electronico VARCHAR(255) NOT NULL UNIQUE,
    sexo ENUM('Masculino', 'Femenino', 'Otro') NOT NULL,
    area VARCHAR(100) NOT NULL,
    descripcion TEXT,
    acepta_boletin BOOLEAN DEFAULT FALSE,
    roles JSON NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_roles CHECK (JSON_VALID(roles))
);
```

### 2. Configurar la base de datos

Cambiar la contraseña en `server/db.js` a la de tu MySQL.

### 3. Iniciar el proyecto

Ejecutar `IniciarProyecto.bat` desde el directorio raíz.

## 🌐 Servicios y Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| **React Frontend** | 5173 | http://localhost:5173 |
| **Node.js Backend** | 3001 | http://localhost:3001 |
| **Go Notifications** | 8080 | http://localhost:8080 |

## 📧 Sistema de Notificaciones

El servicio Go maneja automáticamente:

- **Emails de bienvenida** cuando un empleado se suscribe al boletín
- **Notificaciones administrativas** al crear/actualizar empleados
- **Simulación de envíos** si no hay configuración SMTP

### Endpoints del Servicio Go

- `GET /api/notifications/health` - Estado del servicio
- `POST /api/notifications/send` - Enviar notificación

Para más detalles, ver [notification-service/README.md](notification-service/README.md)

## 🔧 Configuración SMTP (Opcional)

Para enviar emails reales, configurar variables de entorno en el servicio Go:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_password_de_aplicacion
```

Sin configuración SMTP, las notificaciones se simularán en la consola.

## 📂 Estructura del Proyecto

```
├── client/              # Frontend React + Vite
├── server/              # Backend Node.js + Express  
├── notification-service/ # Servicio de notificaciones Go
├── IniciarProyecto.bat  # Script de inicio automático
└── README.md            # Este archivo
```

## 🔄 Flujo de Notificaciones

1. Usuario se registra/actualiza en el frontend
2. Backend Node.js procesa la solicitud
3. Si acepta boletín → Backend llama al servicio Go
4. Servicio Go envía email de bienvenida
5. Logs de notificaciones en consola

## 🛠️ Desarrollo

### Iniciar servicios individualmente:

```bash
# Servicio Go (puerto 8080)
cd notification-service
go run cmd/main.go

# Backend Node.js (puerto 3001)  
cd server
npm start

# Frontend React (puerto 5173)
cd client
npm run dev
```






