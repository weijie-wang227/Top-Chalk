package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	cohere "github.com/cohere-ai/cohere-go/v2"
	client "github.com/cohere-ai/cohere-go/v2/client"
)

type Category struct {
	Title     string `json:"title"`
	Complaint string `json:"complaint"`
}

func CheckCategory(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var category Category

		if err := json.NewDecoder(r.Body).Decode(&category); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			log.Print(err)
			return
		}

		var exists int
		q1 := `SELECT 1 FROM categoriesdown WHERE name = $1`
		err := db.QueryRow(q1, category.Title).Scan(&exists)

		if err != sql.ErrNoRows && err != nil {
			http.Error(w, "Database error", http.StatusInternalServerError)
			log.Print(err)
			return
		}

		if err == sql.ErrNoRows {
			req := fmt.Sprintf("Category: %s\nComplaint: %s", category.Title, category.Complaint)
			co := client.NewClient(client.WithToken(os.Getenv("CO_API_KEY")))
			model := "6e762b0e-690f-4204-8a45-8e8ad98b165a-ft"

			resp, err := co.Classify(
				context.TODO(),
				&cohere.ClassifyRequest{
					Model:  &model,
					Inputs: []string{req},
				},
			)
			if err != nil {
				http.Error(w, "Cohere classification failed", http.StatusInternalServerError)
				log.Print(err)
				return
			}

			if len(resp.Classifications) == 0 {
				http.Error(w, "No classification result", http.StatusInternalServerError)
				return
			}

			label := resp.Classifications[0].Prediction
			log.Printf("Cohere predicted label: %s", *label)

			if *label == "YES" {
				var categoryID int
				insertCategory := `INSERT INTO categoriesdown (name) VALUES ($1) RETURNING id`
				err = db.QueryRow(insertCategory, category.Title).Scan(&categoryID)
				if err != nil {
					http.Error(w, "Failed to insert category", http.StatusInternalServerError)
					log.Print(err)
					return
				}

				insertSub := `INSERT INTO subcategoriesdown (title, category_id) VALUES ($1, $2)`
				_, err = db.Exec(insertSub, category.Complaint, categoryID)
				if err != nil {
					http.Error(w, "Failed to insert subcategory", http.StatusInternalServerError)
					log.Print(err)
					return
				}

				w.WriteHeader(http.StatusCreated)
				if err := json.NewEncoder(w).Encode(map[string]string{
					"message": "Category approved and added.",
					"status": "success",
				}); err != nil {
					http.Error(w, "Encoding response failed", http.StatusInternalServerError)
					log.Print(err)
					return
				}
			} else {
				w.Header().Set("Content-Type", "application/json")
				if err := json.NewEncoder(w).Encode(map[string]string{
					"error": "Category rejected by moderation.",
					"status": "failure",
				}); err != nil {
					http.Error(w, "Encoding response failed", http.StatusInternalServerError)
					log.Print(err)
					return
				}
			}
		} else {
			w.Header().Set("Content-Type", "application/json")
			if err := json.NewEncoder(w).Encode(map[string]string{
				"error": "Category already exists.",
				"status": "exists",
			}); err != nil {
				http.Error(w, "Encoding response failed", http.StatusInternalServerError)
				log.Print(err)
				return
			}
		}
	}
}