import os
import json
import logging
import urllib.request
import urllib.parse
from datetime import datetime, timezone
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

# WMO Weather interpretation codes
WMO_CODES = {
    0: ("Clear sky", "wb_sunny", "low"),
    1: ("Mainly clear", "wb_sunny", "low"),
    2: ("Partly cloudy", "partly_cloudy_day", "low"),
    3: ("Overcast", "cloud", "low"),
    45: ("Foggy", "foggy", "medium"),
    48: ("Depositing rime fog", "foggy", "medium"),
    51: ("Light drizzle", "grain", "medium"),
    53: ("Moderate drizzle", "grain", "medium"),
    55: ("Dense drizzle", "grain", "medium"),
    61: ("Slight rain", "rainy", "medium"),
    63: ("Moderate rain", "rainy", "high"),
    65: ("Heavy rain", "rainy", "high"),
    71: ("Slight snow", "ac_unit", "medium"),
    73: ("Moderate snow", "ac_unit", "high"),
    75: ("Heavy snow", "ac_unit", "high"),
    80: ("Rain showers", "rainy", "medium"),
    81: ("Moderate showers", "rainy", "high"),
    82: ("Violent showers", "thunderstorm", "high"),
    95: ("Thunderstorm", "thunderstorm", "high"),
    96: ("Thunderstorm with slight hail", "thunderstorm", "high"),
    99: ("Thunderstorm with heavy hail", "thunderstorm", "high")
}


class WeatherService:
    def __init__(self):
        self.provider_name = "Open-Meteo Weather API"
        self.timeout = 5  # seconds

    def get_coordinates(self, destination: str) -> Optional[Tuple[float, float]]:
        """Resolve latitude and longitude for Indian destination using destinations.resolver."""
        try:
            from app.services import destinations
            res = destinations.resolver.resolve(destination)
            if res.is_ok and res.destination:
                return float(res.destination.lat), float(res.destination.lon)
        except Exception as e:
            logger.warning(f"Destination resolution failed in weather service for '{destination}': {e}")

        return None

    def get_weather(self, destination: str) -> dict:
        """Fetch live weather from Open-Meteo or return clear unavailable response."""
        coords = self.get_coordinates(destination)
        if not coords:
            return self._generate_unresolved_location_response(destination)

        lat, lon = coords

        try:
            url = (
                f"https://api.open-meteo.com/v1/forecast?"
                f"latitude={lat}&longitude={lon}"
                f"&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
                f"&hourly=temperature_2m,precipitation_probability,weather_code"
                f"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max"
                f"&timezone=auto"
            )
            req = urllib.request.Request(url, headers={"User-Agent": "RoamWise-Travel-Planner/1.0"})
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                res = self._format_open_meteo_response(destination, data)
                res["latitude"] = lat
                res["longitude"] = lon
                res["geocodingSuccess"] = True
                return res
        except Exception as e:
            logger.warning(f"Live weather API unreachable for '{destination}' ({e}). Returning unavailable response.")
            return self._generate_unavailable_response(destination, lat, lon)

    def _generate_unresolved_location_response(self, destination: str) -> dict:
        return {
            "destination": destination,
            "provider": "RoamWise Geocoding Service",
            "isLive": False,
            "geocodingSuccess": False,
            "error": "Location not found",
            "summary": f"Could not determine geographic coordinates for '{destination}'.",
            "disclaimer": f"Could not determine geographic coordinates for '{destination}'. Destination must be a valid location in India.",
            "current": {
                "temperature": None,
                "condition": "Location Unresolved",
                "icon": "help",
                "uvIndex": None,
                "humidity": None,
                "wind": "N/A",
                "daylight": "N/A",
                "sunrise": "--",
                "sunset": "--",
                "rainRisk": 0
            },
            "alerts": [],
            "hourly": []
        }

    def _generate_unavailable_response(self, destination: str, lat: Optional[float] = None, lon: Optional[float] = None) -> dict:
        """Return clear 'Live weather temporarily unavailable' response with isLive=False and empty alerts."""
        return {
            "destination": destination,
            "provider": self.provider_name,
            "providerAttribution": "Weather data by Open-Meteo.com (CC-BY 4.0)",
            "isLive": False,
            "lastUpdated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "latitude": lat,
            "longitude": lon,
            "geocodingSuccess": lat is not None and lon is not None,
            "error": "Live weather temporarily unavailable",
            "summary": "Live weather temporarily unavailable",
            "disclaimer": "Live weather temporarily unavailable. Please verify network connectivity or try again later.",
            "current": {
                "temperature": None,
                "condition": "Unavailable",
                "icon": "cloud_off",
                "uvIndex": None,
                "humidity": None,
                "wind": "N/A",
                "daylight": "N/A",
                "sunrise": "--",
                "sunset": "--",
                "rainRisk": 0
            },
            "alerts": [],
            "hourly": []
        }

    def _format_open_meteo_response(self, destination: str, raw: dict) -> dict:
        curr = raw.get("current", {})
        daily = raw.get("daily", {})
        hourly = raw.get("hourly", {})

        weather_code = curr.get("weather_code", 0)
        cond_text, icon, risk_level = WMO_CODES.get(weather_code, ("Clear", "wb_sunny", "low"))
        temp = round(curr.get("temperature_2m", 24))
        humidity = round(curr.get("relative_humidity_2m", 50))
        wind_speed = curr.get("wind_speed_10m", 10)

        # Sunrise and sunset from daily[0]
        sunrise = "06:15 AM"
        sunset = "05:45 PM"
        uv_max = 5
        rain_max = 10
        if daily.get("sunrise") and len(daily["sunrise"]) > 0:
            try:
                sr_dt = datetime.fromisoformat(daily["sunrise"][0])
                sunrise = sr_dt.strftime("%I:%M %p")
            except Exception:
                pass
        if daily.get("sunset") and len(daily["sunset"]) > 0:
            try:
                ss_dt = datetime.fromisoformat(daily["sunset"][0])
                sunset = ss_dt.strftime("%I:%M %p")
            except Exception:
                pass
        if daily.get("uv_index_max") and len(daily["uv_index_max"]) > 0:
            uv_max = round(daily["uv_index_max"][0])
        if daily.get("precipitation_probability_max") and len(daily["precipitation_probability_max"]) > 0:
            rain_max = int(daily["precipitation_probability_max"][0] or 0)

        # Format 6-hour interval forecast
        hourly_forecast = []
        h_times = hourly.get("time", [])
        h_temps = hourly.get("temperature_2m", [])
        h_probs = hourly.get("precipitation_probability", [])
        h_codes = hourly.get("weather_code", [])

        # Sample every 2-3 hours for next 12 hours
        for i in range(0, min(len(h_times), 18), 3):
            try:
                t_dt = datetime.fromisoformat(h_times[i])
                time_label = t_dt.strftime("%I %p").lstrip("0")
                h_code = h_codes[i] if i < len(h_codes) else 0
                _, h_icon, _ = WMO_CODES.get(h_code, ("Clear", "wb_sunny", "low"))
                hourly_forecast.append({
                    "time": time_label,
                    "temp": round(h_temps[i]) if i < len(h_temps) else temp,
                    "rainRisk": int(h_probs[i]) if i < len(h_probs) else 0,
                    "icon": h_icon
                })
            except Exception:
                continue

        # Formulate alerts if rain risk is high
        alerts = []
        if rain_max >= 45:
            alerts.append({
                "id": f"alert-weather-{int(datetime.now().timestamp())}",
                "type": "rain_front",
                "title": f"Afternoon Precipitation Advisory ({rain_max}%)",
                "time": "Today 02:00 PM – 05:00 PM",
                "description": f"Forecast indicates {cond_text.lower()} with rain risk rising to {rain_max}%. Sheltered Plan B alternatives prepared for outdoor stops.",
                "planBReady": True
            })

        return {
            "destination": destination,
            "provider": self.provider_name,
            "providerAttribution": "Weather data by Open-Meteo.com (CC-BY 4.0)",
            "isLive": True,
            "lastUpdated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC"),
            "summary": f"{temp}°C • {cond_text}",
            "current": {
                "temperature": temp,
                "condition": cond_text,
                "icon": icon,
                "uvIndex": uv_max,
                "humidity": humidity,
                "wind": f"{wind_speed} km/h",
                "daylight": "11h 30m",
                "sunrise": sunrise,
                "sunset": sunset,
                "rainRisk": rain_max
            },
            "alerts": alerts,
            "hourly": hourly_forecast[:6]
        }


weather_service = WeatherService()
