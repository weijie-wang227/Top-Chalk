package routes

import (
	"backend/internal/handlers"
	"database/sql"

	"github.com/gorilla/mux"
)

func NewRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()

	r.HandleFunc("/login", handlers.LoginHandler(db)).Methods("POST")

	return r
}
