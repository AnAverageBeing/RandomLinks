package routes

import (
	"net/http"
	"random/db"
	"random/model"

	"github.com/gin-gonic/gin"
)

func FetchLinks(c *gin.Context) {
	rows, err := db.DB.Query("SELECT id, url FROM links ORDER BY RANDOM() LIMIT 10;")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching links"})
		return
	}
	defer rows.Close()

	links := []model.Link{}
	for rows.Next() {
		var link model.Link
		err := rows.Scan(&link.ID, &link.URL)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error scanning rows"})
			return
		}
		links = append(links, link)
	}

	c.JSON(http.StatusOK, gin.H{"error": "", "links": links})
}
