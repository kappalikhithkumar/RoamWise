import sqlite3
import json
from flask import g, current_app

def get_db():
    """Get or create SQLite database connection for current request context."""
    if "db" not in g:
        g.db = sqlite3.connect(
            current_app.config["DATABASE_PATH"],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
        # Enable foreign keys
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db

def close_db(e=None):
    """Close the database connection at the end of the request."""
    db = g.pop("db", None)
    if db is not None:
        db.close()

def _ensure_column(cursor, table, col_name, col_def):
    """Ensure a column exists in a SQLite table, adding it if missing."""
    cursor.execute(f"PRAGMA table_info({table})")
    cols = [r[1] for r in cursor.fetchall()]
    if col_name not in cols:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_def}")

def init_db(app):
    """Initialize database tables for trips, days, activities, weather, and alerts."""
    with app.app_context():
        db = get_db()
        cursor = db.cursor()
        
        # Trips table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                destination TEXT NOT NULL,
                start_date TEXT NOT NULL,
                end_date TEXT NOT NULL,
                budget_tier TEXT NOT NULL,
                travel_style TEXT,
                traveler_type TEXT,
                pace TEXT,
                weather_adaptive INTEGER DEFAULT 1,
                tagline TEXT,
                destinations_json TEXT,
                interests_json TEXT,
                is_domestic INTEGER DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        _ensure_column(cursor, "trips", "tagline", "TEXT")
        _ensure_column(cursor, "trips", "destinations_json", "TEXT")
        _ensure_column(cursor, "trips", "interests_json", "TEXT")
        _ensure_column(cursor, "trips", "is_domestic", "INTEGER DEFAULT 1")
        
        # Daily itineraries table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trip_days (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trip_id INTEGER NOT NULL,
                day_number INTEGER NOT NULL,
                day_of_week TEXT,
                date_str TEXT NOT NULL,
                theme TEXT,
                weather_summary TEXT,
                temperature TEXT,
                rain_risk INTEGER DEFAULT 0,
                weather_condition TEXT,
                weather_alert TEXT,
                FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
            );
        """)
        _ensure_column(cursor, "trip_days", "day_of_week", "TEXT")
        _ensure_column(cursor, "trip_days", "weather_condition", "TEXT")
        _ensure_column(cursor, "trip_days", "weather_alert", "TEXT")
        
        # Activities table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                day_id INTEGER NOT NULL,
                activity_key TEXT,
                title TEXT NOT NULL,
                time_slot TEXT NOT NULL,
                period TEXT,
                duration TEXT,
                cost INTEGER DEFAULT 0,
                cost_display TEXT,
                category TEXT,
                location TEXT,
                is_indoor INTEGER DEFAULT 0,
                weather_risk TEXT DEFAULT 'low',
                weather_risk_label TEXT,
                description TEXT,
                image_url TEXT,
                is_visited INTEGER DEFAULT 0,
                is_locked INTEGER DEFAULT 0,
                is_plan_b_alternative INTEGER DEFAULT 0,
                has_plan_b_ready INTEGER DEFAULT 0,
                plan_b_alternative_json TEXT,
                FOREIGN KEY (day_id) REFERENCES trip_days (id) ON DELETE CASCADE
            );
        """)
        _ensure_column(cursor, "activities", "activity_key", "TEXT")
        _ensure_column(cursor, "activities", "period", "TEXT")
        _ensure_column(cursor, "activities", "cost_display", "TEXT")
        _ensure_column(cursor, "activities", "location", "TEXT")
        _ensure_column(cursor, "activities", "weather_risk_label", "TEXT")
        _ensure_column(cursor, "activities", "is_visited", "INTEGER DEFAULT 0")
        _ensure_column(cursor, "activities", "is_plan_b_alternative", "INTEGER DEFAULT 0")
        _ensure_column(cursor, "activities", "has_plan_b_ready", "INTEGER DEFAULT 0")
        _ensure_column(cursor, "activities", "plan_b_alternative_json", "TEXT")
        
        # Alerts table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trip_id INTEGER,
                alert_type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                severity TEXT DEFAULT 'info',
                is_read INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
            );
        """)
        
        db.commit()

def serialize_activity(row):
    """Serialize a database activity row into the React frontend Activity shape."""
    r = dict(row)
    plan_b_alt = None
    if r.get("plan_b_alternative_json"):
        try:
            plan_b_alt = json.loads(r["plan_b_alternative_json"])
        except Exception:
            plan_b_alt = None
            
    return {
        "id": r.get("activity_key") or f"act-{r['id']}",
        "title": r["title"],
        "timeSlot": r["time_slot"],
        "period": r.get("period") or "morning",
        "duration": r.get("duration") or "2h",
        "cost": int(r.get("cost") or 0) if str(r.get("cost", "")).isdigit() else 0,
        "costDisplay": r.get("cost_display") or (f"₹{r.get('cost')}" if r.get("cost") else "Free"),
        "category": r.get("category") or "Culture",
        "location": r.get("location") or "Local Heritage Site",
        "isIndoor": bool(r.get("is_indoor")),
        "weatherRisk": r.get("weather_risk") or "low",
        "weatherRiskLabel": r.get("weather_risk_label") or "☀️ Low Risk",
        "description": r.get("description") or "",
        "imageUrl": r.get("image_url") or "",
        "isVisited": bool(r.get("is_visited")),
        "isLocked": bool(r.get("is_locked")),
        "isPlanBAlternative": bool(r.get("is_plan_b_alternative")),
        "hasPlanBReady": bool(r.get("has_plan_b_ready")),
        "planBAlternative": plan_b_alt
    }

def serialize_day(day_row, activities):
    """Serialize a database trip_day row into the React frontend DayItinerary shape."""
    r = dict(day_row)
    return {
        "dayNumber": r["day_number"],
        "dayOfWeek": r.get("day_of_week") or "Day",
        "dateStr": r["date_str"],
        "theme": r.get("theme") or f"Day {r['day_number']} Exploration",
        "weatherSummary": r.get("weather_summary") or "Optimal Weather",
        "temperature": r.get("temperature") or "26°C",
        "rainRisk": r.get("rain_risk") or 0,
        "weatherCondition": r.get("weather_condition") or "sunny",
        "weatherAlert": r.get("weather_alert"),
        "activities": activities
    }

def serialize_trip(trip_row, days=None):
    """Serialize a database trip row into the React frontend TripConfig and summary."""
    r = dict(trip_row)
    destinations = []
    if r.get("destinations_json"):
        try:
            destinations = json.loads(r["destinations_json"])
        except Exception:
            destinations = [r["destination"]]
    else:
        destinations = [d.strip() for d in r["destination"].split(",") if d.strip()]
        
    interests = []
    if r.get("interests_json"):
        try:
            interests = json.loads(r["interests_json"])
        except Exception:
            interests = [i.strip() for i in (r.get("travel_style") or "").split(",") if i.strip()]
    elif r.get("travel_style"):
        interests = [i.strip() for i in r["travel_style"].split(",") if i.strip()]

    result = {
        "id": r["id"],
        "destination": r["destination"],
        "destinations": destinations,
        "startDate": r["start_date"],
        "endDate": r["end_date"],
        "budgetTier": r["budget_tier"],
        "interests": interests,
        "travelerType": r.get("traveler_type") or "Couple",
        "pace": r.get("pace") or "Balanced",
        "weatherAdaptive": bool(r.get("weather_adaptive", 1)),
        "tagline": r.get("tagline") or f"{r.get('traveler_type', 'Travel')} Expedition in {r['destination'].split(',')[0]}",
        "isDomestic": bool(r.get("is_domestic", 1)),
        "createdAt": str(r.get("created_at") or "")
    }
    
    if days is not None:
        result["days"] = days
        
    return result
