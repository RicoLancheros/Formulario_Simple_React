package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"notification-service/config"
	"notification-service/models"
	"strings"
	"time"

	"github.com/google/uuid"
)

// NotificationHandler maneja las solicitudes de notificación
type NotificationHandler struct {
	config *config.Config
}

// NewNotificationHandler crea una nueva instancia del handler
func NewNotificationHandler(cfg *config.Config) *NotificationHandler {
	return &NotificationHandler{
		config: cfg,
	}
}

// SendNotification maneja el endpoint POST /api/notifications/send
func (h *NotificationHandler) SendNotification(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	var req models.NotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "JSON inválido", http.StatusBadRequest)
		return
	}

	// Validar campos requeridos
	if req.Type == "" || req.Email == "" {
		http.Error(w, "Tipo y email son requeridos", http.StatusBadRequest)
		return
	}

	// Generar ID único para la notificación
	notificationID := uuid.New().String()

	// Construir el mensaje según el tipo
	subject, body := h.buildMessage(req)

	// Enviar email (o simular si no hay configuración SMTP)
	err := h.sendEmail(req.Email, subject, body)

	response := models.NotificationResponse{
		ID: notificationID,
	}

	if err != nil {
		log.Printf("Error enviando email a %s: %v", req.Email, err)
		response.Success = false
		response.Message = "Error al enviar notificación"
		w.WriteHeader(http.StatusInternalServerError)
	} else {
		log.Printf("Notificación enviada exitosamente a %s (ID: %s)", req.Email, notificationID)
		response.Success = true
		response.Message = "Notificación enviada exitosamente"
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// HealthCheck maneja el endpoint GET /api/notifications/health
func (h *NotificationHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
		return
	}

	response := map[string]interface{}{
		"status":          "healthy",
		"service":         "notification-service",
		"timestamp":       time.Now().UTC(),
		"smtp_configured": h.config.SMTPUser != "" && h.config.SMTPPass != "",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// buildMessage construye el asunto y cuerpo del mensaje según el tipo
func (h *NotificationHandler) buildMessage(req models.NotificationRequest) (string, string) {
	switch req.Type {
	case "welcome":
		if req.Subject != "" {
			return req.Subject, h.buildWelcomeBody(req.Data)
		}
		return "¡Bienvenido al Sistema de Empleados!", h.buildWelcomeBody(req.Data)

	case "employee_created":
		if req.Subject != "" {
			return req.Subject, h.buildEmployeeCreatedBody(req.Data)
		}
		return "Nuevo Empleado Registrado", h.buildEmployeeCreatedBody(req.Data)

	case "employee_updated":
		if req.Subject != "" {
			return req.Subject, h.buildEmployeeUpdatedBody(req.Data)
		}
		return "Información de Empleado Actualizada", h.buildEmployeeUpdatedBody(req.Data)

	default:
		return req.Subject, "Notificación del Sistema de Empleados"
	}
}

// buildWelcomeBody construye el cuerpo del mensaje de bienvenida
func (h *NotificationHandler) buildWelcomeBody(data interface{}) string {
	employee, ok := data.(map[string]interface{})
	if !ok {
		return "¡Gracias por suscribirte a nuestro boletín informativo!"
	}

	name := "Usuario"
	if nombre, exists := employee["nombre_completo"]; exists {
		if nombreStr, ok := nombre.(string); ok {
			name = nombreStr
		}
	}

	return fmt.Sprintf(`
Hola %s,

¡Gracias por suscribirte a nuestro boletín informativo!

Recibirás actualizaciones importantes sobre:
- Nuevas oportunidades laborales
- Eventos de la empresa
- Noticias del sector

¡Bienvenido a bordo!

Saludos,
El equipo del Sistema de Empleados
`, name)
}

// buildEmployeeCreatedBody construye el cuerpo del mensaje de empleado creado
func (h *NotificationHandler) buildEmployeeCreatedBody(data interface{}) string {
	employee, ok := data.(map[string]interface{})
	if !ok {
		return "Un nuevo empleado ha sido registrado en el sistema."
	}

	name := "Empleado"
	area := "N/A"

	if nombre, exists := employee["nombre_completo"]; exists {
		if nombreStr, ok := nombre.(string); ok {
			name = nombreStr
		}
	}

	if areaData, exists := employee["area"]; exists {
		if areaStr, ok := areaData.(string); ok {
			area = areaStr
		}
	}

	return fmt.Sprintf(`
Nuevo empleado registrado:

Nombre: %s
Área: %s

El empleado ha sido añadido exitosamente al sistema.

Saludos,
Sistema de Empleados
`, name, area)
}

// buildEmployeeUpdatedBody construye el cuerpo del mensaje de empleado actualizado
func (h *NotificationHandler) buildEmployeeUpdatedBody(data interface{}) string {
	employee, ok := data.(map[string]interface{})
	if !ok {
		return "La información de un empleado ha sido actualizada."
	}

	name := "Empleado"
	if nombre, exists := employee["nombre_completo"]; exists {
		if nombreStr, ok := nombre.(string); ok {
			name = nombreStr
		}
	}

	return fmt.Sprintf(`
Información actualizada:

El perfil de %s ha sido modificado en el sistema.

Saludos,
Sistema de Empleados
`, name)
}

// sendEmail envía un email usando SMTP o simula el envío
func (h *NotificationHandler) sendEmail(to, subject, body string) error {
	// Si no hay configuración SMTP, simular el envío
	if h.config.SMTPUser == "" || h.config.SMTPPass == "" {
		log.Printf("SIMULANDO envío de email a %s - Asunto: %s", to, subject)
		return nil
	}

	// Configurar autenticación SMTP
	auth := smtp.PlainAuth("", h.config.SMTPUser, h.config.SMTPPass, h.config.SMTPHost)

	// Construir el mensaje
	msg := []string{
		"From: " + fmt.Sprintf("%s <%s>", h.config.FromName, h.config.FromEmail),
		"To: " + to,
		"Subject: " + subject,
		"MIME-Version: 1.0",
		"Content-Type: text/plain; charset=UTF-8",
		"",
		body,
	}

	// Enviar email
	err := smtp.SendMail(
		h.config.SMTPHost+":"+h.config.SMTPPort,
		auth,
		h.config.FromEmail,
		[]string{to},
		[]byte(strings.Join(msg, "\r\n")),
	)

	return err
}
