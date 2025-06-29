package tasks

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/robfig/cron/v3"
)

func weeklyReset(db *sql.DB) {
	fmt.Println("Weekly reset executed at:", time.Now())

	_, err := db.Exec("DELETE FROM weeklyTracker;")
	if err != nil {
		fmt.Println("failed to reset weeklyTracker")
	}

}

func WeeklyLoop(db *sql.DB) {
	c := cron.New()

	_, err := c.AddFunc("0 19 * * 0", func() {
		weeklyReset(db)
	})
	if err != nil {
		panic(err)
	}

	c.Start()

	fmt.Println("Weekly reset scheduler started. Press Ctrl+C to stop.")

	// Keep the program running
	select {}
}
