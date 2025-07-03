package models

import "time"

// NotificationRequest representa una solicitud de notificación
type NotificationRequest struct {
	Type    string      `json:"type"` // "welcome", "employee_created", "employee_updated"
	Email   string      `json:"email"`
	Subject string      `json:"subject"`
	Data    interface{} `json:"data"`
}

// Employee representa la información del empleado para notificaciones
type Employee struct {
	ID                int      `json:"id"`
	NombreCompleto    string   `json:"nombre_completo"`
	CorreoElectronico string   `json:"correo_electronico"`
	Sexo              string   `json:"sexo"`
	Area              string   `json:"area"`
	Descripcion       string   `json:"descripcion"`
	AceptaBoletin     bool     `json:"acepta_boletin"`
	Roles             []string `json:"roles"`
}

// NotificationResponse representa la respuesta del servicio
type NotificationResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	ID      string `json:"id,omitempty"`
}

// NotificationLog representa un log de notificación enviada
type NotificationLog struct {
	ID       string    `json:"id"`
	Type     string    `json:"type"`
	Email    string    `json:"email"`
	Subject  string    `json:"subject"`
	Status   string    `json:"status"` // "sent", "failed", "pending"
	SentAt   time.Time `json:"sent_at"`
	ErrorMsg string    `json:"error_msg,omitempty"`
}
