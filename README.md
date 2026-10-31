# RoamWise — AI Atmospheric & Adaptive Travel Planner

RoamWise is an intelligent, full-stack travel companion that dynamically adapts day-by-day itineraries to real weather forecasts, unexpected delays, and spontaneous schedule changes.

Designed with the **Serene Expedition** visual system (Google Stitch), built with **React, Vite, TypeScript, Tailwind CSS**, and a **Python Flask + SQLite** backend powered by **Google Gemini 3.8 Flash** and **Open-Meteo**.

---

## Key Capabilities

1. **Personalized AI Itinerary Generation**
   - Synthesizes multi-day circuits using Google Gemini (`gemini-3.8-flash`) with structured output.
   - Tailored to destination order, dates, budget tier, traveler type, interests, and travel pace.
   - Deterministic offline synthesis ensures zero user disruptions when offline or unconfigured.

2. **Adaptive Plan B & Real-Time Replanning**
   - Natural language schedule optimization (e.g. *"Our cab is delayed by 45 minutes"*, *"It is raining. Suggest indoor alternatives"*).
   - **Strict Safety Guarantee**: Completed activities (`isVisited = true`) and locked reservations are strictly preserved and never rescheduled or deleted.
   - Interactive Plan B alternative swaps for rain-exposed outdoor attractions.
   - Visual difference review screen (original vs proposed timetable).

3. **Real Meteorological Intelligence**
   - Live weather forecasts powered by **Open-Meteo Weather API** (temperature, precipitation probability, humidity, wind, and UV index).
   - Microclimate precipitation advisories that automatically highlight outdoor stops at risk.
   - Transparent data labeling: live Open-Meteo data vs clearly designated offline simulation.

4. **Multi-Stop Route Mapping**
   - Waypoint sequence visualization with spatial transit estimates (distance in km and transit duration in minutes).
   - Direct integration with native Google Maps / Apple Maps directions for every stop.
   - OpenStreetMap spatial attribution.

5. **Full State Persistence & Graceful Fallback**
   - SQLite relational storage with cascading foreign keys (`trips`, `trip_days`, `activities`).
   - Bidirectional synchronization between React `TripContext` and Flask REST API.
   - All completed stops and Plan B changes survive browser reloads and cold restarts.
   - Complete offline fallback if the backend server is stopped.

---

## Architecture Overview

```
roamwise/
├── backend/
│   ├── app/
│   │   ├── routes/              # Flask Blueprints (health, trips, weather, alerts)
│   │   ├── services/            # Gemini AI service, Open-Meteo Weather service
│   │   ├── config.py            # Environment configuration
│   │   └── database.py          # SQLite database connection, migrations & serializers
│   ├── run.py                   # Development server entry point
│   ├── wsgi.py                  # Production WSGI entry point (Waitress/Gunicorn)
│   ├── requirements.txt         # Python dependencies
│   ├── test_backend.py          # Isolated unit test suite
│   └── test_master_e2e.py       # Master end-to-end integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/          # Serene Expedition UI components & modals
│   │   ├── context/             # TripContext (state management & backend sync)
│   │   ├── pages/               # React Router pages (Home, MyTrips, Plan, Weather, Map, etc.)
│   │   ├── services/            # Typed REST API service
│   │   └── types/               # TypeScript interfaces
│   ├── tailwind.config.js       # Serene Expedition design tokens
│   ├── vite.config.ts           # Vite reverse proxy configuration
│   └── package.json             # Frontend dependencies
├── design-reference-v2/         # Google Stitch DESIGN.md, HTML screens & assets
├── docs/                        # Architecture, API & deployment guides
└── .env.example                 # Environment variables template
```

---

## Quick Start (Local Development)

### 1. Backend Setup

```powershell
# Navigate to workspace
cd roamwise

# Install Python dependencies
pip install -r backend/requirements.txt

# (Optional) Set your Gemini API key in environment or .env
$env:GEMINI_API_KEY="your_gemini_api_key_here"

# Start Flask development server (runs on http://127.0.0.1:5000)
python backend/run.py
```

### 2. Frontend Setup

```powershell
# In a separate terminal, navigate to frontend
cd frontend

# Install Node dependencies
npm.cmd install

# Start Vite dev server (runs on http://localhost:5173 with /api proxy to Flask)
npm.cmd run dev
```

### 3. Production Build & Verification

```powershell
# Frontend TypeScript check and production build
cd frontend
npm.cmd run build

# Run master backend integration test suite (uses isolated test database)
cd ..
python backend/test_master_e2e.py
```

---

## Design System Tokens (Serene Expedition)

| Token | Value | Semantic Usage |
| :--- | :--- | :--- |
| **Primary** | `#173F35` | Deep Forest Green — Dominant brand headers, key actions |
| **Secondary** | `#D8E9DD` | Sage Green — Badges, borders, subtle accents |
| **Accent** | `#E5A45B` | Warm Amber — Weather warnings, active highlights, alerts |
| **Background**| `#F7F5EF` | Warm Cream — Application body background |
| **Text** | `#25332E` | Charcoal Evergreen — High contrast body and headings |
| **Surface** | `#FFFFFF` | Pure White — Content cards, bottom sheets, modals |
| **Heading Font** | `Manrope (600, 700)` | Geometric modern display typography |
| **Body Font** | `Inter (400, 500, 600)`| Neutral readable interface typography |

---

## License & Attribution

- Built with Google Gemini Interactions API and Google Stitch.
- Weather data provided by [Open-Meteo.com](https://open-meteo.com) under CC-BY 4.0.
- Map data and spatial routing © [OpenStreetMap](https://www.openstreetmap.org) contributors.
