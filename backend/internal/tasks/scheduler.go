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

type Spot struct {
	streak int
	id     int
}

type Rank struct {
	id    int
	votes int
}

var LEADERBOARDQUERYS = map[string]string{
	"grand": `
			SELECT id, SUM(count) AS total_votes
			FROM votes
			GROUP BY id
			ORDER BY total_votes DESC
			LIMIT 3;
	`,
	"categoriesup": `
			SELECT id, SUM(count) AS total_votes
			FROM votes
			WHERE category_id = $1
			GROUP BY id
			ORDER BY total_votes DESC
			LIMIT 3;
		`,
	"faculties": `
			SELECT t.id, COALESCE(SUM(v.count), 0) AS total_votes
			FROM teachers t
			LEFT JOIN votes v ON t.id = v.id
			WHERE t.faculty_id = $1
			GROUP BY t.id
			ORDER BY total_votes DESC
			LIMIT 3;
		`}

func weeklyTracker(db *sql.DB) {
	fmt.Println("Tracker update started")
	for table, customQuery := range LEADERBOARDQUERYS {
		var Ids []int
		if table == "grand" {
			Ids = []int{0}
		} else {
			q := fmt.Sprintf(`SELECT id FROM %s`, table)
			idRows, err := db.Query(q)
			if err != nil {
				fmt.Printf("id query failed")
				fmt.Println(err)
			}
			defer idRows.Close()

			for idRows.Next() {
				var id int
				if err := idRows.Scan(&id); err != nil {
					fmt.Printf("failed to scan row: %v\n", err)
					continue
				}
				Ids = append(Ids, id)
			}
			if err := idRows.Err(); err != nil {
				fmt.Printf("rows error: %v\n", err)
			}
		}

		// Get previous leaderboard
		const q1 = `
			SELECT teacher_id, streak, rank
			FROM leaderboardtracker
			WHERE type = $1
		`
		prevLeaderboard, err := db.Query(q1, table)
		if err != nil {
			fmt.Println(err)
		}
		defer prevLeaderboard.Close()

		var prevLead []Spot
		for prevLeaderboard.Next() {
			var spot Spot
			if err := prevLeaderboard.Scan(&spot); err != nil {
				fmt.Println(err)
				return
			}
			prevLead = append(prevLead, spot)
		}

		for _, id := range Ids {

			var rows *sql.Rows
			var err error
			if table == "grand" {
				rows, err = db.Query(customQuery)
			} else {
				rows, err = db.Query(customQuery, id)
			}

			if err != nil {
				fmt.Println(err)
				return
			}
			defer rows.Close()

			var rank = 1

			for rows.Next() {
				var row Rank
				var streak int = 1
				if err := rows.Scan(&row.id, &row.votes); err != nil {
					fmt.Printf("Row Scan Failed")
					fmt.Println(err)
					return
				}

				for _, spot := range prevLead {
					if spot.id == row.id {
						streak = spot.streak + 1
					}
				}

				q2 := `
					UPDATE leaderboardtracker
					SET teacher_id = $1, streak = $2
					WHERE type = $3 AND rank = $4 AND leaderboard_id = $5
				`
				//q2 := `
				//	INSERT INTO leaderboardtracker (teacher_id, streak, type, rank, leaderboard_id) VALUES ($1, $2, $3, $4, $5);
				//`

				_, err := db.Exec(q2, row.id, streak, table, rank, id)
				if err != nil {
					fmt.Printf("Row update failed")
					fmt.Println(err)
				}

				rank++
			}
			defer rows.Close()
		}

	}
	fmt.Println("teacker update finished successfully")
}

func WeeklyLoop(db *sql.DB) {
	c := cron.New()

	_, err := c.AddFunc("0 19 * * 0", func() {
		weeklyReset(db)

	})

	if err != nil {
		panic(err)
	}

	_, err2 := c.AddFunc("14 00 * * 1", func() {
		weeklyTracker(db)
	})
	if err2 != nil {
		panic(err2)
	}

	c.Start()

	fmt.Println("Weekly reset scheduler started. Press Ctrl+C to stop.")

	// Keep the program running
	select {}
}
