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

func UploadAvatarHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		err := r.ParseMultipartForm(10 << 20)
		if err != nil {
			http.Error(w, "Could not parse form", http.StatusBadRequest)
			return
		}

		teacherId := r.FormValue("teacherId")
		file, handler, err := r.FormFile("image")
		if err != nil {
			http.Error(w, "Missing image", http.StatusBadRequest)
			return
		}
		defer file.Close()

		// Prepare unique key
		ext := filepath.Ext(handler.Filename)
		key := fmt.Sprintf("avatars/%s-%s%s", teacherId, uuid.New().String(), ext)

		client := config.NewR2Client()
		S3API := os.Getenv("R2_ACCOUNT_HASH")
		url := fmt.Sprintf("https://pub-%s.r2.dev/", S3API)

		// Delete previous avatar
		var oldUrl string
		_ = db.QueryRow("SELECT avatar_url FROM teachers WHERE id = $1", teacherId).Scan(&oldUrl)
		if oldUrl != "" {
			oldKey := strings.TrimPrefix(oldUrl, url)
			if oldKey != "" && oldKey != key {
				_, _ = client.DeleteObject(context.TODO(), &s3.DeleteObjectInput{
					Bucket: aws.String("topchalk"),
					Key:    aws.String(oldKey),
				})
			}
		}

		// Upload new avatar
		buf := new(bytes.Buffer)
		io.Copy(buf, file)

		_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
			Bucket:      aws.String("topchalk"),
			Key:         aws.String(key),
			Body:        bytes.NewReader(buf.Bytes()),
			ContentType: aws.String(http.DetectContentType(buf.Bytes())),
		})
		if err != nil {
			http.Error(w, "Failed to upload", http.StatusInternalServerError)
			log.Println("Upload error:", err)
			return
		}

		urlKey := url + key

		_, err = db.Exec("UPDATE teachers SET avatar_url = $1 WHERE id = $2", urlKey, teacherId)
		if err != nil {
			http.Error(w, "Failed to save avatar URL", http.StatusInternalServerError)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"url": url})
	}
}

func UploadKudosHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		err := r.ParseMultipartForm(10 << 20)
		if err != nil {
			http.Error(w, "Could not parse form", http.StatusBadRequest)
			return
		}
		teacherId := r.FormValue("professorId")
		studentId := r.FormValue("studentId")
		file, handler, err := r.FormFile("image")
		if err != nil {
			http.Error(w, "Missing image", http.StatusBadRequest)
			return
		}
		defer file.Close()

		// Prepare unique key
		ext := filepath.Ext(handler.Filename)
		key := fmt.Sprintf("kudos/%s/%s%s", teacherId, uuid.New().String(), ext)
		accountHash := os.Getenv("R2_ACCOUNT_HASH")
		url := fmt.Sprintf("https://pub-%s.r2.dev/", accountHash)

		client := config.NewR2Client()

		// Upload new avatar
		buf := new(bytes.Buffer)
		io.Copy(buf, file)

		_, err = client.PutObject(context.TODO(), &s3.PutObjectInput{
			Bucket:      aws.String("topchalk"),
			Key:         aws.String(key),
			Body:        bytes.NewReader(buf.Bytes()),
			ContentType: aws.String(http.DetectContentType(buf.Bytes())),
		})
		if err != nil {
			http.Error(w, "Failed to upload", http.StatusInternalServerError)
			log.Println("Upload error:", err)
			return
		}

		urlKey := url + key

		_, err = db.Exec("INSERT INTO kudos (teacher_id, student_id, url, x, y, z) VALUES ($1, $2, $3, 0,0,0)", teacherId, studentId, urlKey)
		if err != nil {
			http.Error(w, "Failed to save kudos URL", http.StatusInternalServerError)
			log.Println("DB Error:", err)
			return
		}

		json.NewEncoder(w).Encode(map[string]string{"url": url})
	}
}
