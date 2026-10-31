import sys
import os
import io
import json
import urllib.request
import urllib.parse
from datetime import datetime

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', write_through=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', write_through=True)
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.services.weather_service import WeatherService

svc = WeatherService()

DESTS = [
    "Visakhapatnam, India",
    "Hyderabad, India",
    "Araku Valley, Andhra Pradesh",
    "Hampi, Karnataka",
    "Paris, France",
    "Tokyo, Japan",
    "Hallstatt, Austria",
    "Pariss, Frannce",
    "Springfield",
    "Xyzqwert12345NonExistent"
]

print("================================================================================")
print("TESTING OPEN-METEO GEOCODING AND WEATHER FOR ALL DESTINATIONS")
print("================================================================================")

for d in DESTS:
    print(f"\n--- Destination: '{d}' ---")
    clean = d.split(",")[0].strip().lower()
    
    # 1. Test Geocoding directly via Open-Meteo API
    geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={urllib.parse.quote(clean)}&count=5&language=en&format=json"
    req = urllib.request.Request(geo_url, headers={"User-Agent": "RoamWise-Travel-Planner/1.0"})
    
    geo_success = False
    coords = None
    results = []
    
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            results = data.get("results", [])
            if results:
                geo_success = True
                coords = (float(results[0]["latitude"]), float(results[0]["longitude"]))
                print(f"  Geocoding: SUCCESS ({len(results)} matches returned)")
                for idx, r in enumerate(results[:3], 1):
                    print(f"    Match {idx}: {r.get('name')}, {r.get('admin1', '')}, {r.get('country', '')} -> ({r.get('latitude')}, {r.get('longitude')})")
            else:
                print(f"  Geocoding: NO RESULTS found for query '{clean}'")
    except Exception as e:
        print(f"  Geocoding: ERROR ({e})")
        
    # 2. Test Weather Service integration
    w = svc.get_weather(d)
    w_live = w.get("isLive", False)
    curr = w.get("current", {})
    w_temp = curr.get("temperature")
    w_cond = curr.get("condition")
    w_pop = curr.get("rainRisk")
    is_fallback = (coords == (20.5937, 78.9629) and "nagpur" not in d.lower())
    
    print(f"  Weather Integration: Live={w_live} | Coords={coords} {'[CENTRAL INDIA FALLBACK!]' if is_fallback else ''}")
    print(f"  Reported Temp: {w_temp}°C | Condition: {w_cond} | Rain Risk: {w_pop}%")
    print(f"  Hourly slots: {len(w.get('hourly', []))} | Alerts: {len(w.get('alerts', []))}")
    if is_fallback:
        print(f"  ⚠️ ISSUE: Destination '{d}' failed geocoding and silently used Central India coordinates!")
    if len(results) > 1 and d == "Springfield":
        print(f"  ⚠️ AMBIGUITY ISSUE: '{d}' matched {len(results)} distinct global places, but app silently picked Match 1 ({results[0].get('name')}, {results[0].get('admin1')}, {results[0].get('country')})!")
