from flask import Blueprint, jsonify
from app.database import get_db

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    try:
        db = get_db()
        db.execute("SELECT 1").fetchone()
        return jsonify({
            "status": "healthy",
            "service": "RoamWise AI Travel Planner API",
            "version": "1.0.0",
            "database": "connected"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "service": "RoamWise AI Travel Planner API",
            "version": "1.0.0",
            "database": "disconnected",
            "error": str(e)
        }), 503
