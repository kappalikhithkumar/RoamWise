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
    ALIASES
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


if __name__ == "__main__":
    unittest.main()
