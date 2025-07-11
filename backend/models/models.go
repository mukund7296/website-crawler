package models

import (
	"gorm.io/gorm"
	"time"
)

type URL struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	URL       string    `gorm:"not null" json:"url"`
	Status    string    `gorm:"default:'pending'" json:"status"` // pending, processing, completed, failed
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Analyses  []Analysis `json:"analyses,omitempty"`
}

type Analysis struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	URLID       uint      `gorm:"not null" json:"url_id"`
	HTMLVersion string    `json:"html_version"`
	Title       string    `json:"title"`
	LoginForm   bool      `json:"login_form"`
	CreatedAt   time.Time `json:"created_at"`
	Headings    []Heading `json:"headings,omitempty"`
	Links       []Link    `json:"links,omitempty"`
}

type Heading struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	AnalysisID uint   `gorm:"not null" json:"analysis_id"`
	Level      string `gorm:"not null" json:"level"` // h1, h2, etc.
	Count      int    `gorm:"not null" json:"count"`
}

type Link struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	AnalysisID   uint   `gorm:"not null" json:"analysis_id"`
	URL          string `gorm:"not null" json:"url"`
	IsInternal   bool   `gorm:"not null" json:"is_internal"`
	StatusCode   int    `json:"status_code"`
	IsInaccessible bool `gorm:"not null" json:"is_inaccessible"`
}

func ConnectDatabase() {
	dsn := "user:password@tcp(127.0.0.1:3306)/website_crawler?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to database!")
	}

	db.AutoMigrate(&URL{}, &Analysis{}, &Heading{}, &Link{})
}
