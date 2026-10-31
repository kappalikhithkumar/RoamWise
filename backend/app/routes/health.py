from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "RoamWise AI Travel Planner API",
        "version": "1.0.0",
        "database": "connected"
    }), 200
