import os
import sys
import io
import json
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', write_through=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', write_through=True)

from google import genai
from google.genai import types

api_key = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=api_key)
model_name = "gemini-3.5-flash-lite"

TEST_CASES = [
    {
        "name": "Visakhapatnam, India",
        "category": "Major Indian City",
        "destinations": ["Visakhapatnam, Andhra Pradesh"],
        "pace": "Balanced",
        "budget": "Moderate",
        "traveler": "Couple",
        "interests": ["Culture", "History", "Nature"]
    },
    {
        "name": "Hyderabad, India",
        "category": "Major Metropolitan City",
        "destinations": ["Hyderabad, Telangana"],
        "pace": "Relaxed",
        "budget": "Budget-friendly",
        "traveler": "Friends",
        "interests": ["Food", "History", "Culture"]
    },
    {
        "name": "Araku Valley, Andhra Pradesh",
        "category": "Smaller Tourist Destination",
        "destinations": ["Araku Valley, Andhra Pradesh"],
        "pace": "Balanced",
        "budget": "Moderate",
        "traveler": "Family",
        "interests": ["Nature", "Adventure", "Culture"]
    },
    {
        "name": "Hampi, Karnataka",
        "category": "Heritage Destination",
        "destinations": ["Hampi, Karnataka"],
        "pace": "Packed",
        "budget": "Moderate",
        "traveler": "Solo",
        "interests": ["History", "Culture", "Spiritual"]
    },
    {
        "name": "Paris, France",
        "category": "International Metropolitan City",
        "destinations": ["Paris, France"],
        "pace": "Balanced",
        "budget": "Premium",
        "traveler": "Couple",
        "interests": ["Culture", "Food", "History"]
    },
    {
        "name": "Tokyo, Japan",
        "category": "International Destination",
        "destinations": ["Tokyo, Japan"],
        "pace": "Packed",
        "budget": "Moderate",
        "traveler": "Friends",
        "interests": ["Culture", "Shopping", "Food"]
    },
    {
        "name": "Hallstatt, Austria",
        "category": "Smaller International Destination",
        "destinations": ["Hallstatt, Salzkammergut, Austria"],
        "pace": "Relaxed",
        "budget": "Moderate",
        "traveler": "Couple",
        "interests": ["Nature", "Relaxation", "History"]
    },
    {
        "name": "Visakhapatnam ➔ Araku Valley",
        "category": "Multi-Destination Circuit",
        "destinations": ["Visakhapatnam, Andhra Pradesh", "Araku Valley, Andhra Pradesh"],
        "pace": "Balanced",
        "budget": "Moderate",
        "traveler": "Friends",
        "interests": ["Nature", "Culture", "Adventure"]
    }
]

print("================================================================================")
print(f"TESTING REAL GEMINI GENERATION ({model_name}) ACROSS 8 DESTINATIONS")
print("================================================================================")

results = []

for idx, tc in enumerate(TEST_CASES, 1):
    dest = tc["name"]
    print(f"\n[{idx}/8] Testing: {dest} ({tc['category']})")
    print(f"      Pace: {tc['pace']} | Budget: {tc['budget']} | Traveler: {tc['traveler']} | Interests: {tc['interests']}")
    
    prompt = f"""
You are RoamWise AI, an expert adaptive travel planner.
Create a personalized 2-day travel itinerary for {dest}.
Destinations included: {', '.join(tc['destinations'])}.
Traveler Type: {tc['traveler']}
Travel Pace: {tc['pace']} (Relaxed: 2 stops/day; Balanced: 3 stops/day; Packed: 4 stops/day)
Budget Tier: {tc['budget']}
Interests: {', '.join(tc['interests'])}

Return ONLY valid JSON matching this schema:
{{
  "tagline": "Brief poetic expedition tagline",
  "days": [
    {{
      "dayNumber": 1,
      "theme": "Captivating theme for the day",
      "activities": [
        {{
          "id": "act-1-1",
          "title": "Real attraction or activity name",
          "timeSlot": "09:30 AM",
          "duration": "2h",
          "cost": 500,
          "costDisplay": "Cost formatted",
          "category": "Category",
          "location": "Specific real location/street",
          "isIndoor": false,
          "weatherRisk": "low",
          "weatherRiskLabel": "☀️ Clear Skies",
          "description": "Accurate description of this real landmark."
        }}
      ]
    }}
  ]
}}
"""
    t0 = time.time()
    try:
        resp = client.models.generate_content(
            model=model_name,
            contents=prompt
        )
        dur = time.time() - t0
        raw_text = resp.text.strip()
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        if raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
            
        data = json.loads(raw_text.strip())
        days = data.get("days", [])
        all_stops = []
        for d in days:
            all_stops.extend([a.get("title") for a in d.get("activities", [])])
            
        dups = len(all_stops) - len(set(all_stops))
        
        print(f"      ✓ SUCCESS in {dur:.2f}s | Days: {len(days)} | Total Activities: {len(all_stops)} | Duplicates: {dups}")
        print(f"      Tagline: \"{data.get('tagline')}\"")
        for d in days:
            stops_str = ", ".join([f"{a.get('title')} ({a.get('location')})" for a in d.get("activities", [])])
            print(f"        Day {d.get('dayNumber')} [{d.get('theme')}]: {stops_str}")
            
        results.append({
            "name": dest,
            "category": tc["category"],
            "success": True,
            "duration": dur,
            "days_count": len(days),
            "activities_count": len(all_stops),
            "duplicates": dups,
            "activities": all_stops
        })
    except Exception as e:
        dur = time.time() - t0
        print(f"      ✗ FAILED in {dur:.2f}s: {e}")
        results.append({
            "name": dest,
            "category": tc["category"],
            "success": False,
            "duration": dur,
            "error": str(e)
        })

print("\n\n================================================================================")
print("SUMMARY OF REAL GEMINI GENERATION RESULTS")
print("================================================================================")
for r in results:
    status = f"SUCCESS ({r['duration']:.2f}s, {r['activities_count']} acts, {r['duplicates']} dups)" if r["success"] else f"FAILED: {r.get('error')[:60]}"
    print(f"- {r['name']} ({r['category']}): {status}")
