from app.routes.health import health_bp
from app.routes.trips import trips_bp
from app.routes.weather import weather_bp
from app.routes.alerts import alerts_bp

__all__ = ["health_bp", "trips_bp", "weather_bp", "alerts_bp"]
