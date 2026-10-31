"""
RoamWise WSGI Production Entry Point.
Use with Gunicorn (Linux/macOS) or Waitress (Windows):
    gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app
    waitress-serve --port=5000 wsgi:app
"""
import os
from app import create_app
from app.config import Config

class ProductionConfig(Config):
    DEBUG = False
    SECRET_KEY = os.getenv("SECRET_KEY", "roamwise-prod-key-replace-in-env")

app = create_app(ProductionConfig)

if __name__ == "__main__":
    app.run()
