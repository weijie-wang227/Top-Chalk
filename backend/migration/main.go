package main

import (
	"backend/internal/config"
	"log"

	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	db := config.ConnectDB()

	rows, err := db.Query(`SELECT id, password FROM users`)
	if err != nil {
		log.Fatal(err)
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var pw string
		if err := rows.Scan(&id, &pw); err != nil {
			log.Print(err)
			continue
		}

		// skip if already bcrypt
		if len(pw) >= 60 && pw[0:2] == "$2" {
			continue
		}

		hash, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
		if err != nil {
			log.Print(err)
			continue
		}

		if _, err := db.Exec(`UPDATE users SET password = $1 WHERE id = $2`, string(hash), id); err != nil {
			log.Print(err)
		}
	}
	log.Println("Password migration complete")
}
