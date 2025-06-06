package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func LoginHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var creds LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		var storedPassword string
		err := db.QueryRow("SELECT password FROM users WHERE username = ?", creds.Username).Scan(&storedPassword)

		if err == sql.ErrNoRows || storedPassword != creds.Password {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		} else if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}

		// Success
		http.SetCookie(w, &http.Cookie{
			Name:     "session_id",
			Value:    "some-session-token", // You should generate a real token
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		})
		json.NewEncoder(w).Encode(map[string]string{"message": "Login successful"})
	}
}

func UpvoteHandler(db *sql.DB) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

	}
}

func GetTop3Handler(db *sql.DB) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

	}
}

func GetTop3ByCategoryHandler(db *sql.DB) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

	}
}

func GetTop3ByFacultyHandler(db *sql.DB) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

	}
}
