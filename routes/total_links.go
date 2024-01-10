package routes

import (
	"net/http"
	"random/db"

	"github.com/gin-gonic/gin"
)

func TotalLinks(c *gin.Context) {
	var count int
	err := db.DB.QueryRow("SELECT COUNT(*) FROM links").Scan(&count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error fetching total links"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"error": "", "totalLinks": count})
}
