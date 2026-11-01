"""
poi_service.py — RoamWise POI Discovery Layer

Architecture:
    1. Primary: OpenStreetMap Overpass API (live verified coordinates, names, categories)
    2. Fallback: Curated, hand-verified local landmark dictionaries per major destination
    3. Disclosure: Always surfaces provenance so the application can label data honestly

Supported query types:
    - tourism=attraction|museum|viewpoint|gallery|zoo|theme_park
    - historic=monument|palace|castle|ruins|archaeological_site|temple
    - leisure=garden|park|nature_reserve

Usage:
    service = POIService()
    pois = service.get_pois("Bangalore", max_results=20)
    # Returns list of dicts with: name, lat, lon, category, tags, source
"""
import logging
import urllib.request
import urllib.parse
import json
import re
from typing import Optional

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Overpass configuration
# ---------------------------------------------------------------------------
OVERPASS_ENDPOINT = "https://overpass-api.de/api/interpreter"
OVERPASS_TIMEOUT_SECONDS = 8  # Tight budget — must not stall itinerary generation

# ---------------------------------------------------------------------------
# Geocoding bounding boxes for well-known cities (lat_min, lon_min, lat_max, lon_max)
# Used when Nominatim geocoding is skipped for speed
# ---------------------------------------------------------------------------
CITY_BBOXES: dict[str, tuple[float, float, float, float]] = {
    # South India
    "bangalore": (12.85, 77.45, 13.10, 77.75),
    "bengaluru": (12.85, 77.45, 13.10, 77.75),
    "hyderabad": (17.30, 78.35, 17.55, 78.60),
    "visakhapatnam": (17.60, 83.15, 17.80, 83.35),
    "vizag": (17.60, 83.15, 17.80, 83.35),
    "chennai": (12.95, 80.15, 13.20, 80.35),
    "madurai": (9.90, 78.08, 10.00, 78.18),
    "mysuru": (12.25, 76.55, 12.40, 76.75),
    "mysore": (12.25, 76.55, 12.40, 76.75),
    "kochi": (9.92, 76.22, 10.05, 76.35),
    "coimbatore": (10.95, 76.90, 11.05, 77.05),
    # North India
    "delhi": (28.50, 77.05, 28.75, 77.35),
    "new delhi": (28.50, 77.05, 28.75, 77.35),
    "mumbai": (18.90, 72.77, 19.15, 72.95),
    "kolkata": (22.50, 88.30, 22.65, 88.45),
    "jaipur": (26.85, 75.75, 26.97, 75.90),
    "agra": (27.14, 77.95, 27.22, 78.07),
    "varanasi": (25.28, 82.97, 25.35, 83.07),
    "lucknow": (26.80, 80.88, 26.95, 81.05),
    "amritsar": (31.60, 74.84, 31.68, 74.92),
    "jodhpur": (26.27, 73.00, 26.35, 73.10),
    "udaipur": (24.55, 73.66, 24.65, 73.75),
    # East / Northeast India
    "bhubaneswar": (20.22, 85.78, 20.30, 85.90),
    "guwahati": (26.13, 91.72, 26.22, 91.82),
    # Destinations
    "goa": (15.25, 73.85, 15.65, 74.10),
    "hampi": (15.30, 76.44, 15.37, 76.52),
    "ooty": (11.38, 76.68, 11.44, 76.74),
    "araku valley": (18.30, 82.85, 18.40, 82.95),
    "kodaikanal": (10.23, 77.47, 10.27, 77.51),
    "darjeeling": (27.03, 88.25, 27.07, 88.30),
}

# Category priority used in display + Plan B logic
OVERPASS_TAGS = {
    "tourism": ["attraction", "museum", "viewpoint", "gallery", "zoo", "theme_park", "artwork"],
    "historic": ["monument", "palace", "castle", "ruins", "archaeological_site", "temple", "fort"],
    "leisure": ["garden", "park", "nature_reserve"],
}


def _build_overpass_query(bbox: tuple[float, float, float, float], limit: int = 120) -> str:
    """Build an Overpass QL query for a bounding box."""
    s, w, n, e = bbox
    bbox_str = f"({s},{w},{n},{e})"
    filters = []
    for tag_key, tag_values in OVERPASS_TAGS.items():
        values_regex = "|".join(tag_values)
        filters.append(f'nwr[{tag_key}~"{values_regex}"][name]{bbox_str}')
    union = ";\n  ".join(filters)
    return f"""[out:json][timeout:{OVERPASS_TIMEOUT_SECONDS}];
(
  {union};
);
out tags center {limit};
"""


def _resolve_bbox(destination: str) -> Optional[tuple[float, float, float, float]]:
    """
    Find bounding box for an Indian destination via destinations.resolver.
    If destination is not in predefined CITY_BBOXES, dynamically builds
    a ~7 km bounding box around the geocoded lat/lon coordinates.
    """
    import math
    from app.services import destinations

    res = destinations.resolver.resolve(destination)
    if not res.is_ok or not res.destination:
        return None

    canonical_name = res.destination.name.lower().strip()
    if canonical_name in CITY_BBOXES:
        return CITY_BBOXES[canonical_name]

    from app.services.destinations import ALIASES
    alias_key = ALIASES.get(canonical_name)
    if alias_key and alias_key in CITY_BBOXES:
        return CITY_BBOXES[alias_key]

    # For any resolved Indian destination NOT in CITY_BBOXES:
    # Build a bbox of about 7 km around the geocoded lat/lon
    lat = float(res.destination.lat)
    lon = float(res.destination.lon)
    delta_lat = 7.0 / 111.0
    cos_lat = math.cos(math.radians(lat))
    delta_lon = 7.0 / (111.0 * cos_lat) if cos_lat > 0.01 else 7.0 / 111.0

    return (
        round(lat - delta_lat, 4),
        round(lon - delta_lon, 4),
        round(lat + delta_lat, 4),
        round(lon + delta_lon, 4),
    )


def _extract_pois(elements: list[dict]) -> list[dict]:
    """Transform raw Overpass elements into normalized POI dicts, ranking Wikipedia/Wikidata places first."""
    pois = []
    seen_names: set[str] = set()
    for el in elements:
        tags = el.get("tags", {})
        name = tags.get("name", "").strip()
        name_en = tags.get("name:en", "").strip()
        display_name = name_en if name_en else name
        if not display_name or display_name.lower() in seen_names:
            continue
        seen_names.add(display_name.lower())

        # Resolve coordinates
        lat = el.get("lat") or el.get("center", {}).get("lat")
        lon = el.get("lon") or el.get("center", {}).get("lon")

        # Determine primary category
        category = "Attraction"
        for tag_key in ("tourism", "historic", "leisure"):
            if tag_key in tags:
                val = tags[tag_key]
                category_map = {
                    "museum": "Museum", "attraction": "Attraction", "viewpoint": "Viewpoint",
                    "gallery": "Art Gallery", "garden": "Garden", "park": "Park",
                    "monument": "Monument", "palace": "Palace", "castle": "Fort/Castle",
                    "ruins": "Heritage Ruins", "archaeological_site": "Archaeological Site",
                    "temple": "Temple", "fort": "Fort",
                    "nature_reserve": "Nature Reserve", "zoo": "Zoo",
                }
                category = category_map.get(val, val.title())
                break

        pois.append({
            "name": display_name,
            "lat": lat,
            "lon": lon,
            "category": category,
            "tags": {k: v for k, v in tags.items() if k in ("tourism", "historic", "leisure", "wikidata", "wikipedia", "opening_hours", "fee")},
            "source": "openstreetmap",
        })

    # Rank Wikipedia / Wikidata-tagged places first
    def _rank_poi(p: dict) -> tuple[int, int]:
        tags = p.get("tags", {})
        has_wiki = 1 if ("wikipedia" in tags or "wikidata" in tags) else 0
        is_major = 1 if p.get("category") in ("Museum", "Monument", "Palace", "Fort/Castle", "Temple", "Attraction") else 0
        return (has_wiki, is_major)

    pois.sort(key=_rank_poi, reverse=True)
    return pois


class POIService:
    """
    Two-tier POI discovery service.

    Tier 1 (Live): Queries OpenStreetMap Overpass API for real named attractions with
                   verified coordinates. Results are disclosed as `source: openstreetmap`.

    Tier 2 (Fallback): Returns from a curated, hand-verified dictionary of landmarks
                        per supported city. Results are disclosed as `source: curated`.

    If neither tier can produce results, returns an empty list with a disclosure message
    rather than inventing attraction names.
    """

    def __init__(self):
        self._cache: dict[str, tuple[float, dict]] = {}

    def get_pois(
        self,
        destination: str,
        max_results: int = 20,
        interests: list[str] = None,
        prefer_live: bool = False,
    ) -> dict:
        """
        Retrieve POIs for a destination.

        Returns:
            {
                "pois": [...],
                "source": "curated" | "openstreetmap" | "none",
                "sourceDisclosure": str,
                "destination": str,
            }
        """
        import time
        from app.services import destinations

        # Resolve destination via destinations.resolver
        res = destinations.resolver.resolve(destination)
        if not res.is_ok or not res.destination:
            return {
                "pois": [],
                "source": "none",
                "sourceDisclosure": res.message,
                "destination": destination,
            }

        canonical_name = res.destination.name
        canonical_key = canonical_name.lower().strip()
        now = time.time()

        # ── 24h in-memory cache keyed by canonical destination ───────────
        cache_key = f"{canonical_key}:{'live' if prefer_live else 'default'}"
        cached_entry = None
        if cache_key in self._cache:
            cached_time, cached_data = self._cache[cache_key]
            if now - cached_time < 86400:  # 24 hours
                cached_entry = cached_data
        elif not prefer_live and canonical_key in self._cache:
            cached_time, cached_data = self._cache[canonical_key]
            if now - cached_time < 86400:
                cached_entry = cached_data

        if cached_entry:
            raw_pois = cached_entry["pois"]
            source = cached_entry["source"]
            disclosure = cached_entry["sourceDisclosure"]
        else:
            raw_pois = []
            source = "none"
            disclosure = ""

            # ── Tier 1: Check curated verified database first (sub-millisecond, highly reliable) ──
            if not prefer_live:
                curated = _get_curated_pois(destination)
                if curated:
                    raw_pois = list(curated)
                    source = "curated"
                    disclosure = (
                        f"Attractions sourced from verified landmark database for {destination}. "
                        "Recognized heritage sites, museums, and natural landmarks with real coordinates."
                    )
                    logger.info(f"[POI] Using curated database: {len(raw_pois)} POIs for '{destination}'")

            # ── Tier 2: OpenStreetMap Overpass API (for uncataloged destinations or when live requested) ──
            if not raw_pois:
                bbox = _resolve_bbox(destination)
                if bbox:
                    try:
                        # Query about 120 elements as specified
                        query = _build_overpass_query(bbox, limit=120)
                        encoded = urllib.parse.quote(query)
                        url = f"{OVERPASS_ENDPOINT}?data={encoded}"
                        req = urllib.request.Request(
                            url,
                            headers={"User-Agent": "RoamWise-AI-Planner/2.0 (travel app; contact@roamwise.ai)"}
                        )
                        # Client timeout set to server timeout + 3s (8s + 3s = 11s)
                        client_timeout = OVERPASS_TIMEOUT_SECONDS + 3
                        with urllib.request.urlopen(req, timeout=client_timeout) as resp:
                            data = json.loads(resp.read().decode())
                        elements = data.get("elements", [])
                        raw_pois = _extract_pois(elements)
                        if raw_pois:
                            source = "openstreetmap"
                            disclosure = (
                                f"Attractions sourced live from OpenStreetMap contributors for {destination}. "
                                "Names, coordinates, and categories are community-verified data."
                            )
                            logger.info(f"[POI] Overpass returned {len(raw_pois)} POIs for '{destination}'")
                    except Exception as e:
                        logger.warning(f"[POI] Overpass API unavailable for '{destination}': {e}")

            # ── Tier 3: Secondary check of curated if prefer_live was true but Overpass failed ──
            if not raw_pois and prefer_live:
                curated = _get_curated_pois(destination)
                if curated:
                    raw_pois = list(curated)
                    source = "curated"
                    disclosure = (
                        f"Attractions sourced from verified landmark database for {destination} (Overpass live fallback)."
                    )

            # ── Tier 4: No external POIs found ────────────────────────────────
            if not raw_pois:
                source = "none"
                disclosure = (
                    f"No external verified POI database match found for '{destination}'. "
                    "Gemini AI will synthesize recommendations using its parametric travel knowledge. "
                    "Please verify opening hours independently before travel."
                )
                logger.info(f"[POI] No POIs found for '{destination}' — falling back to model knowledge")

            # Store in 24h in-memory cache keyed by canonical destination
            self._cache[cache_key] = (now, {
                "pois": raw_pois,
                "source": source,
                "sourceDisclosure": disclosure,
            })
            if canonical_key not in self._cache:
                self._cache[canonical_key] = (now, {
                    "pois": raw_pois,
                    "source": source,
                    "sourceDisclosure": disclosure,
                })

        # Filter by interests if provided
        if interests and raw_pois:
            pois = _filter_by_interests(raw_pois, interests, max_results)
        else:
            pois = raw_pois[:max_results]

        return {
            "pois": pois,
            "source": source,
            "sourceDisclosure": disclosure,
            "destination": destination,
        }


# ---------------------------------------------------------------------------
# Interest-based filtering
# ---------------------------------------------------------------------------
_INTEREST_CATEGORY_MAP: dict[str, list[str]] = {
    "History": ["Museum", "Monument", "Palace", "Fort/Castle", "Heritage Ruins",
                "Archaeological Site", "Fort", "Attraction"],
    "Culture": ["Art Gallery", "Museum", "Attraction", "Temple", "Monument"],
    "Nature": ["Garden", "Park", "Nature Reserve", "Viewpoint", "Zoo"],
    "Adventure": ["Viewpoint", "Nature Reserve", "Park", "Attraction"],
    "Spiritual": ["Temple", "Attraction"],
    "Food": ["Attraction"],  # Overpass rarely tags restaurants as attractions; Gemini handles food
    "Relaxation": ["Garden", "Park", "Viewpoint"],
    "Art": ["Art Gallery", "Museum", "Attraction"],
}


def _filter_by_interests(pois: list[dict], interests: list[str], max_results: int) -> list[dict]:
    """Prefer POIs matching user interests; append remaining ones up to max."""
    preferred_cats: set[str] = set()
    for interest in interests:
        for cat in _INTEREST_CATEGORY_MAP.get(interest, []):
            preferred_cats.add(cat)
    preferred = [p for p in pois if p["category"] in preferred_cats]
    others = [p for p in pois if p not in preferred]
    combined = preferred + others
    return combined[:max_results]


# ---------------------------------------------------------------------------
# Curated, hand-verified landmark database
# Criteria: Real place name, confirmed as tourist attraction, geographically accurate area
# ---------------------------------------------------------------------------
def _curated_landmark(name: str, area: str, category: str, lat: Optional[float], lon: Optional[float],
                       tags: dict = None) -> dict:
    return {
        "name": name,
        "lat": lat,
        "lon": lon,
        "category": category,
        "area": area,
        "tags": tags or {},
        "source": "curated",
    }


_CURATED_DB: dict[str, list[dict]] = {

    # ── Bangalore / Bengaluru ────────────────────────────────────────────
    "bangalore": [
        _curated_landmark("Lalbagh Botanical Garden", "Mavalli, Bengaluru", "Garden", 12.9507, 77.5848,
                          {"tourism": "attraction", "wikipedia": "en:Lalbagh"}),
        _curated_landmark("Cubbon Park", "Kasturba Road, Bengaluru", "Park", 12.9763, 77.5929,
                          {"leisure": "park", "wikipedia": "en:Cubbon Park"}),
        _curated_landmark("Bangalore Palace", "Vasanth Nagar, Bengaluru", "Palace", 12.9984, 77.5922,
                          {"historic": "palace", "wikipedia": "en:Bangalore Palace"}),
        _curated_landmark("Vidhana Soudha", "Dr. Ambedkar Veedhi, Bengaluru", "Monument", 12.9791, 77.5913,
                          {"tourism": "attraction", "wikipedia": "en:Vidhana Soudha"}),
        _curated_landmark("Tipu Sultan's Summer Palace", "Albert Victor Road, Bengaluru", "Palace", 12.9600, 77.5737,
                          {"historic": "palace", "wikipedia": "en:Tipu Sultan's Summer Palace, Bangalore"}),
        _curated_landmark("Visvesvaraya Industrial and Technological Museum", "Kasturba Road, Bengaluru", "Museum", 12.9744, 77.5939,
                          {"tourism": "museum", "wikipedia": "en:Visvesvaraya Industrial and Technological Museum"}),
        _curated_landmark("National Gallery of Modern Art, Bengaluru", "Palace Road, Bengaluru", "Art Gallery", 12.9986, 77.5886,
                          {"tourism": "gallery", "wikipedia": "en:National Gallery of Modern Art, Bangalore"}),
        _curated_landmark("ISKCON Temple Bangalore", "Chord Road, Rajajinagar, Bengaluru", "Temple", 13.0101, 77.5545,
                          {"tourism": "attraction", "wikipedia": "en:ISKCON Bangalore"}),
        _curated_landmark("Ulsoor Lake", "Ulsoor, Bengaluru", "Park", 12.9833, 77.6218,
                          {"leisure": "park", "wikipedia": "en:Ulsoor Lake"}),
        _curated_landmark("HAL Aerospace Museum & Heritage Centre", "HAL Airport Road, Bengaluru", "Museum", 12.9602, 77.6620,
                          {"tourism": "museum", "wikipedia": "en:HAL Aerospace Museum"}),
        _curated_landmark("Bannerghatta National Park", "Bannerghatta, Bengaluru", "Nature Reserve", 12.7997, 77.5761,
                          {"leisure": "nature_reserve", "wikipedia": "en:Bannerghatta National Park"}),
        _curated_landmark("Commercial Street", "Tasker Town, Bengaluru", "Attraction", 12.9830, 77.6080,
                          {"tourism": "attraction"}),
        _curated_landmark("Dodda Basavanna (Bull Temple)", "Basavanagudi, Bengaluru", "Temple", 12.9416, 77.5706,
                          {"tourism": "attraction", "wikipedia": "en:Bull Temple, Bangalore"}),
        _curated_landmark("Jawaharlal Nehru Planetarium", "Race Course Road, Bengaluru", "Attraction", 12.9982, 77.5783,
                          {"tourism": "attraction", "wikipedia": "en:Jawaharlal Nehru Planetarium, Bangalore"}),
        _curated_landmark("Karnataka Chitrakala Parishath", "Kumara Krupa Road, Bengaluru", "Art Gallery", 12.9878, 77.5881,
                          {"tourism": "gallery"}),
        _curated_landmark("Freedom Park (former Central Jail)", "Gandhinagar, Bengaluru", "Park", 12.9771, 77.5729,
                          {"leisure": "park", "wikipedia": "en:Freedom Park, Bangalore"}),
        _curated_landmark("Wonderla Amusement Park", "Mysore Road, Bengaluru", "Attraction", 12.8367, 77.3824,
                          {"tourism": "theme_park", "wikipedia": "en:Wonderla"}),
        _curated_landmark("MTR Restaurant (Mavalli Tiffin Rooms)", "Lalbagh Road, Bengaluru", "Attraction", 12.9475, 77.5769,
                          {"tourism": "attraction"}),
    ],

    # ── Mysuru / Mysore ──────────────────────────────────────────────────
    "mysuru": [
        _curated_landmark("Mysore Palace (Amba Vilas Palace)", "Sayyaji Rao Road, Mysuru", "Palace", 12.3052, 76.6551,
                          {"historic": "palace", "wikipedia": "en:Mysore Palace"}),
        _curated_landmark("Chamundeshwari Temple", "Chamundi Hills, Mysuru", "Temple", 12.2724, 76.6683,
                          {"tourism": "attraction", "wikipedia": "en:Chamundeshwari Temple"}),
        _curated_landmark("Brindavan Gardens", "KRS Dam, Mandya", "Garden", 12.4241, 76.5724,
                          {"leisure": "garden", "wikipedia": "en:Brindavan Gardens"}),
        _curated_landmark("Mysore Zoo (Sri Chamarajendra Zoological Gardens)", "Mysuru", "Zoo", 12.2999, 76.6568,
                          {"tourism": "zoo", "wikipedia": "en:Mysore Zoo"}),
        _curated_landmark("St. Philomena's Cathedral", "Ashoka Road, Mysuru", "Attraction", 12.3123, 76.6526,
                          {"tourism": "attraction", "wikipedia": "en:St. Philomena's Cathedral, Mysore"}),
        _curated_landmark("Jaganmohan Palace & Art Gallery", "Jayachamarajendra, Mysuru", "Art Gallery", 12.3044, 76.6512,
                          {"tourism": "gallery", "wikipedia": "en:Jaganmohan Palace"}),
    ],

    # ── Hampi ────────────────────────────────────────────────────────────
    "hampi": [
        _curated_landmark("Virupaksha Temple", "Hampi Bazaar, Hampi", "Temple", 15.3350, 76.4600,
                          {"tourism": "attraction", "wikipedia": "en:Virupaksha Temple, Hampi"}),
        _curated_landmark("Vijaya Vittala Temple & Stone Chariot", "Vitthala Road, Hampi", "Heritage Ruins", 15.3386, 76.4749,
                          {"tourism": "attraction", "wikipedia": "en:Vittala Temple, Hampi"}),
        _curated_landmark("Lotus Mahal", "Royal Enclosure, Hampi", "Heritage Ruins", 15.3212, 76.4665,
                          {"historic": "ruins", "wikipedia": "en:Lotus Mahal"}),
        _curated_landmark("Elephant Stables", "Royal Enclosure, Hampi", "Heritage Ruins", 15.3225, 76.4662,
                          {"historic": "ruins", "wikipedia": "en:Elephant Stables, Hampi"}),
        _curated_landmark("Hemakuta Hill Temples", "Hemakuta, Hampi", "Temple", 15.3332, 76.4574,
                          {"tourism": "attraction"}),
        _curated_landmark("Queen's Bath", "Royal Enclosure, Hampi", "Heritage Ruins", 15.3196, 76.4680,
                          {"historic": "ruins", "wikipedia": "en:Queen's Bath, Hampi"}),
        _curated_landmark("Hazara Rama Temple", "Royal Enclosure, Hampi", "Temple", 15.3216, 76.4640,
                          {"tourism": "attraction", "wikipedia": "en:Hazara Rama Temple"}),
        _curated_landmark("Matanga Hill Sunrise Viewpoint", "Hampi", "Viewpoint", 15.3350, 76.4679,
                          {"tourism": "viewpoint"}),
    ],

    # ── Araku Valley ─────────────────────────────────────────────────────
    "araku valley": [
        _curated_landmark("Borra Caves (Borra Guhalu)", "Ananthagiri Hills, Araku Valley", "Attraction", 18.2756, 83.0369,
                          {"tourism": "attraction", "wikipedia": "en:Borra Caves"}),
        _curated_landmark("Padmapuram Gardens", "Araku Valley", "Garden", 18.3273, 82.8775,
                          {"leisure": "garden"}),
        _curated_landmark("Tribal Museum (Araku)", "Araku Valley", "Museum", 18.3260, 82.8780,
                          {"tourism": "museum"}),
        _curated_landmark("Chaparai Water Cascades", "Araku Valley", "Attraction", 18.3219, 82.8843,
                          {"tourism": "attraction"}),
        _curated_landmark("Ananthagiri Coffee Plantations", "Ananthagiri, Araku Valley", "Nature Reserve", 18.3060, 83.0100,
                          {"tourism": "attraction"}),
        _curated_landmark("Katiki Waterfalls", "Ananthagiri, Vizag District", "Attraction", 18.2476, 83.0340,
                          {"tourism": "attraction"}),
    ],

    # ── Ooty ─────────────────────────────────────────────────────────────
    "ooty": [
        _curated_landmark("Government Botanical Garden, Ooty", "Udagamandalam", "Garden", 11.4115, 76.6914,
                          {"leisure": "garden", "wikipedia": "en:Government Botanical Gardens, Ooty"}),
        _curated_landmark("Ooty Lake", "Ooty", "Park", 11.4073, 76.6932,
                          {"leisure": "park", "wikipedia": "en:Ooty Lake"}),
        _curated_landmark("Nilgiri Mountain Railway (Rack Section)", "Ooty to Mettupalayam", "Attraction", 11.4065, 76.6991,
                          {"tourism": "attraction", "wikipedia": "en:Nilgiri Mountain Railway"}),
        _curated_landmark("Doddabetta Peak", "Doddabetta, Ooty", "Viewpoint", 11.4063, 76.7352,
                          {"tourism": "viewpoint", "wikipedia": "en:Doddabetta"}),
        _curated_landmark("Mudumalai National Park", "Mudumalai, Nilgiris", "Nature Reserve", 11.5604, 76.5356,
                          {"leisure": "nature_reserve", "wikipedia": "en:Mudumalai National Park"}),
    ],

    # ── Jaipur ───────────────────────────────────────────────────────────
    "jaipur": [
        _curated_landmark("Amer Fort (Amber Fort)", "Amer, Jaipur", "Fort/Castle", 26.9855, 75.8513,
                          {"historic": "castle", "wikipedia": "en:Amer Fort"}),
        _curated_landmark("Hawa Mahal (Palace of Winds)", "Badi Choupad, Jaipur", "Palace", 26.9239, 75.8267,
                          {"historic": "palace", "wikipedia": "en:Hawa Mahal"}),
        _curated_landmark("City Palace, Jaipur", "Gangori Bazaar, Jaipur", "Palace", 26.9258, 75.8237,
                          {"historic": "palace", "wikipedia": "en:City Palace, Jaipur"}),
        _curated_landmark("Jantar Mantar, Jaipur", "Gangori Bazaar, Jaipur", "Monument", 26.9247, 75.8242,
                          {"tourism": "attraction", "wikipedia": "en:Jantar Mantar, Jaipur"}),
        _curated_landmark("Nahargarh Fort", "Aravalli Hills, Jaipur", "Fort/Castle", 26.9440, 75.8030,
                          {"historic": "fort", "wikipedia": "en:Nahargarh Fort"}),
        _curated_landmark("Jaigarh Fort", "Amer, Jaipur", "Fort/Castle", 26.9879, 75.8413,
                          {"historic": "fort", "wikipedia": "en:Jaigarh Fort"}),
        _curated_landmark("Albert Hall Museum", "Ram Niwas Garden, Jaipur", "Museum", 26.9048, 75.8202,
                          {"tourism": "museum", "wikipedia": "en:Albert Hall Museum, Jaipur"}),
        _curated_landmark("Jal Mahal", "Man Sagar Lake, Jaipur", "Palace", 26.9535, 75.8462,
                          {"historic": "palace", "wikipedia": "en:Jal Mahal"}),
        _curated_landmark("Panna Meena Ka Kund (Stepwell)", "Amer, Jaipur", "Heritage Ruins", 26.9860, 75.8540,
                          {"historic": "archaeological_site", "wikipedia": "en:Panna Meena Ka Kund"}),
    ],

    # ── Goa ──────────────────────────────────────────────────────────────
    "goa": [
        _curated_landmark("Basilica of Bom Jesus", "Old Goa", "Attraction", 15.5009, 73.9116,
                          {"tourism": "attraction", "wikipedia": "en:Basilica of Bom Jesus"}),
        _curated_landmark("Fort Aguada", "Sinquerim, North Goa", "Fort/Castle", 15.4942, 73.7713,
                          {"historic": "fort", "wikipedia": "en:Fort Aguada"}),
        _curated_landmark("Fontainhas (Latin Quarter)", "Panaji, Goa", "Attraction", 15.4987, 73.8253,
                          {"tourism": "attraction", "wikipedia": "en:Fontainhas"}),
        _curated_landmark("Dudhsagar Falls", "Sanguem, Goa", "Attraction", 15.3144, 74.3148,
                          {"tourism": "attraction", "wikipedia": "en:Dudhsagar Falls"}),
        _curated_landmark("Anjuna Beach", "Anjuna, North Goa", "Attraction", 15.5737, 73.7403,
                          {"tourism": "attraction", "wikipedia": "en:Anjuna Beach"}),
        _curated_landmark("Calangute Beach", "Calangute, North Goa", "Attraction", 15.5440, 73.7557,
                          {"tourism": "attraction", "wikipedia": "en:Calangute Beach"}),
        _curated_landmark("Goa State Museum", "Patto, Panaji", "Museum", 15.4953, 73.8297,
                          {"tourism": "museum", "wikipedia": "en:Goa State Museum"}),
    ],

    # ── Hyderabad ────────────────────────────────────────────────────────
    "hyderabad": [
        _curated_landmark("Charminar", "Old City, Hyderabad", "Monument", 17.3616, 78.4747,
                          {"tourism": "attraction", "wikipedia": "en:Charminar"}),
        _curated_landmark("Golconda Fort", "Ibrahim Bagh, Hyderabad", "Fort/Castle", 17.3833, 78.4011,
                          {"historic": "fort", "wikipedia": "en:Golconda Fort"}),
        _curated_landmark("Chowmahalla Palace", "Motigall, Hyderabad", "Palace", 17.3599, 78.4710,
                          {"historic": "palace", "wikipedia": "en:Chowmahalla Palace"}),
        _curated_landmark("Salar Jung Museum", "Darulshifa, Hyderabad", "Museum", 17.3714, 78.4800,
                          {"tourism": "museum", "wikipedia": "en:Salar Jung Museum"}),
        _curated_landmark("Qutb Shahi Tombs", "Golconda, Hyderabad", "Heritage Ruins", 17.3933, 78.4015,
                          {"historic": "ruins", "wikipedia": "en:Qutb Shahi tombs"}),
        _curated_landmark("Hussain Sagar Lake & Lumbini Park", "Necklace Road, Hyderabad", "Park", 17.4239, 78.4738,
                          {"leisure": "park", "wikipedia": "en:Hussain Sagar"}),
        _curated_landmark("Birla Mandir Hyderabad", "Khairatabad, Hyderabad", "Temple", 17.4062, 78.4666,
                          {"tourism": "attraction", "wikipedia": "en:Birla Mandir, Hyderabad"}),
        _curated_landmark("Shilparamam Arts & Crafts Village", "HITEC City, Hyderabad", "Attraction", 17.4534, 78.3660,
                          {"tourism": "attraction", "wikipedia": "en:Shilparamam"}),
    ],

    # ── Visakhapatnam ────────────────────────────────────────────────────
    "visakhapatnam": [
        _curated_landmark("INS Kursura Submarine Museum", "RK Beach Road, Visakhapatnam", "Museum", 17.7010, 83.3010,
                          {"tourism": "museum", "wikipedia": "en:INS Kursura"}),
        _curated_landmark("TU 142 Aircraft Museum", "Beach Road, Visakhapatnam", "Museum", 17.7012, 83.3014,
                          {"tourism": "museum"}),
        _curated_landmark("Kailasagiri Hilltop Park", "Kailasagiri, Visakhapatnam", "Viewpoint", 17.7456, 83.3786,
                          {"tourism": "viewpoint", "wikipedia": "en:Kailasagiri"}),
        _curated_landmark("Ramakrishna Beach (RK Beach)", "Beach Road, Visakhapatnam", "Attraction", 17.7099, 83.3193,
                          {"tourism": "attraction"}),
        _curated_landmark("Simhachalam Temple", "Simhachalam, Visakhapatnam", "Temple", 17.7734, 83.2437,
                          {"tourism": "attraction", "wikipedia": "en:Simhachalam Temple"}),
        _curated_landmark("Dolphin's Nose Lighthouse", "Southern Port Ridge, Visakhapatnam", "Viewpoint", 17.6990, 83.2740,
                          {"tourism": "viewpoint"}),
        _curated_landmark("Rushikonda Beach", "Rushikonda, Visakhapatnam", "Attraction", 17.7556, 83.3782,
                          {"tourism": "attraction", "wikipedia": "en:Rushikonda Beach"}),
        _curated_landmark("Thotlakonda Buddhist Complex", "Mangamaripeta, Visakhapatnam", "Heritage Ruins", 17.7805, 83.3900,
                          {"historic": "archaeological_site", "wikipedia": "en:Thotlakonda"}),
        _curated_landmark("Bheemili Beach & Dutch Outpost Ruins", "Bheemunipatnam, Visakhapatnam", "Heritage Ruins", 17.8917, 83.4542,
                          {"historic": "ruins"}),
        _curated_landmark("Yarada Beach", "Yarada Village, Visakhapatnam", "Attraction", 17.6509, 83.2484,
                          {"tourism": "attraction"}),
    ],

    # ── Delhi ────────────────────────────────────────────────────────────
    "delhi": [
        _curated_landmark("Red Fort (Lal Qila)", "Netaji Subhash Marg, Delhi", "Fort/Castle", 28.6562, 77.2410,
                          {"historic": "fort", "wikipedia": "en:Red Fort"}),
        _curated_landmark("Qutub Minar", "Mehrauli, Delhi", "Monument", 28.5244, 77.1855,
                          {"tourism": "attraction", "wikipedia": "en:Qutb Minar"}),
        _curated_landmark("India Gate", "Kartavya Path, Delhi", "Monument", 28.6129, 77.2295,
                          {"tourism": "attraction", "wikipedia": "en:India Gate"}),
        _curated_landmark("Humayun's Tomb", "Nizamuddin East, Delhi", "Heritage Ruins", 28.5933, 77.2507,
                          {"historic": "ruins", "wikipedia": "en:Humayun's Tomb"}),
        _curated_landmark("Lotus Temple", "Bahapur, Delhi", "Attraction", 28.5535, 77.2588,
                          {"tourism": "attraction", "wikipedia": "en:Lotus Temple"}),
        _curated_landmark("Akshardham Temple, Delhi", "Noida More, Delhi", "Temple", 28.6127, 77.2773,
                          {"tourism": "attraction", "wikipedia": "en:Akshardham, Delhi"}),
        _curated_landmark("National Museum of India", "Janpath, Delhi", "Museum", 28.6120, 77.2197,
                          {"tourism": "museum", "wikipedia": "en:National Museum, New Delhi"}),
        _curated_landmark("Chandni Chowk", "Old Delhi", "Attraction", 28.6580, 77.2300,
                          {"tourism": "attraction", "wikipedia": "en:Chandni Chowk"}),
    ],

    # ── Mumbai ───────────────────────────────────────────────────────────
    "mumbai": [
        _curated_landmark("Gateway of India", "Apollo Bunder, Mumbai", "Monument", 18.9220, 72.8347,
                          {"tourism": "attraction", "wikipedia": "en:Gateway of India"}),
        _curated_landmark("Chhatrapati Shivaji Maharaj Vastu Sangrahalaya", "Fort, Mumbai", "Museum", 18.9268, 72.8332,
                          {"tourism": "museum", "wikipedia": "en:Chhatrapati Shivaji Maharaj Vastu Sangrahalaya"}),
        _curated_landmark("Elephanta Caves", "Elephanta Island, Mumbai Harbour", "Heritage Ruins", 18.9633, 72.9315,
                          {"historic": "archaeological_site", "wikipedia": "en:Elephanta Caves"}),
        _curated_landmark("Marine Drive (Queen's Necklace)", "Marine Drive, Mumbai", "Attraction", 18.9442, 72.8236,
                          {"tourism": "attraction", "wikipedia": "en:Marine Drive, Mumbai"}),
        _curated_landmark("Colaba Causeway & Market", "Colaba, Mumbai", "Attraction", 18.9145, 72.8296,
                          {"tourism": "attraction"}),
        _curated_landmark("Sanjay Gandhi National Park", "Borivali, Mumbai", "Nature Reserve", 19.2147, 72.9080,
                          {"leisure": "nature_reserve", "wikipedia": "en:Sanjay Gandhi National Park"}),
        _curated_landmark("Haji Ali Dargah", "Worli, Mumbai", "Attraction", 18.9824, 72.8091,
                          {"tourism": "attraction", "wikipedia": "en:Haji Ali Dargah"}),
    ],
}

# Register aliases
_CURATED_DB["bengaluru"] = _CURATED_DB["bangalore"]
_CURATED_DB["vizag"] = _CURATED_DB["visakhapatnam"]
_CURATED_DB["mysore"] = _CURATED_DB["mysuru"]
_CURATED_DB["new delhi"] = _CURATED_DB["delhi"]
_CURATED_DB["bombay"] = _CURATED_DB["mumbai"]
_CURATED_DB["calcutta"] = _CURATED_DB.get("kolkata", [])
_CURATED_DB["madras"] = _CURATED_DB.get("chennai", [])
_CURATED_DB["cochin"] = _CURATED_DB.get("kochi", [])
_CURATED_DB["banaras"] = _CURATED_DB.get("varanasi", [])


def _get_curated_pois(destination: str) -> list[dict]:
    """Match a destination name to the curated database using destinations.resolver (exact canonical key only)."""
    from app.services import destinations
    res = destinations.resolver.resolve(destination)
    if not res.is_ok or not res.destination:
        return []

    canonical_name = res.destination.name.lower().strip()
    if canonical_name in _CURATED_DB:
        return _CURATED_DB[canonical_name]

    from app.services.destinations import ALIASES
    alias_key = ALIASES.get(canonical_name)
    if alias_key and alias_key in _CURATED_DB:
        return _CURATED_DB[alias_key]

    return []


# Global singleton instance
poi_service = POIService()
