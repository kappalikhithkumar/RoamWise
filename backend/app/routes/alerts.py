from flask import Blueprint, jsonify

alerts_bp = Blueprint("alerts", __name__)

@alerts_bp.route("/alerts", methods=["GET"])
def get_alerts():
    """Retrieve notification feed."""
    return jsonify({
        "alerts": [],
        "unreadCount": 0
    }), 200
