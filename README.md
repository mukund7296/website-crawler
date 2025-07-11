# website-crawler
# Website Crawler Analysis Tool - Step-by-Step Implementation

showing the progression through commits. Here's how I'll approach it:

## Step 1: Project Setup and Scaffolding

1. **Initialize project structure**
   ```
   /website-crawler
     /backend
     /frontend
     docker-compose.yml
     README.md
   ```

2. **Set up backend (Go)**
   - Initialize Go module
   - Choose Gin as web framework
   - Set up basic server structure
   - Add MySQL connection

3. **Set up frontend (React/TypeScript)**
   - Create React app with TypeScript template
   - Add basic routing
   - Set up state management (likely React Context or Redux Toolkit)

## Step 2: Database Schema Design

Create tables for:
- `urls` (id, url, status, created_at, updated_at)
- `url_analyses` (id, url_id, html_version, title, login_form, created_at)
- `headings` (id, analysis_id, level, count)
- `links` (id, analysis_id, url, is_internal, status_code, is_inaccessible)

## Step 3: Backend API Development

1. **Authentication**
   - Implement JWT-based auth
   - Create login/register endpoints

2. **URL Management API**
   - POST /api/urls - Add new URL
   - GET /api/urls - List URLs with pagination
   - POST /api/urls/:id/analyze - Start analysis
   - DELETE /api/urls/:id - Delete URL

3. **Analysis API**
   - GET /api/analyses/:id - Get analysis details
   - GET /api/analyses/:id/links - Get links breakdown

## Step 4: Crawler Implementation

1. **HTML Parser**
   - Use GoQuery to parse HTML
   - Extract:
     - HTML version
     - Title
     - Headings by level
     - Links (internal/external)

2. **Link Checker**
   - Check HTTP status of each link
   - Classify as internal/external

3. **Login Form Detection**
   - Check for password input fields

## Step 5: Frontend Development

1. **Authentication Flow**
   - Login/Register forms
   - JWT storage and API client setup

2. **URL Management**
   - Form to add new URL
   - Table view with pagination/sorting
   - Status indicators
   - Action buttons (analyze, delete)

3. **Dashboard**
   - Summary cards with key metrics
   - Charts for links breakdown
   - Filtering and search functionality

4. **Detail View**
   - Detailed analysis results
   - Visualizations (using Chart.js)
   - Broken links list

## Step 6: Real-time Updates

Implement WebSocket or polling to:
- Update status in real-time
- Show progress indicators

## Step 7: Testing

1. **Backend Tests**
   - API endpoint tests
   - Parser unit tests

2. **Frontend Tests**
   - Component tests
   - Integration tests for key flows

## Step 8: Final Polish

- Responsive design adjustments
- Error handling improvements
- Performance optimizations
- Documentation completion
