from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.database import close_db, init_db
from app.routes.health import health_bp
from app.routes.trips import trips_bp
from app.routes.weather import weather_bp
from app.routes.alerts import alerts_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for frontend dev server
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Teardown database connections
    app.teardown_appcontext(close_db)
    
    # Initialize DB tables
    init_db(app)
    
    # Register blueprints with /api prefix
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(trips_bp, url_prefix="/api")
    app.register_blueprint(weather_bp, url_prefix="/api")
    app.register_blueprint(alerts_bp, url_prefix="/api")
    
    return app
