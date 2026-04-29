# Insighta Labs+ Backend

## Live URL
`https://insighta-backend-production-89e8.up.railway.app`

## System Architecture
- Node.js/Express REST API
- MongoDB with Mongoose
- GitHub OAuth authentication
- JWT access tokens (3 min expiry) + refresh tokens (5 min expiry)
- Role-based access control (admin/analyst)

## Authentication Flow
1. Client requests `/auth/github`
2. User authorizes via GitHub
3. Backend exchanges code for GitHub token
4. User created/updated in database
5. JWT tokens issued
6. Web: tokens passed via URL hash → localStorage
7. CLI: tokens passed via local callback server → stored at `~/.insighta/credentials.json`

## API Endpoints
- `GET /auth/github` - GitHub OAuth
- `GET /auth/github/callback` - OAuth callback
- `POST /auth/refresh` - Refresh tokens
- `POST /auth/logout` - Logout
- `GET /auth/whoami` - Current user
- `GET /api/profiles` - List profiles (paginated)
- `GET /api/profiles/search?q=` - Natural language search
- `GET /api/profiles/export?format=csv` - CSV export
- `POST /api/profiles` - Create profile (admin)
- `GET /api/profiles/:id` - Get profile
- `DELETE /api/profiles/:id` - Delete profile (admin)
- `GET /health` - Health check

## Role Enforcement
- **analyst**: Read-only (GET profiles, search)
- **admin**: Full CRUD access
- Default role: analyst
- Middleware checks role on every request

## Natural Language Parsing
Rule-based parser supporting:
- Gender: "male", "female", "young males"
- Age: "above 30", "teenagers", "young" (16-24)
- Country: "from nigeria", "people from kenya"
- Combined: "adult males from kenya"

## Setup
```bash
npm install
cp .env.example .env
npm run dev