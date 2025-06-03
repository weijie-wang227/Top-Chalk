package handlers

import (
	"encoding/json"
	"net/http"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	var creds LoginRequest
	_ = json.NewDecoder(r.Body).Decode(&creds)

	if creds.Username == "admin" && creds.Password == "password123" {
		json.NewEncoder(w).Encode(map[string]string{"message": "Login successful"})
		http.SetCookie(w, &http.Cookie{
			Name:     "session_id",
			Value:    "some-session-token",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		})
	} else {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
	}
}
