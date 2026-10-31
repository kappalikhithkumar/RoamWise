import os
import json
import logging
import socket
import urllib.request
import urllib.parse
from datetime import datetime

# Enforce fast socket connect timeout so offline or firewalled environments don't hang
socket.setdefaulttimeout(2.5)

logger = logging.getLogger(__name__)

# Known geographic coordinates for premier destinations
PRESET_COORDINATES = {
    "hyderabad": (17.3850, 78.4867),
    "visakhapatnam": (17.6868, 83.2185),
    "vizag": (17.6868, 83.2185),
    "jaipur": (26.9124, 75.7873),
    "delhi": (28.6139, 77.2090),
    "agra": (27.1767, 78.0081),
    "goa": (15.2993, 74.1240),
    "munnar": (10.0889, 77.0595),
    "kerala": (9.9312, 76.2673),
    "varanasi": (25.3176, 82.9739),
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "mumbai": (19.0760, 72.8777),
    "manali": (32.2432, 77.1892),
    "shimla": (31.1048, 77.1734),
    "srinagar": (34.0837, 74.7973),
    "udaipur": (24.5854, 73.7125),
    "amritsar": (31.6340, 74.8723),
    "rishikesh": (30.0869, 78.2676),
    "kyoto": (35.0116, 135.7681),
    "tokyo": (35.6762, 139.6503)
}

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

    def get_coordinates(self, destination: str):
        """Resolve latitude and longitude for destination."""
        clean_name = destination.split(",")[0].strip().lower()
        for key, coords in PRESET_COORDINATES.items():
            if key in clean_name or clean_name in key:
                return coords

        # Try Open-Meteo Geocoding API if not in preset
        try:
            url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(clean_name)}&count=5&language=en&format=json"
            req = urllib.request.Request(url, headers={"User-Agent": "RoamWise-Travel-Planner/1.0"})
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if "results" in data and len(data["results"]) > 0:
                    r = data["results"][0]
                    return float(r["latitude"]), float(r["longitude"])
        except Exception as e:
            logger.info(f"Geocoding lookup bypassed for {destination}: {e}")

        # Return None if location is unresolvable rather than silently faking coordinates
        return None

    def get_weather(self, destination: str) -> dict:
        """Fetch live weather from Open-Meteo or return clearly labelled fallback."""
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
            logger.info(f"Live weather API unreachable ({e}). Using labelled microclimate simulation.")
            fallback = self._generate_simulated_fallback(destination, lat, lon)
            fallback["latitude"] = lat
            fallback["longitude"] = lon
            fallback["geocodingSuccess"] = True
            return fallback

    def _generate_unresolved_location_response(self, destination: str) -> dict:
        return {
            "destination": destination,
            "provider": "RoamWise Geocoding Service",
            "isLive": False,
            "geocodingSuccess": False,
            "error": "Location not found",
            "disclaimer": f"Could not determine geographic coordinates for '{destination}'. Please check spelling or specify city and country.",
            "current": {
                "temperature": 25,
                "condition": "Location Unresolved",
                "rainRisk": 0,
                "humidity": 50,
                "wind": "0 km/h",
                "daylight": "12h",
                "sunrise": "06:00 AM",
                "sunset": "06:00 PM",
                "icon": "help"
            },
            "alerts": [{
                "id": "alert-unresolved-loc",
                "type": "weather",
                "title": f"Unresolved Location: '{destination}'",
                "time": "Now",
                "description": f"Could not verify geographic coordinates for '{destination}'. Live weather forecasts cannot be fetched automatically.",
                "planBReady": False
            }],
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
            "lastUpdated": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
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
            "hourly": hourly_forecast[:6] if hourly_forecast else [
                {"time": "10 AM", "temp": temp, "rainRisk": rain_max // 2, "icon": "wb_sunny"},
                {"time": "01 PM", "temp": temp + 2, "rainRisk": rain_max, "icon": icon},
                {"time": "04 PM", "temp": temp + 1, "rainRisk": rain_max, "icon": icon},
                {"time": "07 PM", "temp": temp - 2, "rainRisk": rain_max // 3, "icon": "wb_sunny"}
            ]
        }

    def _generate_simulated_fallback(self, destination: str, lat: float, lon: float) -> dict:
        """Labelled microclimate fallback forecast when live provider is offline."""
        now = datetime.now()
        clean = destination.split(",")[0].strip()

        # Deterministic variation based on destination letters
        char_sum = sum(ord(c) for c in clean)
        base_temp = 22 + (char_sum % 8)  # 22 - 29 C
        base_rain = (char_sum * 7) % 65  # 0 - 64%

        cond = "Sunny & Pleasant" if base_rain < 30 else ("Partly Cloudy" if base_rain < 50 else "Passing Showers")
        icon = "wb_sunny" if base_rain < 30 else ("partly_cloudy_day" if base_rain < 50 else "rainy")

        alerts = []
        if base_rain >= 40:
            alerts.append({
                "id": "alert-simulated-01",
                "type": "rain_front",
                "title": f"Precipitation Warning ({base_rain}% Estimated)",
                "time": "Afternoon Window",
                "description": f"Microclimate simulation indicates {cond.lower()} in {clean}. Sheltered indoor alternatives recommended for outdoor trails.",
                "planBReady": True
            })

        return {
            "destination": destination,
            "provider": "RoamWise Microclimate Engine (Offline Fallback)",
            "providerAttribution": "Offline fallback simulation. Connect to live network for Open-Meteo forecast.",
            "isLive": False,
            "disclaimer": "Simulated forecast. Live weather API currently offline.",
            "lastUpdated": now.strftime("%Y-%m-%d %H:%M:%S Local"),
            "current": {
                "temperature": base_temp,
                "condition": cond,
                "icon": icon,
                "uvIndex": 4,
                "humidity": 55,
                "wind": "11 km/h NE",
                "daylight": "11h 24m",
                "sunrise": "06:18 AM",
                "sunset": "05:42 PM",
                "rainRisk": base_rain
            },
            "alerts": alerts,
            "hourly": [
                {"time": "09 AM", "temp": base_temp - 2, "rainRisk": max(0, base_rain - 15), "icon": "wb_sunny"},
                {"time": "12 PM", "temp": base_temp + 1, "rainRisk": base_rain, "icon": icon},
                {"time": "03 PM", "temp": base_temp, "rainRisk": base_rain, "icon": icon},
                {"time": "06 PM", "temp": base_temp - 3, "rainRisk": max(0, base_rain - 20), "icon": "partly_cloudy_day"},
                {"time": "09 PM", "temp": base_temp - 5, "rainRisk": 5, "icon": "clear_night"}
            ]
        }


weather_service = WeatherService()
