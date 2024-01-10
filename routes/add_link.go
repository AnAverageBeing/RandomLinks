package routes

import (
	"net/http"
	"random/db"
	"random/utils"

	"github.com/gin-gonic/gin"
	"github.com/mattn/go-sqlite3"
)

func AddLink(c *gin.Context) {
	var json struct {
		URL string `json:"url"`
	}

	if err := c.BindJSON(&json); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	if !utils.IsURLValid(json.URL) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL"})
		return
	}

	_, err := db.DB.Exec("INSERT INTO links (url) VALUES (?)", json.URL)
	if err != nil {
		sqliteError, isSQLError := err.(sqlite3.Error)
		if isSQLError && sqliteError.Code == sqlite3.ErrConstraint {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Duplicate link"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error inserting link"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"error": ""})
}
