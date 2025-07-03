package config

import (
	"log"
	"os"
)

// Config contiene la configuración del servicio
type Config struct {
	Port      string
	SMTPHost  string
	SMTPPort  string
	SMTPUser  string
	SMTPPass  string
	FromEmail string
	FromName  string
}

// LoadConfig carga la configuración desde variables de entorno o valores por defecto
func LoadConfig() *Config {
	config := &Config{
		Port:      getEnv("PORT", "8080"),
		SMTPHost:  getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:  getEnv("SMTP_PORT", "587"),
		SMTPUser:  getEnv("SMTP_USER", ""),
		SMTPPass:  getEnv("SMTP_PASS", ""),
		FromEmail: getEnv("FROM_EMAIL", "noreply@formulario.com"),
		FromName:  getEnv("FROM_NAME", "Sistema de Empleados"),
	}

	if config.SMTPUser == "" || config.SMTPPass == "" {
		log.Println("Advertencia: SMTP_USER y SMTP_PASS no configurados. Las notificaciones solo se simularán.")
	}

	return config
}

// getEnv obtiene una variable de entorno o retorna un valor por defecto
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
