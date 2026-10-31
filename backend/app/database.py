import sqlite3
from flask import g, current_app

def get_db():
    """Get or create SQLite database connection for current request context."""
    if "db" not in g:
        g.db = sqlite3.connect(
            current_app.config["DATABASE_PATH"],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    """Close the database connection at the end of the request."""
    db = g.pop("db", None)
    if db is not None:
        db.close()

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
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Daily itineraries table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS trip_days (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                trip_id INTEGER NOT NULL,
                day_number INTEGER NOT NULL,
                date_str TEXT NOT NULL,
                theme TEXT,
                weather_summary TEXT,
                temperature TEXT,
                rain_risk INTEGER DEFAULT 0,
                FOREIGN KEY (trip_id) REFERENCES trips (id) ON DELETE CASCADE
            );
        """)
        
        # Activities table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                day_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                time_slot TEXT NOT NULL,
                duration TEXT,
                cost TEXT,
                category TEXT,
                is_indoor INTEGER DEFAULT 0,
                weather_risk TEXT DEFAULT 'Low Risk',
                description TEXT,
                image_url TEXT,
                is_locked INTEGER DEFAULT 0,
                FOREIGN KEY (day_id) REFERENCES trip_days (id) ON DELETE CASCADE
            );
        """)
        
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
