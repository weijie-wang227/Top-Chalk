package config

import (
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

func ConnectDB() *sql.DB {
	dsn := getDSN()
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal("Error opening DB:", err)
	}
	if err := db.Ping(); err != nil {
		log.Fatal("Error connecting to DB:", err)
	}
	return db
}

func FillDB(db *sql.DB) error {
	createStudentsQuery := `
	CREATE TABLE IF NOT EXISTS students (
		id INT AUTO_INCREMENT PRIMARY KEY,
		username VARCHAR(255) NOT NULL UNIQUE,
		password VARCHAR(255) NOT NULL
	);`
	createTeachersQuery := `
	CREATE TABLE IF NOT EXISTS students (
		id INT AUTO_INCREMENT PRIMARY KEY,
		username VARCHAR(255) NOT NULL UNIQUE,
		password VARCHAR(255) NOT NULL
	);`
	_, err := db.Exec(createStudentsQuery)
	if err != nil {
		log.Printf("Failed to create students table: %v", err)
		return err
	}
	log.Println("Students table exists or created.")

	_, err2 := db.Exec(createTeachersQuery)
	if err2 != nil {
		log.Printf("Failed to create teachers table: %v", err)
		return err
	}
	log.Println("Teachers table exists or created.")

	return nil
}
