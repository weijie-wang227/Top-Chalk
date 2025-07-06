package config

import (
	"fmt"
	"os"
)

func getDSN() string {
	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")
	instanceConnName := os.Getenv("DB_HOST") // this should be the Cloud SQL instance connection name

	dsn := fmt.Sprintf("user=%s password=%s dbname=%s host=/cloudsql/%s sslmode=disable",
		dbUser, dbPass, dbName, instanceConnName)

	fmt.Printf("Connecting to DB %s as %s using Unix socket...\n", dbName, dbUser)
	return dsn
}