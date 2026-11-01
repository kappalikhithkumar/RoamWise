# RoamWise — AI Atmospheric & Adaptive Travel Planner

RoamWise is an intelligent, full-stack travel companion that dynamically adapts multi-day itineraries to real-time weather forecasts, unexpected transit delays, and spontaneous schedule disruptions.

Designed with the **Serene Expedition** visual system (Google Stitch), built with **React 18, Vite 5, TypeScript, Tailwind CSS**, and a **Python Flask + SQLite** backend powered by **Google Gemini** (`gemini-3.5-flash-lite`), a **Two-Tier POI Discovery Layer** (Curated Landmark Registries + OpenStreetMap Overpass), and **Open-Meteo Weather APIs**.

---

## Key Capabilities

1. **Grounded AI Itinerary Generation & POI Discovery**
   - Synthesizes personalized multi-day circuits using Google Gemini (`gemini-3.5-flash-lite`) with strict JSON schema enforcement.
   - **Two-Tier POI Discovery Layer (`poi_service.py`)**: Prioritizes curated landmark registries (Bangalore, Visakhapatnam, Hyderabad, Jaipur, Hampi, Araku Valley, Paris, Tokyo, etc.) and OpenStreetMap Overpass bounding box queries to eliminate landmark hallucination.
   - Grounded prompt injection ensures real attractions, real neighborhood locations, and verified local costs (INR ₹ for domestic Indian circuits, local currency for international).
   - Robust deterministic procedural fallback ensures zero user disruption when offline or unconfigured.

2. **Adaptive Plan B & Real-Time Replanning**
   - Natural-language schedule recovery (e.g. *"Cab delayed 45 minutes in traffic"*, *"Thunderstorm approaching, suggest sheltered indoor alternative"*).
   - **Strict Safety Guarantee**: Completed activities (`isVisited = true`) and locked stops are strictly preserved and immutable during replanning.
   - One-click Plan B substitutions replacing rain-threatened outdoor stops with verified indoor shelters.
   - Visual difference review screen (original vs proposed timetable with `locked`, `adjusted`, and `swapped` indicators).

3. **Real Meteorological Intelligence**
   - Live atmospheric observations and precipitation probabilities powered by **Open-Meteo Weather API** (temperature, precipitation risk %, humidity, wind speed, UV index, and sunrise/sunset).
   - Microclimate precipitation advisories (triggered when rain risk >= 45%) highlighting outdoor stops at risk.
   - Transparent data labeling: live Open-Meteo observations vs clearly designated offline microclimate simulation.

4. **Multi-Stop Route Mapping & Navigation**
   - Waypoint sequence visualization with spatial transit estimates (distance in km and transit duration in minutes).
   - Direct integration with native Google Maps search and turn-by-turn directions deep-links for every stop.
   - OpenStreetMap spatial attribution.

5. **Full State Persistence & Dual-Mode Dashboard**
   - SQLite relational storage with cascading foreign keys (`trips`, `trip_days`, `activities`, `alerts`).
   - **Dual-Mode Dashboard**: Clean Discovery Hub for new users with curated circuits, and Active Expedition Dashboard when a trip is active.
   - **Demo Mode**: Explicit presentation mode for demonstrations without polluting the presentation database.
   - Bidirectional synchronization between React `TripContext` and Flask REST API.
   - All completed stops and Plan B changes survive browser reloads and cold restarts.

---

## Architecture Overview

```
roamwise/
├── backend/
│   ├── app/
│   │   ├── routes/              # Flask Blueprints (health, trips, weather, alerts)
│   │   ├── services/            # Gemini AI service, Two-Tier POI service, Open-Meteo Weather service
│   │   ├── config.py            # Environment configuration
│   │   └── database.py          # SQLite database connection, dynamic migrations & serializers
│   ├── run.py                   # Development server entry point
│   ├── wsgi.py                  # Production WSGI entry point (Waitress/Gunicorn)
│   ├── requirements.txt         # Python dependencies (Flask, Flask-CORS, google-genai, python-dotenv)
│   ├── test_backend.py          # Isolated unit & API test suite
│   └── test_master_e2e.py       # Master end-to-end integration test suite (11/11 tests passing)
├── frontend/
│   ├── src/
│   │   ├── components/          # Serene Expedition UI components, forms, cards & modals
│   │   ├── context/             # TripContext (global state, backend sync & hydration)
│   │   ├── pages/               # 12 React Router pages (Home, MyTrips, Plan, Weather, Map, etc.)
│   │   ├── services/            # Typed REST API service (fetch client)
│   │   ├── mock/                # Curated circuits, sample Jaipur days & procedural generator
│   │   └── types/               # TypeScript interfaces & data models
│   ├── tailwind.config.js       # Serene Expedition design tokens & radii
│   ├── vite.config.ts           # Vite dev server & /api proxy configuration
│   └── package.json             # Frontend dependencies (React 18, Vite 5, Tailwind 3.4)
├── design-reference-v2/         # Google Stitch DESIGN.md, 24 HTML screens & screenshot assets
├── docs/                        # Forensic Dossier, System Inventory JSON, and Deployment guides
│   ├── ROAMWISE_COMPREHENSIVE_APPLICATION_DOSSIER.md
│   ├── ROAMWISE_SYSTEM_INVENTORY.json
│   ├── ROAMWISE_Source_Code_For_Review.zip
│   └── API_AND_DEPLOYMENT.md
├── documentation/               # Architecture and setup notes
└── .env.example                 # Environment variables template
```

---

## Quick Start (Local Development)

### 1. Backend Setup

```bash
# Navigate to workspace
cd roamwise

# Install Python dependencies
pip install -r backend/requirements.txt

# Configure environment variables (create .env from template)
cp .env.example .env
# Open .env and set GEMINI_API_KEY="your_api_key_here"

# Start Flask development server (runs on http://127.0.0.1:5000)
# Note: On Windows PowerShell/CMD, set PYTHONPATH=backend
set PYTHONPATH=backend
python backend/run.py
```

### 2. Frontend Setup

```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install Node dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173 with /api proxy to Flask)
npm run dev
```

### 3. Production Build & Verification

```bash
# Frontend TypeScript check and production build
cd frontend
npm run build

# Run master backend integration test suite (uses isolated test_master.db)
cd ..
set PYTHONPATH=backend
python backend/test_master_e2e.py
```

---

## Design System Tokens (Serene Expedition)

| Token | Value | Semantic Usage |
| :--- | :--- | :--- |
| **Primary** | `#173F35` | Deep Forest Green — Dominant brand headers, key actions |
| **Secondary** | `#D8E9DD` | Botanical Sage Green — Badges, borders, subtle accents |
| **Accent / Tertiary** | `#E5A45B` | Warm Amber — Weather warnings, active highlights, alerts |
| **Background** | `#F7F5EF` | Warm Cream — Application body background |
| **Surface** | `#EDFDF5` | Soft Mint — Base card containers, elevated panels |
| **Text** | `#25332E` | Charcoal Evergreen — High contrast body and headings |
| **Muted Text** | `#414845` | Mid-tone charcoal — Timestamps, sublabels, notes |
| **Heading Font** | `Manrope (600, 700)` | Geometric modern display typography |
| **Body Font** | `Inter (400, 500, 600)` | Neutral readable interface typography |

---

## Known Limitations

1. **Map Rendering**: `MapView.tsx` renders an illustrative SVG canvas with percentage positions and heuristic transit formulas rather than interactive tiled GIS maps (e.g. Leaflet/Mapbox).
2. **Authentication**: API endpoints (`/api/trips`) are unauthenticated; data is single-tenant.
3. **Generating Screen Timer**: `GeneratingPage.tsx` uses a 4.1s client-side timer while backend generation processes asynchronously.
4. **Android APK**: Native packaging wrapper (Capacitor/Cordova) is not yet configured; application is currently responsive mobile web.

---

## Changelog

### Version 1.2.0 (Current — Serene Expedition & POI Grounding)
- **Two-Tier POI Discovery Layer**: Integrated curated landmark registries across 14 major global hubs with OpenStreetMap Overpass bounding box queries to eliminate attraction hallucination.
- **Serene Expedition Design System**: Migrated all 12 frontend views to Google Stitch Serene Expedition aesthetic (Deep Forest Green `#173F35`, Sage Green `#D8E9DD`, Warm Amber `#E5A45B`).
- **Discovery Hub & Demo Mode**: Implemented clean Discovery Hub for new users, isolated demo mode for presentations, and guaranteed zero database pollution.
- **Cascade Deletion & Verification**: Implemented full relational cascade deletion and passed 11/11 Master E2E integration tests.

### Version 1.1.0 (AI & Meteorological Intelligence)
- **Gemini AI Integration**: Added structured multi-day itinerary generation (`gemini-3.5-flash-lite`) with a 15.0s resilient timeout and automatic deterministic fallback.
- **Adaptive Replanning & Plan B**: Implemented natural-language disruption recovery with strict safety locks for visited stops (`isVisited = true`).
- **Open-Meteo Integration**: Integrated live global atmospheric observations, rain-risk threshold calculations, and labeled microclimate fallbacks.

### Version 1.0.0 (Foundation Launch)
- Initial full-stack prototype with React + Vite + TypeScript frontend, Flask REST API, and SQLite database persistence.
- Deterministic multi-day itinerary generation across standard Indian tourist destinations.

---

## License & Attribution

- Built with Google Gemini Interactions API and Google Stitch.
- Weather data provided by [Open-Meteo.com](https://open-meteo.com) under CC-BY 4.0.
- Map data and spatial routing © [OpenStreetMap](https://www.openstreetmap.org) contributors.
