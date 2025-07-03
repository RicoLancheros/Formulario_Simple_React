package main

import (
	"fmt"
	"log"
	"net/http"
	"notification-service/config"
	"notification-service/handlers"
)

func main() {
	// Cargar configuración
	cfg := config.LoadConfig()

	// Crear handler de notificaciones
	notificationHandler := handlers.NewNotificationHandler(cfg)

	// Configurar rutas
	mux := http.NewServeMux()

	// Middleware para CORS
	corsHandler := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}

			next(w, r)
		}
	}

	// Rutas del servicio
	mux.HandleFunc("/api/notifications/send", corsHandler(notificationHandler.SendNotification))
	mux.HandleFunc("/api/notifications/health", corsHandler(notificationHandler.HealthCheck))

	// Ruta raíz para información del servicio
	mux.HandleFunc("/", corsHandler(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Método no permitido", http.StatusMethodNotAllowed)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{
    "service": "notification-service",
    "version": "1.0.0",
    "status": "running",
    "endpoints": [
        "GET /api/notifications/health",
        "POST /api/notifications/send"
    ]
}`)
	}))

	// Mensaje de inicio
	log.Printf("🚀 Servicio de Notificaciones iniciado en puerto %s", cfg.Port)
	log.Printf("📧 SMTP configurado: %t", cfg.SMTPUser != "" && cfg.SMTPPass != "")
	log.Printf("🌐 Endpoints disponibles:")
	log.Printf("   GET  http://localhost:%s/", cfg.Port)
	log.Printf("   GET  http://localhost:%s/api/notifications/health", cfg.Port)
	log.Printf("   POST http://localhost:%s/api/notifications/send", cfg.Port)

	// Iniciar servidor
	if err := http.ListenAndServe(":"+cfg.Port, mux); err != nil {
		log.Fatalf("❌ Error iniciando servidor: %v", err)
	}
}
