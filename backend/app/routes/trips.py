import json
from flask import Blueprint, jsonify, request
from app.database import get_db, serialize_trip, serialize_day, serialize_activity

trips_bp = Blueprint("trips", __name__)

@trips_bp.route("/trips", methods=["GET"])
def list_trips():
    """List all saved itineraries with summary metrics."""
    db = get_db()
    rows = db.execute("SELECT * FROM trips ORDER BY created_at DESC").fetchall()
    
    trips = []
    for r in rows:
        trip_dict = serialize_trip(r)
        
        # Get day count for summary
        day_count_row = db.execute(
            "SELECT count(*) as count FROM trip_days WHERE trip_id = ?",
            (r["id"],)
        ).fetchone()
        day_count = day_count_row["count"] if day_count_row else 0
        
        trip_dict["dayCount"] = day_count
        trip_dict["status"] = "upcoming"
        trips.append(trip_dict)
        
    return jsonify({"trips": trips}), 200

@trips_bp.route("/trips", methods=["POST"])
def create_trip():
    """Save a new trip, its configuration, and its complete day schedule and activities."""
    data = request.get_json() or {}
    
    destination = data.get("destination", "Jaipur ➔ Delhi ➔ Agra")
    destinations = data.get("destinations", [destination])
    start_date = data.get("startDate", "2025-10-18")
    end_date = data.get("endDate", "2025-10-24")
    budget_tier = data.get("budgetTier", "Moderate")
    interests = data.get("interests", ["Culture", "Food", "History"])
    traveler_type = data.get("travelerType", "Couple")
    pace = data.get("pace", "Balanced")
    weather_adaptive = 1 if data.get("weatherAdaptive", True) else 0
    tagline = data.get("tagline", f"{traveler_type} Expedition across {destination}")
    is_domestic = 1 if data.get("isDomestic", True) else 0
    
    days_data = data.get("days", [])
    
    db = get_db()
    cursor = db.cursor()
    
    cursor.execute("""
        INSERT INTO trips (
            destination, start_date, end_date, budget_tier, travel_style,
            traveler_type, pace, weather_adaptive, tagline,
            destinations_json, interests_json, is_domestic
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        destination,
        start_date,
        end_date,
        budget_tier,
        ", ".join(interests) if isinstance(interests, list) else str(interests),
        traveler_type,
        pace,
        weather_adaptive,
        tagline,
        json.dumps(destinations),
        json.dumps(interests),
        is_domestic
    ))
    
    trip_id = cursor.lastrowid
    
    # Save days and activities if provided
    saved_days = []
    for day in days_data:
        day_number = day.get("dayNumber", 1)
        day_of_week = day.get("dayOfWeek", "Day")
        date_str = day.get("dateStr", start_date)
        theme = day.get("theme", "")
        weather_summary = day.get("weatherSummary", "Sunny")
        temperature = day.get("temperature", "26°C")
        rain_risk = int(day.get("rainRisk", 0))
        weather_condition = day.get("weatherCondition", "sunny")
        weather_alert = day.get("weatherAlert")
        
        cursor.execute("""
            INSERT INTO trip_days (
                trip_id, day_number, day_of_week, date_str, theme,
                weather_summary, temperature, rain_risk, weather_condition, weather_alert
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            trip_id, day_number, day_of_week, date_str, theme,
            weather_summary, temperature, rain_risk, weather_condition, weather_alert
        ))
        day_id = cursor.lastrowid
        
        saved_activities = []
        for act in day.get("activities", []):
            activity_key = act.get("id", f"act-{day_number}-{len(saved_activities) + 1}")
            title = act.get("title", "Activity")
            time_slot = act.get("timeSlot", "10:00 AM")
            period = act.get("period", "morning")
            duration = act.get("duration", "2h")
            cost = int(act.get("cost", 0)) if str(act.get("cost", "")).isdigit() else 0
            cost_display = act.get("costDisplay", f"₹{cost}")
            category = act.get("category", "Culture")
            location = act.get("location", "Heritage Area")
            is_indoor = 1 if act.get("isIndoor") else 0
            weather_risk = act.get("weatherRisk", "low")
            weather_risk_label = act.get("weatherRiskLabel", "☀️ Low Risk")
            description = act.get("description", "")
            image_url = act.get("imageUrl", "")
            is_visited = 1 if act.get("isVisited") else 0
            is_locked = 1 if act.get("isLocked") else 0
            is_plan_b_alternative = 1 if act.get("isPlanBAlternative") else 0
            has_plan_b_ready = 1 if act.get("hasPlanBReady") else 0
            
            plan_b_alt_json = None
            if act.get("planBAlternative"):
                plan_b_alt_json = json.dumps(act["planBAlternative"])
                
            cursor.execute("""
                INSERT INTO activities (
                    day_id, activity_key, title, time_slot, period, duration,
                    cost, cost_display, category, location, is_indoor,
                    weather_risk, weather_risk_label, description, image_url,
                    is_visited, is_locked, is_plan_b_alternative, has_plan_b_ready,
                    plan_b_alternative_json
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                day_id, activity_key, title, time_slot, period, duration,
                cost, cost_display, category, location, is_indoor,
                weather_risk, weather_risk_label, description, image_url,
                is_visited, is_locked, is_plan_b_alternative, has_plan_b_ready,
                plan_b_alt_json
            ))
            
            act_id = cursor.lastrowid
            saved_activities.append({
                **act,
                "id": activity_key,
                "dbId": act_id
            })
            
        saved_days.append({
            **day,
            "id": day_id,
            "activities": saved_activities
        })
        
    db.commit()
    
    trip_row = db.execute("SELECT * FROM trips WHERE id = ?", (trip_id,)).fetchone()
    trip_result = serialize_trip(trip_row, saved_days if saved_days else None)
    
    return jsonify({
        "message": "Trip saved successfully",
        "tripId": trip_id,
        "trip": trip_result
    }), 201

@trips_bp.route("/trips/<int:trip_id>", methods=["GET"])
def get_trip(trip_id):
    """Retrieve full trip overview with daily breakdowns and activities."""
    db = get_db()
    trip_row = db.execute("SELECT * FROM trips WHERE id = ?", (trip_id,)).fetchone()
    if not trip_row:
        return jsonify({"error": "Trip not found"}), 404
        
    day_rows = db.execute(
        "SELECT * FROM trip_days WHERE trip_id = ? ORDER BY day_number ASC",
        (trip_id,)
    ).fetchall()
    
    days = []
    for d in day_rows:
        act_rows = db.execute(
            "SELECT * FROM activities WHERE day_id = ? ORDER BY id ASC",
            (d["id"],)
        ).fetchall()
        activities = [serialize_activity(a) for a in act_rows]
        days.append(serialize_day(d, activities))
        
    trip_data = serialize_trip(trip_row, days)
    return jsonify({
        **trip_data,
        "trip": trip_data,
        "days": days,
        "message": "Trip updated successfully"
    }), 200

@trips_bp.route("/trips/<int:trip_id>", methods=["PUT"])
def update_trip(trip_id):
    """Update trip configuration, activity visited status, or entire itinerary."""
    db = get_db()
    cursor = db.cursor()
    
    trip_row = db.execute("SELECT * FROM trips WHERE id = ?", (trip_id,)).fetchone()
    if not trip_row:
        return jsonify({"error": "Trip not found"}), 404
        
    data = request.get_json() or {}
    
    # 1. Update trip-level fields if provided
    updates = []
    params = []
    if "destination" in data:
        updates.append("destination = ?")
        params.append(data["destination"])
    if "destinations" in data:
        updates.append("destinations_json = ?")
        params.append(json.dumps(data["destinations"]))
    if "startDate" in data:
        updates.append("start_date = ?")
        params.append(data["startDate"])
    if "endDate" in data:
        updates.append("end_date = ?")
        params.append(data["endDate"])
    if "budgetTier" in data:
        updates.append("budget_tier = ?")
        params.append(data["budgetTier"])
    if "pace" in data:
        updates.append("pace = ?")
        params.append(data["pace"])
    if "tagline" in data:
        updates.append("tagline = ?")
        params.append(data["tagline"])
        
    if updates:
        params.append(trip_id)
        cursor.execute(f"UPDATE trips SET {', '.join(updates)} WHERE id = ?", params)
        
    # 2. Update days / activities if provided
    if "days" in data:
        for day in data["days"]:
            day_number = day.get("dayNumber")
            if not day_number:
                continue
                
            day_row = db.execute(
                "SELECT id FROM trip_days WHERE trip_id = ? AND day_number = ?",
                (trip_id, day_number)
            ).fetchone()
            
            if day_row:
                day_id = day_row["id"]
                cursor.execute("""
                    UPDATE trip_days
                    SET theme = ?, weather_summary = ?, weather_alert = ?
                    WHERE id = ?
                """, (
                    day.get("theme", ""),
                    day.get("weatherSummary", ""),
                    day.get("weatherAlert"),
                    day_id
                ))
            else:
                cursor.execute("""
                    INSERT INTO trip_days (
                        trip_id, day_number, day_of_week, date_str, theme,
                        weather_summary, temperature, rain_risk, weather_condition
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    trip_id, day_number, day.get("dayOfWeek", "Day"),
                    day.get("dateStr", ""), day.get("theme", ""),
                    day.get("weatherSummary", "Sunny"), day.get("temperature", "26°C"),
                    int(day.get("rainRisk", 0)), day.get("weatherCondition", "sunny")
                ))
                day_id = cursor.lastrowid
                
            if "activities" in day:
                cursor.execute("DELETE FROM activities WHERE day_id = ?", (day_id,))
                for act in day.get("activities", []):
                    act_key = act.get("id") or f"act-{day_number}-{Date.now() if 'Date' in locals() else 'new'}"
                    is_visited = 1 if act.get("isVisited") else 0
                    is_plan_b = 1 if act.get("isPlanBAlternative") else 0
                    has_plan_b = 1 if act.get("hasPlanBReady") else 0
                    is_locked = 1 if act.get("isLocked") else 0

                    plan_b_alt_json = None
                    if act.get("planBAlternative"):
                        plan_b_alt_json = json.dumps(act["planBAlternative"])

                    cost_val = act.get("cost", 0)
                    cost = int(cost_val) if str(cost_val).isdigit() else 0

                    cursor.execute("""
                        INSERT INTO activities (
                            day_id, activity_key, title, time_slot, period, duration,
                            cost, cost_display, category, location, is_indoor,
                            weather_risk, weather_risk_label, description, image_url,
                            is_visited, is_locked, is_plan_b_alternative, has_plan_b_ready,
                            plan_b_alternative_json
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        day_id, act_key,
                        act.get("title", "Activity"),
                        act.get("timeSlot", "10:00 AM"),
                        act.get("period", "morning"),
                        act.get("duration", "2h"),
                        cost,
                        act.get("costDisplay", f"₹{cost}"),
                        act.get("category", "Culture"),
                        act.get("location", ""),
                        1 if act.get("isIndoor") else 0,
                        act.get("weatherRisk", "low"),
                        act.get("weatherRiskLabel", "☀️ Low Risk"),
                        act.get("description", ""),
                        act.get("imageUrl", ""),
                        is_visited,
                        is_locked,
                        is_plan_b,
                        has_plan_b,
                        plan_b_alt_json
                    ))
                    
    db.commit()
    
    # Return updated trip
    return get_trip(trip_id)

@trips_bp.route("/trips/<int:trip_id>", methods=["DELETE"])
def delete_trip(trip_id):
    """Delete a trip and cascade delete its days and activities."""
    db = get_db()
    cursor = db.cursor()
    row = cursor.execute("SELECT id FROM trips WHERE id = ?", (trip_id,)).fetchone()
    if not row:
        return jsonify({"error": "Trip not found"}), 404

    day_rows = cursor.execute("SELECT id FROM trip_days WHERE trip_id = ?", (trip_id,)).fetchall()
    day_ids = [d["id"] for d in day_rows]
    if day_ids:
        placeholders = ",".join("?" * len(day_ids))
        cursor.execute(f"DELETE FROM activities WHERE day_id IN ({placeholders})", day_ids)
        cursor.execute("DELETE FROM trip_days WHERE trip_id = ?", (trip_id,))

    cursor.execute("DELETE FROM trips WHERE id = ?", (trip_id,))
    db.commit()
    return jsonify({"message": f"Trip {trip_id} deleted successfully", "success": True}), 200
