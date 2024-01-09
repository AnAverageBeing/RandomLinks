package main

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	_ "github.com/mattn/go-sqlite3"
)

var db *sql.DB

type Link struct {
	ID  int    `json:"id"`
	URL string `json:"url"`
}

func initDB() {
	var err error
	db, err = sql.Open("sqlite3", "links.db")
	if err != nil {
		log.Fatal("Error opening database:", err)
	}

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS links (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		url TEXT UNIQUE
	);`)
	if err != nil {
		log.Fatal("Error creating table:", err)
	}
}

func fetchLinks(c *gin.Context) {
	rows, err := db.Query("SELECT id, url FROM links ORDER BY RANDOM() LIMIT 10;")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching links"})
		return
	}
	defer rows.Close()

	links := []Link{}
	for rows.Next() {
		var link Link
		err := rows.Scan(&link.ID, &link.URL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning rows"})
			return
		}
		links = append(links, link)
	}

	c.JSON(http.StatusOK, gin.H{"error": "", "links": links})
}

func addLink(c *gin.Context) {
	var json struct {
		URL string `json:"url"`
	}

	if err := c.BindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	// Check for dead links
	if !isURLValid(json.URL) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL"})
		return
	}

	// Check for duplicates
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM links WHERE url = ?", json.URL).Scan(&count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking duplicate links"})
		return
	}
	if count > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Duplicate link"})
		return
	}

	_, err = db.Exec("INSERT INTO links (url) VALUES (?)", json.URL)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error inserting link"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"error": ""})
}

func isURLValid(url string) bool {
	resp, err := http.Head(url)
	if err != nil || resp.StatusCode != http.StatusOK {
		return false
	}
	return true
}

func main() {
	initDB()

	defer db.Close()

	router := gin.Default()

	router.Use(static.Serve("/", static.LocalFile("./web/", true)))

	api := router.Group("/api")
	{
		api.GET("fetch", fetchLinks)
		api.POST("add", addLink)
	}

	router.Run(":8080")
}
