package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Mode     string `json:"mode"`
}

func LoginHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var creds LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		var storedPassword string
		err := db.QueryRow("SELECT password FROM users WHERE username = ? AND mode = ? ", creds.Username, creds.Mode).Scan(&storedPassword)

		if err == sql.ErrNoRows || storedPassword != creds.Password {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
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

type Data struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func GetCategoriesHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		const q = `SELECT id, name FROM categories`

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
		const q = `SELECT name FROM faculties`

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
