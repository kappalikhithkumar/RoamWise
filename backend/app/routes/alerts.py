from flask import Blueprint, jsonify
from app.database import get_db

alerts_bp = Blueprint("alerts", __name__)

@alerts_bp.route("/alerts", methods=["GET"])
def get_alerts():
    """Retrieve live notification feed (matching Screen 10)."""
    # Sample real-time items corresponding to Stitch Screen 10 mock data
    alerts = [
        {
            "id": 1,
            "type": "weather",
            "category": "URGENT WEATHER",
            "title": "Rain Alert for Tomorrow (Day 2)",
            "message": "65% precipitation detected starting 2:00 PM in Arashiyama. Bamboo Grove and Tenryu-ji paths expected slippery.",
            "timeAgo": "12 mins ago",
            "unread": True,
            "hasPlanB": True
        },
        {
            "id": 2,
            "type": "plan",
            "category": "AI PLAN OPTIMIZATION",
            "title": "Crowd Alert at Fushimi Inari",
            "message": "Afternoon crowd surge detected (+80%). AI recommends switching your morning hike to 07:30 AM.",
            "timeAgo": "1 hour ago",
            "unread": True,
            "hasPlanB": False
        },
        {
            "id": 3,
            "type": "plan",
            "category": "SCHEDULE NOTICE",
            "title": "Nishiki Market Early Closure",
            "message": "Artisan knife shop closes at 4:30 PM today for inventory count. Added 35 min buffer.",
            "timeAgo": "3 hours ago",
            "unread": False,
            "hasPlanB": False
        }
    ]
    return jsonify({
        "alerts": alerts,
        "unreadCount": sum(1 for a in alerts if a["unread"])
    }), 200
