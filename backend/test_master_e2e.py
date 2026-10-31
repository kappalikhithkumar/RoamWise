import os
import sys
import json
import socket
from pathlib import Path

# Fast timeout for resilient socket testing
socket.setdefaulttimeout(2.5)

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app import create_app
from app.config import Config
from app.services.gemini_service import GeminiService
from app.services.weather_service import WeatherService

TEST_DB_PATH = Path(__file__).resolve().parent / "test_master.db"
if TEST_DB_PATH.exists():
    try:
        TEST_DB_PATH.unlink()
    except Exception:
        pass

class MasterTestConfig(Config):
    TESTING = True
    DATABASE_PATH = str(TEST_DB_PATH)

app = create_app(MasterTestConfig)
client = app.test_client()

print("======================================================================")
print("ROAMWISE MASTER END-TO-END TEST SUITE")
print("Target: Isolated Database 'test_master.db' (Zero Presentation Pollution)")
print("======================================================================")

try:
    # ------------------------------------------------------------------
    # 1. API Health Check
    # ------------------------------------------------------------------
    print("\n--- TEST 1: API Health Check ---")
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.get_json()
    assert data["status"] == "healthy"
    print(f"Health verified: {data['service']} v{data['version']}")

    # ------------------------------------------------------------------
    # 2. Scenario Execution: Hyderabad 3-Day Friends Balanced Trip
    # ------------------------------------------------------------------
    print("\n--- TEST 2: AI Itinerary Generation for Hyderabad ---")
    hyderabad_config = {
        "destination": "Hyderabad, Telangana",
        "destinations": ["Old City Hyderabad", "Golconda", "HITEC City"],
        "startDate": "2026-11-20",
        "endDate": "2026-11-22",
        "budgetTier": "Budget-friendly",
        "interests": ["Food", "History", "Culture"],
        "travelerType": "Friends",
        "pace": "Balanced",
        "weatherAdaptive": True
    }

    gen_res = client.post("/api/trips/generate", data=json.dumps(hyderabad_config), content_type="application/json")
    assert gen_res.status_code == 200
    gen_data = gen_res.get_json()
    assert gen_data["success"] is True
    days = gen_data["days"]
    print(f"Generated {len(days)} days itinerary via source: {gen_data['generationSource']}")
    assert len(days) == 3
    print(f"Day 1 Theme: {days[0]['theme']}")
    print(f"Day 1 Activities count: {len(days[0]['activities'])}")
    assert len(days[0]["activities"]) >= 2
    day1_act1 = days[0]["activities"][0]
    print(f"Day 1 Activity 1: {day1_act1['title']} ({day1_act1['costDisplay']})")

    # ------------------------------------------------------------------
    # 3. Trip Creation & SQLite Persistence
    # ------------------------------------------------------------------
    print("\n--- TEST 3: Saving Hyderabad Trip to Database ---")
    save_payload = {
        **hyderabad_config,
        "tagline": gen_data.get("tagline", "Friends Expedition across Hyderabad"),
        "days": days
    }
    create_res = client.post("/api/trips", data=json.dumps(save_payload), content_type="application/json")
    assert create_res.status_code == 201
    created_trip = create_res.get_json()
    trip_id = created_trip["tripId"]
    print(f"Trip saved successfully with ID: {trip_id}")

    # ------------------------------------------------------------------
    # 4. Retrieval Verification
    # ------------------------------------------------------------------
    print(f"\n--- TEST 4: Retrieving Saved Trip {trip_id} ---")
    get_res = client.get(f"/api/trips/{trip_id}")
    assert get_res.status_code == 200
    saved_trip = get_res.get_json()
    assert saved_trip["destination"] == "Hyderabad, Telangana"
    assert len(saved_trip["days"]) == 3
    print(f"Trip retrieved. Destination: {saved_trip['destination']}, Days: {len(saved_trip['days'])}")

    # ------------------------------------------------------------------
    # 5. Activity Completion Tracking (isVisited = True)
    # ------------------------------------------------------------------
    print("\n--- TEST 5: User Marks Activity Completed ---")
    updated_days = saved_trip["days"]
    target_act = updated_days[0]["activities"][0]
    target_act["isVisited"] = True
    print(f"Marking '{target_act['title']}' as visited...")

    put_res = client.put(f"/api/trips/{trip_id}", data=json.dumps({"days": updated_days}), content_type="application/json")
    assert put_res.status_code == 200
    updated_trip_data = put_res.get_json()
    assert updated_trip_data["days"][0]["activities"][0]["isVisited"] is True
    print("Activity completion updated in SQLite.")

    # ------------------------------------------------------------------
    # 6. Real Weather Integration (Open-Meteo with fallback)
    # ------------------------------------------------------------------
    print("\n--- TEST 6: Real Weather Service for Hyderabad ---")
    weather_res = client.get("/api/weather/Hyderabad")
    assert weather_res.status_code == 200
    weather_data = weather_res.get_json()
    print(f"Weather Provider: {weather_data['provider']}")
    print(f"Is Live: {weather_data['isLive']}")
    print(f"Current Temp: {weather_data['current']['temperature']}°C, Condition: {weather_data['current']['condition']}")
    print(f"Precipitation Risk: {weather_data['current']['rainRisk']}%")
    assert "current" in weather_data
    assert "temperature" in weather_data["current"]

    # ------------------------------------------------------------------
    # 7. AI Replanning with Completed Activity Preservation
    # ------------------------------------------------------------------
    print("\n--- TEST 7: AI Replanning (Rain Disruption & Delay) ---")
    replan_req = {
        "trip": updated_trip_data,
        "scenarioText": "Thunderstorm approaching Golconda Fort. Cab delayed 45 minutes. Suggest sheltered alternative.",
        "delayMinutes": 45,
        "activeDayNumber": 1
    }
    replan_res = client.post("/api/trips/replan", data=json.dumps(replan_req), content_type="application/json")
    assert replan_res.status_code == 200
    proposal = replan_res.get_json()["proposal"]
    print(f"Scenario: {proposal['scenarioTitle']}")
    print(f"Reservations / Visited Kept: {proposal['reservationsKept']}")
    print(f"Diff items count: {len(proposal['diffItems'])}")

    # Verify that visited activity was preserved
    proposed_acts = proposal["proposedActivities"]
    preserved_act = next((a for a in proposed_acts if a.get("id") == target_act["id"]), None)
    assert preserved_act is not None
    assert preserved_act.get("isVisited") is True
    print(f"CRITICAL SAFETY VERIFIED: Visited stop '{preserved_act['title']}' was preserved intact!")

    # ------------------------------------------------------------------
    # 8. User Accepts Replan & Persists to SQLite
    # ------------------------------------------------------------------
    print("\n--- TEST 8: User Confirms Replan ---")
    updated_days[0]["activities"] = proposed_acts
    save_replan_res = client.put(f"/api/trips/{trip_id}", data=json.dumps({"days": updated_days}), content_type="application/json")
    assert save_replan_res.status_code == 200
    print("Replan changes saved to SQLite.")

    # ------------------------------------------------------------------
    # 9. Browser Refresh / Application Restart Simulation
    # ------------------------------------------------------------------
    print("\n--- TEST 9: Simulating Browser Refresh / Cold Restart ---")
    reloaded_res = client.get(f"/api/trips/{trip_id}")
    assert reloaded_res.status_code == 200
    reloaded_trip = reloaded_res.get_json()
    first_act_after_reload = reloaded_trip["days"][0]["activities"][0]
    assert first_act_after_reload["isVisited"] is True
    print(f"Cold restart verified: '{first_act_after_reload['title']}' remains isVisited = True!")

    # ------------------------------------------------------------------
    # 10. Deletion & Cleanup Verification
    # ------------------------------------------------------------------
    print(f"\n--- TEST 10: Deleting Trip {trip_id} ---")
    del_res = client.delete(f"/api/trips/{trip_id}")
    assert del_res.status_code == 200
    assert del_res.get_json()["success"] is True

    # Confirm 404
    get_del_res = client.get(f"/api/trips/{trip_id}")
    assert get_del_res.status_code == 404
    print(f"Trip {trip_id} successfully deleted and confirmed 404.")

    # ------------------------------------------------------------------
    # 11. Resiliency & Fallback Validation
    # ------------------------------------------------------------------
    print("\n--- TEST 11: Resiliency Under Failure Modes ---")
    # A. Gemini offline / no key service instance
    offline_service = GeminiService(api_key="")
    fallback_itinerary = offline_service.generate_itinerary({"destination": "Shimla, Himachal", "startDate": "2026-11-20", "endDate": "2026-11-21"})
    assert fallback_itinerary is not None
    assert len(fallback_itinerary["days"]) == 2
    assert fallback_itinerary["generationSource"] == "deterministic-fallback"
    print("A. Offline AI fallback generates valid 2-day itinerary: PASSED ✓")

    # B. Malformed AI validation check
    valid, _ = offline_service._validate_itinerary({"invalid": "data"}, {})
    assert valid is False
    print("B. Malformed AI schema rejection: PASSED ✓")

    # C. Weather fallback check
    ws = WeatherService()
    sim_weather = ws._generate_simulated_fallback("Ooty", 11.4102, 76.6950)
    assert sim_weather["isLive"] is False
    assert "Fallback" in sim_weather["provider"] or "Simulated" in sim_weather["disclaimer"]
    assert "disclaimer" in sim_weather
    print("C. Labelled weather offline disclaimer check: PASSED ✓")

    # D. Missing trip 404 check
    res_404 = client.get("/api/trips/88888")
    assert res_404.status_code == 404
    print("D. 404 error response handling: PASSED ✓")

    print("\n======================================================================")
    print("✓✓✓ ALL 11 MASTER INTEGRATION AND RESILIENCY TESTS PASSED! ✓✓✓")
    print("======================================================================")

finally:
    if TEST_DB_PATH.exists():
        try:
            TEST_DB_PATH.unlink()
            print(f"\n[Cleanup] Isolated test database {TEST_DB_PATH.name} safely deleted.")
        except Exception as e:
            print(f"[Cleanup Note] {e}")
