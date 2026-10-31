import sys
import os
import io
import json
import urllib.request
import urllib.parse
from datetime import datetime, timedelta

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
sys.path.insert(0, os.path.join(os.path.dirname(__file__)))

from app.services.weather_service import WeatherService
from app.services.gemini_service import gemini_service

weather_svc = WeatherService()

DESTINATIONS = [
    {"name": "Visakhapatnam, India", "type": "Major Indian City", "dates": ("2026-11-20", "2026-11-22")},
    {"name": "Hyderabad, India", "type": "Major Metropolitan City", "dates": ("2026-11-20", "2026-11-22")},
    {"name": "Araku Valley, Andhra Pradesh", "type": "Smaller Tourist Destination", "dates": ("2026-11-20", "2026-11-22")},
    {"name": "Hampi, Karnataka", "type": "Heritage Destination", "dates": ("2026-11-20", "2026-11-22")},
    {"name": "Paris, France", "type": "International Metropolitan City", "dates": ("2026-11-20", "2026-11-22")},
    {"name": "Tokyo, Japan", "type": "International Destination", "dates": ("2026-11-20", "2026-11-22")},
    {"name": "Hallstatt, Austria", "type": "Smaller International Destination", "dates": ("2026-11-20", "2026-11-22")},
    {"name": "Visakhapatnam ➔ Araku Valley", "type": "Multi-Destination Circuit", "dates": ("2026-11-20", "2026-11-23"), "multistop": ["Visakhapatnam", "Araku Valley"]}
]

EDGE_CASES = [
    "Pariss, Frannce",            # Misspelled
    "Springfield",                # Ambiguous (50+ Springfields in USA)
    "Kailasagiri, Visakhapatnam", # Hyper-local attraction instead of city
    "Atlantis Deep Ocean",        # Non-existent / fictional
    "Xyzqwert12345NonExistent"    # Gibberish
]

print("================================================================================")
print("ROAMWISE UNIVERSAL DESTINATION INTELLIGENCE & VERIFICATION TEST")
print("================================================================================")

# -------------------------------------------------------------------------
# PART 1: GLOBAL WEATHER & GEOCODING AUDIT (Open-Meteo)
# -------------------------------------------------------------------------
print("\n--- PART 1: GLOBAL GEOCODING & WEATHER AUDIT (Open-Meteo) ---")
geocoding_results = {}

for dest in DESTINATIONS:
    dest_name = dest["name"]
    print(f"\nEvaluating: '{dest_name}' ({dest['type']})")
    
    # 1. Geocoding
    coords = weather_svc.get_coordinates(dest_name)
    is_preset = any(k in dest_name.lower() for k in weather_svc.get_coordinates.__code__.co_consts if isinstance(k, str))
    print(f"  Coordinates resolved: {coords}")
    
    # Check if it hit the default fallback (Nagpur central India: 20.5937, 78.9629)
    if coords == (20.5937, 78.9629) and "nagpur" not in dest_name.lower():
        geocoding_status = "FAILED (Fell back to default Central India 20.5937, 78.9629)"
    else:
        geocoding_status = "SUCCESS"
    print(f"  Geocoding Status: {geocoding_status}")
    
    # 2. Weather Fetch
    weather_data = weather_svc.get_weather(dest_name)
    is_live = weather_data.get("isLive", False)
    provider = weather_data.get("provider", "Unknown")
    temp = weather_data.get("currentTemp")
    condition = weather_data.get("condition")
    precip_risk = weather_data.get("precipitationRisk")
    daily_count = len(weather_data.get("dailyForecast", []))
    
    print(f"  Weather Provider: {provider} | Live: {is_live}")
    print(f"  Current: {temp}°C, {condition} | Rain Risk: {precip_risk}% | Daily Forecast Days: {daily_count}")
    
    geocoding_results[dest_name] = {
        "coords": coords,
        "geocoding_status": geocoding_status,
        "weather_live": is_live,
        "temp": temp,
        "condition": condition,
        "precip_risk": precip_risk
    }

print("\n--- Testing Edge Cases with Geocoding ---")
for edge in EDGE_CASES:
    coords = weather_svc.get_coordinates(edge)
    w = weather_svc.get_weather(edge)
    is_fallback = coords == (20.5937, 78.9629)
    print(f"Edge Case '{edge}' -> Coords: {coords} {'[SILENT FALLBACK TO CENTRAL INDIA!]' if is_fallback else '[GEOCODED]'}")

# -------------------------------------------------------------------------
# PART 2: GEMINI API GENERATION & FALLBACK AUDIT
# -------------------------------------------------------------------------
print("\n\n--- PART 2: ITINERARY GENERATION & LLM SOURCE AUDIT ---")
generation_results = {}

for dest in DESTINATIONS:
    dest_name = dest["name"]
    print(f"\n==================================================================")
    print(f"Testing Itinerary Generation for: {dest_name}")
    print(f"==================================================================")
    
    config = {
        "destination": dest_name,
        "destinations": dest.get("multistop", [dest_name]),
        "startDate": dest["dates"][0],
        "endDate": dest["dates"][1],
        "pace": "Balanced",
        "budgetTier": "Moderate",
        "travelerType": "Couple",
        "interests": ["Culture", "History", "Nature", "Food"]
    }
    
    t0 = datetime.now()
    res = gemini_service.generate_itinerary(config)
    dur = (datetime.now() - t0).total_seconds()
    
    source = res.get("generationSource", "unknown")
    fallback_reason = res.get("fallbackReason", "None")
    days = res.get("days", [])
    
    print(f"Generation Duration: {dur:.2f}s")
    print(f"Generation Source: {source}")
    print(f"Fallback Reason: {fallback_reason}")
    print(f"Tagline: {res.get('tagline')}")
    print(f"Days Generated: {len(days)}")
    
    activities_by_day = []
    all_titles = []
    
    for d in days:
        d_titles = [a["title"] for a in d["activities"]]
        activities_by_day.append(d_titles)
        all_titles.extend(d_titles)
        print(f"  Day {d['dayNumber']} ({d['theme']}):")
        for a in d["activities"]:
            print(f"    - {a['title']} ({a['category']}, {a['costDisplay']}) | Indoor: {a['isIndoor']} | Risk: {a['weatherRisk']} ({a['weatherRiskLabel']})")
    
    # Check for duplicate titles
    duplicates = len(all_titles) - len(set(all_titles))
    print(f"  Duplicate activities across days: {duplicates}")
    
    generation_results[dest_name] = {
        "source": source,
        "fallback_reason": fallback_reason,
        "days_count": len(days),
        "activities_count": len(all_titles),
        "duplicates": duplicates,
        "activities_sample": all_titles[:4]
    }

print("\n\nAll tests completed.")
