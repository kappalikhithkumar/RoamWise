import os
import sys
import json
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app import create_app
from app.config import Config

TEST_DB_PATH = Path(__file__).resolve().parent / "test_roamwise.db"

# Ensure clean slate for test database
if TEST_DB_PATH.exists():
    try:
        TEST_DB_PATH.unlink()
    except Exception:
        pass

class TestConfig(Config):
    TESTING = True
    DATABASE_PATH = str(TEST_DB_PATH)

app = create_app(TestConfig)
client = app.test_client()

print(f"=== Running Backend Tests with Isolated Test DB: {TEST_DB_PATH.name} ===")

try:
    print("\n--- 1. Testing GET /api/health ---")
    res = client.get("/api/health")
    data = res.get_json()
    print("Health Status:", res.status_code, data)
    assert res.status_code == 200
    assert data["status"] == "healthy"
    assert data["database"] == "connected"

    print("\n--- 2. Testing POST /api/trips ---")
    sample_trip = {
        "destination": "Jaipur -> Delhi -> Agra",
        "destinations": ["Jaipur, Rajasthan", "Delhi, NCR", "Agra, Uttar Pradesh"],
        "startDate": "2025-10-18",
        "endDate": "2025-10-24",
        "budgetTier": "Moderate",
        "interests": ["Culture", "Food", "History"],
        "travelerType": "Couple",
        "pace": "Balanced",
        "weatherAdaptive": True,
        "tagline": "Couple Expedition across Golden Triangle",
        "days": [
            {
                "dayNumber": 1,
                "dayOfWeek": "Saturday",
                "dateStr": "Oct 18, 2025",
                "theme": "Jaipur: Crown Fortresses & Amber Royalty",
                "weatherSummary": "26°C • Clear & Golden",
                "temperature": "26°C",
                "rainRisk": 10,
                "weatherCondition": "sunny",
                "activities": [
                    {
                        "id": "act-1-1",
                        "title": "Amer Fort & Sheesh Mahal",
                        "timeSlot": "09:00 AM",
                        "period": "morning",
                        "duration": "2.5h",
                        "cost": 500,
                        "costDisplay": "₹500",
                        "category": "History",
                        "location": "Amer, Jaipur",
                        "isIndoor": False,
                        "weatherRisk": "low",
                        "weatherRiskLabel": "☀️ Low Risk",
                        "description": "Iconic fortress",
                        "imageUrl": "",
                        "isVisited": True,
                        "hasPlanBReady": False
                    },
                    {
                        "id": "act-1-2",
                        "title": "City Palace Courtyards",
                        "timeSlot": "02:00 PM",
                        "period": "afternoon",
                        "duration": "2h",
                        "cost": 700,
                        "costDisplay": "₹700",
                        "category": "Culture",
                        "location": "Old City, Jaipur",
                        "isIndoor": False,
                        "weatherRisk": "medium",
                        "weatherRiskLabel": "⛅ Moderate Risk",
                        "description": "Royal residence",
                        "imageUrl": "",
                        "isVisited": False,
                        "hasPlanBReady": True,
                        "planBAlternative": {
                            "id": "alt-1-2",
                            "title": "Albert Hall Museum & Indoor Gallery",
                            "timeSlot": "02:00 PM",
                            "duration": "2h",
                            "cost": 300,
                            "costDisplay": "₹300",
                            "category": "History",
                            "location": "Ram Niwas Garden, Jaipur",
                            "isIndoor": True,
                            "weatherRiskLabel": "☂️ Indoor Safe",
                            "description": "Indo-Saracenic museum housing extensive miniature paintings.",
                            "shelterReason": "Rain protection",
                            "costDelta": "-₹400"
                        }
                    }
                ]
            }
        ]
    }

    res = client.post("/api/trips", data=json.dumps(sample_trip), content_type="application/json")
    print("Create Trip Status:", res.status_code)
    assert res.status_code == 201
    created_data = res.get_json()
    trip_id = created_data.get("tripId")
    print(f"Created Trip ID: {trip_id}")
    assert trip_id is not None

    print("\n--- 3. Testing GET /api/trips ---")
    res = client.get("/api/trips")
    print("List Trips Status:", res.status_code)
    assert res.status_code == 200
    trips_data = res.get_json()
    trips_list = trips_data["trips"] if "trips" in trips_data else trips_data
    print(f"Found {len(trips_list)} trips in isolated test database.")
    assert len(trips_list) == 1
    assert trips_list[0]["id"] == trip_id

    print(f"\n--- 4. Testing GET /api/trips/{trip_id} ---")
    res = client.get(f"/api/trips/{trip_id}")
    print("Get Single Trip Status:", res.status_code)
    assert res.status_code == 200
    single_trip = res.get_json()
    days = single_trip.get("days", [])
    print(f"Days count: {len(days)}")
    assert len(days) == 1
    assert len(days[0]["activities"]) == 2
    assert days[0]["activities"][0]["isVisited"] is True

    print(f"\n--- 5. Testing PUT /api/trips/{trip_id} (Mark visited & apply Plan B) ---")
    update_payload = {
        "status": "ongoing",
        "days": [
            {
                "dayNumber": 1,
                "activities": [
                    {
                        "id": "act-1-1",
                        "isVisited": True
                    },
                    {
                        "id": "alt-1-2",
                        "title": "Albert Hall Museum & Indoor Gallery",
                        "timeSlot": "02:00 PM",
                        "period": "afternoon",
                        "duration": "2h",
                        "cost": 300,
                        "costDisplay": "₹300",
                        "category": "History",
                        "location": "Ram Niwas Garden, Jaipur",
                        "isIndoor": True,
                        "weatherRiskLabel": "☂️ Indoor Safe",
                        "isVisited": True,
                        "isPlanBAlternative": True
                    }
                ]
            }
        ]
    }
    res = client.put(f"/api/trips/{trip_id}", data=json.dumps(update_payload), content_type="application/json")
    print("Update Trip Status:", res.status_code)
    assert res.status_code == 200
    updated_trip = res.get_json()
    updated_days = updated_trip.get("days", [])
    updated_act2 = updated_days[0]["activities"][1]
    print(f"Updated Act 2 Title: {updated_act2['title']}")
    print(f"Updated Act 2 isVisited: {updated_act2['isVisited']}")
    print(f"Updated Act 2 isPlanBAlternative: {updated_act2['isPlanBAlternative']}")
    assert updated_act2["isVisited"] is True
    assert updated_act2["isPlanBAlternative"] is True

    print(f"\n--- 6. Testing DELETE /api/trips/{trip_id} ---")
    res = client.delete(f"/api/trips/{trip_id}")
    print("Delete Trip Status:", res.status_code, res.get_json())
    assert res.status_code == 200
    del_data = res.get_json()
    assert del_data.get("success") is True

    # Verify trip no longer exists
    res_after = client.get(f"/api/trips/{trip_id}")
    print(f"Get Deleted Trip Status: {res_after.status_code}")
    assert res_after.status_code == 404

    # Verify listing is now empty
    res_list_after = client.get("/api/trips")
    trips_after = res_list_after.get_json().get("trips", [])
    print(f"Trips count after deletion: {len(trips_after)}")
    assert len(trips_after) == 0

    print("\n--- 7. Testing 404 Handling on non-existent endpoints ---")
    res_404 = client.get("/api/trips/99999")
    print("404 GET Check Status:", res_404.status_code, res_404.get_json())
    assert res_404.status_code == 404

    res_del_404 = client.delete("/api/trips/99999")
    print("404 DELETE Check Status:", res_del_404.status_code, res_del_404.get_json())
    assert res_del_404.status_code == 404

    print("\n✓✓✓ ALL ISOLATED BACKEND UNIT AND API TESTS PASSED! ✓✓✓")

finally:
    # Clean up test database so it does not pollute project
    if TEST_DB_PATH.exists():
        try:
            TEST_DB_PATH.unlink()
            print(f"\n[Cleanup] Isolated test database {TEST_DB_PATH.name} safely deleted.")
        except Exception as e:
            print(f"[Cleanup Notice] Could not delete {TEST_DB_PATH.name}: {e}")
