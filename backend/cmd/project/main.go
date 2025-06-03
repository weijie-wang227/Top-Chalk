package main

import (
	"backend/internal/routes"
	"log"
	"net/http"

	"github.com/gorilla/handlers"
)

func main() {
	router := routes.NewRouter()

	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:5173"}),
		handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type"}),
		handlers.AllowCredentials(),
	)(router)

	log.Println("Server is running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", corsHandler))
}
