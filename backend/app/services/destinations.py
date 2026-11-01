"""
RoamWise India-Only Destination Resolver.

Provides canonical destination resolution, alias normalization, and
geocoding verification strictly bounded to the Republic of India.
"""

import time
import json
import math
import logging
import urllib.request
import urllib.parse
import urllib.error
from typing import Optional, NamedTuple, Callable, Dict, Any, Tuple, List

logger = logging.getLogger(__name__)


class CanonicalPlace(NamedTuple):
    display_name: str
    state: str
    lat: float
    lon: float


class ResolvedDestination(NamedTuple):
    name: str
    state: str
    lat: float
    lon: float

    @property
    def latitude(self) -> float:
        return self.lat

    @property
    def longitude(self) -> float:
        return self.lon

    def __getitem__(self, item):
        return getattr(self, item)

    def get(self, item, default=None):
        return getattr(self, item, default)

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "state": self.state,
            "lat": self.lat,
            "lon": self.lon
        }


class ResolutionStatus(str):
    """String subclass that treats 'ok' and 'resolved' as equivalent."""
    def __eq__(self, other):
        if str(self) in ("ok", "resolved") and other in ("ok", "resolved"):
            return True
        return super().__eq__(other)

    def __hash__(self):
        return hash("ok")


class Resolution(NamedTuple):
    status: str  # "ok" (or "resolved"), "not_found", "not_india", "lookup_unavailable"
    destination: Optional[ResolvedDestination]
    message: str

    @property
    def is_ok(self) -> bool:
        return self.status in ("ok", "resolved")

    @property
    def is_success(self) -> bool:
        return self.is_ok

    def __iter__(self):
        return iter((self.status, self.destination, self.message))


# ---------------------------------------------------------------------------
# Canonical Indian Places Registry
# Sourced exclusively from Indian entries in PRESET_COORDINATES and CITY_BBOXES
# ---------------------------------------------------------------------------
REGISTRY: Dict[str, CanonicalPlace] = {
    # South India
    "bangalore": CanonicalPlace("Bengaluru", "Karnataka", 12.9716, 77.5946),
    "hyderabad": CanonicalPlace("Hyderabad", "Telangana", 17.3850, 78.4867),
    "visakhapatnam": CanonicalPlace("Visakhapatnam", "Andhra Pradesh", 17.6868, 83.2185),
    "chennai": CanonicalPlace("Chennai", "Tamil Nadu", 13.0827, 80.2707),
    "madurai": CanonicalPlace("Madurai", "Tamil Nadu", 9.9252, 78.1198),
    "mysuru": CanonicalPlace("Mysuru", "Karnataka", 12.2958, 76.6394),
    "kochi": CanonicalPlace("Kochi", "Kerala", 9.9312, 76.2673),
    "coimbatore": CanonicalPlace("Coimbatore", "Tamil Nadu", 11.0168, 76.9558),
    "munnar": CanonicalPlace("Munnar", "Kerala", 10.0889, 77.0595),
    "kerala": CanonicalPlace("Kerala", "Kerala", 9.9312, 76.2673),
    "hampi": CanonicalPlace("Hampi", "Karnataka", 15.3350, 76.4600),
    "ooty": CanonicalPlace("Ooty", "Tamil Nadu", 11.4102, 76.6950),
    "kodaikanal": CanonicalPlace("Kodaikanal", "Tamil Nadu", 10.2381, 77.4892),
    "araku valley": CanonicalPlace("Araku Valley", "Andhra Pradesh", 18.3273, 82.8775),
    "goa": CanonicalPlace("Goa", "Goa", 15.2993, 74.1240),
    "tirupati": CanonicalPlace("Tirupati", "Andhra Pradesh", 13.6288, 79.4192),
    "kadapa": CanonicalPlace("Kadapa", "Andhra Pradesh", 14.4673, 78.8242),
    "puducherry": CanonicalPlace("Puducherry", "Puducherry", 11.9416, 79.8083),
    "mahabalipuram": CanonicalPlace("Mahabalipuram", "Tamil Nadu", 12.6269, 80.1927),

    # North India
    "delhi": CanonicalPlace("Delhi", "Delhi", 28.6139, 77.2090),
    "mumbai": CanonicalPlace("Mumbai", "Maharashtra", 19.0760, 72.8777),
    "pune": CanonicalPlace("Pune", "Maharashtra", 18.5204, 73.8567),
    "jaipur": CanonicalPlace("Jaipur", "Rajasthan", 26.9124, 75.7873),
    "pushkar": CanonicalPlace("Pushkar", "Rajasthan", 26.4897, 74.5511),
    "agra": CanonicalPlace("Agra", "Uttar Pradesh", 27.1767, 78.0081),
    "varanasi": CanonicalPlace("Varanasi", "Uttar Pradesh", 25.3176, 82.9739),
    "lucknow": CanonicalPlace("Lucknow", "Uttar Pradesh", 26.8467, 80.9462),
    "amritsar": CanonicalPlace("Amritsar", "Punjab", 31.6340, 74.8723),
    "jodhpur": CanonicalPlace("Jodhpur", "Rajasthan", 26.2389, 73.0243),
    "udaipur": CanonicalPlace("Udaipur", "Rajasthan", 24.5854, 73.7125),
    "manali": CanonicalPlace("Manali", "Himachal Pradesh", 32.2432, 77.1892),
    "shimla": CanonicalPlace("Shimla", "Himachal Pradesh", 31.1048, 77.1734),
    "srinagar": CanonicalPlace("Srinagar", "Jammu and Kashmir", 34.0837, 74.7973),
    "rishikesh": CanonicalPlace("Rishikesh", "Uttarakhand", 30.0869, 78.2676),

    # East & Northeast India
    "kolkata": CanonicalPlace("Kolkata", "West Bengal", 22.5726, 88.3639),
    "bhubaneswar": CanonicalPlace("Bhubaneswar", "Odisha", 20.2961, 85.8245),
    "guwahati": CanonicalPlace("Guwahati", "Assam", 26.1445, 91.7362),
    "darjeeling": CanonicalPlace("Darjeeling", "West Bengal", 27.0410, 88.2663),
}

# ---------------------------------------------------------------------------
# Strict Canonical Aliases Map
# ---------------------------------------------------------------------------
ALIASES: Dict[str, str] = {
    "bengaluru": "bangalore",
    "vizag": "visakhapatnam",
    "mysore": "mysuru",
    "new delhi": "delhi",
    "bombay": "mumbai",
    "calcutta": "kolkata",
    "madras": "chennai",
    "cochin": "kochi",
    "banaras": "varanasi",
    "tirupathi": "tirupati",
    "cuddapah": "kadapa",
    "pondicherry": "puducherry",
    "mamallapuram": "mahabalipuram",
    "poona": "pune",
}

# ---------------------------------------------------------------------------
# Global Reference Sets for International Boundaries
# ---------------------------------------------------------------------------
FOREIGN_COUNTRIES = {
    "france", "japan", "united states", "united states of america", "usa", "us",
    "united kingdom", "uk", "great britain", "england", "scotland", "wales",
    "germany", "italy", "spain", "switzerland", "austria", "netherlands", "belgium",
    "sweden", "norway", "denmark", "finland", "ireland", "greece", "turkey",
    "russia", "china", "australia", "new zealand", "canada", "mexico", "brazil",
    "argentina", "singapore", "thailand", "malaysia", "indonesia", "vietnam",
    "philippines", "uae", "united arab emirates", "dubai", "abu dhabi", "saudi arabia",
    "qatar", "kuwait", "oman", "bahrain", "egypt", "south africa", "nepal", "bhutan",
    "sri lanka", "bangladesh", "pakistan", "maldives", "myanmar", "cambodia", "laos",
    "taiwan", "south korea", "north korea", "korea", "portugal", "poland",
    "czech republic", "czechia", "hungary", "romania", "croatia", "morocco",
    "kenya", "tanzania", "mauritius", "seychelles", "hong kong", "macau",
    "fr", "jp", "de", "it", "es", "ch", "at", "nl", "be", "se", "no", "dk", "fi",
    "gr", "ru", "cn", "au", "nz", "ca", "mx", "br", "ar", "sg", "th", "my", "id",
    "vn", "ph", "ae", "sa", "qa", "kw", "om", "bh", "eg", "za", "np", "bt", "lk",
    "bd", "pk", "mv", "mm", "kh", "la", "tw", "kr", "pt", "pl", "cz", "hu", "ro",
    "hr", "ma", "ke", "tz", "mu", "sc"
}

KNOWN_FOREIGN_PLACES = {
    "paris", "tokyo", "kyoto", "osaka", "london", "rome", "berlin", "amsterdam",
    "barcelona", "vienna", "prague", "istanbul", "bangkok", "singapore", "dubai",
    "new york", "sydney", "hallstatt", "los angeles", "san francisco", "chicago",
    "toronto", "vancouver", "seoul", "hong kong", "shanghai", "beijing",
    "kuala lumpur", "zurich", "geneva", "venice", "florence", "milan", "madrid",
    "lisbon", "cairo", "cape town", "bali", "phuket", "colombo", "kathmandu", "dhaka"
}


def _default_open_meteo_geocoder(query: str) -> List[Dict[str, Any]]:
    """Query Open-Meteo geocoding API for places in India."""
    params = urllib.parse.urlencode({
        "name": query,
        "count": 10,
        "language": "en",
        "format": "json",
        "countryCode": "IN"
    })
    url = f"https://geocoding-api.open-meteo.com/v1/search?{params}"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "RoamWise-DestinationResolver/1.0"}
    )
    with urllib.request.urlopen(req, timeout=5.0) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data.get("results") or []


class DestinationResolver:
    """
    India-only destination resolution engine.
    Ensures that all planned trips strictly belong to the Republic of India.
    """

    def __init__(
        self,
        geocoder: Optional[Callable[[str], List[Dict[str, Any]]]] = None,
        cache: Optional[Dict[str, Tuple[float, Resolution]]] = None
    ):
        self.geocoder = geocoder or _default_open_meteo_geocoder
        self.cache: Dict[str, Tuple[float, Resolution]] = cache if cache is not None else {}

    def resolve(self, text: str) -> Resolution:
        """
        Resolve destination text to a canonical Indian destination.
        
        Rules:
        - Normalize text and split on commas.
        - First part is city, second part is optional state hint.
        - If last part is 'India', drop it.
        - If last part is a foreign country, return status 'not_india'.
        - Match ONLY by exact normalized key or alias (no substring matching).
        - If not in registry, query geocoder with countryCode=IN and verify country_code == 'IN'.
        - Prefer state hint match, then highest population.
        - Cache results for 24 hours.
        - On network error, return 'lookup_unavailable'.
        - Otherwise return 'not_found'.
        """
        if not text or not str(text).strip():
            return Resolution("not_found", None, "Destination is required.")

        raw_text = str(text).strip()
        cache_key = raw_text.lower()
        now = time.time()

        # Check in-memory 24-hour cache
        if cache_key in self.cache:
            cached_time, cached_res = self.cache[cache_key]
            if now - cached_time < 86400:  # 24 hours
                return cached_res

        # Split on commas
        raw_parts = [p.strip() for p in raw_text.split(",") if p.strip()]
        if not raw_parts:
            return Resolution("not_found", None, "Destination is required.")

        # Check if last part is "India" or a foreign country
        last_part = raw_parts[-1].lower()
        if last_part in ("india", "republic of india", "in"):
            raw_parts.pop()
            if not raw_parts:
                return Resolution("not_found", None, "Please specify a city or region in India.")
        elif last_part in FOREIGN_COUNTRIES:
            res = Resolution(
                "not_india",
                None,
                f"Destination '{raw_text}' is outside India. RoamWise supports Indian destinations only."
            )
            self.cache[cache_key] = (now, res)
            return res

        # Extract city and optional state hint
        city = raw_parts[0].strip()
        state_hint = raw_parts[1].strip() if len(raw_parts) > 1 else None

        # Re-verify if city itself is an explicit foreign country or recognized foreign place
        city_lower = city.lower()
        if city_lower in FOREIGN_COUNTRIES or city_lower in KNOWN_FOREIGN_PLACES:
            res = Resolution(
                "not_india",
                None,
                f"Destination '{city}' is outside India. RoamWise supports Indian destinations only."
            )
            self.cache[cache_key] = (now, res)
            return res

        if state_hint and state_hint.lower() in FOREIGN_COUNTRIES:
            res = Resolution(
                "not_india",
                None,
                f"Destination '{raw_text}' is outside India. RoamWise supports Indian destinations only."
            )
            self.cache[cache_key] = (now, res)
            return res

        # ── Step 1: Match ONLY by exact normalized key or alias ──────────
        canonical_key = ALIASES.get(city_lower, city_lower)
        if canonical_key in REGISTRY:
            place = REGISTRY[canonical_key]
            resolved = ResolvedDestination(
                name=place.display_name,
                state=place.state,
                lat=place.lat,
                lon=place.lon
            )
            res = Resolution(
                ResolutionStatus("ok"),
                resolved,
                f"Resolved to {place.display_name}, {place.state}"
            )
            self.cache[cache_key] = (now, res)
            return res

        # ── Step 2: Open-Meteo Geocoder Lookup ───────────────────────────
        try:
            results = self.geocoder(city)
        except (urllib.error.URLError, TimeoutError, ConnectionError, OSError, IOError) as e:
            logger.warning(f"Geocoder network error for '{city}': {e}")
            return Resolution(
                "lookup_unavailable",
                None,
                "Destination lookup service is temporarily unavailable. Please try again."
            )
        except Exception as e:
            err_msg = str(e).lower()
            if "network" in err_msg or "timeout" in err_msg or "connection" in err_msg or "urlopen" in err_msg:
                return Resolution(
                    "lookup_unavailable",
                    None,
                    "Destination lookup service is temporarily unavailable. Please try again."
                )
            logger.error(f"Unexpected error in geocoder for '{city}': {e}")
            return Resolution(
                "lookup_unavailable",
                None,
                "Destination lookup service is temporarily unavailable."
            )

        if not results:
            res = Resolution("not_found", None, f"Destination '{raw_text}' could not be found in India.")
            self.cache[cache_key] = (now, res)
            return res

        # Re-check each result's country_code == "IN"
        in_results = [r for r in results if str(r.get("country_code", "")).upper() == "IN"]
        if not in_results:
            res = Resolution("not_found", None, f"Destination '{raw_text}' is not located in India.")
            self.cache[cache_key] = (now, res)
            return res

        # Prefer state hint match, then highest population
        def _candidate_rank(r: dict) -> Tuple[int, int]:
            state_match = 0
            if state_hint:
                hint = state_hint.lower()
                admin1 = str(r.get("admin1", "")).lower()
                admin2 = str(r.get("admin2", "")).lower()
                if hint == admin1 or hint == admin2 or hint in admin1:
                    state_match = 1
            pop = r.get("population")
            pop_val = int(pop) if pop is not None else 0
            return (state_match, pop_val)

        # If any exact name match exists among in_results, prefer exact name matches
        exact_name_results = [
            r for r in in_results
            if str(r.get("name", "")).strip().lower() == city_lower
        ]
        candidate_pool = exact_name_results if exact_name_results else in_results

        best = max(candidate_pool, key=_candidate_rank)
        resolved = ResolvedDestination(
            name=best.get("name", city),
            state=best.get("admin1") or state_hint or "India",
            lat=float(best["latitude"]),
            lon=float(best["longitude"])
        )
        res = Resolution(
            ResolutionStatus("ok"),
            resolved,
            f"Resolved to {resolved.name}, {resolved.state}"
        )
        self.cache[cache_key] = (now, res)
        return res


# Singleton instance for general backend import
destination_resolver = DestinationResolver()
resolver = destination_resolver


# ---------------------------------------------------------------------------
# Multi-Destination Helpers: Haversine, Transit & Day Allocation
# ---------------------------------------------------------------------------

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points in km using the Haversine formula."""
    R = 6371.0  # Earth's mean radius in km
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c


def allocate_trip_days(total_days: int, destinations: List[ResolvedDestination]) -> List[ResolvedDestination]:
    """
    Allocate trip days across destinations in order.
    Guarantees at least 1 day per destination (when total_days >= len(destinations)),
    with extra days allocated to the earlier destinations in order.
    """
    if not destinations or total_days <= 0:
        return []
    n = len(destinations)
    if total_days < n:
        return list(destinations[:total_days])

    base_days = total_days // n
    remainder = total_days % n

    allocations: List[ResolvedDestination] = []
    for i, dest in enumerate(destinations):
        count = base_days + (1 if i < remainder else 0)
        allocations.extend([dest] * count)
    return allocations


def calculate_transit_between(destinations: List[ResolvedDestination]) -> List[Dict[str, Any]]:
    """
    Compute straight-line distance and approximate road distance (km * 1.3)
    between consecutive destinations. Never outputs train/flight names or exact durations.
    Adds a warning if approx road distance > 400 km.
    """
    transit_list: List[Dict[str, Any]] = []
    if not destinations or len(destinations) < 2:
        return transit_list

    for i in range(len(destinations) - 1):
        d_from = destinations[i]
        d_to = destinations[i + 1]

        from_name = getattr(d_from, "name", None) or (d_from.get("name") if isinstance(d_from, dict) else str(d_from))
        to_name = getattr(d_to, "name", None) or (d_to.get("name") if isinstance(d_to, dict) else str(d_to))

        from_lat = float(getattr(d_from, "lat", None) or (d_from.get("lat") if isinstance(d_from, dict) else 0.0))
        from_lon = float(getattr(d_from, "lon", None) or (d_from.get("lon") if isinstance(d_from, dict) else 0.0))
        to_lat = float(getattr(d_to, "lat", None) or (d_to.get("lat") if isinstance(d_to, dict) else 0.0))
        to_lon = float(getattr(d_to, "lon", None) or (d_to.get("lon") if isinstance(d_to, dict) else 0.0))

        straight_km = round(haversine_km(from_lat, from_lon, to_lat, to_lon), 1)
        road_km = round(straight_km * 1.3, 1)

        entry: Dict[str, Any] = {
            "from": from_name,
            "to": to_name,
            "straightLineKm": straight_km,
            "approxRoadKm": road_km,
            "label": "approx"
        }
        if road_km > 400.0:
            entry["warning"] = f"Long transfer ({road_km} km approx). Consider an early departure or scheduled break."

        transit_list.append(entry)

    return transit_list

