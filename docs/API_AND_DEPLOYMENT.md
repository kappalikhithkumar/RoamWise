# RoamWise API & Production Deployment Guide

## 1. Environment Variables Specification

Both backend and frontend support environment configuration via `.env` files.
Use `.env.example` as a template.

### Backend (`.env` in root or `backend/`)

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `FLASK_APP` | String | `backend/run.py` | Flask application entry point |
| `FLASK_DEBUG` | Boolean | `False` in prod | Enable/disable Flask debug reloader |
| `PORT` | Integer | `5000` | Port for the backend API server |
| `HOST` | String | `127.0.0.1` | Host interface binding (`0.0.0.0` for containers) |
| `SECRET_KEY` | String | `(generated)` | Flask session encryption key |
| `DATABASE_PATH` | String | `backend/roamwise.db`| Path to the SQLite database file |
| `GEMINI_API_KEY` | String | `""` | Google Gemini API key for live AI generation |
| `GEMINI_MODEL` | String | `gemini-3.8-flash` | Gemini model name |
| `WEATHER_PROVIDER`| String | `open-meteo` | Weather provider (`open-meteo` free tier) |

### Frontend (`frontend/.env`)

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | String | `/api` | Base URL for REST API requests (proxied in dev) |

---

## 2. API Endpoints Reference

### Health & Monitoring
- `GET /api/health`
  - Returns service status, version, and database connectivity.
  - Response: `{ "status": "healthy", "service": "...", "version": "1.0.0", "database": "connected" }`

### Trip Itineraries
- `GET /api/trips`
  - Returns all saved trips with summary metrics.
  - Response: `{ "trips": [ ... ] }`

- `POST /api/trips`
  - Creates a new trip with multi-day schedule, activities, and Plan B alternatives.
  - If `days` is omitted, automatically triggers Gemini itinerary synthesis.
  - Response: `{ "success": true, "tripId": 1, "trip": { ... }, "message": "Trip saved successfully" }` (HTTP 201)

- `GET /api/trips/<id>`
  - Retrieves full details of a specific trip including daily breakdowns, visited flags, and Plan B alternatives.
  - Returns HTTP 404 if trip does not exist.

- `PUT /api/trips/<id>`
  - Updates trip metadata, activities, visited checkmarks, Plan B substitutions, or schedule re-sequencing.
  - Response: `{ "success": true, "trip": { ... }, "message": "Trip updated successfully" }`

- `DELETE /api/trips/<id>`
  - Cascades deletion of the trip, child days, and activities from SQLite.
  - Returns HTTP 404 if trip does not exist.
  - Response: `{ "success": true, "message": "Trip <id> deleted successfully" }`

### AI Generation & Replanning
- `POST /api/trips/generate`
  - Generates personalized multi-day itinerary using Google Gemini (`gemini-3.8-flash`) with deterministic fallback.
  - Body: `{ "destination": "...", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "budgetTier": "...", "interests": [...], "travelerType": "...", "pace": "..." }`
  - Response: `{ "success": true, "itinerary": { ... }, "days": [ ... ], "generationSource": "gemini-ai" | "deterministic-fallback" }`

- `POST /api/trips/replan`
  - Absorbs delays, rain alerts, or budget shifts using Gemini AI.
  - Preserves completed activities (`isVisited: true`) and locked stops intact.
  - Body: `{ "trip": { ... }, "scenarioText": "...", "delayMinutes": 45, "activeDayNumber": 1 }`
  - Response: `{ "success": true, "proposal": { "scenarioTitle": "...", "diffItems": [ ... ], "proposedActivities": [ ... ] } }`

### Weather Intelligence
- `GET /api/weather/<destination>`
  - Fetches live meteorological forecast via Open-Meteo API (temperature, rain risk, humidity, wind, UV index, and weather warnings).
  - Falls back to clearly labelled microclimate simulation when offline.
  - Response: `{ "destination": "...", "provider": "Open-Meteo Weather API", "isLive": true, "current": { ... }, "hourly": [ ... ], "alerts": [ ... ] }`

---

## 3. Production Deployment Architecture

### 1. Frontend Production Build
```powershell
cd frontend
npm.cmd run build
```
Build output is generated in `frontend/dist/`. This can be served by Nginx, Caddy, Vercel, Netlify, Cloudflare Pages, or directly through Flask.

### 2. Backend WSGI Server
Do not run `flask run` or `backend/run.py` in production. Use a production WSGI server:
- **Windows**:
  ```powershell
  pip install waitress
  waitress-serve --listen=127.0.0.1:5000 backend.wsgi:app
  ```
- **Linux / Docker**:
  ```bash
  pip install gunicorn
  gunicorn -w 4 -b 0.0.0.0:5000 "backend.wsgi:app"
  ```

### 3. Nginx Reverse Proxy Configuration (Example)
```nginx
server {
    listen 80;
    server_name roamwise.example.com;

    # Serve static React frontend
    location / {
        root /var/www/roamwise/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to Flask WSGI
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
