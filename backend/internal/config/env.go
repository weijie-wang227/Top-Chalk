package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
)

func getDSN() string {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")
	instanceConnName := os.Getenv("DB_HOST")

	dsn := fmt.Sprintf("user=%s password=%s dbname=%s host=/cloudsql/%s sslmode=disable",
		dbUser, dbPass, dbName, instanceConnName)

	fmt.Printf("Connecting to DB %s as %s using Unix socket...\n", dbName, dbUser)
	return dsn
}
