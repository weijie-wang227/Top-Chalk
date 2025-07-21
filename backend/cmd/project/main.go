package main

import (
	"backend/internal/config"
	"backend/internal/routes"
	"backend/internal/tasks"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/handlers"
)

func main() {
	db := config.ConnectDB()
	config.CreateTables(db)
	defer db.Close()
	router := routes.NewRouter(db)
	go tasks.WeeklyLoop(db)
	fmt.Println("Current time is:", time.Now())

	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:5173",
			"https://weijie-wang227.github.io"}),
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
