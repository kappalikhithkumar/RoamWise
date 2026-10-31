import urllib.request
import urllib.parse
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:5000/api"

def make_req(endpoint, method="GET", data=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.getcode(), json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

print("=== 1. Probing Live GET /api/health ===")
code, res = make_req("/health")
print(f"Health Response ({code}):", res)
assert code == 200
assert res.get("status") == "healthy"
assert res.get("database") == "connected"

print("\n=== 2. Creating Live Trip via POST /api/trips ===")
payload = {
    "destination": "Goa Coastal Circuit",
    "destinations": ["North Goa", "South Goa"],
    "startDate": "2026-11-20",
    "endDate": "2026-11-23",
    "budgetTier": "Moderate",
    "interests": ["Nature", "Food", "Relaxation"],
    "travelerType": "Friends",
    "pace": "Relaxed",
    "weatherAdaptive": True,
    "tagline": "Coastal Escapes & Shaded Shacks",
    "days": [
        {
            "dayNumber": 1,
            "dayOfWeek": "Friday",
            "dateStr": "Nov 20, 2026",
            "theme": "Panaji Old Latin Quarter & Mandovi Cruise",
            "weatherSummary": "29°C • Tropical & Clear",
            "temperature": "29°C",
            "rainRisk": 15,
            "weatherCondition": "sunny",
            "activities": [
                {
                    "id": "goa-act-1",
                    "title": "Fontainhas Heritage Walk",
                    "timeSlot": "09:30 AM",
                    "period": "morning",
                    "duration": "2h",
                    "cost": 300,
                    "costDisplay": "₹300",
                    "category": "Culture",
                    "location": "Fontainhas, Panaji",
                    "isIndoor": False,
                    "weatherRisk": "low",
                    "weatherRiskLabel": "☀️ Low Risk",
                    "description": "Historic Portuguese neighborhood with vibrant architecture.",
                    "isVisited": False,
                    "hasPlanBReady": True,
                    "planBAlternative": {
                        "id": "goa-alt-1",
                        "title": "Goa State Museum Gallery",
                        "timeSlot": "09:30 AM",
                        "duration": "2h",
                        "cost": 100,
                        "costDisplay": "₹100",
                        "category": "Culture",
                        "location": "Panaji Art Center",
                        "isIndoor": True,
                        "weatherRiskLabel": "☂️ Indoor Sheltered",
                        "description": "Air-conditioned state archives and historical sculpture hall.",
                        "shelterReason": "Rain protection",
                        "costDelta": "-₹200"
                    }
                },
                {
                    "id": "goa-act-2",
                    "title": "Miramar Sunset Promenade",
                    "timeSlot": "05:00 PM",
                    "period": "evening",
                    "duration": "1.5h",
                    "cost": 0,
                    "costDisplay": "Free",
                    "category": "Nature",
                    "location": "Miramar Beach",
                    "isIndoor": False,
                    "weatherRisk": "low",
                    "weatherRiskLabel": "☀️ Sunset Window",
                    "description": "Seaside walk overlooking the Mandovi confluence.",
                    "isVisited": False
                }
            ]
        }
    ]
}

code, res = make_req("/trips", method="POST", data=payload)
print(f"POST Response ({code}):", res.get("message"))
assert code == 201
trip_id = res.get("tripId")
assert trip_id is not None
print(f"Created Trip ID: {trip_id}")

print("\n=== 3. Listing Live Trips via GET /api/trips ===")
code, trips_res = make_req("/trips")
trips = trips_res.get("trips", []) if isinstance(trips_res, dict) else trips_res
print(f"GET /trips ({code}) count:", len(trips))
assert code == 200
assert any(t["id"] == trip_id for t in trips)

print(f"\n=== 4. Getting Single Live Trip via GET /api/trips/{trip_id} ===")
code, trip = make_req(f"/trips/{trip_id}")
print(f"GET /trips/{trip_id} ({code}): Destination =", trip.get("destination"))
assert code == 200
assert len(trip["days"]) == 1
assert len(trip["days"][0]["activities"]) == 2
first_act = trip["days"][0]["activities"][0]
print(f"Activity 1: {first_act['title']} | Visited: {first_act['isVisited']} | Has Plan B: {first_act['hasPlanBReady']}")

print(f"\n=== 5. Updating Visited Status & Activating Plan B via PUT /api/trips/{trip_id} ===")
updated_days = trip["days"]
# Mark act 1 visited and swap with Plan B alternative
alt = first_act["planBAlternative"]
updated_days[0]["activities"][0]["title"] = alt["title"]
updated_days[0]["activities"][0]["isIndoor"] = True
updated_days[0]["activities"][0]["isPlanBAlternative"] = True
updated_days[0]["activities"][0]["isVisited"] = True
# Mark act 2 visited
updated_days[0]["activities"][1]["isVisited"] = True

code, update_res = make_req(f"/trips/{trip_id}", method="PUT", data={"days": updated_days})
print(f"PUT Response ({code}):", update_res.get("message"))
assert code == 200

print(f"\n=== 6. Re-fetching Live Trip to Verify Persistence across requests ===")
code, re_trip = make_req(f"/trips/{trip_id}")
act1_updated = re_trip["days"][0]["activities"][0]
act2_updated = re_trip["days"][0]["activities"][1]
print(f"Updated Act 1 Title: {act1_updated['title']}")
print(f"Updated Act 1 isVisited: {act1_updated['isVisited']}")
print(f"Updated Act 1 isPlanBAlternative: {act1_updated['isPlanBAlternative']}")
print(f"Updated Act 2 isVisited: {act2_updated['isVisited']}")
assert act1_updated["isVisited"] is True
assert act1_updated["isPlanBAlternative"] is True
assert act2_updated["isVisited"] is True

print("\n=== 7. Testing 404 and Error Handling ===")
code, err_res = make_req("/trips/999999")
print(f"404 Test Code: {code}, Response: {err_res}")
assert code == 404

print("\n✓✓✓ ALL LIVE HTTP API AND SQLITE DATABASE TESTS PASSED! ✓✓✓")
