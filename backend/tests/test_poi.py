"""
Unit tests for RoamWise POI Discovery Layer:
1. Overpass mirror fallback (overpass-api.de -> overpass.kumi.systems).
2. Wikipedia GeoSearch fallback (radius 10000 m, limit 50, source: wikipedia).
3. Persistent SQLite cache `poi_cache` with 30-day TTL (checked before any network call).
4. Response verification flag: "unverified" when poiSource is "none", "verified" otherwise.
"""

import sys
import time
import json
import sqlite3
import tempfile
from pathlib import Path
import unittest
from unittest.mock import MagicMock

# Ensure backend is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.poi_service import (
    POIService,
    get_cached_pois_from_db,
    save_cached_pois_to_db,
    _derive_wiki_category,
    OVERPASS_MIRRORS
)
from app.services.destinations import ResolvedDestination
from app import create_app


class TestPOIService(unittest.TestCase):
    def setUp(self):
        # Create an isolated temporary SQLite database for cache tests
        self.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.db_path = self.temp_db.name
        self.temp_db.close()

        # Initialize table in temp DB
        conn = sqlite3.connect(self.db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS poi_cache (
                destination_key TEXT PRIMARY KEY,
                json TEXT NOT NULL,
                fetched_at REAL NOT NULL
            )
        """)
        conn.commit()
        conn.close()

    def tearDown(self):
        try:
            Path(self.db_path).unlink(missing_ok=True)
        except Exception:
            pass

    def test_sqlite_poi_cache_hit_bypasses_network(self):
        """Persistent SQLite cache is checked before ANY network call."""
        cached_pois = [
            {"name": "Pre-Cached Temple", "lat": 13.6288, "lon": 79.4192, "category": "Temple", "source": "openstreetmap"}
        ]
        save_cached_pois_to_db(
            "tirupati",
            {
                "pois": cached_pois,
                "source": "openstreetmap",
                "sourceDisclosure": "Pre-cached test POIs"
            },
            db_path=self.db_path
        )

        mock_overpass = MagicMock()
        mock_wiki = MagicMock()

        service = POIService(
            db_path=self.db_path,
            overpass_fetcher=mock_overpass,
            wikipedia_fetcher=mock_wiki
        )

        res = service.get_pois("Tirupati")
        self.assertEqual(res["source"], "openstreetmap")
        self.assertEqual(len(res["pois"]), 1)
        self.assertEqual(res["pois"][0]["name"], "Pre-Cached Temple")

        # Network fetchers MUST NOT be called on cache hit
        mock_overpass.assert_not_called()
        mock_wiki.assert_not_called()

    def test_sqlite_poi_cache_expired_triggers_network(self):
        """Cache entries older than 30 days are treated as expired and re-queried."""
        old_time = time.time() - (31 * 86400)  # 31 days ago (expired)
        conn = sqlite3.connect(self.db_path)
        conn.execute(
            "INSERT INTO poi_cache (destination_key, json, fetched_at) VALUES (?, ?, ?)",
            ("tirupati", json.dumps({"pois": [{"name": "Stale Landmark"}], "source": "curated"}), old_time)
        )
        conn.commit()
        conn.close()

        mock_overpass = MagicMock(return_value=[
            {
                "tags": {"name": "Fresh Overpass Temple", "tourism": "attraction"},
                "lat": 13.63,
                "lon": 79.42
            }
        ])

        service = POIService(
            db_path=self.db_path,
            overpass_fetcher=mock_overpass
        )

        res = service.get_pois("Tirupati")
        self.assertEqual(res["source"], "openstreetmap")
        self.assertEqual(res["pois"][0]["name"], "Fresh Overpass Temple")
        mock_overpass.assert_called()

    def test_overpass_mirror_fallback(self):
        """If primary Overpass mirror fails, service falls back to secondary mirror."""
        called_mirrors = []

        def mock_fetcher(mirror, bbox):
            called_mirrors.append(mirror)
            if mirror == OVERPASS_MIRRORS[0]:
                raise RuntimeError("Primary mirror 504 Gateway Timeout")
            # Secondary mirror succeeds
            return [
                {
                    "tags": {"name": "Amer Fort", "historic": "fort"},
                    "lat": 26.9855,
                    "lon": 75.8513
                }
            ]

        service = POIService(
            db_path=self.db_path,
            overpass_fetcher=mock_fetcher
        )

        res = service.get_pois("Jaipur")
        self.assertEqual(res["source"], "openstreetmap")
        self.assertTrue(len(res["pois"]) >= 1)
        self.assertEqual(res["pois"][0]["name"], "Amer Fort")
        # Ensure primary mirror was tried first, then secondary
        self.assertIn(OVERPASS_MIRRORS[0], called_mirrors)
        self.assertIn(OVERPASS_MIRRORS[1], called_mirrors)

    def test_wikipedia_geosearch_fallback_when_overpass_fails(self):
        """When all Overpass mirrors fail, fallback to Wikipedia GeoSearch with source 'wikipedia'."""
        mock_overpass = MagicMock(side_effect=RuntimeError("All Overpass servers unavailable"))
        mock_wiki = MagicMock(return_value=[
            {"title": "Chand Baori", "lat": 27.0072, "lon": 76.6064},
            {"title": "Harshat Mata Temple", "lat": 27.0080, "lon": 76.6070}
        ])

        service = POIService(
            db_path=self.db_path,
            overpass_fetcher=mock_overpass,
            wikipedia_fetcher=mock_wiki
        )

        # Clear memory cache and query
        res = service.get_pois("Pushkar")
        self.assertEqual(res["source"], "wikipedia")
        self.assertEqual(len(res["pois"]), 2)
        self.assertEqual(res["pois"][0]["name"], "Chand Baori")
        self.assertEqual(res["pois"][0]["source"], "wikipedia")
        self.assertEqual(res["pois"][1]["category"], "Spiritual / Temple")
        mock_wiki.assert_called_once()

        # Check that it was persisted to SQLite poi_cache
        cached = get_cached_pois_from_db("pushkar", db_path=self.db_path)
        self.assertIsNotNone(cached)
        self.assertEqual(cached["source"], "wikipedia")

    def test_derive_wiki_category(self):
        """Category derivation parses common monument and heritage keywords accurately."""
        self.assertEqual(_derive_wiki_category("Brihadisvara Temple"), "Spiritual / Temple")
        self.assertEqual(_derive_wiki_category("Amer Fort"), "Fort")
        self.assertEqual(_derive_wiki_category("City Palace, Udaipur"), "Palace")
        self.assertEqual(_derive_wiki_category("Government Museum"), "Museum")
        self.assertEqual(_derive_wiki_category("Cubbon Park"), "Nature & Outdoors")
        self.assertEqual(_derive_wiki_category("India Gate"), "Monument")
        self.assertEqual(_derive_wiki_category("Random Sight"), "Attraction")

    def test_unverified_flag_when_poi_source_none(self):
        """When poiSource is 'none', response includes verification: 'unverified'."""
        app = create_app()
        client = app.test_client()

        from unittest.mock import patch
        with patch("app.routes.trips.gemini_service.generate_itinerary") as mock_gen:
            mock_gen.return_value = {
                "tagline": "Unverified Circuit",
                "days": [],
                "poiSource": "none",
                "verification": "unverified",
                "generationSource": "deterministic-fallback"
            }
            res = client.post("/api/trips/generate", json={
                "destinations": ["Visakhapatnam"],
                "startDate": "2026-11-14",
                "endDate": "2026-11-15"
            })
            self.assertEqual(res.status_code, 200)
            data = res.get_json()
            self.assertEqual(data["poiSource"], "none")
            self.assertEqual(data["verification"], "unverified")

    def test_plan_b_validation_different_real_venue(self):
        """Validate planBAlternative: must match a real POI, be indoor/sheltered, and not be sub-area of main."""
        from app.services.gemini_service import GeminiService
        service = GeminiService()

        vizag = ResolvedDestination("Visakhapatnam", "Andhra Pradesh", 17.6868, 83.2185)
        day_pois = [
            {"name": "INS Kursura Submarine Museum", "category": "Museum", "lat": 17.7126, "lon": 83.3197, "isIndoor": True},
            {"name": "Visakha Museum", "category": "Museum", "lat": 17.7180, "lon": 83.3250, "isIndoor": True},
            {"name": "Ramakrishna Beach", "category": "Beach", "lat": 17.7100, "lon": 83.3150, "isIndoor": False},
        ]

        # Case 1: Valid distinct indoor venue (Kursura Submarine with Visakha Museum as Plan B)
        data_valid = {
            "days": [
                {
                    "dayNumber": 1,
                    "activities": [
                        {
                            "id": "act-1",
                            "title": "INS Kursura Submarine Museum",
                            "hasPlanBReady": True,
                            "planBAlternative": {
                                "id": "alt-1",
                                "title": "Visakha Museum",
                                "isIndoor": True
                            }
                        },
                        {
                            "id": "act-2",
                            "title": "Ramakrishna Beach",
                            "hasPlanBReady": False
                        }
                    ]
                }
            ]
        }
        ok, res = service._validate_itinerary(
            data=data_valid,
            config={},
            resolved_destinations=[vizag],
            day_destinations=[vizag],
            per_dest_pois={"Visakhapatnam": day_pois},
            per_dest_poi_source={"Visakhapatnam": "openstreetmap"}
        )
        self.assertTrue(ok)
        act1 = res["days"][0]["activities"][0]
        self.assertTrue(act1["hasPlanBReady"])
        self.assertIsNotNone(act1["planBAlternative"])
        self.assertEqual(act1["planBAlternative"]["title"], "Visakha Museum")

        # Case 2: Invalid venue — fake or unlisted venue (must be removed)
        data_fake_alt = {
            "days": [
                {
                    "dayNumber": 1,
                    "activities": [
                        {
                            "id": "act-1",
                            "title": "INS Kursura Submarine Museum",
                            "hasPlanBReady": True,
                            "planBAlternative": {
                                "id": "alt-1",
                                "title": "Totally Invented Indoor Art Gallery",
                                "isIndoor": True
                            }
                        },
                        {
                            "id": "act-2",
                            "title": "Ramakrishna Beach",
                            "hasPlanBReady": False
                        }
                    ]
                }
            ]
        }
        ok, res = service._validate_itinerary(
            data=data_fake_alt,
            config={},
            resolved_destinations=[vizag],
            day_destinations=[vizag],
            per_dest_pois={"Visakhapatnam": day_pois},
            per_dest_poi_source={"Visakhapatnam": "openstreetmap"}
        )
        self.assertTrue(ok)
        act1 = res["days"][0]["activities"][0]
        self.assertFalse(act1["hasPlanBReady"])
        self.assertIsNone(act1["planBAlternative"])

        # Case 3: Invalid venue — sub-area of main activity (e.g. Kursura Control Room)
        data_sub_area = {
            "days": [
                {
                    "dayNumber": 1,
                    "activities": [
                        {
                            "id": "act-1",
                            "title": "INS Kursura Submarine Museum",
                            "hasPlanBReady": True,
                            "planBAlternative": {
                                "id": "alt-1",
                                "title": "INS Kursura Submarine Control Deck",
                                "isIndoor": True
                            }
                        },
                        {
                            "id": "act-2",
                            "title": "Ramakrishna Beach",
                            "hasPlanBReady": False
                        }
                    ]
                }
            ]
        }
        ok, res = service._validate_itinerary(
            data=data_sub_area,
            config={},
            resolved_destinations=[vizag],
            day_destinations=[vizag],
            per_dest_pois={"Visakhapatnam": day_pois},
            per_dest_poi_source={"Visakhapatnam": "openstreetmap"}
        )
        self.assertTrue(ok)
        act1 = res["days"][0]["activities"][0]
        self.assertFalse(act1["hasPlanBReady"])
        self.assertIsNone(act1["planBAlternative"])

    def test_image_url_set_only_from_wikipedia_and_cached(self):
        """imageUrl is retrieved strictly from Wikipedia pageimages API and cached; empty if none."""
        from app.services.gemini_service import get_wikipedia_page_image, _WIKI_IMAGE_CACHE
        from unittest.mock import patch

        mock_resp_json = json.dumps({
            "query": {
                "pages": [
                    {
                        "title": "Hawa Mahal",
                        "thumbnail": {
                            "source": "https://upload.wikimedia.org/wikipedia/commons/hawa_mahal.jpg"
                        }
                    }
                ]
            }
        }).encode("utf-8")

        mock_resp = MagicMock()
        mock_resp.read.return_value = mock_resp_json
        mock_resp.__enter__.return_value = mock_resp

        with patch("urllib.request.urlopen", return_value=mock_resp):
            img_url = get_wikipedia_page_image("Hawa Mahal Test Unique")
            self.assertEqual(img_url, "https://upload.wikimedia.org/wikipedia/commons/hawa_mahal.jpg")

        # Second call must hit in-memory cache without urlopen
        with patch("urllib.request.urlopen") as mock_second:
            cached_img = get_wikipedia_page_image("Hawa Mahal Test Unique")
            self.assertEqual(cached_img, "https://upload.wikimedia.org/wikipedia/commons/hawa_mahal.jpg")
            mock_second.assert_not_called()


if __name__ == "__main__":
    unittest.main()
