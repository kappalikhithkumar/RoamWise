"""
Unit tests for RoamWise India-Only Destination Resolver.

Covers:
- Alias and canonical resolution ("Vizag" -> Visakhapatnam, "Mysore, Karnataka" -> Mysuru).
- Strict non-substring matching ("go" does NOT resolve to "Goa").
- International destination rejection ("Kyoto, Japan" -> not_india).
- Foreign geocoder result rejection (country_code == "PK" rejected).
- Network resiliency during geocoding (network errors return lookup_unavailable).
"""

import sys
from pathlib import Path
import unittest
from unittest.mock import MagicMock
import urllib.error

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.services.destinations import (
    DestinationResolver,
    Resolution,
    ResolvedDestination,
    REGISTRY,
    ALIASES,
    haversine_km,
    allocate_trip_days,
    calculate_transit_between
)


class TestDestinationResolver(unittest.TestCase):
    def setUp(self):
        # Create a fresh mock geocoder and resolver instance per test
        self.mock_geocoder = MagicMock(return_value=[])
        self.resolver = DestinationResolver(geocoder=self.mock_geocoder)

    def test_alias_resolution_vizag(self):
        """'Vizag' resolves via alias to canonical Visakhapatnam, Andhra Pradesh."""
        resolution = self.resolver.resolve("Vizag")
        self.assertTrue(resolution.is_ok, f"Expected OK resolution, got: {resolution.status}")
        self.assertIsNotNone(resolution.destination)
        self.assertEqual(resolution.destination.name, "Visakhapatnam")
        self.assertEqual(resolution.destination.state, "Andhra Pradesh")
        # Registry match should bypass external geocoder
        self.mock_geocoder.assert_not_called()

    def test_alias_and_state_hint_mysore_karnataka(self):
        """'Mysore, Karnataka' resolves via alias to canonical Mysuru, Karnataka."""
        resolution = self.resolver.resolve("Mysore, Karnataka")
        self.assertTrue(resolution.is_ok, f"Expected OK resolution, got: {resolution.status}")
        self.assertIsNotNone(resolution.destination)
        self.assertEqual(resolution.destination.name, "Mysuru")
        self.assertEqual(resolution.destination.state, "Karnataka")
        self.mock_geocoder.assert_not_called()

    def test_go_does_not_resolve_to_goa(self):
        """'go' must NOT resolve to Goa via substring matching."""
        # Mock geocoder returns empty for 'go'
        self.mock_geocoder.return_value = []
        resolution = self.resolver.resolve("go")
        self.assertNotEqual(resolution.status, "ok")
        self.assertNotEqual(resolution.status, "resolved")
        if resolution.destination:
            self.assertNotEqual(resolution.destination.name.lower(), "goa")
        self.assertEqual(resolution.status, "not_found")

    def test_foreign_destination_kyoto_japan_returns_not_india(self):
        """'Kyoto, Japan' returns status 'not_india'."""
        resolution = self.resolver.resolve("Kyoto, Japan")
        self.assertEqual(resolution.status, "not_india")
        self.assertIsNone(resolution.destination)
        self.assertIn("outside India", resolution.message)
        self.mock_geocoder.assert_not_called()

    def test_geocoder_result_foreign_country_code_rejected(self):
        """A geocoder result with country_code 'PK' (or non-IN) is rejected."""
        self.mock_geocoder.return_value = [
            {
                "name": "Lahore",
                "country_code": "PK",
                "latitude": 31.5497,
                "longitude": 74.3436,
                "admin1": "Punjab"
            }
        ]
        resolution = self.resolver.resolve("Lahore")
        self.assertEqual(resolution.status, "not_found")
        self.assertIsNone(resolution.destination)
        self.assertIn("not located in India", resolution.message)

    def test_geocoder_network_error_returns_lookup_unavailable(self):
        """A network error in geocoder returns 'lookup_unavailable' (never 'not_india')."""
        self.mock_geocoder.side_effect = urllib.error.URLError("Network unreachable")
        resolution = self.resolver.resolve("SomeUnregisteredPlace")
        self.assertEqual(resolution.status, "lookup_unavailable")
        self.assertIsNone(resolution.destination)
        self.assertIn("temporarily unavailable", resolution.message)

    def test_geocoder_timeout_error_returns_lookup_unavailable(self):
        """A timeout error in geocoder returns 'lookup_unavailable'."""
        self.mock_geocoder.side_effect = TimeoutError("Connection timed out")
        resolution = self.resolver.resolve("Dhanushkodi")
        self.assertEqual(resolution.status, "lookup_unavailable")
        self.assertIsNone(resolution.destination)

    def test_geocoder_valid_india_resolution(self):
        """A valid Indian place found via Open-Meteo geocoder resolves with coordinates."""
        self.mock_geocoder.return_value = [
            {
                "name": "Dhanushkodi",
                "country_code": "IN",
                "latitude": 9.1786,
                "longitude": 79.4184,
                "admin1": "Tamil Nadu",
                "population": 500
            }
        ]
        resolution = self.resolver.resolve("Dhanushkodi, Tamil Nadu")
        self.assertTrue(resolution.is_ok)
        self.assertIsNotNone(resolution.destination)
        self.assertEqual(resolution.destination.name, "Dhanushkodi")
        self.assertEqual(resolution.destination.state, "Tamil Nadu")
        self.assertAlmostEqual(resolution.destination.lat, 9.1786)
        self.assertAlmostEqual(resolution.destination.lon, 79.4184)

    def test_new_canonical_places_in_registry(self):
        """Tirupati, Kadapa, Pune, Shimla, Mahabalipuram, Pushkar, and Puducherry resolve via registry."""
        test_cases = [
            ("Tirupati", "Tirupati", "Andhra Pradesh"),
            ("Kadapa", "Kadapa", "Andhra Pradesh"),
            ("Pune", "Pune", "Maharashtra"),
            ("Shimla", "Shimla", "Himachal Pradesh"),
            ("Mahabalipuram", "Mahabalipuram", "Tamil Nadu"),
            ("Pushkar", "Pushkar", "Rajasthan"),
            ("Puducherry", "Puducherry", "Puducherry"),
        ]
        for query, expected_name, expected_state in test_cases:
            res = self.resolver.resolve(query)
            self.assertTrue(res.is_ok, f"Expected {query} to resolve, got: {res.status}")
            self.assertEqual(res.destination.name, expected_name)
            self.assertEqual(res.destination.state, expected_state)
            self.assertGreater(res.destination.lat, 0.0)
            self.assertGreater(res.destination.lon, 0.0)
        self.mock_geocoder.assert_not_called()

    def test_new_aliases_resolution(self):
        """New aliases resolve correctly to canonical registry destinations."""
        alias_cases = [
            ("tirupathi", "Tirupati", "Andhra Pradesh"),
            ("cuddapah", "Kadapa", "Andhra Pradesh"),
            ("pondicherry", "Puducherry", "Puducherry"),
            ("mamallapuram", "Mahabalipuram", "Tamil Nadu"),
            ("poona", "Pune", "Maharashtra"),
        ]
        for query, expected_name, expected_state in alias_cases:
            res = self.resolver.resolve(query)
            self.assertTrue(res.is_ok, f"Expected alias {query} to resolve, got: {res.status}")
            self.assertEqual(res.destination.name, expected_name)
            self.assertEqual(res.destination.state, expected_state)
        self.mock_geocoder.assert_not_called()

    def test_allocate_trip_days(self):
        """allocate_trip_days assigns at least 1 day per destination and extra days to earlier ones."""
        d1 = ResolvedDestination("Visakhapatnam", "Andhra Pradesh", 17.6868, 83.2185)
        d2 = ResolvedDestination("Kadapa", "Andhra Pradesh", 14.4673, 78.8242)
        d3 = ResolvedDestination("Tirupati", "Andhra Pradesh", 13.6288, 79.4192)

        # 5 days across 3 destinations -> [d1, d1, d2, d2, d3]
        alloc5 = allocate_trip_days(5, [d1, d2, d3])
        self.assertEqual(len(alloc5), 5)
        self.assertEqual([d.name for d in alloc5], ["Visakhapatnam", "Visakhapatnam", "Kadapa", "Kadapa", "Tirupati"])

        # 3 days across 3 destinations -> [d1, d2, d3]
        alloc3 = allocate_trip_days(3, [d1, d2, d3])
        self.assertEqual(len(alloc3), 3)
        self.assertEqual([d.name for d in alloc3], ["Visakhapatnam", "Kadapa", "Tirupati"])

        # 2 days across 3 destinations -> [d1, d2]
        alloc2 = allocate_trip_days(2, [d1, d2, d3])
        self.assertEqual(len(alloc2), 2)
        self.assertEqual([d.name for d in alloc2], ["Visakhapatnam", "Kadapa"])

        # 6 days across 2 destinations -> 3 each
        alloc6 = allocate_trip_days(6, [d1, d2])
        self.assertEqual(len(alloc6), 6)
        self.assertEqual([d.name for d in alloc6], ["Visakhapatnam", "Visakhapatnam", "Visakhapatnam", "Kadapa", "Kadapa", "Kadapa"])

        # Empty / zero cases
        self.assertEqual(allocate_trip_days(0, [d1]), [])
        self.assertEqual(allocate_trip_days(5, []), [])

    def test_haversine_and_40km_boundary(self):
        """haversine_km correctly calculates distance and differentiates <= 40 km vs > 40 km."""
        # Bangalore centre
        b_lat, b_lon = 12.9716, 77.5946
        # Point ~10 km away in Bangalore
        p_close_lat, p_close_lon = 12.9716, 77.6846
        dist_close = haversine_km(b_lat, b_lon, p_close_lat, p_close_lon)
        self.assertLess(dist_close, 40.0)
        self.assertGreater(dist_close, 5.0)

        # Point ~55 km away (outside 40 km boundary)
        p_far_lat, p_far_lon = 12.9716, 78.1000
        dist_far = haversine_km(b_lat, b_lon, p_far_lat, p_far_lon)
        self.assertGreater(dist_far, 40.0)

        # Mysore is ~125-145 km away from Bangalore
        m_lat, m_lon = 12.2958, 76.6394
        dist_mysore = haversine_km(b_lat, b_lon, m_lat, m_lon)
        self.assertTrue(120.0 < dist_mysore < 140.0, f"Expected 120-140 km, got {dist_mysore}")

    def test_calculate_transit_between(self):
        """calculate_transit_between computes approx road km, avoids fabricated names, and flags > 400 km."""
        vizag = ResolvedDestination("Visakhapatnam", "Andhra Pradesh", 17.6868, 83.2185)
        kadapa = ResolvedDestination("Kadapa", "Andhra Pradesh", 14.4673, 78.8242)
        tirupati = ResolvedDestination("Tirupati", "Andhra Pradesh", 13.6288, 79.4192)

        # Single destination returns empty list
        self.assertEqual(calculate_transit_between([vizag]), [])
        self.assertEqual(calculate_transit_between([]), [])

        # Vizag -> Kadapa -> Tirupati
        transit = calculate_transit_between([vizag, kadapa, tirupati])
        self.assertEqual(len(transit), 2)

        # Leg 1: Vizag -> Kadapa (long transfer > 400 km)
        leg1 = transit[0]
        self.assertEqual(leg1["from"], "Visakhapatnam")
        self.assertEqual(leg1["to"], "Kadapa")
        self.assertEqual(leg1["label"], "approx")
        self.assertAlmostEqual(leg1["approxRoadKm"], round(leg1["straightLineKm"] * 1.3, 1))
        self.assertGreater(leg1["approxRoadKm"], 400.0)
        self.assertIn("warning", leg1)
        self.assertIn("Long transfer", leg1["warning"])
        # Ensure no made-up flight/train names
        self.assertNotIn("Vande Bharat", str(leg1))
        self.assertNotIn("Express", str(leg1))
        self.assertNotIn("Flight", str(leg1))

        # Leg 2: Kadapa -> Tirupati (~105 km straight line, ~136 km road, no warning)
        leg2 = transit[1]
        self.assertEqual(leg2["from"], "Kadapa")
        self.assertEqual(leg2["to"], "Tirupati")
        self.assertEqual(leg2["label"], "approx")
        self.assertAlmostEqual(leg2["approxRoadKm"], round(leg2["straightLineKm"] * 1.3, 1))
        self.assertLess(leg2["approxRoadKm"], 400.0)
        self.assertNotIn("warning", leg2)

    def test_itinerary_40km_filtering(self):
        """Activities more than 40 km from destination center are filtered or stripped."""
        from app.services.gemini_service import GeminiService
        service = GeminiService()

        vizag = ResolvedDestination("Visakhapatnam", "Andhra Pradesh", 17.6868, 83.2185)
        raw_data = {
            "tagline": "Vizag Exploration",
            "days": [
                {
                    "dayNumber": 1,
                    "theme": "Coastal Discovery",
                    "dayOfWeek": "Monday",
                    "dateStr": "Nov 14",
                    "activities": [
                        {
                            "id": "act-1-1",
                            "title": "RK Beach Walk",
                            "timeSlot": "09:00 AM",
                            "period": "morning",
                            "duration": "1.5h",
                            "cost": 0,
                            "lat": 17.7126,
                            "lon": 83.3197
                        },
                        {
                            "id": "act-1-2",
                            "title": "Kailasagiri Hilltop",
                            "timeSlot": "11:30 AM",
                            "period": "morning",
                            "duration": "2h",
                            "cost": 100,
                            "lat": 17.7492,
                            "lon": 83.3422
                        },
                        {
                            "id": "act-1-3",
                            "title": "Distant Outpost",
                            "timeSlot": "03:00 PM",
                            "period": "afternoon",
                            "duration": "2h",
                            "cost": 50,
                            "lat": 16.5000,
                            "lon": 80.6000
                        }
                    ]
                }
            ]
        }

        valid, validated = service._validate_itinerary(
            data=raw_data,
            config={"destination": "Visakhapatnam"},
            resolved_destinations=[vizag],
            day_destinations=[vizag],
            per_dest_pois={"Visakhapatnam": []},
            per_dest_poi_source={"Visakhapatnam": "none"}
        )

        self.assertTrue(valid)
        self.assertIsNotNone(validated)
        day1 = validated["days"][0]
        act_titles = [a["title"] for a in day1["activities"]]
        self.assertIn("RK Beach Walk", act_titles)
        self.assertIn("Kailasagiri Hilltop", act_titles)
        self.assertNotIn("Distant Outpost", act_titles)
        self.assertEqual(day1["dayDestination"]["name"], "Visakhapatnam")


if __name__ == "__main__":
    unittest.main()
