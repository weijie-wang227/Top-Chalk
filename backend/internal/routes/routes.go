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
	r.HandleFunc("/downvote", handlers.DownvoteHandler(db)).Methods("POST")
	r.HandleFunc("/register", handlers.RegisterHandler(db)).Methods("POST")
	r.HandleFunc("/auth/request", handlers.AuthStatusHandler(db)).Methods("GET")
	r.HandleFunc("/logout", handlers.LogoutHandler(db)).Methods("POST")

	r.HandleFunc("/categoriesUp", handlers.GetCategoriesUpHandler(db)).Methods("GET")
	r.HandleFunc("/categoriesDown", handlers.GetCategoriesDownHandler(db)).Methods("GET")
	r.HandleFunc("/subcategories", handlers.GetSubCategoriesHandler(db)).Methods("GET")
	r.HandleFunc("/professors", handlers.GetProfessorsHandler(db)).Methods("GET")
	r.HandleFunc("/faculties", handlers.GetFacultiesHandler(db)).Methods("GET")
	r.HandleFunc("/info", handlers.GetProfInfoHandler(db)).Methods("GET")

	r.HandleFunc("/leaderboard", handlers.GetTop3Handler(db)).Methods("GET")
	r.HandleFunc("/top3categories", handlers.GetTop3ByCategoryHandler(db)).Methods("GET")
	r.HandleFunc("/top3faculties", handlers.GetTop3ByFacultyHandler(db)).Methods("GET")

	r.HandleFunc("/bestCategories", handlers.GetBestCategories(db)).Methods("GET")
	r.HandleFunc("/worstCategories", handlers.GetWorstCategories(db)).Methods("GET")
	r.HandleFunc("/getName", handlers.GetNameHandler(db)).Methods("GET")

	r.HandleFunc("/uploadAvatar", handlers.UploadAvatarHandler(db)).Methods("POST")
	r.HandleFunc("/avatarUrl", handlers.GetAvatarUrl(db)).Methods("GET")

	r.HandleFunc("/checkVote", handlers.CheckVotes(db)).Methods("GET")

	r.HandleFunc("uploadKudos", handlers.UploadKudosHandler(db)).Methods("POST")

	r.HandleFunc("getKudos", handlers.GetKudos(db)).Methods("GET")
	r.HandleFunc("updateKudos", handlers.UpdateKudos(db)).Methods("POST")

	return r
}
