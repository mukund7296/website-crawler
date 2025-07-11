I'll guide you through creating this project step by step with code examples. Let's start with the initial setup and then build up the components.

## Step 1: Project Setup

1. Create project directory and initialize Git:
```bash
mkdir website-crawler
cd website-crawler
git init
```


2. Create backend and frontend directories:
```bash
mkdir backend frontend
```

## Step 2: Backend Setup (Go)

It looks like you're trying to initialize a Go module using `go mod init`, but your system is giving the error:

```
zsh: command not found: go
```

---

### 🛠️ What this means:

Your terminal (Zsh) doesn't recognize the `go` command because **Go (Golang)** is **not installed** on your system — or it's not added to your system `PATH`.

---

### ✅ How to Fix It

#### 1. **Install Go**

If you're using macOS, the easiest way is with **Homebrew**:

```bash
brew install go
```

> If you don’t have Homebrew, install it from: [https://brew.sh/](https://brew.sh/)

#### 2. **Verify Installation**

After installation, restart your terminal and run:

```bash
go version
```

You should see output like:

```
go version go1.21.0 darwin/amd64
```

#### 3. **Retry your command**

Then go back to your project folder:

```bash
cd /Users/React/website-crawler/backend
go mod init website-crawler/backend
```

---


1. Initialize Go module:
```bash
cd backend
go mod init website-crawler/backend
```

2. Install dependencies:
```bash
go get -u github.com/gin-gonic/gin
go get -u github.com/go-sql-driver/mysql
go get -u github.com/PuerkitoBio/goquery
```

3. Create `main.go` with basic server setup:
```go
package main

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"website-crawler/backend/models"
)

var db *gorm.DB

func main() {
	// Initialize database
	models.ConnectDatabase()
	
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
```

## Step 3: Database Models

Create `backend/models/models.go`:
```go
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
```

## Step 4: Frontend Setup (React/TypeScript)

1. Initialize React app:
```bash
cd ../frontend
npx create-react-app . --template typescript
```

<img width="570" height="220" alt="image" src="https://github.com/user-attachments/assets/1e800d97-e72e-4081-9510-d3c5d341cae5" />


2. Install dependencies:
```bash
npm install axios react-router-dom @mui/material @mui/icons-material @mui/x-data-grid chart.js react-chartjs-2 jwt-decode
```
<img width="549" height="240" alt="image" src="https://github.com/user-attachments/assets/f003ca05-68eb-4ccc-bd91-d5c1ce7762c8" />

3. Create basic structure:
```
src/
  components/
    Auth/
      Login.tsx
      Register.tsx
    Dashboard/
      URLTable.tsx
      AnalysisDetail.tsx
    Common/
      Header.tsx
      Loading.tsx
  contexts/
    AuthContext.tsx
  services/
    api.ts
  types/
    types.ts
  App.tsx
  index.tsx
```

## Step 5: Frontend Authentication

1. Create `src/contexts/AuthContext.tsx`:
```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';

interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const navigate = useNavigate();

  const login = async (email: string, password: string) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { token } = response.data;
    localStorage.setItem('token', token);
    setToken(token);
    navigate('/dashboard');
  };

  const register = async (email: string, password: string) => {
    await axios.post('/api/auth/register', { email, password });
    navigate('/login');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

## Step 6: API Service

Create `src/services/api.ts`:
```ts
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const addURL = (url: string) => api.post('/urls', { url });
export const getURLs = (page: number, limit: number) => api.get(`/urls?page=${page}&limit=${limit}`);
export const analyzeURL = (id: number) => api.post(`/urls/${id}/analyze`);
export const deleteURL = (id: number) => api.delete(`/urls/${id}`);
export const getAnalysis = (id: number) => api.get(`/analyses/${id}`);
```

## Step 7: URL Table Component

Create `src/components/Dashboard/URLTable.tsx`:
```tsx
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';
import { getURLs, analyzeURL, deleteURL } from '../../services/api';

const URLTable: React.FC = () => {
  const [urls, setUrls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'url', headerName: 'URL', width: 300 },
    { field: 'status', headerName: 'Status', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <>
          <Button 
            variant="contained" 
            size="small"
            onClick={() => handleAnalyze(params.row.id)}
            disabled={params.row.status === 'processing'}
          >
            Analyze
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            size="small" 
            sx={{ ml: 1 }}
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  const fetchURLs = async () => {
    setLoading(true);
    try {
      const response = await getURLs(paginationModel.page + 1, paginationModel.pageSize);
      setUrls(response.data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (id: number) => {
    try {
      await analyzeURL(id);
      fetchURLs();
    } catch (error) {
      console.error('Error analyzing URL:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteURL(id);
      fetchURLs();
    } catch (error) {
      console.error('Error deleting URL:', error);
    }
  };

  useEffect(() => {
    fetchURLs();
  }, [paginationModel]);

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={urls}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 20]}
        checkboxSelection
      />
    </Box>
  );
};

export default URLTable;
```

## Step 8: Analysis Detail Component

Create `src/components/Dashboard/AnalysisDetail.tsx`:
```tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { getAnalysis } from '../../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AnalysisDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await getAnalysis(Number(id));
        setAnalysis(response.data);
      } catch (error) {
        console.error('Error fetching analysis:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!analysis) return <div>Analysis not found</div>;

  const headingsData = analysis.headings.map((h: any) => ({
    name: `H${h.level}`,
    value: h.count
  }));

  const linksData = [
    { name: 'Internal', value: analysis.links.filter((l: any) => l.is_internal).length },
    { name: 'External', value: analysis.links.filter((l: any) => !l.is_internal).length },
    { name: 'Broken', value: analysis.links.filter((l: any) => l.is_inaccessible).length }
  ];

  const brokenLinks = analysis.links.filter((l: any) => l.is_inaccessible);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analysis for {analysis.url}
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="h6">HTML Version</Typography>
          <Typography>{analysis.html_version || 'Unknown'}</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="h6">Title</Typography>
          <Typography>{analysis.title || 'No title'}</Typography>
        </Paper>
        
        <Paper sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="h6">Login Form</Typography>
          <Typography>{analysis.login_form ? 'Yes' : 'No'}</Typography>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Paper sx={{ p: 2, width: '100%', maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>Headings Distribution</Typography>
          <PieChart width={400} height={300}>
            <Pie
              data={headingsData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {headingsData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </Paper>

        <Paper sx={{ p: 2, width: '100%', maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>Links Distribution</Typography>
          <BarChart
            width={400}
            height={300}
            data={linksData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </Paper>
      </Box>

      {brokenLinks.length > 0 && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="h6" gutterBottom>Broken Links</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>URL</TableCell>
                  <TableCell>Status Code</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {brokenLinks.map((link: any) => (
                  <TableRow key={link.id}>
                    <TableCell>{link.url}</TableCell>
                    <TableCell>{link.status_code}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default AnalysisDetail;
```

## Step 9: Backend Crawler Implementation

Create `backend/crawler/crawler.go`:
```go
package crawler

import (
	"net/http"
	"net/url"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

type PageAnalysis struct {
	HTMLVersion    string
	Title          string
	Headings       map[string]int
	InternalLinks  int
	ExternalLinks  int
	Inaccessible   int
	HasLoginForm   bool
	BrokenLinks    []BrokenLink
}

type BrokenLink struct {
	URL        string
	StatusCode int
}

func AnalyzePage(pageURL string) (*PageAnalysis, error) {
	// Fetch the page
	resp, err := http.Get(pageURL)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Parse HTML
	doc, err := goquery.NewDocumentFromReader(resp.Body)
	if err != nil {
		return nil, err
	}

	analysis := &PageAnalysis{
		Headings: make(map[string]int),
	}

	// Get HTML version
	html, _ := doc.Html()
	analysis.HTMLVersion = detectHTMLVersion(html)

	// Get title
	analysis.Title = doc.Find("title").Text()

	// Count headings
	for i := 1; i <= 6; i++ {
		level := fmt.Sprintf("h%d", i)
		analysis.Headings[level] = doc.Find(level).Length()
	}

	// Check for login form
	analysis.HasLoginForm = doc.Find("input[type='password']").Length() > 0

	// Parse domain for internal/external links
	baseURL, _ := url.Parse(pageURL)
	baseDomain := baseURL.Hostname()

	// Process all links
	doc.Find("a").Each(func(i int, s *goquery.Selection) {
		href, exists := s.Attr("href")
		if !exists || href == "" {
			return
		}

		linkURL, err := url.Parse(href)
		if err != nil {
			return
		}

		// Resolve relative URLs
		if !linkURL.IsAbs() {
			linkURL = baseURL.ResolveReference(linkURL)
		}

		// Check if link is internal
		isInternal := strings.HasSuffix(linkURL.Hostname(), baseDomain)

		// Check link accessibility
		statusCode, accessible := checkLinkAccessibility(linkURL.String())
		if !accessible {
			analysis.Inaccessible++
			analysis.BrokenLinks = append(analysis.BrokenLinks, BrokenLink{
				URL:        linkURL.String(),
				StatusCode: statusCode,
			})
		}

		if isInternal {
			analysis.InternalLinks++
		} else {
			analysis.ExternalLinks++
		}
	})

	return analysis, nil
}

func detectHTMLVersion(html string) string {
	// Simplified version detection
	if strings.Contains(html, "<!DOCTYPE html>") {
		return "HTML5"
	} else if strings.Contains(html, "<!DOCTYPE HTML PUBLIC") {
		return "HTML4"
	}
	return "Unknown"
}

func checkLinkAccessibility(url string) (int, bool) {
	resp, err := http.Head(url)
	if err != nil {
		return 0, false
	}
	defer resp.Body.Close()

	return resp.StatusCode, resp.StatusCode < 400
}
```

## Step 10: Docker Setup

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DB_HOST=db
      - DB_USER=root
      - DB_PASSWORD=password
      - DB_NAME=website_crawler
    depends_on:
      - db
    volumes:
      - ./backend:/app

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000/api
    volumes:
      - ./frontend:/app
    depends_on:
      - backend

  db:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=password
      - MYSQL_DATABASE=website_crawler
    volumes:
      - mysql-data:/var/lib/mysql

volumes:
  mysql-data:
```

## Step 11: Final App Component

Update `src/App.tsx`:
```tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import AnalysisDetail from './components/Dashboard/AnalysisDetail';
import PrivateRoute from './components/Common/PrivateRoute';
import Header from './components/Common/Header';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/analysis/:id"
            element={
              <PrivateRoute>
                <AnalysisDetail />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
```

This implementation covers all the requirements:
- Frontend with React/TypeScript
- Backend with Go
- MySQL database
- Authentication
- URL management
- Analysis dashboard with charts
- Real-time status updates
- Responsive design

