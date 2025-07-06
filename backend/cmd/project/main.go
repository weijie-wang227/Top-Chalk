package main

import (
	"backend/internal/config"
	"backend/internal/routes"
	"backend/internal/tasks"
	"log"
	"net/http" 
	"os"
	"github.com/gorilla/handlers"
)

func main() {
	db := config.ConnectDB()
	config.CreateTables(db)
	defer db.Close()
	router := routes.NewRouter(db)
	go tasks.WeeklyLoop(db)

	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:5173", "top-chalk.vercel.app"}),
		handlers.AllowedMethods([]string{"GET", "POST", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type"}),
		handlers.AllowCredentials(),
	)(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // default for local dev
	}

	log.Printf("Server is running on http://0.0.0.0:%s", port)
	log.Fatal(http.ListenAndServe("0.0.0.0:"+port, corsHandler))
}
