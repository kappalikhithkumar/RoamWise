from flask import Blueprint, jsonify, request
from app.database import get_db

trips_bp = Blueprint("trips", __name__)

@trips_bp.route("/trips", methods=["GET"])
def list_trips():
    """List all saved itineraries."""
    db = get_db()
    rows = db.execute("SELECT * FROM trips ORDER BY created_at DESC").fetchall()
    trips = [dict(r) for r in rows]
    return jsonify({"trips": trips}), 200

@trips_bp.route("/trips", methods=["POST"])
def create_trip():
    """Initialize a new trip from Screen 1 form inputs."""
    data = request.get_json() or {}
    destination = data.get("destination", "Kyoto, Japan")
    start_date = data.get("startDate", "2025-10-14")
    end_date = data.get("endDate", "2025-10-18")
    budget_tier = data.get("budgetTier", "Moderate")
    travel_style = ",".join(data.get("travelStyles", ["Culture", "Food", "Nature"]))
    traveler_type = data.get("travelerType", "Solo")
    pace = data.get("pace", "balanced")
    
    db = get_db()
    cursor = db.cursor()
    cursor.execute("""
        INSERT INTO trips (destination, start_date, end_date, budget_tier, travel_style, traveler_type, pace)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (destination, start_date, end_date, budget_tier, travel_style, traveler_type, pace))
    trip_id = cursor.lastrowid
    db.commit()
    
    return jsonify({
        "message": "Trip created successfully",
        "tripId": trip_id,
        "destination": destination
    }), 201

@trips_bp.route("/trips/<int:trip_id>", methods=["GET"])
def get_trip(trip_id):
    """Retrieve full trip overview with daily breakdowns."""
    db = get_db()
    trip = db.execute("SELECT * FROM trips WHERE id = ?", (trip_id,)).fetchone()
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
        
    days = db.execute("SELECT * FROM trip_days WHERE trip_id = ? ORDER BY day_number ASC", (trip_id,)).fetchall()
    return jsonify({
        "trip": dict(trip),
        "days": [dict(d) for d in days]
    }), 200
