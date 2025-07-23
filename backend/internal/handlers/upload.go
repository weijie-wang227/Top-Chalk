package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"backend/internal/config"
	"database/sql"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

// Utility function to send JSON response with error logging
func sendError(w http.ResponseWriter, status int, msg string, err error) {
	log.Printf("[ERROR] %s: %v", msg, err)
	http.Error(w, fmt.Sprintf("%s: %v", msg, err), status)
}

func UploadAvatarHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("[INFO] UploadAvatarHandler called")

		err := r.ParseMultipartForm(10 << 20) // 10 MB limit
		if err != nil {
			sendError(w, http.StatusBadRequest, "Could not parse form", err)
			return
		}

		teacherId := r.FormValue("teacherId")
		if teacherId == "" {
			sendError(w, http.StatusBadRequest, "Missing teacherId", fmt.Errorf("teacherId not provided"))
			return
		}
		log.Printf("[DEBUG] teacherId=%s", teacherId)

		file, handler, err := r.FormFile("image")
		if err != nil {
			sendError(w, http.StatusBadRequest, "Missing image", err)
			return
		}
		defer file.Close()

		log.Printf("[DEBUG] Uploading file: %s", handler.Filename)

		// Prepare unique key
		ext := filepath.Ext(handler.Filename)
		key := fmt.Sprintf("avatars/%s-%s%s", teacherId, uuid.New().String(), ext)

		S3API := os.Getenv("R2_ACCOUNT_HASH")
		if S3API == "" {
			sendError(w, http.StatusInternalServerError, "Environment variable R2_ACCOUNT_HASH not set", fmt.Errorf("R2_ACCOUNT_HASH missing"))
			return
		}
		url := fmt.Sprintf("https://pub-%s.r2.dev/", S3API)
		log.Printf("[DEBUG] R2 URL: %s", url)

		client := config.NewR2Client()

		// Delete previous avatar if exists
		var oldUrl sql.NullString
		err = db.QueryRow("SELECT avatar_url FROM teachers WHERE id = $1", teacherId).Scan(&oldUrl)
		if err != nil && err != sql.ErrNoRows {
			sendError(w, http.StatusInternalServerError, "Failed to query existing avatar", err)
			return
		}

		// Delete old avatar if exists
		if oldUrl.Valid && oldUrl.String != "" {
			oldKey := strings.TrimPrefix(oldUrl.String, url)
			if oldKey != "" && oldKey != key {
				_, delErr := client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
					Bucket: aws.String("topchalk"),
					Key:    aws.String(oldKey),
				})
				if delErr != nil {
					log.Printf("[WARN] Failed to delete old avatar: %v", delErr)
				} else {
					log.Printf("[INFO] Old avatar deleted: %s", oldKey)
				}
			}
		}

		// Upload new avatar
		buf := new(bytes.Buffer)
		if _, err := io.Copy(buf, file); err != nil {
			sendError(w, http.StatusInternalServerError, "Failed to read file", err)
			return
		}

		_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
			Bucket:      aws.String("topchalk"),
			Key:         aws.String(key),
			Body:        bytes.NewReader(buf.Bytes()),
			ContentType: aws.String(http.DetectContentType(buf.Bytes())),
		})
		if err != nil {
			sendError(w, http.StatusInternalServerError, "Failed to upload to R2", err)
			return
		}

		urlKey := url + key
		log.Printf("[INFO] Uploaded avatar: %s", urlKey)

		_, err = db.Exec("UPDATE teachers SET avatar_url = $1 WHERE id = $2", urlKey, teacherId)
		if err != nil {
			sendError(w, http.StatusInternalServerError, "Failed to save avatar URL to DB", err)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"url": urlKey})
	}
}

func UploadKudosHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Println("[INFO] UploadKudosHandler called")

		err := r.ParseMultipartForm(10 << 20)
		if err != nil {
			sendError(w, http.StatusBadRequest, "Could not parse form", err)
			return
		}

		teacherId := r.FormValue("professorId")
		studentId := r.FormValue("studentId")
		if teacherId == "" || studentId == "" {
			sendError(w, http.StatusBadRequest, "Missing professorId or studentId", fmt.Errorf("professorId=%s, studentId=%s", teacherId, studentId))
			return
		}
		log.Printf("[DEBUG] professorId=%s, studentId=%s", teacherId, studentId)

		file, handler, err := r.FormFile("image")
		if err != nil {
			sendError(w, http.StatusBadRequest, "Missing image", err)
			return
		}
		defer file.Close()

		log.Printf("[DEBUG] Uploading kudos file: %s", handler.Filename)

		// Prepare unique key
		ext := filepath.Ext(handler.Filename)
		key := fmt.Sprintf("kudos/%s/%s%s", teacherId, uuid.New().String(), ext)
		accountHash := os.Getenv("R2_ACCOUNT_HASH")
		if accountHash == "" {
			sendError(w, http.StatusInternalServerError, "Environment variable R2_ACCOUNT_HASH not set", fmt.Errorf("R2_ACCOUNT_HASH missing"))
			return
		}
		url := fmt.Sprintf("https://pub-%s.r2.dev/", accountHash)

		client := config.NewR2Client()

		// Upload file
		buf := new(bytes.Buffer)
		if _, err := io.Copy(buf, file); err != nil {
			sendError(w, http.StatusInternalServerError, "Failed to read file", err)
			return
		}

		_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
			Bucket:      aws.String("topchalk"),
			Key:         aws.String(key),
			Body:        bytes.NewReader(buf.Bytes()),
			ContentType: aws.String(http.DetectContentType(buf.Bytes())),
		})
		if err != nil {
			sendError(w, http.StatusInternalServerError, "Failed to upload to R2", err)
			return
		}

		urlKey := url + key
		log.Printf("[INFO] Uploaded kudos: %s", urlKey)

		_, err = db.Exec("INSERT INTO kudos (teacher_id, student_id, url, x, y, z) VALUES ($1, $2, $3, 0, 0, 0)", teacherId, studentId, urlKey)
		if err != nil {
			sendError(w, http.StatusInternalServerError, "Failed to save kudos URL to DB", err)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"url": urlKey})
	}
}
