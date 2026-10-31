import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

test_cases = [
    {
        "name": "Bangalore (4 Days, Solo, Relaxed)",
        "payload": {
            "destination": "Bangalore",
            "startDate": "2026-11-30",
            "endDate": "2026-12-03",
            "budgetTier": "Budget-friendly",
            "travelerType": "Solo",
            "pace": "Relaxed",
            "interests": ["Food", "Adventure"]
        }
    },
    {
        "name": "Araku Valley (3 Days, Couple, Balanced - Small Indian Destination)",
        "payload": {
            "destination": "Araku Valley, Andhra Pradesh",
            "startDate": "2026-11-20",
            "endDate": "2026-11-22",
            "budgetTier": "Moderate",
            "travelerType": "Couple",
            "pace": "Balanced",
            "interests": ["Nature", "Food"]
        }
    },
    {
        "name": "Paris, France (3 Days, Friends, Balanced - International Destination)",
        "payload": {
            "destination": "Paris, France",
            "startDate": "2026-12-10",
            "endDate": "2026-12-12",
            "budgetTier": "Moderate",
            "travelerType": "Friends",
            "pace": "Balanced",
            "interests": ["Culture", "History", "Food"]
        }
    }
]

print("======================================================================")
print("ROAMWISE DESTINATION INTELLIGENCE VERIFICATION TEST")
print("======================================================================")

for tc in test_cases:
    print(f"\n--- Testing: {tc['name']} ---")
    req = urllib.request.Request(
        "http://127.0.0.1:5000/api/trips/generate",
        data=json.dumps(tc["payload"]).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            data = json.loads(resp.read().decode())
            itin = data.get("itinerary", {})
            src = data.get("generationSource") or itin.get("generationSource")
            model = itin.get("modelUsed")
            poi_src = itin.get("poiSource")
            print(f"  Source: {src} | Model: {model} | POI Source: {poi_src}")
            print(f"  Tagline: {itin.get('tagline')}")
            days = itin.get("days", [])
            print(f"  Days Count: {len(days)}")
            all_stops = []
            for d in days:
                print(f"    Day {d['dayNumber']}: {d['theme']}")
                for a in d.get("activities", []):
                    all_stops.append(a['title'])
                    plan_b_title = a.get('planBAlternative', {}).get('title') if a.get('hasPlanBReady') else None
                    plan_b_str = f" [Plan B: {plan_b_title}]" if plan_b_title else ""
                    print(f"      * {a['title']} ({a.get('location')}) - {a.get('costDisplay')}{plan_b_str}")
            # Check duplicate stops
            duplicates = [s for s in all_stops if all_stops.count(s) > 1]
            print(f"  Duplicate stops: {len(duplicates)} {set(duplicates) if duplicates else '(0 duplicates - clean)'}")
    except Exception as e:
        print(f"  FAILED: {e}")
