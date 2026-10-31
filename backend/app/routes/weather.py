from flask import Blueprint, jsonify

weather_bp = Blueprint("weather", __name__)

@weather_bp.route("/weather/<destination>", methods=["GET"])
def get_destination_weather(destination):
    """Return atmospheric forecast and microclimate sensors for destination (matching Screen 5)."""
    return jsonify({
        "destination": destination,
        "current": {
            "temperature": 22,
            "condition": "Mostly Sunny",
            "uvIndex": 3,
            "humidity": 58,
            "wind": "9 km/h NNE",
            "daylight": "11h 21m",
            "sunrise": "06:01 AM",
            "sunset": "05:22 PM"
        },
        "alerts": [
            {
                "id": "alert-front-01",
                "type": "rain_front",
                "title": "Front Approaching",
                "time": "Tomorrow 2:00 PM",
                "description": "Rain risk spikes to 65% in Arashiyama. Covered alternative structured.",
                "planBReady": True
            }
        ],
        "hourly": [
            {"time": "10 AM", "temp": 22, "rainRisk": 0, "icon": "wb_sunny"},
            {"time": "12 PM", "temp": 24, "rainRisk": 10, "icon": "cloud"},
            {"time": "2 PM", "temp": 23, "rainRisk": 45, "icon": "grain"},
            {"time": "4 PM", "temp": 20, "rainRisk": 65, "icon": "rainy"},
            {"time": "6 PM", "temp": 18, "rainRisk": 30, "icon": "weather_mix"},
            {"time": "8 PM", "temp": 17, "rainRisk": 5, "icon": "clear_night"}
        ]
    }), 200
