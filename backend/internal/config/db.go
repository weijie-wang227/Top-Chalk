package config

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq" // PostgreSQL driver
)

func ConnectDB() *sql.DB {
	dsn := getDSN()
	db, err := sql.Open("postgres", dsn)
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
		id SERIAL PRIMARY KEY,
		username VARCHAR(255) NOT NULL UNIQUE,
		password VARCHAR(255) NOT NULL,
		mode VARCHAR(255) NOT NULL
	);`

	createSessionsQuery := `
	CREATE TABLE IF NOT EXISTS sessions (
		session_id VARCHAR(255) PRIMARY KEY,
		user_id INT NOT NULL,
		mode VARCHAR(50) NOT NULL,
		expires_at TIMESTAMP NOT NULL,
		FOREIGN KEY (user_id) REFERENCES users(id)
	);`

	createFaculties := `
	CREATE TABLE IF NOT EXISTS faculties (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL
	);`

	createCategoriesUp := `
	CREATE TABLE IF NOT EXISTS categoriesup (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL
	);`

	createCategoriesDown := `
	CREATE TABLE IF NOT EXISTS categoriesdown (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL
	);`

	createSubCategoriesDown := `
	CREATE TABLE IF NOT EXISTS subcategoriesdown (
		id SERIAL PRIMARY KEY,
		name VARCHAR(100) NOT NULL,		
		category_id INT NOT NULL,
		FOREIGN KEY (category_id) REFERENCES categoriesdown(id) ON DELETE CASCADE
	);`

	createTeachersQuery := `
	CREATE TABLE IF NOT EXISTS teachers (
		id INT PRIMARY KEY,
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
		count INT NOT NULL,
		FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (category_id) REFERENCES categoriesup(id) ON DELETE CASCADE,
		UNIQUE (id, category_id)
	);`

	createDownVotesQuery := `
	CREATE TABLE IF NOT EXISTS downvotes (
		id INT NOT NULL,
		downvote_id INT NOT NULL,
		count INT NOT NULL,
		FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (downvote_id) REFERENCES subcategoriesdown(id) ON DELETE CASCADE,
		UNIQUE (id, downvote_id)
	);`

	createWeeklyQuery := `
	CREATE TABLE IF NOT EXISTS weeklytracker (
		student_id INT NOT NULL,
		teacher_id INT NOT NULL,
		isupvote BOOLEAN NOT NULL, 
		UNIQUE (student_id, teacher_id, isupvote),
		FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
	);`

	createLeaderboardtrackerQuery := `
	CREATE TABLE IF NOT EXISTS leaderboardtracker (
		type VARCHAR(100) NOT NULL,
		leaderboard_id INT,
		teacher_id INT NOT NULL,
		streak INT NOT NULL,
		rank INT NOT NULL,
		FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE);
	`

	queries := []struct {
		name  string
		query string
	}{
		{"users", createUsersQuery},
		{"sessions", createSessionsQuery},
		{"faculties", createFaculties},
		{"categoriesup", createCategoriesUp},
		{"teachers", createTeachersQuery},
		{"votes", createVotesQuery},
		{"categoriesdown", createCategoriesDown},
		{"subcategoriesdown", createSubCategoriesDown},
		{"downvotes", createDownVotesQuery},
		{"weeklytracker", createWeeklyQuery},
		{"leaderboardtracker", createLeaderboardtrackerQuery},
	}

	for _, q := range queries {
		if _, err := db.Exec(q.query); err != nil {
			log.Printf("Failed to create %s table: %v", q.name, err)
			return err
		}
		log.Printf("%s table exists or created.", q.name)
	}

	return nil
}
