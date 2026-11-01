import sys
import os
import unittest
from unittest.mock import patch
import urllib.error

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__))))

from app.services import weather_service as ws_module
from app.services.weather_service import weather_service, WeatherService


class TestWeatherServiceUpdates(unittest.TestCase):
    def test_preset_coordinates_removed(self):
        """Verify PRESET_COORDINATES dictionary is completely removed."""
        self.assertFalse(hasattr(ws_module, "PRESET_COORDINATES"))

    def test_simulated_fallback_removed(self):
        """Verify _generate_simulated_fallback is completely deleted."""
        self.assertFalse(hasattr(weather_service, "_generate_simulated_fallback"))

    def test_coordinates_from_destination_resolver(self):
        """Verify coordinates resolution strictly uses destinations.resolver."""
        # Indian destinations
        jaipur_coords = weather_service.get_coordinates("Jaipur")
        self.assertIsNotNone(jaipur_coords)
        self.assertAlmostEqual(jaipur_coords[0], 26.9124, places=2)
        self.assertAlmostEqual(jaipur_coords[1], 75.7873, places=2)

        # Aliases
        vizag_coords = weather_service.get_coordinates("vizag")
        self.assertIsNotNone(vizag_coords)
        self.assertAlmostEqual(vizag_coords[0], 17.6868, places=2)
        self.assertAlmostEqual(vizag_coords[1], 83.2185, places=2)

        bengaluru_coords = weather_service.get_coordinates("bengaluru")
        self.assertIsNotNone(bengaluru_coords)
        self.assertAlmostEqual(bengaluru_coords[0], 12.9716, places=2)

        # International destinations must resolve to None
        paris_coords = weather_service.get_coordinates("Paris, France")
        self.assertIsNone(paris_coords)

        tokyo_coords = weather_service.get_coordinates("Tokyo, Japan")
        self.assertIsNone(tokyo_coords)

        gibberish_coords = weather_service.get_coordinates("XyzUnknownPlace12345")
        self.assertIsNone(gibberish_coords)

    def test_open_meteo_unreachable_returns_unavailable_response(self):
        """When Open-Meteo is unreachable, return isLive=False, alerts=[], and clear message."""
        with patch("urllib.request.urlopen", side_effect=urllib.error.URLError("Network unreachable")):
            res = weather_service.get_weather("Jaipur")
            self.assertFalse(res["isLive"])
            self.assertEqual(res["alerts"], [])
            self.assertEqual(res["error"], "Live weather temporarily unavailable")
            self.assertEqual(res["summary"], "Live weather temporarily unavailable")
            self.assertIn("Live weather temporarily unavailable", res["disclaimer"])
            self.assertIsNone(res["current"]["temperature"])
            self.assertEqual(res["current"]["condition"], "Unavailable")
            self.assertEqual(res["hourly"], [])

    def test_unresolved_location_returns_empty_alerts(self):
        """When destination cannot be resolved in India, return isLive=False, alerts=[]."""
        res = weather_service.get_weather("Paris, France")
        self.assertFalse(res["isLive"])
        self.assertEqual(res["alerts"], [])
        self.assertEqual(res["error"], "Location not found")
        self.assertEqual(res["hourly"], [])

    def test_live_weather_response_structure_when_successful(self):
        """When live weather fetch succeeds, verify expected payload structure."""
        fake_payload = {
            "current": {
                "temperature_2m": 28.5,
                "relative_humidity_2m": 45,
                "weather_code": 0,
                "wind_speed_10m": 12.0
            },
            "daily": {
                "sunrise": ["2026-11-01T06:15"],
                "sunset": ["2026-11-01T17:45"],
                "uv_index_max": [6.0],
                "precipitation_probability_max": [10]
            },
            "hourly": {
                "time": ["2026-11-01T06:00", "2026-11-01T09:00"],
                "temperature_2m": [22.0, 27.0],
                "precipitation_probability": [0, 5],
                "weather_code": [0, 0]
            }
        }

        class MockResponse:
            def __enter__(self):
                return self
            def __exit__(self, *args):
                pass
            def read(self):
                import json
                return json.dumps(fake_payload).encode("utf-8")

        with patch("urllib.request.urlopen", return_value=MockResponse()):
            res = weather_service.get_weather("Jaipur")
            self.assertTrue(res["isLive"])
            self.assertEqual(res["destination"], "Jaipur")
            self.assertEqual(res["current"]["temperature"], 28)
            self.assertEqual(res["current"]["condition"], "Clear sky")
            self.assertEqual(res["alerts"], [])  # rain_max = 10 < 45, so alerts empty


if __name__ == "__main__":
    unittest.main()
