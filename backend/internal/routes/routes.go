package routes

import (
	"backend/internal/handlers"
	"database/sql"

	"github.com/gorilla/mux"
)

func NewRouter(db *sql.DB) *mux.Router {
	r := mux.NewRouter()

	r.HandleFunc("/login", handlers.LoginHandler(db)).Methods("POST")
	r.HandleFunc("/upvote", handlers.UpvoteHandler(db)).Methods("POST")
	r.HandleFunc("/register", handlers.RegisterHandler(db)).Methods("POST")

	r.HandleFunc("/categories", handlers.GetCategoriesHandler(db)).Methods("GET")
	r.HandleFunc("/professors", handlers.GetProfessorsHandler(db)).Methods("GET")
	r.HandleFunc("/faculties", handlers.GetFacultiesHandler(db)).Methods("GET")

	r.HandleFunc("/leaderboard", handlers.GetTop3Handler(db)).Methods("GET")
	r.HandleFunc("/top3categories", handlers.GetTop3ByCategoryHandler(db)).Methods("GET")
	r.HandleFunc("/top3faculties", handlers.GetTop3ByFacultyHandler(db)).Methods("GET")

	return r
}
