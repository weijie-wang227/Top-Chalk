package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

func Login(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var creds LoginRequest
		json.NewDecoder(r.Body).Decode(&creds)

		var storedPassword string
		err := db.QueryRow("SELECT password FROM users WHERE username = ?", creds.Username).Scan(&storedPassword)
		if err != nil {
			http.Error(w, "User not found", http.StatusUnauthorized)
			return
		}

		if creds.Password != storedPassword {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"message": "Login successful"})
	}
}
