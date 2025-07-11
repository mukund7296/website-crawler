package main

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"website-crawler/backend/models"
	"github.com/redis/go-redis/v9"
	"time"
)

var db *gorm.DB
var redisClient *redis.Client


func main() {
	// Initialize database
	models.ConnectDatabase()
	redisClient = redis.NewClient(&redis.Options{
		Addr:     "redis:6379",
		Password: "",
		DB:       0,
	})
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err := redisClient.Ping(ctx).Result()
	if err != nil {
		log.Fatal("Failed to connect to Redis:", err)
	}

	// Add cache middleware to your router
	router.Use(cacheMiddleware(5 * time.Minute))
	
	r := gin.Default()
	
	// API routes
	api := r.Group("/api")
	{
		api.POST("/auth/register", auth.Register)
		api.POST("/auth/login", auth.Login)
		
		// Protected routes
		authMiddleware := api.Group("/")
		authMiddleware.Use(middleware.JWTAuth())
		{
			authMiddleware.POST("/urls", urls.AddURL)
			authMiddleware.GET("/urls", urls.GetURLs)
			authMiddleware.POST("/urls/:id/analyze", urls.AnalyzeURL)
			authMiddleware.DELETE("/urls/:id", urls.DeleteURL)
			authMiddleware.GET("/analyses/:id", analyses.GetAnalysis)
		}
	}
	
	r.Run(":8000")
}

func cacheMiddleware(ttl time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Only cache GET requests
		if c.Request.Method != "GET" {
			c.Next()
			return
		}

		cacheKey := c.Request.URL.String()
		ctx := c.Request.Context()

		// Try to get from cache
		cached, err := redisClient.Get(ctx, cacheKey).Bytes()
		if err == nil {
			c.Header("X-Cache", "HIT")
			c.Data(http.StatusOK, "application/json", cached)
			c.Abort()
			return
		}

		// Cache miss - proceed
		c.Header("X-Cache", "MISS")
		c.Next()

		// Cache successful responses
		if c.Writer.Status() == http.StatusOK && c.Writer.Size() > 0 {
			redisClient.Set(ctx, cacheKey, c.Writer.GetBodyString(), ttl)
		}
	}
}
