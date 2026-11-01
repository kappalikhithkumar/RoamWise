#!/usr/bin/env python3
"""
warm_poi_cache.py — Pre-populates SQLite poi_cache with POIs for popular Indian destinations.

Features:
- Covers ~60 iconic Indian destinations across all regions.
- Checks existing 30-day cache first to avoid redundant API hits.
- Queries Overpass (with mirror fallback) and Wikipedia GeoSearch.
- Persists all discovered POIs directly to SQLite `poi_cache` table.
- Ensures RoamWise functions completely offline for these circuits.

Usage:
    python scripts/warm_poi_cache.py
"""

import sys
import time
import logging
from pathlib import Path

# Ensure backend is in python path
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.poi_service import POIService, get_cached_pois_from_db

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("warm_poi_cache")

POPULAR_INDIAN_DESTINATIONS = [
    # North India
    "Delhi", "New Delhi", "Agra", "Jaipur", "Udaipur", "Jodhpur", "Jaisalmer",
    "Varanasi", "Amritsar", "Shimla", "Manali", "Rishikesh", "Haridwar",
    "Lucknow", "Pushkar", "Mathura", "Ayodhya", "Srinagar", "Leh",
    "Dharamshala", "Nainital", "Mussoorie", "Chandigarh",
    # South India
    "Bengaluru", "Hyderabad", "Chennai", "Visakhapatnam", "Kochi", "Mysuru",
    "Madurai", "Tirupati", "Coimbatore", "Puducherry", "Thiruvananthapuram",
    "Munnar", "Ooty", "Kodaikanal", "Hampi", "Gokarna", "Alappuzha",
    "Varkala", "Rameswaram", "Mahabalipuram", "Kadapa", "Vijayawada",
    "Mangalore", "Coorg", "Wayanad", "Chikmagalur",
    # West India
    "Mumbai", "Pune", "Goa", "Ahmedabad", "Surat", "Vadodara", "Nashik",
    "Aurangabad", "Shirdi", "Mount Abu",
    # East & Northeast India
    "Kolkata", "Darjeeling", "Bhubaneswar", "Puri", "Gangtok", "Shillong",
    "Guwahati", "Kaziranga", "Bodh Gaya", "Konark"
]


def warm_cache():
    """Fetch and cache POIs for all destinations."""
    logger.info(f"Starting POI cache warming for {len(POPULAR_INDIAN_DESTINATIONS)} Indian destinations...")
    service = POIService()
    
    total = len(POPULAR_INDIAN_DESTINATIONS)
    success_count = 0
    cached_already_count = 0

    for idx, dest in enumerate(POPULAR_INDIAN_DESTINATIONS, 1):
        dest_clean = dest.strip()
        
        # Check if already cached in SQLite table
        existing = get_cached_pois_from_db(dest_clean.lower())
        if existing and existing.get("pois"):
            cached_already_count += 1
            success_count += 1
            src = existing.get("source", "cached")
            count = len(existing.get("pois", []))
            print(f"[{idx}/{total}] {dest_clean}: {count} POIs (already in cache, source: {src})")
            continue

        print(f"[{idx}/{total}] Fetching POIs for {dest_clean}...", end=" ", flush=True)
        try:
            res = service.get_pois(dest_clean, max_results=30)
            pois = res.get("pois", [])
            source = res.get("source", "none")
            count = len(pois)
            if count > 0:
                success_count += 1
                print(f"DONE ({count} POIs, source: {source})")
            else:
                print("EMPTY (0 POIs found)")
        except Exception as e:
            print(f"FAILED ({e})")

        # Brief polite pause between network calls
        time.sleep(0.3)

    print("\n" + "=" * 65)
    print("POI CACHE WARMING COMPLETED")
    print(f"Total destinations processed: {total}")
    print(f"Successfully available in cache: {success_count}/{total}")
    print(f"Already cached prior to run: {cached_already_count}")
    print("=" * 65)


if __name__ == "__main__":
    warm_cache()
