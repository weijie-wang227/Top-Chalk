package config

import (
	"fmt"
	"os"

	/* Enable when testing locally 
	"log"
	"github.com/joho/godotenv"
	*/
)

/* Enable when testing locally 
func loadEnv() {
    err := godotenv.Load()
    if err != nil {
        log.Fatal("Error loading .env file")
    }
}
*/

func getDSN() string {

	/* Enable when testing locally 
	loadEnv()
	*/	

	dbUser := os.Getenv("DB_USER")
	dbPass := os.Getenv("DB_PASS")
	dbName := os.Getenv("DB_NAME")
	instanceConnName := os.Getenv("DB_HOST") // this should be the Cloud SQL instance connection name

													// Set host=%s when testing locally
	dsn := fmt.Sprintf("user=%s password=%s dbname=%s host=/cloudsql/%s sslmode=disable",
		dbUser, dbPass, dbName, instanceConnName)

	fmt.Printf("Connecting to DB %s as %s using Unix socket...\n", dbName, dbUser)
	return dsn
}