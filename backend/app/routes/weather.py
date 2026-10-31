from flask import Blueprint, jsonify
from app.services.weather_service import weather_service

weather_bp = Blueprint("weather", __name__)

@weather_bp.route("/weather/<destination>", methods=["GET"])
def get_destination_weather(destination):
    """Return atmospheric forecast, real weather metrics, and Plan B advisories."""
    result = weather_service.get_weather(destination)
    return jsonify(result), 200
