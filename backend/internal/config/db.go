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

func CreateTables(db *sql.DB) error {
	createUsersQuery := `
	CREATE TABLE IF NOT EXISTS users (
		id INT AUTO_INCREMENT PRIMARY KEY,
		username VARCHAR(255) NOT NULL UNIQUE,
		password VARCHAR(255) NOT NULL,
		mode VARCHAR(255) NOT NULL
	);`
	createSessionsQuery := `
	CREATE TABLE IF NOT EXISTS sessions (
		session_id VARCHAR(255) PRIMARY KEY,
		user_id INT NOT NULL,
		mode VARCHAR(50) NOT NULL,
		expires_at DATETIME NOT NULL,
		FOREIGN KEY (user_id) REFERENCES users(id)
	);`
	createFaculties := `
	CREATE TABLE IF NOT EXISTS faculties (
    	id INT AUTO_INCREMENT PRIMARY KEY,
    	name VARCHAR(100) NOT NULL
	);`
	createCategoriesUp := `
	CREATE TABLE IF NOT EXISTS categoriesUp (
		id INT AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(100) NOT NULL
	);`
	createCategoriesDown := `
	CREATE TABLE IF NOT EXISTS categoriesDown (
		id INT AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(100) NOT NULL
	);`
	createSubCategoriesDown := `
	CREATE TABLE IF NOT EXISTS subCategoriesDown (
		id INT AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(100) NOT NULL,		
		category_id INT NOT NULL,
		FOREIGN KEY (category_id) REFERENCES categoriesDown(id) ON DELETE CASCADE
	);`
	createTeachersQuery := `
	CREATE TABLE IF NOT EXISTS teachers (
		id INT NOT NULL,
		faculty_id INT NOT NULL,
		name VARCHAR(255) NOT NULL,
		avatar_url VARCHAR(255),
		FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE
	);`
	createVotesQuery := `
	CREATE TABLE IF NOT EXISTS votes (
		id INT NOT NULL,
		category_id INT NOT NULL,
		count int NOT NULL,
		FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
		UNIQUE KEY unique_vote (id, category_id)
	);`
	createDownVotesQuery := `
	CREATE TABLE IF NOT EXISTS downvotes (
		id INT NOT NULL,
		downvote_id INT NOT NULL,
		count INT NOT NULL,
		FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (downvote_id)
			REFERENCES subCategoriesDown(id)
			ON DELETE CASCADE,
		UNIQUE KEY unique_downVote (id, downvote_id)
	);`

	_, err := db.Exec(createUsersQuery)
	if err != nil {
		log.Printf("Failed to create users table: %v", err)
		return err
	}
	log.Println("Users table exists or created.")

	_, err = db.Exec(createSessionsQuery)
	if err != nil {
		log.Printf("Failed to create sessions table: %v", err)
		return err
	}
	log.Println("Sessions table exists or created.")

	_, err = db.Exec(createFaculties)
	if err != nil {
		log.Printf("Failed to create faculties table: %v", err)
		return err
	}
	log.Println("Faculties table exists or created.")

	_, err = db.Exec(createCategoriesUp)
	if err != nil {
		log.Printf("Failed to create categories table: %v", err)
		return err
	}
	log.Println("CategoriesUp table exists or created.")

	_, err = db.Exec(createTeachersQuery)
	if err != nil {
		log.Printf("Failed to create teachers table: %v", err)
		return err
	}
	log.Println("Teachers table exists or created.")

	_, err = db.Exec(createVotesQuery)
	if err != nil {
		log.Printf("Failed to create upvotes table: %v", err)
		return err
	}
	log.Println("Votes table exists or created.")

	_, err = db.Exec(createCategoriesDown)
	if err != nil {
		log.Printf("Failed to create categoriesDown table: %v", err)
		return err
	}
	log.Println("categoriesDown table exists or created.")

	_, err = db.Exec(createSubCategoriesDown)
	if err != nil {
		log.Printf("Failed to create subCategoriesDown table: %v", err)
		return err
	}
	log.Println("subCategoriesDown table exists or created.")

	_, err = db.Exec(createDownVotesQuery)
	if err != nil {
		log.Printf("Failed to create downvotes table: %v", err)
		return err
	}
	log.Println("downvotes table exists or created.")

	return nil
}
