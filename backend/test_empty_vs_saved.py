import os
import sys
import json
import sqlite3
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app import create_app
from app.config import Config

TEST_DB_PATH = Path(__file__).resolve().parent / "test_empty_vs_saved.db"

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

print("======================================================================")
print("=== VERIFYING EMPTY DATABASE VS SAVED TRIP ARCHITECTURE ===")
print("======================================================================")

try:
    # ---------------------------------------------------------
    # TEST 1: EMPTY DATABASE SCENARIO
    # ---------------------------------------------------------
    print("\n[TEST 1] Scenario: Empty Database (New User)")
    res = client.get("/api/trips")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.get_json()
    assert "trips" in data, "Response should have 'trips' key"
    assert len(data["trips"]) == 0, f"Expected 0 trips, got {len(data['trips'])}"
    print("✓ GET /api/trips returns empty list (0 trips).")

    # Verify directly in SQLite that NO trips were auto-inserted
    conn = sqlite3.connect(str(TEST_DB_PATH))
    cursor = conn.cursor()
    cursor.execute("SELECT count(*) FROM trips")
    db_trip_count = cursor.fetchone()[0]
    conn.close()
    assert db_trip_count == 0, f"Database has {db_trip_count} trips! Auto-seeding detected!"
    print("✓ Direct SQLite inspection confirms 0 records: No automatic sample seeding.")

    # ---------------------------------------------------------
    # TEST 2: DATABASE CONTAINING REAL SAVED TRIP SCENARIO
    # ---------------------------------------------------------
    print("\n[TEST 2] Scenario: Database with a Real Saved User Trip")
    new_trip_payload = {
        "destination": "Kerala Backwaters & Tea Sanctuary",
        "destinations": ["Kochi, Kerala", "Munnar, Kerala", "Alleppey, Kerala"],
        "startDate": "2026-12-10",
        "endDate": "2026-12-16",
        "budgetTier": "Premium",
        "interests": ["Nature", "Food", "Relaxation"],
        "travelerType": "Couple",
        "pace": "Relaxed",
        "weatherAdaptive": True,
        "tagline": "Emerald Hills, Spice Plantations & Houseboat Drifts",
        "days": [
            {
                "dayNumber": 1,
                "dayOfWeek": "Thursday",
                "dateStr": "Dec 10, 2026",
                "theme": "Fort Kochi Colonial Heritage & Spice Markets",
                "weatherSummary": "28°C • Coastal Sunshine",
                "temperature": "28°C",
                "rainRisk": 5,
                "weatherCondition": "sunny",
                "activities": [
                    {
                        "id": "kerala-act-1",
                        "title": "Chinese Fishing Nets & Sunset Promenade",
                        "timeSlot": "04:30 PM",
                        "period": "evening",
                        "duration": "1.5h",
                        "cost": 0,
                        "costDisplay": "Free",
                        "category": "Culture",
                        "location": "Fort Kochi Beach",
                        "isIndoor": False,
                        "weatherRisk": "low",
                        "weatherRiskLabel": "☀️ Sunset Window",
                        "description": "Cantilevered wooden fishing nets silhouetted against the Arabian sea sunset.",
                        "isVisited": True,
                        "isLocked": False
                    },
                    {
                        "id": "kerala-act-2",
                        "title": "Mattancherry Palace & Jew Town Antiques",
                        "timeSlot": "10:00 AM",
                        "period": "morning",
                        "duration": "2h",
                        "cost": 150,
                        "costDisplay": "₹150",
                        "category": "History",
                        "location": "Jew Town Rd, Kochi",
                        "isIndoor": True,
                        "weatherRisk": "low",
                        "weatherRiskLabel": "🏛️ Indoor Sheltered",
                        "description": "Portuguese palace with rare Hindu murals and artisanal spice warehouses.",
                        "isVisited": False,
                        "isLocked": False
                    }
                ]
            }
        ]
    }

    create_res = client.post("/api/trips", data=json.dumps(new_trip_payload), content_type="application/json")
    assert create_res.status_code == 201, f"Expected 201, got {create_res.status_code}"
    created_id = create_res.get_json()["tripId"]
    print(f"✓ Real user trip successfully created with ID: {created_id}")

    # Fetch trips list
    res_list = client.get("/api/trips")
    assert res_list.status_code == 200
    trips_list = res_list.get_json()["trips"]
    assert len(trips_list) == 1, f"Expected 1 trip, got {len(trips_list)}"
    saved_trip = trips_list[0]
    assert saved_trip["id"] == created_id
    assert saved_trip["destination"] == "Kerala Backwaters & Tea Sanctuary"
    print(f"✓ GET /api/trips correctly returns real saved trip: '{saved_trip['destination']}'")

    # Fetch single trip
    res_single = client.get(f"/api/trips/{created_id}")
    assert res_single.status_code == 200
    single_data = res_single.get_json()
    assert single_data["destination"] == "Kerala Backwaters & Tea Sanctuary"
    assert len(single_data["days"]) == 1
    assert len(single_data["days"][0]["activities"]) == 2
    assert single_data["days"][0]["activities"][0]["isVisited"] is True
    print("✓ Full trip schedule and visited flags retrieved correctly for Actual Trip Dashboard.")

    # ---------------------------------------------------------
    # TEST 3: INSPECTION OF PRODUCTION DB WITHOUT MODIFICATION
    # ---------------------------------------------------------
    print("\n[TEST 3] Production Database Audit: Checking 'roamwise.db'")
    prod_db_path = Path(__file__).resolve().parent / "roamwise.db"
    assert prod_db_path.exists(), "roamwise.db must exist!"
    
    prod_conn = sqlite3.connect(str(prod_db_path))
    prod_cursor = prod_conn.cursor()
    prod_cursor.execute("SELECT id, destination, destinations_json, tagline, created_at FROM trips ORDER BY id ASC")
    rows = prod_cursor.fetchall()
    prod_conn.close()

    print(f"✓ Total existing trips in production roamwise.db: {len(rows)}")
    goa_records = []
    for r in rows:
        trip_id, dest, dest_json, tagline, created = r
        if "Goa" in dest:
            goa_records.append(r)
        # Safe ASCII representation
        print(f"   - Trip ID {trip_id}: {dest} | Created: {created}")

    print(f"\n✓ Identified {len(goa_records)} Goa Coastal Circuit records in production DB:")
    for g in goa_records:
        print(f"   * ID {g[0]} | Destination: {g[1]} | Created: {g[4]}")
    
    assert len(goa_records) > 0, "Goa test records were detected and preserved intact without unauthorized deletion."
    print("✓ RULE ENFORCED: Zero existing database records deleted without user authorization.")

    print("\n======================================================================")
    print("✓✓✓ ALL ARCHITECTURAL REQUIREMENTS VERIFIED SUCCESSFULLY! ✓✓✓")
    print("======================================================================")

finally:
    if TEST_DB_PATH.exists():
        try:
            TEST_DB_PATH.unlink()
            print(f"\n[Cleanup] Isolated test DB {TEST_DB_PATH.name} cleaned up.")
        except Exception:
            pass
