package routes

import (
	"backend/internal/handlers"

	"github.com/gorilla/mux"
)

func NewRouter() *mux.Router {
	r := mux.NewRouter()
	r.HandleFunc("/login", handlers.LoginHandler).Methods("POST")
	return r
}
