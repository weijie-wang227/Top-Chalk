package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Mode     string `json:"mode"`
}

func RegisterHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		var existing int
		err := db.QueryRow("SELECT COUNT(*) FROM users WHERE username = ?", req.Username).Scan(&existing)
		if err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			return
		}

		if existing > 0 {
			http.Error(w, "User already exists", http.StatusConflict)
			return
		}

		_, err = db.Exec("INSERT INTO users (username, password, mode) VALUES (?, ?, ?)",
			req.Username, req.Password, req.Mode)
		if err != nil {
			http.Error(w, "Failed to register user", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Registration successful",
		})
	}
}

func LoginHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var creds LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		var userId int
		var password string

		err := db.QueryRow(
			"SELECT id, password FROM users WHERE username = ? AND mode = ?",
			creds.Username, creds.Mode,
		).Scan(&userId, &password)

		if err == sql.ErrNoRows || password != creds.Password {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		} else if err != nil {
			http.Error(w, "Server error", http.StatusInternalServerError)
			return
		}

		// Generate session token
		sessionToken := uuid.NewString()
		expiry := time.Now().Add(24 * time.Hour)
		_, err = db.Exec(
			"INSERT INTO sessions (session_id, user_id, mode, expires_at) VALUES (?, ?, ?, ?)",
			sessionToken, userId, creds.Mode, expiry,
		)
		if err != nil {
			http.Error(w, "Could not create session", http.StatusInternalServerError)
			return
		}
		log.Printf("New Session: %v", sessionToken)
		// Set session cookie
		http.SetCookie(w, &http.Cookie{
			Name:     "session_id",
			Value:    sessionToken,
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			Expires:  expiry,
		})

		http.SetCookie(w, &http.Cookie{
			Name:     "current_user",
			Value:    creds.Username,
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			Expires:  expiry,
		})

		json.NewEncoder(w).Encode(map[string]string{"message": "Login successful"})
	}
}

func AuthStatusHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie("session_id")
		type AuthResponse struct {
			UserID int    `json:"userId"`
			Mode   string `json:"mode"`
		}

		if err != nil {
			log.Printf("No session currently")
			json.NewEncoder(w).Encode(AuthResponse{
				UserID: -1,
				Mode:   "None",
			})
			return
		}

		var userId int
		var mode string
		var expiry time.Time

		err = db.QueryRow(
			"SELECT user_id, mode, expires_at FROM sessions WHERE session_id = ?",
			cookie.Value,
		).Scan(&userId, &mode, &expiry)

		if err == sql.ErrNoRows || time.Now().After(expiry) {
			if err == sql.ErrNoRows {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{
					"error": "session doesnt exist",
				})
				return
			} else if time.Now().After(expiry) {

				_, err = db.Exec("DELETE FROM sessions WHERE expires_at = ?", expiry)
				if err != nil {
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusInternalServerError)
					json.NewEncoder(w).Encode(map[string]string{
						"error": err.Error(),
					})
					return
				}

				http.SetCookie(w, &http.Cookie{
					Name:     "session_id",
					Value:    "",
					Path:     "/",
					MaxAge:   -1,
					HttpOnly: true,
					SameSite: http.SameSiteLaxMode,
				})

				http.SetCookie(w, &http.Cookie{
					Name:     "current_user",
					Value:    "",
					Path:     "/",
					MaxAge:   -1,
					HttpOnly: true,
					SameSite: http.SameSiteLaxMode,
				})

			}
			json.NewEncoder(w).Encode(json.NewEncoder(w).Encode(AuthResponse{
				UserID: -2,
				Mode:   "None",
			}))
			return
		} else if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": err.Error(),
			})
			return
		}

		json.NewEncoder(w).Encode(AuthResponse{
			UserID: userId,
			Mode:   mode,
		})
	}
}

func LogoutHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Try to get the session cookie
		cookie, err := r.Cookie("session_id")
		if err != nil {
			http.Error(w, "No active session", http.StatusBadRequest)
			return
		}

		// Delete the session from the database
		_, err = db.Exec("DELETE FROM sessions WHERE session_id = ?", cookie.Value)
		if err != nil {
			http.Error(w, "Failed to logout", http.StatusInternalServerError)
			return
		}

		// Clear the cookie from the browser
		http.SetCookie(w, &http.Cookie{
			Name:     "session_id",
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		})

		http.SetCookie(w, &http.Cookie{
			Name:     "current_user",
			Value:    "",
			Path:     "/",
			MaxAge:   -1,
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		})

		// Send success message
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Logged out successfully"})
	}
}

type UpvoteRequest struct {
	ProfId     int `json:"profId"`
	CategoryId int `json:"selectedCategory"`
}

func UpvoteHandler(db *sql.DB) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		var upvote UpvoteRequest
		if err := json.NewDecoder(r.Body).Decode(&upvote); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		query := `
		INSERT INTO votes (id, category_id, count)
		VALUES (?, ?, 1)
		ON DUPLICATE KEY UPDATE count = count + 1;
		`

		_, err := db.Exec(query, upvote.ProfId, upvote.CategoryId)
		if err != nil {
			log.Printf("Failed to insert or update vote: %v", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Vote successful",
		})
	}
}

type ProfImageResponse struct {
	ImageURL string `json:"imageUrl"`
}

func GetProfImageHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		profIdStr := r.URL.Query().Get("profId")
		profId, err := strconv.Atoi(profIdStr)
		if err != nil {
			http.Error(w, "Invalid or missing profId", http.StatusBadRequest)
			return
		}

		var imageURL string
		query := `SELECT image_url FROM teachers_img WHERE id = ?`
		err = db.QueryRow(query, profId).Scan(&imageURL)
		if err == sql.ErrNoRows {
			http.Error(w, "Image not found", http.StatusNotFound)
			return
		} else if err != nil {
			http.Error(w, "Server error", http.StatusInternalServerError)
			return
		}

		resp := ProfImageResponse{ImageURL: imageURL}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(resp)
	}
}

type ProfInfo struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func GetProfInfoHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		profIdStr := r.URL.Query().Get("profId")
		profId, err := strconv.Atoi(profIdStr)
		if err != nil {
			http.Error(w, "Invalid or missing profId", http.StatusBadRequest)
			return
		}

		var info ProfInfo
		query := `SELECT id, name FROM teachers WHERE id = ?`
		err = db.QueryRow(query, profId).Scan(&info.ID, &info.Name)
		if err == sql.ErrNoRows {
			http.Error(w, "Professor not found", http.StatusNotFound)
			return
		} else if err != nil {
			http.Error(w, "Server error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(info)
	}
}

type DownvoteRequest struct {
	ProfId     int `json:"profId"`
	DownvoteId int `json:"selectedSubCategory"`
}

func DownvoteHandler(db *sql.DB) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		var downvote DownvoteRequest
		if err := json.NewDecoder(r.Body).Decode(&downvote); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		query := `
		INSERT INTO downvotes (id, downvote_id, count)
		VALUES(?, ?, 1)
		ON DUPLICATE KEY UPDATE count = count + 1;
		`
		_, err := db.Exec(query, downvote.ProfId, downvote.DownvoteId)
		if err != nil {
			log.Printf("Failed to insert or update vote: %v", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Vote successful",
		})
	}
}

type Data struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func GetCategoriesUpHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const q = `SELECT id, name FROM categories`

		rows, err := db.Query(q)
		if err != nil {
			http.Error(w, "db query failed", http.StatusInternalServerError)
			log.Printf("DB query failed")
			return
		}
		defer rows.Close()

		var categories []Data
		for rows.Next() {
			var category Data
			if err := rows.Scan(&category.ID, &category.Name); err != nil {
				http.Error(w, "row scan failed", http.StatusInternalServerError)
				log.Printf("Row scan failed")
				return
			}
			categories = append(categories, category)
		}
		if err := rows.Err(); err != nil {
			http.Error(w, "rows error", http.StatusInternalServerError)
			log.Printf("Rows Error")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		// If you handle CORS elsewhere (proxy or middleware), delete the next line.
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")

		if err := json.NewEncoder(w).Encode(categories); err != nil {
			http.Error(w, "json encode failed", http.StatusInternalServerError)
			return
		}
	}
}

func GetCategoriesDownHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const q = `SELECT id, name FROM categoriesdown`

		rows, err := db.Query(q)
		if err != nil {
			http.Error(w, "db query failed", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var categories []Data
		for rows.Next() {
			var category Data
			if err := rows.Scan(&category.ID, &category.Name); err != nil {
				http.Error(w, "row scan failed", http.StatusInternalServerError)
				return
			}
			categories = append(categories, category)
		}
		if err := rows.Err(); err != nil {
			http.Error(w, "rows error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		// If you handle CORS elsewhere (proxy or middleware), delete the next line.
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")

		if err := json.NewEncoder(w).Encode(categories); err != nil {
			http.Error(w, "json encode failed", http.StatusInternalServerError)
			return
		}
	}
}

func GetSubCategoriesHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Extract category_id from query params
		categoryIDStr := r.URL.Query().Get("category_id")
		if categoryIDStr == "" {
			log.Printf("no cat_id")
			http.Error(w, "category_id is required", http.StatusBadRequest)
			return
		}

		categoryID, err := strconv.Atoi(categoryIDStr)
		if err != nil {
			http.Error(w, "invalid category_id", http.StatusBadRequest)
			return
		}

		const q = `SELECT id, name FROM subcategoriesdown WHERE category_id = ?`

		rows, err := db.Query(q, categoryID)
		if err != nil {
			http.Error(w, "db query failed", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var subcategories []Data
		for rows.Next() {
			var subcategory Data
			if err := rows.Scan(&subcategory.ID, &subcategory.Name); err != nil {
				http.Error(w, "row scan failed", http.StatusInternalServerError)
				return
			}
			subcategories = append(subcategories, subcategory)
		}
		if err := rows.Err(); err != nil {
			http.Error(w, "rows error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")

		if err := json.NewEncoder(w).Encode(subcategories); err != nil {
			http.Error(w, "json encode failed", http.StatusInternalServerError)
			return
		}
	}
}

func GetProfessorsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const q = `
			SELECT teachers.id, teachers.name
			FROM teachers
		`

		rows, err := db.Query(q)
		if err != nil {
			http.Error(w, "db query failed", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var teachers []Data
		for rows.Next() {
			var t Data
			if err := rows.Scan(&t.ID, &t.Name); err != nil {
				http.Error(w, "row scan failed", http.StatusInternalServerError)
				return
			}
			teachers = append(teachers, t)
		}
		if err := rows.Err(); err != nil {
			http.Error(w, "rows error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")

		if err := json.NewEncoder(w).Encode(teachers); err != nil {
			http.Error(w, "json encode failed", http.StatusInternalServerError)
			return
		}
	}
}

func GetFacultiesHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const q = `SELECT id, name FROM faculties`

		rows, err := db.Query(q)
		if err != nil {
			http.Error(w, "db query failed", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var faculties []Data
		for rows.Next() {
			var faculty Data
			if err := rows.Scan(&faculty.ID, &faculty.Name); err != nil {
				http.Error(w, "row scan failed", http.StatusInternalServerError)
				return
			}
			faculties = append(faculties, faculty)
		}
		if err := rows.Err(); err != nil {
			http.Error(w, "rows error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		// If you handle CORS elsewhere (proxy or middleware), delete the next line.
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")

		if err := json.NewEncoder(w).Encode(faculties); err != nil {
			http.Error(w, "json encode failed", http.StatusInternalServerError)
			return
		}
	}
}

type Teacher struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Votes int    `json:"votes"`
}

func GetTop3Handler(db *sql.DB) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		const q = `
			SELECT teachers.id, teachers.name, SUM(votes.count) AS total_votes
			FROM teachers
			JOIN votes ON teachers.id = votes.id
			GROUP BY teachers.id, teachers.name
			ORDER BY total_votes DESC
			LIMIT 3;
		`

		rows, err := db.Query(q)
		if err != nil {
			http.Error(w, "db query failed", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var topTeachers []Teacher
		for rows.Next() {
			var t Teacher
			if err := rows.Scan(&t.ID, &t.Name, &t.Votes); err != nil {
				http.Error(w, "row scan failed", http.StatusInternalServerError)
				return
			}
			topTeachers = append(topTeachers, t)
		}

		if err := rows.Err(); err != nil {
			http.Error(w, "rows error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")

		if err := json.NewEncoder(w).Encode(topTeachers); err != nil {
			http.Error(w, "json encode failed", http.StatusInternalServerError)
			return
		}
	}
}

func GetTop3ByCategoryHandler(db *sql.DB) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		// Get category_id from URL query parameters
		categoryIDs, ok := r.URL.Query()["category_id"]
		if !ok || len(categoryIDs[0]) < 1 {
			http.Error(w, "category_id parameter is missing", http.StatusBadRequest)
			return
		}

		categoryID := categoryIDs[0]

		const q = `
			SELECT 
				t.id,
				t.name,
				SUM(v.count) AS total_votes
			FROM 
				votes v
			JOIN 
				teachers t ON v.id = t.id
			WHERE 
				v.category_id = ?
			GROUP BY 
				t.id, t.name
			ORDER BY 
				total_votes DESC
			LIMIT 3;
		`

		rows, err := db.Query(q, categoryID)
		if err != nil {
			http.Error(w, "DB query failed", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var results []Teacher
		for rows.Next() {
			var t Teacher
			if err := rows.Scan(&t.ID, &t.Name, &t.Votes); err != nil {
				http.Error(w, "Row scan failed", http.StatusInternalServerError)
				return
			}
			results = append(results, t)
		}
		if err := rows.Err(); err != nil {
			http.Error(w, "Rows error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")

		if err := json.NewEncoder(w).Encode(results); err != nil {
			http.Error(w, "JSON encode failed", http.StatusInternalServerError)
			return
		}
	}
}

func GetTop3ByFacultyHandler(db *sql.DB) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		facultyIDs, ok := r.URL.Query()["faculty_id"]
		if !ok || len(facultyIDs[0]) < 1 {
			http.Error(w, "faculty_id parameter is missing", http.StatusBadRequest)
			return
		}
		facultyID := facultyIDs[0]

		const q = `
      SELECT
        t.id,
        t.name,
        COALESCE(SUM(v.count), 0) AS total_votes
      FROM
        teachers t
      LEFT JOIN
        votes v ON t.id = v.id
      WHERE
        t.faculty_id = ?
      GROUP BY
        t.id, t.name
      ORDER BY
        total_votes DESC
      LIMIT 3;
    `

		rows, err := db.Query(q, facultyID)
		if err != nil {
			http.Error(w, "DB query failed", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var results []Teacher
		for rows.Next() {
			var t Teacher
			if err := rows.Scan(&t.ID, &t.Name, &t.Votes); err != nil {
				http.Error(w, "Row scan failed", http.StatusInternalServerError)
				return
			}
			results = append(results, t)
		}
		if err := rows.Err(); err != nil {
			http.Error(w, "Rows error", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")

		if err := json.NewEncoder(w).Encode(results); err != nil {
			http.Error(w, "JSON encode failed", http.StatusInternalServerError)
			return
		}
	}
}

func GetBestCategories(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		teacherID, ok := r.URL.Query()["id"]
		if !ok || len(teacherID[0]) < 1 {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "teacher_id parameter is missing",
			})
			return
		}

		teacherIDInt, err := strconv.Atoi(teacherID[0])
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusBadRequest)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "invalid teacher_id",
			})
			return
		}

		const query = `
		SELECT c.name 
		FROM votes v 
		JOIN categoriesUp c ON v.category_id = c.id 
		WHERE v.id = ? 
		GROUP BY c.name 
		ORDER BY SUM(v.count) DESC 
		LIMIT 3;
	`

		rows, err := db.Query(query, teacherIDInt)
		if err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "DB query failed",
			})
			return
		}
		defer rows.Close()

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")

		var results []string

		for rows.Next() {
			var result string
			if err := rows.Scan(&result); err != nil {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{
					"error": "Row scan failed",
				})
				return
			}
			results = append(results, result)
		}

		if err := json.NewEncoder(w).Encode(map[string][]string{
			"items": results,
		}); err != nil {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusInternalServerError)
			json.NewEncoder(w).Encode(map[string]string{
				"error": "JSON encode failed",
			})
		}
	}

}

type WorstData struct {
	Name     string `json:"content"`
	Category string `json:"category"`
	Votes    int    `json:"votes"`
}

func GetWorstCategories(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		teacherID, ok := r.URL.Query()["id"]
		if !ok || len(teacherID) < 1 {
			http.Error(w, "teacher_id parameter is missing", http.StatusBadRequest)
			return
		}

		id, err := strconv.Atoi(teacherID[0])
		if err != nil {
			http.Error(w, "Invalid teacher_id", http.StatusBadRequest)
			return
		}

		const query = `
        SELECT
			cd.name AS category_name,
			COUNT(d.id) AS total_votes,
			(
				SELECT sd2.name
				FROM subcategoriesdown sd2
				JOIN downvotes d2 ON sd2.id = d2.downvote_id
				WHERE sd2.category_id = cd.id
				AND d2.id = ?
				GROUP BY sd2.id, sd2.name
				ORDER BY COUNT(*) DESC
				LIMIT 1
			) AS top_subcategory
			FROM categoriesdown cd
			JOIN subcategoriesdown sd ON cd.id = sd.category_id
			JOIN downvotes d ON sd.id = d.downvote_id
			WHERE d.id = ?
			GROUP BY cd.id, cd.name;`

		rows, err := db.Query(query, id, id)
		if err != nil {
			http.Error(w, "DB query failed", http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")

		var results []WorstData
		for rows.Next() {
			var result WorstData
			if err := rows.Scan(&result.Category, &result.Votes, &result.Name); err != nil {
				http.Error(w, "Row scan failed", http.StatusInternalServerError)
				return
			}
			results = append(results, result)
		}

		if err := json.NewEncoder(w).Encode(results); err != nil {
			http.Error(w, "JSON encode failed", http.StatusInternalServerError)
			return
		}
	}
}

func GetNameHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		teacherID, ok := r.URL.Query()["id"]
		if !ok || len(teacherID) < 1 {
			http.Error(w, "teacher_id parameter is missing", http.StatusBadRequest)
			return
		}

		id, err := strconv.Atoi(teacherID[0])
		if err != nil {
			http.Error(w, "Invalid teacher_id", http.StatusBadRequest)
			return
		}

		const query = `SELECT name FROM teachers WHERE id = ?`

		var name string
		err = db.QueryRow(query, id).Scan(&name)

		if err == sql.ErrNoRows {
			http.Error(w, "DB query failed", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		if err := json.NewEncoder(w).Encode(map[string]string{
			"name": name,
		}); err != nil {
			http.Error(w, "JSON encode failed", http.StatusInternalServerError)
			return
		}
	}
}

func GetAvatarUrl(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		teacherID, ok := r.URL.Query()["id"]
		if !ok || len(teacherID) < 1 {
			http.Error(w, "teacher_id parameter is missing", http.StatusBadRequest)
			log.Printf("teacher_id missing")
			return
		}

		id, err := strconv.Atoi(teacherID[0])
		if err != nil {
			http.Error(w, "Invalid teacher_id", http.StatusBadRequest)
			log.Printf("teacher_id invalid")
			return
		}

		const query = `SELECT avatar_url FROM teachers WHERE id = ?`

		var url string
		err = db.QueryRow(query, id).Scan(&url)

		if err == sql.ErrNoRows {
			http.Error(w, "DB query failed", http.StatusInternalServerError)
			log.Printf("DB query failed")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		if err := json.NewEncoder(w).Encode(map[string]string{
			"url": url,
		}); err != nil {
			http.Error(w, "JSON encode failed", http.StatusInternalServerError)
			return
		}

	}
}
