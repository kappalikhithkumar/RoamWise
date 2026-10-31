# RoamWise AI Travel Planner — Architecture

## 1. System Overview
RoamWise is an atmospheric, weather-adaptive mobile travel companion. It continuously aligns day-by-day travel itineraries with live weather radar, travel disruptions, and user preferences.

## 2. Technology Stack
* **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS (configured with exact Google Stitch design tokens: Outfit & Inter fonts, Material Symbols, Adaptive Teal & Sky Cerulean palette).
* **Backend**: Python 3.12 + Flask + Flask-CORS.
* **Database**: SQLite3 (storing trips, daily schedules, activities, weather telemetry, and notifications).
* **AI Engine (Upcoming)**: Gemini API (generating smart itineraries, weather replanning, and Plan B recommendations).

## 3. Directory Layout
* `frontend/`: Single-page mobile-first React application.
* `backend/`: RESTful Flask API serving trips, weather, and alerts.
* `design-reference/`: Preserved Google Stitch design specifications (`DESIGN.md`, screen HTML files, `manifest.json`).
* `documentation/`: System architecture, setup instructions, and API contracts.
