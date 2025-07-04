package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"

	"golang.org/x/crypto/bcrypt"
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

		// Uniqueness check
		var existing int
		if err := db.QueryRow(`SELECT COUNT(*) FROM users WHERE username = $1`, req.Username).
			Scan(&existing); err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			log.Print(err)
			return
		}
		if existing > 0 {
			http.Error(w, "User already exists", http.StatusConflict)
			return
		}

		// ▶ hash the password
		hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Password hashing failed", http.StatusInternalServerError)
			return
		}

		// Store hash (NOT the raw password)
		_, err = db.Exec(
			`INSERT INTO users (username, password, mode) VALUES ($1, $2, $3)`,
			req.Username, string(hash), req.Mode,
		)
		if err != nil {
			http.Error(w, "Failed to register user", http.StatusInternalServerError)
			log.Print(err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Registration successful"})
	}
}

func LoginHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var creds LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		var (
			userID        int
			storedPassRaw string
		)
		err := db.QueryRow(
			`SELECT id, password FROM users WHERE username = $1 AND mode = $2`,
			creds.Username, creds.Mode).
			Scan(&userID, &storedPassRaw)

		if err == sql.ErrNoRows {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		if err != nil {
			http.Error(w, "Server error", http.StatusInternalServerError)
			return
		}

		// Decide if the stored value is already bcrypt (starts with "$2")
		// If bcrypt compare fails we fall back to legacy plain‑text check.
		valid := false
		if len(storedPassRaw) >= 60 && storedPassRaw[0:2] == "$2" {
			// bcrypt hash path
			if bcrypt.CompareHashAndPassword([]byte(storedPassRaw), []byte(creds.Password)) == nil {
				valid = true
			}
		} else if storedPassRaw == creds.Password {
			// legacy plain‑text match — immediately upgrade to bcrypt
			if hash, err := bcrypt.GenerateFromPassword([]byte(creds.Password), bcrypt.DefaultCost); err == nil {
				_, _ = db.Exec(`UPDATE users SET password = $1 WHERE id = $2`, string(hash), userID)
			}
			valid = true
		}

		if !valid {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// ── create a session as before ──
		sessionToken := uuid.NewString()
		expiry := time.Now().Add(24 * time.Hour)
		if _, err = db.Exec(
			`INSERT INTO sessions (session_id, user_id, mode, expires_at) VALUES ($1,$2,$3,$4)`,
			sessionToken, userID, creds.Mode, expiry); err != nil {
			http.Error(w, "Could not create session", http.StatusInternalServerError)
			return
		}

		http.SetCookie(w, &http.Cookie{
			Name:     "session_id",
			Value:    sessionToken,
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
			Expires:  expiry,
			// Secure: true,  // enable in production (HTTPS)
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
			UserID   int    `json:"userId"`
			Mode     string `json:"mode"`
			Username string `json:"username"`
		}

		if err != nil {
			log.Printf("No session currently")
			json.NewEncoder(w).Encode(AuthResponse{
				UserID:   -1,
				Mode:     "None",
				Username: "",
			})
			return
		}

		var userId int
		var mode string
		var expiry time.Time
		var username string

		err = db.QueryRow(
			"SELECT s.user_id, s.mode, s.expires_at, u.username FROM sessions s JOIN users u ON s.user_id = u.id WHERE session_id = $1",
			cookie.Value,
		).Scan(&userId, &mode, &expiry, &username)

		if err == sql.ErrNoRows || time.Now().After(expiry) {
			if err == sql.ErrNoRows {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusInternalServerError)
				json.NewEncoder(w).Encode(map[string]string{
					"error": "session doesnt exist",
				})
				return
			} else if time.Now().After(expiry) {

				_, err = db.Exec("DELETE FROM sessions WHERE expires_at = $1", expiry)
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
				UserID:   -2,
				Mode:     "None",
				Username: "",
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
			UserID:   userId,
			Mode:     mode,
			Username: username,
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
		_, err = db.Exec("DELETE FROM sessions WHERE session_id = $1", cookie.Value)
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
	StudentId  int `json:"studentId"`
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
		VALUES ($1, $2, 1)
		ON CONFLICT (id, category_id) DO UPDATE
		SET count = votes.count + 1;
		`

		_, err := db.Exec(query, upvote.ProfId, upvote.CategoryId)
		if err != nil {
			log.Printf("Failed to insert or update vote: %v", err)
			return
		}

		query2 := `
		INSERT INTO weeklyTracker (student_id, teacher_id, isUpvote)
		VALUES ($1, $2, true)`

		_, err2 := db.Exec(query2, upvote.StudentId, upvote.ProfId)
		if err2 != nil {
			log.Printf("Failed to insert or update tracker: %v", err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Vote successful",
		})
	}
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
		query := `SELECT teachers.id, teachers.name, faculties.name FROM teachers JOIN faculties ON faculties.id = teachers.faculty_id  WHERE teachers.id = $1`
		err = db.QueryRow(query, profId).Scan(&info.ProfId, &info.ProfName, &info.Faculty)
		if err == sql.ErrNoRows {
			http.Error(w, "Professor not found", http.StatusNotFound)
			log.Printf("Prof not found")
			return
		} else if err != nil {
			http.Error(w, "Server error", http.StatusInternalServerError)
			log.Printf(err.Error())
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(info)
	}
}

type DownvoteRequest struct {
	ProfId     int `json:"profId"`
	StudentId  int `json:"studentId"`
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
		VALUES ($1, $2, 1)
		ON CONFLICT (id, downvote_id) DO UPDATE
		SET count = downvotes.count + 1;
		`
		_, err := db.Exec(query, downvote.ProfId, downvote.DownvoteId)
		if err != nil {
			log.Printf("Failed to insert or update vote: %v", err)
			return
		}

		query2 := `
		INSERT INTO weeklyTracker (student_id, teacher_id, isUpvote)
		VALUES ($1, $2, false)`

		_, err2 := db.Exec(query2, downvote.StudentId, downvote.ProfId)
		if err2 != nil {
			log.Printf("Failed to insert or update tracker: %v", err)
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
		const q = `SELECT id, name FROM categoriesUp`

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

		const q = `SELECT id, name FROM subcategoriesdown WHERE category_id = $1`

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

type ProfInfo struct {
	ProfId   int    `json:"id"`
	ProfName string `json:"name"`
	Faculty  string `json:"faculty"`
}

func GetProfessorsHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const q = `
			SELECT teachers.id, teachers.name, faculties.name
			FROM teachers JOIN faculties ON teachers.faculty_id = faculties.id
		`

		rows, err := db.Query(q)
		if err != nil {
			http.Error(w, "db query failed", http.StatusInternalServerError)
			log.Printf(err.Error())
			return
		}
		defer rows.Close()

		var teachers []ProfInfo
		for rows.Next() {
			var t ProfInfo
			if err := rows.Scan(&t.ProfId, &t.ProfName, &t.Faculty); err != nil {
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
				v.category_id = $1
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
        t.faculty_id = $1
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
		WHERE v.id = $1
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
				AND d2.id = $1
				GROUP BY sd2.id, sd2.name
				ORDER BY COUNT(*) DESC
				LIMIT 1
			) AS top_subcategory
			FROM categoriesdown cd
			JOIN subcategoriesdown sd ON cd.id = sd.category_id
			JOIN downvotes d ON sd.id = d.downvote_id
			WHERE d.id = $2
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

		const query = `SELECT name FROM teachers WHERE id = $1`

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

		const query = `SELECT avatar_url FROM teachers WHERE id = $1`

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

type AlreadyVoted struct {
	HasUpvoted   bool `json:"upvote"`
	HasDownvoted bool `json:"downvote"`
}

func CheckVotes(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		student_id, ok := r.URL.Query()["studentId"]
		if !ok || len(student_id) < 1 {
			http.Error(w, "student_id parameter is missing", http.StatusBadRequest)
			log.Printf("student_id missing")
			return
		}

		studentID, err := strconv.Atoi(student_id[0])
		if err != nil {
			http.Error(w, "Invalid student_id", http.StatusBadRequest)
			log.Printf("student_id invalid")
			return
		}

		teacher_id, ok := r.URL.Query()["teacherId"]
		if !ok || len(teacher_id) < 1 {
			http.Error(w, "teacher_id parameter is missing", http.StatusBadRequest)
			log.Printf("teacher_id missing")
			return
		}
		teacherID, err := strconv.Atoi(teacher_id[0])
		if err != nil {
			http.Error(w, "Invalid teacher_id", http.StatusBadRequest)
			log.Printf("teacher_id invalid")
			return
		}

		var hasVoted AlreadyVoted
		err2 := db.QueryRow(`
			SELECT EXISTS (
				SELECT 1 FROM weeklyTracker WHERE student_id = $1 AND teacher_id = $2 AND isUpvote = true
			)
		`, studentID, teacherID).Scan(&hasVoted.HasUpvoted)
		if err2 != nil {
			http.Error(w, "Failed to check upvote", http.StatusBadRequest)
			log.Printf(err2.Error())
			return
		}

		err3 := db.QueryRow(`
			SELECT EXISTS (
				SELECT 1 FROM weeklyTracker WHERE student_id = $1 AND teacher_id = $2 AND isUpvote = false
			)
		`, studentID, teacherID).Scan(&hasVoted.HasDownvoted)
		if err3 != nil {
			http.Error(w, "failed to check downvote", http.StatusBadRequest)
			log.Printf(err3.Error())
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		if err4 := json.NewEncoder(w).Encode(hasVoted); err4 != nil {
			http.Error(w, "JSON encode failed", http.StatusInternalServerError)
			return
		}
	}

}
