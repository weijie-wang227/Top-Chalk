package config

import (
	"fmt"
	"os"

  
	
	"log"
	"github.com/joho/godotenv"
	
)
func loadEnv() {
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }
}


func getDSN() string {

 	loadEnv()

	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")
	instanceConnName := os.Getenv("DB_HOST")

	// For production
	dsn := fmt.Sprintf("user=%s password=%s dbname=%s host=%s sslmode=disable",
		dbUser, dbPass, dbName, instanceConnName)

	// For local testing
	/*
		dbPort := os.Getenv("DB_PORT")
		dsn := fmt.Sprintf(
			"postgres://%s:%s@%s:%s/%s?sslmode=disable",
			dbUser, dbPass, instanceConnName, dbPort, dbName,
		)
	*/

	fmt.Printf("Connecting to DB %s as %s using Unix socket...\n", dbName, dbUser)
	return dsn
}
