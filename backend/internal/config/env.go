package config

import (
	"log"
	"os"
	"github.com/joho/godotenv"
	"fmt"
)

func getDSN() string {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	// URL-encode password if needed
	// If it's already encoded (like %21 for !), remove url.QueryEscape
	 dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable",
        dbUser, dbPass, dbHost, dbPort, dbName)

	fmt.Println("Connecting with DSN:", dsn)
	return dsn
}
