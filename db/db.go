package db

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB() {
	var err error
	DB, err = sql.Open("sqlite3", "links.db")
	if err != nil {
		log.Fatal("Error opening database:", err)
	}

	_, err = DB.Exec(`CREATE TABLE IF NOT EXISTS links (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		url TEXT UNIQUE
	);`)
	if err != nil {
		log.Fatal("Error creating table:", err)
	}
}
