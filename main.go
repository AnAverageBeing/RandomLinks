package main

import (
	"os"
	"random/db"
	"random/routes"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

func main() {
	db.InitDB()

	defer db.DB.Close()

	router := gin.Default()

	router.Use(static.Serve("/", static.LocalFile("./frontend/", true)))

	api := router.Group("/api")
	{
		api.GET("fetch", routes.FetchLinks)
		api.POST("add", routes.AddLink)
		api.GET("total", routes.TotalLinks)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	router.Run("0.0.0.0:" + port)
}
