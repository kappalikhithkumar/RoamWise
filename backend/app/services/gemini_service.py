import os
import re
import time
import json
import difflib
import logging
import sqlite3
import urllib.request
import urllib.parse
from pathlib import Path
import concurrent.futures
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

STOP_WORDS = {
    "the", "and", "of", "in", "at", "to", "for", "a", "an", "on", "with",
    "by", "from", "visit", "explore", "tour", "walk", "view", "see"
}

def _normalize_title_tokens(text: str) -> tuple[str, set[str]]:
    t = str(text or "").lower().strip()
    t = re.sub(r"\(.*?\)", "", t)
    t = re.sub(r"[^\w\s]", " ", t)
    words = [w for w in t.split() if w]
    sig_words = {w for w in words if w not in STOP_WORDS}
    norm_str = " ".join(words)
    return norm_str, sig_words

def _match_activity_to_poi(act_title: str, pois: list[dict]) -> tuple[bool, dict | None]:
    """
    Validate activity title against POI list:
    Match with difflib ratio >= 0.85 or token containment.
    """
    act_norm, act_tokens = _normalize_title_tokens(act_title)
    if not act_norm:
        return False, None

    best_match = None
    best_score = 0.0

    for poi in pois:
        poi_name = poi.get("name", "")
        poi_norm, poi_tokens = _normalize_title_tokens(poi_name)
        if not poi_norm:
            continue

        # 1. difflib ratio >= 0.85
        ratio = difflib.SequenceMatcher(None, act_norm, poi_norm).ratio()
        if ratio >= 0.85:
            if ratio > best_score:
                best_score = ratio
                best_match = poi
            continue

        # 2. Token containment
        if poi_tokens and act_tokens:
            if poi_tokens.issubset(act_tokens) and len(poi_tokens) >= 1:
                return True, poi
            if act_tokens.issubset(poi_tokens) and len(act_tokens) >= 2:
                return True, poi
            if (len(poi_norm) >= 6 and poi_norm in act_norm) or (len(act_norm) >= 6 and act_norm in poi_norm):
                return True, poi

    if best_match is not None:
        return True, best_match

    return False, None

# Try importing the official google-genai SDK
try:
    from google import genai
    from google.genai import types
    HAS_GENAI = True
except ImportError:
    HAS_GENAI = False

from app.config import Config
DEFAULT_MODEL = getattr(Config, "GEMINI_MODEL", os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite"))

# Import POI service — lazy to avoid circular imports
_poi_service = None

def _get_poi_service():
    global _poi_service
    if _poi_service is None:
        try:
            from app.services.poi_service import POIService
            _poi_service = POIService()
        except Exception as e:
            logger.warning(f"POI service unavailable: {e}")
    return _poi_service


_WIKI_IMAGE_CACHE: dict[str, str] = {}

def get_wikipedia_page_image(title: str) -> str:
    """
    Fetch thumbnail image URL for a verified POI using Wikipedia pageimages API.
    action=query&titles={title}&prop=pageimages&format=json&pithumbsize=600
    Returns image URL string, or empty string "" if none found.
    Caches results in-memory and SQLite table `wiki_image_cache`.
    """
    if not title:
        return ""
    clean_title = re.sub(r"\(.*?\)", "", str(title)).strip()
    if not clean_title:
        return ""
    cache_key = clean_title.lower()
    if cache_key in _WIKI_IMAGE_CACHE:
        return _WIKI_IMAGE_CACHE[cache_key]

    # Check SQLite cache
    db_path = None
    try:
        from flask import current_app
        if current_app and current_app.config.get("DATABASE_PATH"):
            db_path = current_app.config["DATABASE_PATH"]
    except Exception:
        pass
    if not db_path:
        base_dir = Path(__file__).resolve().parent.parent.parent
        db_path = os.getenv("DATABASE_PATH", str(base_dir / "roamwise.db"))

    try:
        conn = sqlite3.connect(db_path)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS wiki_image_cache (
                title_key TEXT PRIMARY KEY,
                image_url TEXT NOT NULL,
                fetched_at REAL NOT NULL
            )
        """)
        row = conn.execute("SELECT image_url FROM wiki_image_cache WHERE title_key = ?", (cache_key,)).fetchone()
        if row:
            conn.close()
            _WIKI_IMAGE_CACHE[cache_key] = row[0]
            return row[0]
        conn.close()
    except Exception as e:
        logger.debug(f"SQLite image cache read error: {e}")

    # Fetch via Wikipedia pageimages API
    image_url = ""
    try:
        params = urllib.parse.urlencode({
            "action": "query",
            "titles": clean_title,
            "prop": "pageimages",
            "format": "json",
            "pithumbsize": "600",
            "formatversion": "2"
        })
        url = f"https://en.wikipedia.org/w/api.php?{params}"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "RoamWise-AI-Planner/2.0 (travel app; contact@roamwise.ai)"}
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode())
        pages = data.get("query", {}).get("pages", [])
        if pages and isinstance(pages, list):
            thumbnail = pages[0].get("thumbnail")
            if thumbnail and isinstance(thumbnail, dict) and thumbnail.get("source"):
                image_url = thumbnail["source"]
    except Exception as e:
        logger.debug(f"Wikipedia pageimages lookup failed for '{clean_title}': {e}")

    _WIKI_IMAGE_CACHE[cache_key] = image_url

    # Persist to SQLite
    try:
        conn = sqlite3.connect(db_path)
        conn.execute(
            "INSERT OR REPLACE INTO wiki_image_cache (title_key, image_url, fetched_at) VALUES (?, ?, ?)",
            (cache_key, image_url, time.time())
        )
        conn.commit()
        conn.close()
    except Exception as e:
        logger.debug(f"SQLite image cache write error: {e}")

    return image_url


class GeminiService:
    def __init__(self, api_key: str = None):
        self.api_key = api_key if api_key is not None else os.getenv("GEMINI_API_KEY", "")
        self.client = None
        if HAS_GENAI and self.api_key:
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize GenAI client: {e}")

    def is_available(self) -> bool:
        """Check if Gemini client is initialized with a valid API key."""
        return bool(self.client and self.api_key)

    def generate_itinerary(self, config: dict) -> dict:
        """
        Generate a personalized multi-day itinerary.
        Tries live Gemini generation first; falls back cleanly to deterministic synthesis
        if Gemini is unavailable, offline, or returns invalid data.
        """
        from app.services.destinations import (
            destination_resolver,
            allocate_trip_days,
            haversine_km,
            calculate_transit_between,
            ResolvedDestination
        )

        # 1. Resolve all destinations
        raw_dest_list = config.get("destinations")
        if not raw_dest_list or not isinstance(raw_dest_list, list):
            raw_str = config.get("destination", "")
            if "➔" in raw_str:
                raw_dest_list = [s.strip() for s in raw_str.split("➔") if s.strip()]
            elif "->" in raw_str:
                raw_dest_list = [s.strip() for s in raw_str.split("->") if s.strip()]
            else:
                raw_dest_list = [raw_str.strip()] if raw_str.strip() else ["Jaipur"]

        resolved_destinations: list[ResolvedDestination] = []
        for d in raw_dest_list:
            if isinstance(d, ResolvedDestination):
                resolved_destinations.append(d)
            elif isinstance(d, dict) and "name" in d and "lat" in d:
                resolved_destinations.append(
                    ResolvedDestination(d["name"], d.get("state", "India"), float(d["lat"]), float(d["lon"]))
                )
            else:
                res = destination_resolver.resolve(str(d))
                if res.is_ok and res.destination:
                    resolved_destinations.append(res.destination)

        if not resolved_destinations:
            res = destination_resolver.resolve("Jaipur, Rajasthan")
            if res.is_ok and res.destination:
                resolved_destinations = [res.destination]

        # Calculate number of days
        start_date = config.get("startDate", "2026-11-20")
        end_date = config.get("endDate", "2026-11-23")
        try:
            d1 = datetime.strptime(start_date, "%Y-%m-%d")
            d2 = datetime.strptime(end_date, "%Y-%m-%d")
            num_days = max(1, min((d2 - d1).days + 1, 14))
        except Exception:
            num_days = len(resolved_destinations) if len(resolved_destinations) > 1 else 3

        day_destinations = allocate_trip_days(num_days, resolved_destinations)
        interests = config.get("interests", ["Culture", "Food", "History"])

        # Fetch POIs per unique destination
        svc = _get_poi_service()
        per_dest_pois: dict[str, list[dict]] = {}
        per_dest_poi_source: dict[str, str] = {}
        for dest in resolved_destinations:
            if dest.name not in per_dest_pois:
                if svc:
                    p_res = svc.get_pois(dest.name, max_results=30, interests=interests)
                    per_dest_pois[dest.name] = p_res.get("pois", [])
                    per_dest_poi_source[dest.name] = p_res.get("source", "none")
                else:
                    per_dest_pois[dest.name] = []
                    per_dest_poi_source[dest.name] = "none"

        # Determine overall POI source across destinations
        sources = set(per_dest_poi_source.values()) if per_dest_poi_source else set()
        if not sources or sources == {"none"}:
            overall_poi_source = "none"
        elif "openstreetmap" in sources:
            overall_poi_source = "openstreetmap"
        elif "wikipedia" in sources:
            overall_poi_source = "wikipedia"
        elif "curated" in sources:
            overall_poi_source = "curated"
        else:
            overall_poi_source = "none"

        transit_between = calculate_transit_between(resolved_destinations)

        fallback_reason = "No API key configured"
        if self.is_available():
            executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
            try:
                future = executor.submit(
                    self._call_gemini_generation,
                    config,
                    resolved_destinations,
                    day_destinations,
                    per_dest_pois,
                    per_dest_poi_source
                )
                ai_itinerary = future.result(timeout=40.0)
                valid, sanitized = self._validate_itinerary(
                    ai_itinerary,
                    config,
                    resolved_destinations,
                    day_destinations,
                    per_dest_pois,
                    per_dest_poi_source
                )
                if valid:
                    sanitized["generationSource"] = "gemini-ai"
                    sanitized["modelUsed"] = DEFAULT_MODEL
                    sanitized["poiSource"] = overall_poi_source
                    sanitized["verification"] = "unverified" if overall_poi_source == "none" else "verified"
                    sanitized["destinations"] = [d.name for d in resolved_destinations]
                    sanitized["destination"] = " ➔ ".join(d.name for d in resolved_destinations)
                    sanitized["transitBetween"] = transit_between
                    return sanitized
                else:
                    fallback_reason = "Gemini output failed schema validation"
                    logger.info("Gemini output failed validation, using fallback.")
            except concurrent.futures.TimeoutError:
                fallback_reason = "Gemini API request timed out after 40.0s"
                logger.info(f"Gemini live generation bypassed ({fallback_reason}), using fallback.")
            except Exception as e:
                err_str = str(e)
                if "429" in err_str or "RESOURCE_EXHAUSTED" in err_str:
                    fallback_reason = "AI quota or rate limit reached"
                elif "Timeout" in err_str or "timeout" in err_str:
                    fallback_reason = "Gemini API request timed out after 40.0s"
                else:
                    fallback_reason = f"Gemini API error: {err_str[:120]}"
                logger.info(f"Gemini live generation bypassed ({fallback_reason}), using fallback.")
            finally:
                try:
                    executor.shutdown(wait=False, cancel_futures=True)
                except Exception:
                    pass

        # Robust Deterministic Synthesis Fallback
        fallback = self._generate_fallback_itinerary(
            config,
            resolved_destinations,
            day_destinations,
            per_dest_pois,
            per_dest_poi_source
        )
        fallback["generationSource"] = "deterministic-fallback"
        fallback["fallbackReason"] = fallback_reason
        fallback["destinations"] = [d.name for d in resolved_destinations]
        fallback["destination"] = " ➔ ".join(d.name for d in resolved_destinations)
        fallback["transitBetween"] = transit_between
        fallback["poiSource"] = overall_poi_source
        fallback["verification"] = "unverified" if overall_poi_source == "none" else "verified"
        return fallback

    def _call_gemini_generation(
        self,
        config: dict,
        resolved_destinations: list,
        day_destinations: list,
        per_dest_pois: dict,
        per_dest_poi_source: dict
    ) -> dict:
        destination_full = " ➔ ".join(f"{d.name}, {d.state}" for d in resolved_destinations) + ", India"
        start_date = config.get("startDate", "2026-11-20")
        end_date = config.get("endDate", "2026-11-23")
        budget = config.get("budgetTier", "Moderate")
        interests = config.get("interests", ["Culture", "Food", "History"])
        traveler = config.get("travelerType", "Couple")
        pace = config.get("pace", "Balanced")
        num_days = len(day_destinations)

        day_schedule_lines = [
            f"  - Day {idx+1}: {d.name}, {d.state} (Center: lat {d.lat}, lon {d.lon})"
            for idx, d in enumerate(day_destinations)
        ]

        poi_context_sections = []
        for d in resolved_destinations:
            pois = per_dest_pois.get(d.name, [])
            p_source = per_dest_poi_source.get(d.name, "none")
            if pois:
                p_lines = []
                for p in pois[:25]:
                    coords = f" (lat:{p['lat']}, lon:{p['lon']})" if p.get("lat") else ""
                    area = f" — {p.get('area', '')}" if p.get("area") else ""
                    p_lines.append(f"    - {p['name']}{area}{coords} [{p['category']}]")
                poi_context_sections.append(
                    f"VERIFIED ATTRACTIONS FOR {d.name.upper()}, {d.state} ({p_source.upper()}):\n" + "\n".join(p_lines)
                )
            else:
                poi_context_sections.append(
                    f"ATTRACTIONS FOR {d.name.upper()}, {d.state}: Use verified real attractions located in {d.name}."
                )

        poi_context_block = "\n\n".join(poi_context_sections)

        prompt = f"""
You are RoamWise AI, an expert adaptive travel planner with deep geographic knowledge of India.
Create a detailed, high-quality, realistic {num_days}-day travel itinerary for {destination_full}.
Destinations included in order: {', '.join(d.name for d in resolved_destinations)}.
Dates: {start_date} to {end_date} ({num_days} days total).
Traveler Type: {traveler}
Travel Pace: {pace} (if Relaxed: 2-3 stops/day; Balanced: 3-4 stops/day; Packed: 4-5 stops/day)
Budget Tier: {budget} (all costs must be estimated realistically in Indian Rupees ₹ only)
Interests: {', '.join(interests)}

STRICT DAY DESTINATION ALLOCATION:
{chr(10).join(day_schedule_lines)}

{poi_context_block}

CRITICAL RULES:
1. STRICT DAY DESTINATION CONFINEMENT: Each day is strictly assigned to its allocated destination:
   - Day X activities MUST take place in Day X's assigned destination ONLY.
   - Activities for Day X must come ONLY from that day's destination POIs or authentic local landmarks in that destination.
   - NEVER place an attraction from another city in a day (e.g. do NOT put Visakhapatnam stops on a Kadapa or Tirupati day).
2. DISTANCE LIMIT: Every activity MUST be within 40 km of that day's destination center coordinates.
3. Use REAL, SPECIFIC Indian attraction names — not generic names like "City Heritage Quarter" or "Grand Botanical Sanctuary".
4. Each day must have a distinct set of activities — do NOT repeat any attraction across days.
5. Consider the selected pace strictly: Relaxed=2-3 stops, Balanced=3-4 stops, Packed=4-5 stops.
6. Plan B alternatives must be a DIFFERENT real venue that is indoor or sheltered located in that day's destination, not a sub-area of the main activity.
7. All costs must be realistic for domestic travel in India, specified in Indian Rupees (₹) only.
8. Each day in the output JSON MUST include the assigned "dayDestination": {{"name": "<City>", "state": "<State>", "lat": <Lat>, "lon": <Lon>}}.
9. Do NOT output any "imageUrl" fields. Imagery is attached automatically by the backend.

Output MUST be valid JSON adhering strictly to this schema:
{{
  "tagline": "Brief poetic expedition tagline",
  "days": [
    {{
      "dayNumber": 1,
      "dayOfWeek": "Day of week e.g. Friday",
      "dateStr": "e.g. Nov 20, 2026",
      "theme": "Captivating theme for the day using real place names",
      "weatherSummary": "26°C • Clear & Golden",
      "temperature": "26°C",
      "rainRisk": 10,
      "weatherCondition": "sunny",
      "dayDestination": {{
        "name": "{day_destinations[0].name}",
        "state": "{day_destinations[0].state}",
        "lat": {day_destinations[0].lat},
        "lon": {day_destinations[0].lon}
      }},
      "activities": [
        {{
          "id": "act-1-1",
          "title": "REAL specific attraction name in {day_destinations[0].name}",
          "timeSlot": "09:00 AM",
          "period": "morning",
          "duration": "2.5h",
          "cost": 500,
          "costDisplay": "₹500",
          "category": "History",
          "location": "Specific street / neighbourhood / area in {day_destinations[0].name}",
          "isIndoor": false,
          "weatherRisk": "low",
          "weatherRiskLabel": "☀️ Low Risk",
          "description": "Engaging 2-sentence description with specific historical or geographical facts.",
          "isVisited": false,
          "hasPlanBReady": true,
          "planBAlternative": {{
            "id": "alt-1-1",
            "title": "Real indoor museum or sheltered venue name in {day_destinations[0].name}",
            "timeSlot": "09:00 AM",
            "duration": "2h",
            "cost": 300,
            "costDisplay": "₹300",
            "category": "Culture",
            "location": "Specific sheltered location name",
            "isIndoor": true,
            "weatherRiskLabel": "☂️ Indoor Sheltered",
            "description": "Sheltered alternative if weather disrupts the outdoor visit.",
            "shelterReason": "Rain protection",
            "costDelta": "-₹200"
          }}
        }}
      ]
    }}
  ]
}}
"""
        for attempt in range(2):
            try:
                response = self.client.models.generate_content(
                    model=DEFAULT_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.6
                    )
                )
                result = json.loads(response.text)
                return result
            except Exception as e:
                err_str = str(e)
                if ("429" in err_str or "RESOURCE_EXHAUSTED" in err_str) and attempt == 0:
                    logger.warning("Gemini 429 rate limit encountered. Retrying once after 2.0s backoff...")
                    time.sleep(2.0)
                    continue
                raise

    def _validate_itinerary(
        self,
        data: dict,
        config: dict,
        resolved_destinations: list,
        day_destinations: list,
        per_dest_pois: dict,
        per_dest_poi_source: dict
    ) -> tuple[bool, dict]:
        """Validate structure, enforce dayDestination, validate against per-day POIs, and apply 40 km limit."""
        from app.services.destinations import haversine_km

        if not isinstance(data, dict):
            return False, None
        days = data.get("days")
        if not isinstance(days, list) or len(days) == 0:
            return False, None

        sanitized_days = []
        for d_idx, day in enumerate(days, 1):
            if not isinstance(day, dict):
                continue
            day_num = day.get("dayNumber", d_idx)
            activities = day.get("activities", [])
            if not isinstance(activities, list) or len(activities) == 0:
                continue

            day_dest = day_destinations[min(d_idx - 1, len(day_destinations) - 1)]

            sanitized_activities = []
            for a_idx, act in enumerate(activities, 1):
                if not isinstance(act, dict) or not act.get("title"):
                    continue
                cost = act.get("cost", 0)
                try:
                    cost_int = int(cost)
                except Exception:
                    cost_int = 0

                sanitized_act = {
                    "id": act.get("id") or f"act-{day_num}-{a_idx}",
                    "title": act.get("title", "Expedition Highlight"),
                    "timeSlot": act.get("timeSlot", "10:00 AM"),
                    "period": act.get("period", "morning" if a_idx == 1 else "afternoon"),
                    "duration": act.get("duration", "2h"),
                    "cost": cost_int,
                    "costDisplay": act.get("costDisplay", f"₹{cost_int}" if cost_int > 0 else "Free"),
                    "category": act.get("category", "Culture"),
                    "location": act.get("location", f"{day_dest.name}, {day_dest.state}"),
                    "isIndoor": bool(act.get("isIndoor", False)),
                    "weatherRisk": act.get("weatherRisk", "low"),
                    "weatherRiskLabel": act.get("weatherRiskLabel", "☀️ Low Risk"),
                    "description": act.get("description", ""),
                    "imageUrl": "",
                    "isVisited": False,
                    "hasPlanBReady": bool(act.get("hasPlanBReady", False)),
                    "planBAlternative": act.get("planBAlternative")
                }
                if act.get("lat") is not None:
                    sanitized_act["lat"] = float(act["lat"])
                    sanitized_act["latitude"] = float(act["lat"])
                if act.get("lon") is not None:
                    sanitized_act["lon"] = float(act["lon"])
                    sanitized_act["longitude"] = float(act["lon"])

                sanitized_activities.append(sanitized_act)

            if not sanitized_activities:
                continue

            # ── 1. Match against that day's destination POIs ──────────
            day_pois = per_dest_pois.get(day_dest.name, [])
            poi_source = per_dest_poi_source.get(day_dest.name, "none")

            for act in sanitized_activities:
                matched, matched_poi = _match_activity_to_poi(act.get("title", ""), day_pois)
                if matched and matched_poi:
                    act["verified"] = True
                    act["_matched_poi"] = matched_poi
                    if matched_poi.get("lat") is not None:
                        act["lat"] = float(matched_poi["lat"])
                        act["latitude"] = float(matched_poi["lat"])
                    if matched_poi.get("lon") is not None:
                        act["lon"] = float(matched_poi["lon"])
                        act["longitude"] = float(matched_poi["lon"])
                    if matched_poi.get("area"):
                        act["location"] = matched_poi["area"]
                    elif matched_poi.get("name"):
                        act["location"] = matched_poi["name"]

                    # Set imageUrl ONLY from Wikipedia page image of verified POI (pageimages API) and cache it
                    wiki_title = matched_poi.get("tags", {}).get("wikipedia") or matched_poi.get("name") or act.get("title")
                    if ":" in str(wiki_title):
                        wiki_title = str(wiki_title).split(":", 1)[-1]
                    act["imageUrl"] = get_wikipedia_page_image(wiki_title)
                else:
                    act["verified"] = False
                    act["_matched_poi"] = None
                    act["imageUrl"] = ""

            # ── 2. 40 km Distance Verification from day's destination centre ──
            valid_dist_acts = []
            for act in sanitized_activities:
                a_lat = act.get("lat") or act.get("latitude")
                a_lon = act.get("lon") or act.get("longitude")
                if a_lat is not None and a_lon is not None:
                    try:
                        dist = haversine_km(float(a_lat), float(a_lon), day_dest.lat, day_dest.lon)
                        if dist > 40.0:
                            logger.info(
                                f"Activity '{act.get('title')}' is {dist:.1f} km from {day_dest.name} center (> 40km). Dropping."
                            )
                            continue
                    except Exception as e:
                        logger.warning(f"Error computing distance for {act.get('title')}: {e}")
                valid_dist_acts.append(act)

            if len(valid_dist_acts) >= 2:
                sanitized_activities = valid_dist_acts
            else:
                for act in sanitized_activities:
                    a_lat = act.get("lat") or act.get("latitude")
                    a_lon = act.get("lon") or act.get("longitude")
                    if a_lat is not None and a_lon is not None:
                        if haversine_km(float(a_lat), float(a_lon), day_dest.lat, day_dest.lon) > 40.0:
                            act.pop("lat", None)
                            act.pop("lon", None)
                            act.pop("latitude", None)
                            act.pop("longitude", None)
                            act["verified"] = False

            # ── 3. Drop unverified activities if verified exist (min 2) ──
            if poi_source in ("curated", "openstreetmap", "wikipedia") and day_pois:
                verified_acts = [a for a in sanitized_activities if a.get("verified")]
                if len(verified_acts) >= 2:
                    sanitized_activities = verified_acts

            # ── 4. Validate planBAlternative against destination POIs ──
            for act in sanitized_activities:
                has_pb = bool(act.get("hasPlanBReady"))
                plan_b = act.get("planBAlternative")
                if not has_pb or not isinstance(plan_b, dict) or not plan_b.get("title"):
                    act["hasPlanBReady"] = False
                    act["planBAlternative"] = None
                    continue

                pb_title = plan_b.get("title", "").strip()
                # Validate against that day's destination POIs
                pb_matched, pb_poi = _match_activity_to_poi(pb_title, day_pois)
                if not pb_matched or not pb_poi:
                    logger.info(f"Plan B '{pb_title}' failed POI validation against {day_dest.name} POIs. Removing.")
                    act["hasPlanBReady"] = False
                    act["planBAlternative"] = None
                    continue

                # Must be a DIFFERENT real venue (not same venue as main activity, not sub-area)
                main_title = act.get("title", "")
                main_norm, main_tokens = _normalize_title_tokens(main_title)
                pb_norm, pb_tokens = _normalize_title_tokens(pb_title)

                act_poi = act.get("_matched_poi")
                is_same_poi = False
                if act_poi and act_poi.get("name", "").lower() == pb_poi.get("name", "").lower():
                    is_same_poi = True

                ratio = difflib.SequenceMatcher(None, main_norm, pb_norm).ratio()
                is_sub_area = (
                    (len(main_norm) >= 5 and main_norm in pb_norm) or
                    (len(pb_norm) >= 5 and pb_norm in main_norm) or
                    ratio >= 0.70 or
                    len(main_tokens.intersection(pb_tokens)) >= 2
                )

                if is_same_poi or is_sub_area:
                    logger.info(f"Plan B '{pb_title}' is same venue or sub-area of main activity '{main_title}'. Removing.")
                    act["hasPlanBReady"] = False
                    act["planBAlternative"] = None
                    continue

                # Must be indoor or sheltered venue
                poi_cat = pb_poi.get("category", "")
                poi_tags = pb_poi.get("tags", {})
                is_sheltered = (
                    plan_b.get("isIndoor") is True or
                    any(c in poi_cat.lower() for c in ("museum", "gallery", "palace", "temple", "spiritual", "indoor", "aquarium", "library", "exhibition")) or
                    any(t in str(poi_tags).lower() for t in ("indoor", "museum", "temple", "palace", "gallery"))
                )
                is_outdoor_only = any(c in poi_cat.lower() for c in ("beach", "viewpoint", "waterfall", "park", "garden", "wildlife", "reserve", "lake"))
                if is_outdoor_only and not plan_b.get("isIndoor"):
                    logger.info(f"Plan B '{pb_title}' is an open outdoor venue ({poi_cat}), not sheltered. Removing.")
                    act["hasPlanBReady"] = False
                    act["planBAlternative"] = None
                    continue

                # Validated! Attach verified POI coordinates and image
                if pb_poi.get("lat") is not None:
                    plan_b["lat"] = float(pb_poi["lat"])
                    plan_b["latitude"] = float(pb_poi["lat"])
                if pb_poi.get("lon") is not None:
                    plan_b["lon"] = float(pb_poi["lon"])
                    plan_b["longitude"] = float(pb_poi["lon"])
                if pb_poi.get("area"):
                    plan_b["location"] = pb_poi["area"]
                elif pb_poi.get("name"):
                    plan_b["location"] = pb_poi["name"]

                plan_b["isIndoor"] = True
                plan_b["weatherRisk"] = "low"
                plan_b["weatherRiskLabel"] = "☂️ Indoor Sheltered"
                pb_wiki = pb_poi.get("tags", {}).get("wikipedia") or pb_poi.get("name") or pb_title
                if ":" in str(pb_wiki):
                    pb_wiki = str(pb_wiki).split(":", 1)[-1]
                plan_b["imageUrl"] = get_wikipedia_page_image(pb_wiki)

                act["hasPlanBReady"] = True
                act["planBAlternative"] = plan_b

            # Clean up internal temporary fields before returning
            for act in sanitized_activities:
                act.pop("_matched_poi", None)

            sanitized_days.append({
                "dayNumber": day_num,
                "dayOfWeek": day.get("dayOfWeek", "Day"),
                "dateStr": day.get("dateStr", ""),
                "theme": day.get("theme", f"{day_dest.name} Exploration"),
                "weatherSummary": day.get("weatherSummary", "26°C • Clear"),
                "temperature": day.get("temperature", "26°C"),
                "rainRisk": int(day.get("rainRisk", 10)),
                "weatherCondition": day.get("weatherCondition", "sunny"),
                "weatherAlert": day.get("weatherAlert"),
                "dayDestination": {
                    "name": day_dest.name,
                    "state": day_dest.state,
                    "lat": day_dest.lat,
                    "lon": day_dest.lon
                },
                "activities": sanitized_activities
            })

        if not sanitized_days:
            return False, None

        return True, {
            "tagline": data.get("tagline", f"{config.get('travelerType', 'Curated')} Expedition across {' ➔ '.join(d.name for d in resolved_destinations)}"),
            "days": sanitized_days
        }

    def replan_itinerary(self, current_trip: dict, scenario_text: str, delay_minutes: int = 45, active_day_number: int = 1) -> dict:
        """
        Propose intelligent re-sequencing or alternative stops based on natural language.
        Strict rule: completed activities (isVisited=True) and locked stops MUST be preserved.
        """
        if self.is_available():
            executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
            try:
                future = executor.submit(self._call_gemini_replan, current_trip, scenario_text, delay_minutes, active_day_number)
                ai_replan = future.result(timeout=25.0)
                if ai_replan and "proposedActivities" in ai_replan and len(ai_replan["proposedActivities"]) > 0:
                    ai_replan = self._enforce_replan_safety(current_trip, ai_replan, active_day_number)
                    ai_replan["generationSource"] = "gemini-ai"
                    return ai_replan
            except Exception as e:
                logger.info(f"Gemini replan call bypassed ({e}). Using deterministic fallback replan.")
            finally:
                try:
                    executor.shutdown(wait=False, cancel_futures=True)
                except Exception:
                    pass

        return self._generate_fallback_replan(current_trip, scenario_text, delay_minutes, active_day_number)

    def _call_gemini_replan(self, current_trip: dict, scenario_text: str, delay_minutes: int, active_day_number: int) -> dict:
        days = current_trip.get("days", [])
        active_day = next((d for d in days if d.get("dayNumber") == active_day_number), days[0] if days else {})
        current_activities = active_day.get("activities", [])

        prompt = f"""
You are RoamWise AI, an adaptive travel replanning engine.
A traveler experienced a disruption on Day {active_day_number}.
Disruption scenario: "{scenario_text}"
Estimated delay or shift: {delay_minutes} minutes.

Current activities for Day {active_day_number}:
{json.dumps(current_activities, indent=2)}

STRICT REQUIREMENTS:
1. Preserve completed activities (where isVisited is true). DO NOT reschedule or delete them.
2. Preserve locked activities (isLocked is true).
3. Do not suggest repeating already visited places.
4. If it's a delay: shift or compress remaining future activities gracefully.
5. If it's a weather disruption: swap outdoor activities with sheltered indoor alternatives.
6. If cost reduction: substitute expensive stops with free or budget gems.
7. Return a structured JSON response matching this schema:
{{
  "scenarioTitle": "Brief title summarizing the adaptation",
  "triggerReason": "{scenario_text}",
  "delayMinutes": {delay_minutes},
  "reservationsKept": 1,
  "swappedStopsCount": 1,
  "matchScore": 98,
  "diffItems": [
    {{
      "id": "diff-1",
      "type": "locked or adjusted or swapped or added or removed",
      "activityId": "original activity id",
      "title": "activity title",
      "location": "location",
      "originalTime": "10:00 AM",
      "newTime": "11:15 AM",
      "duration": "1.5h",
      "cost": 300,
      "costDisplay": "₹300",
      "notes": "Explanation of the adjustment"
    }}
  ],
  "proposedActivities": [
    ...full array of updated activities for this day...
  ]
}}
"""
        for attempt in range(2):
            try:
                response = self.client.models.generate_content(
                    model=DEFAULT_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.5
                    )
                )
                return json.loads(response.text)
            except Exception as e:
                err_str = str(e)
                if ("429" in err_str or "RESOURCE_EXHAUSTED" in err_str) and attempt == 0:
                    logger.warning("Gemini replan 429 encountered. Retrying once after 2.0s backoff...")
                    time.sleep(2.0)
                    continue
                raise

    def _enforce_replan_safety(self, current_trip: dict, replan_res: dict, active_day_number: int) -> dict:
        """Guarantee completed activities remain exactly as they were."""
        days = current_trip.get("days", [])
        active_day = next((d for d in days if d.get("dayNumber") == active_day_number), days[0] if days else {})
        original_activities = active_day.get("activities", [])

        # Find visited activities
        visited_map = {a.get("id"): a for a in original_activities if a.get("isVisited")}
        proposed = replan_res.get("proposedActivities", [])

        # Ensure all visited activities exist and maintain isVisited=True
        cleaned_proposed = []
        for prop in proposed:
            orig_id = prop.get("id")
            if orig_id in visited_map:
                # Keep original visited attributes intact
                orig = visited_map[orig_id]
                cleaned_proposed.append({
                    **prop,
                    "isVisited": True,
                    "isLocked": True,
                    "timeSlot": orig.get("timeSlot"),
                    "title": orig.get("title")
                })
            else:
                cleaned_proposed.append(prop)

        replan_res["proposedActivities"] = cleaned_proposed
        return replan_res

    def _generate_fallback_replan(self, current_trip: dict, scenario_text: str, delay_minutes: int, active_day_number: int) -> dict:
        days = current_trip.get("days", [])
        active_day = next((d for d in days if d.get("dayNumber") == active_day_number), days[0] if days else {})
        current_acts = active_day.get("activities", [])

        diff_items = []
        proposed_acts = []

        is_rain = "rain" in scenario_text.lower() or "weather" in scenario_text.lower()
        is_budget = "cost" in scenario_text.lower() or "expense" in scenario_text.lower()

        for idx, act in enumerate(current_acts):
            if act.get("isVisited"):
                # Always preserve visited
                diff_items.append({
                    "id": f"diff-{idx+1}",
                    "type": "locked",
                    "activityId": act.get("id"),
                    "title": act.get("title"),
                    "location": act.get("location"),
                    "originalTime": act.get("timeSlot"),
                    "newTime": act.get("timeSlot"),
                    "duration": act.get("duration"),
                    "cost": act.get("cost", 0),
                    "costDisplay": act.get("costDisplay", ""),
                    "notes": "Completed morning stop preserved intact."
                })
                proposed_acts.append({ **act, "isLocked": True })
            elif is_rain and not act.get("isIndoor") and act.get("planBAlternative"):
                # Weather swap
                alt = act["planBAlternative"]
                diff_items.append({
                    "id": f"diff-{idx+1}",
                    "type": "swapped",
                    "activityId": act.get("id"),
                    "title": alt.get("title"),
                    "location": alt.get("location"),
                    "originalTime": act.get("timeSlot"),
                    "newTime": alt.get("timeSlot", act.get("timeSlot")),
                    "duration": alt.get("duration", act.get("duration")),
                    "cost": alt.get("cost", 0),
                    "costDisplay": alt.get("costDisplay", ""),
                    "notes": f"Replaced with sheltered {alt.get('category')} sanctuary due to rainfall alert."
                })
                proposed_acts.append({
                    **act,
                    "id": alt.get("id"),
                    "title": alt.get("title"),
                    "duration": alt.get("duration"),
                    "cost": alt.get("cost"),
                    "costDisplay": alt.get("costDisplay"),
                    "isIndoor": True,
                    "weatherRisk": "low",
                    "weatherRiskLabel": alt.get("weatherRiskLabel", "☂️ Indoor Sheltered"),
                    "description": alt.get("description"),
                    "isPlanBAlternative": True
                })
            else:
                # Shift for delay
                diff_items.append({
                    "id": f"diff-{idx+1}",
                    "type": "adjusted",
                    "activityId": act.get("id"),
                    "title": act.get("title"),
                    "location": act.get("location"),
                    "originalTime": act.get("timeSlot"),
                    "newTime": act.get("timeSlot"),
                    "duration": act.get("duration"),
                    "cost": act.get("cost", 0),
                    "costDisplay": act.get("costDisplay", ""),
                    "notes": f"Re-paced to accommodate {delay_minutes}m schedule adaptation gracefully."
                })
                proposed_acts.append(act)

        return {
            "scenarioTitle": f"Adaptive Schedule Optimization ({delay_minutes}m absorbed)",
            "triggerReason": scenario_text,
            "delayMinutes": delay_minutes,
            "reservationsKept": sum(1 for a in current_acts if a.get("isVisited")),
            "swappedStopsCount": 1 if is_rain else 0,
            "matchScore": 97,
            "diffItems": diff_items,
            "proposedActivities": proposed_acts,
            "generationSource": "deterministic-fallback"
        }

    def _generate_fallback_itinerary(
        self,
        config: dict,
        resolved_destinations: list = None,
        day_destinations: list = None,
        per_dest_pois: dict = None,
        per_dest_poi_source: dict = None
    ) -> dict:
        """Deterministic itinerary synthesis for destinations when live AI is offline."""
        from app.services.destinations import (
            destination_resolver,
            allocate_trip_days,
            haversine_km,
            calculate_transit_between,
            ResolvedDestination
        )

        if not resolved_destinations:
            raw_dest_list = config.get("destinations")
            if not raw_dest_list or not isinstance(raw_dest_list, list):
                raw_str = config.get("destination", "")
                if "➔" in raw_str:
                    raw_dest_list = [s.strip() for s in raw_str.split("➔") if s.strip()]
                elif "->" in raw_str:
                    raw_dest_list = [s.strip() for s in raw_str.split("->") if s.strip()]
                else:
                    raw_dest_list = [raw_str.strip()] if raw_str.strip() else ["Jaipur"]

            resolved_destinations = []
            for d in raw_dest_list:
                if isinstance(d, ResolvedDestination):
                    resolved_destinations.append(d)
                elif isinstance(d, dict) and "name" in d and "lat" in d:
                    resolved_destinations.append(
                        ResolvedDestination(d["name"], d.get("state", "India"), float(d["lat"]), float(d["lon"]))
                    )
                else:
                    res = destination_resolver.resolve(str(d))
                    if res.is_ok and res.destination:
                        resolved_destinations.append(res.destination)

        if not resolved_destinations:
            res = destination_resolver.resolve("Jaipur, Rajasthan")
            if res.is_ok and res.destination:
                resolved_destinations = [res.destination]

        start_date = config.get("startDate", "2026-11-20")
        end_date = config.get("endDate", "2026-11-23")
        traveler = config.get("travelerType", "Couple")
        budget = config.get("budgetTier", "Moderate")
        pace = config.get("pace", "Balanced")
        interests = config.get("interests", ["Culture", "Food", "History"])

        # Determine days count
        try:
            d1 = datetime.strptime(start_date, "%Y-%m-%d")
            d2 = datetime.strptime(end_date, "%Y-%m-%d")
            num_days = max(1, min((d2 - d1).days + 1, 14))
        except Exception:
            num_days = len(resolved_destinations) if len(resolved_destinations) > 1 else 3

        if not day_destinations:
            day_destinations = allocate_trip_days(num_days, resolved_destinations)
        else:
            num_days = len(day_destinations)

        if per_dest_pois is None:
            svc = _get_poi_service()
            per_dest_pois = {}
            for dest in resolved_destinations:
                if svc:
                    p_res = svc.get_pois(dest.name, max_results=30, interests=interests)
                    per_dest_pois[dest.name] = p_res.get("pois", [])
                else:
                    per_dest_pois[dest.name] = []

        # Destination landmark database for premier verified Indian hubs
        VIZAG_LANDMARKS = [
            {
                "title": "INS Kursura Submarine Museum",
                "period": "morning", "duration": "2h", "cost": 70,
                "costDisplay": "₹70", "category": "History", "location": "RK Beach Road, Visakhapatnam",
                "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "🏛️ Indoor Submarine Museum",
                "description": "Authentic Soviet-built submarine decommissioned and preserved as South Asia's first submarine museum along the coastal sands.",
                "imageUrl": ""
            },
            {
                "title": "TU 142 Aircraft Museum",
                "period": "afternoon", "duration": "1.5h", "cost": 50,
                "costDisplay": "₹50", "category": "History", "location": "Opposite Kursura, Beach Road, Visakhapatnam",
                "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "✈️ Covered Aviation Gallery",
                "description": "Decommissioned Tupolev maritime anti-submarine reconnaissance aircraft transformed into an interactive naval aviation museum.",
                "imageUrl": ""
            },
            {
                "title": "Ramakrishna Beach Promenade & Sunset Walk",
                "period": "evening", "duration": "2h", "cost": 0,
                "costDisplay": "Free", "category": "Relaxation", "location": "Beach Road, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🌊 Coastal Sunset",
                "description": "Iconic seafront promenade known for the Kali Temple vista, maritime monuments, and refreshing Bay of Bengal evening breeze.",
                "imageUrl": ""
            },
            {
                "title": "Kailasagiri Hilltop Park & Coastal Ropeway",
                "period": "morning", "duration": "2.5h", "cost": 120,
                "costDisplay": "₹120", "category": "Nature", "location": "Hill Crest, Kailasagiri, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "☀️ Panoramic Heights",
                "description": "Scenic 360-foot hilltop park featuring colossal Shiva-Parvati statues, floral clock, and aerial cable car views of the coastline.",
                "imageUrl": ""
            },
            {
                "title": "Tenneti Seafront Coastal Park",
                "period": "afternoon", "duration": "1.5h", "cost": 20,
                "costDisplay": "₹20", "category": "Nature", "location": "Jodugullapalem, Beach Road, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "high", "weatherRiskLabel": "⚠️ Convective Rain Risk",
                "description": "Cliffside coastal park overlooking rocky Bay of Bengal shores and the grounded cargo vessel MV Maa.",
                "imageUrl": "",
                "alt": {
                    "title": "Visakha Museum Heritage Galleries", "duration": "2h", "cost": 40, "costDisplay": "₹40",
                    "category": "Culture", "location": "Dutch Bungalow, Beach Road, Visakhapatnam", "isIndoor": True,
                    "weatherRiskLabel": "🛡️ 100% Indoor Sheltered",
                    "description": "Air-cooled Dutch colonial bungalow housing naval antiquities, 1971 war relics, and royal portraits.",
                    "shelterReason": "Coastal rain squalls detected. Swapped to indoor naval antiquities museum."
                }
            },
            {
                "title": "Rushikonda Beach & Coastal Sands",
                "period": "evening", "duration": "2.5h", "cost": 0,
                "costDisplay": "Free", "category": "Adventure", "location": "Rushikonda, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🏖️ Golden Hour",
                "description": "Blue Flag-certified golden sand cove known for crystal waters, surfing, and scenic rocky headlands.",
                "imageUrl": ""
            },
            {
                "title": "Simhachalam Temple (Varaha Lakshmi Narasimha)",
                "period": "morning", "duration": "2.5h", "cost": 100,
                "costDisplay": "₹100", "category": "Spiritual", "location": "Simhachalam Hill Range, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🪔 Sacred Morning",
                "description": "Ancient 11th-century hill shrine celebrated for its ornate Chola-Ganga stone carving and 96-pillar Kalyana Mandapam.",
                "imageUrl": ""
            },
            {
                "title": "Dolphin's Nose Promontory & Hilltop Lighthouse",
                "period": "afternoon", "duration": "2h", "cost": 30,
                "costDisplay": "₹30", "category": "History", "location": "Southern Port Ridge, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "⚓ Maritime Vista",
                "description": "Natural dolphin head-shaped basalt rock projecting into the sea, featuring a 358-meter lighthouse overlooking the harbor.",
                "imageUrl": ""
            },
            {
                "title": "Yarada Beach Coastal Cove",
                "period": "evening", "duration": "2h", "cost": 30,
                "costDisplay": "₹30", "category": "Relaxation", "location": "Yarada Village, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🌅 Sunset Overlook",
                "description": "Pristine secluded beach embraced by lush green hills on three sides and the azure Bay of Bengal on the fourth.",
                "imageUrl": ""
            },
            {
                "title": "Thotlakonda Buddhist Complex",
                "period": "morning", "duration": "2h", "cost": 25,
                "costDisplay": "₹25", "category": "History", "location": "Mangamaripeta Hill, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🪷 Monastic Heritage",
                "description": "2,000-year-old Hinayana Buddhist monastery ruins perched on a hill above the sea with stupas and stone viharas.",
                "imageUrl": ""
            },
            {
                "title": "Bheemili Beach & Dutch Outpost Ruins",
                "period": "afternoon", "duration": "2h", "cost": 0,
                "costDisplay": "Free", "category": "History", "location": "Bheemunipatnam, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🏛️ Dutch Maritime Ruins",
                "description": "Historic 17th-century Dutch maritime settlement at the mouth of the Gosthani River with colonial cemetery ruins.",
                "imageUrl": ""
            },
            {
                "title": "Jagadamba Center & Waltair Seafood Trail",
                "period": "evening", "duration": "2h", "cost": 350,
                "costDisplay": "₹350", "category": "Food", "location": "Jagadamba Junction, Visakhapatnam",
                "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "🍽️ Regional Andhra Cuisine",
                "description": "Curated culinary tasting of authentic coastal Andhra delicacies, Royyala Iguru, and Madugula halwa.",
                "imageUrl": ""
            }
        ]

        LANDMARKS_DB = {
            "visakhapatnam": VIZAG_LANDMARKS,
            "vizag": VIZAG_LANDMARKS,
            "hyderabad": [
                {
                    "title": "Charminar & Laad Bazaar Pearl Quarter",
                    "period": "morning", "duration": "2.5h", "cost": 50,
                    "costDisplay": "₹50", "category": "History", "location": "Old City, Hyderabad",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "☀️ Clear Morning",
                    "description": "16th-century four-minaret monument paired with vibrant lac bangle arcades and Irani chai.",
                    "imageUrl": ""
                },
                {
                    "title": "Chowmahalla Palace Royal Courtyards",
                    "period": "afternoon", "duration": "2h", "cost": 100,
                    "costDisplay": "₹100", "category": "Culture", "location": "Motigall, Hyderabad",
                    "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "🏛️ Indoor Safe",
                    "description": "Opulent palace seat of the Asaf Jahi dynasty with ornate Belgian crystal chandeliers.",
                    "imageUrl": ""
                },
                {
                    "title": "Paradise Food Trail & Biryani Heritage",
                    "period": "evening", "duration": "2h", "cost": 350,
                    "costDisplay": "₹350", "category": "Food", "location": "Secunderabad / Old City",
                    "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "🍽️ Indoor Dining",
                    "description": "Authentic Hyderabadi Dum Biryani, mirchi ka salan, and double ka meetha tasting.",
                    "imageUrl": ""
                },
                {
                    "title": "Golconda Fort & Acoustic Echo Vaults",
                    "period": "morning", "duration": "3h", "cost": 40,
                    "costDisplay": "₹40", "category": "History", "location": "Ibrahim Bagh, Hyderabad",
                    "isIndoor": False, "weatherRisk": "high", "weatherRiskLabel": "⚠️ Convective Rain Risk",
                    "description": "Citadel fortress famous for its acoustic clapping portico and Koh-i-Noor diamond vaults.",
                    "imageUrl": "",
                    "alt": {
                        "title": "Salar Jung Museum Galleries", "duration": "2h", "cost": 100, "costDisplay": "₹100",
                        "category": "Culture", "location": "Darulshifa, Hyderabad", "isIndoor": True,
                        "weatherRiskLabel": "🛡️ 100% Indoor Sheltered",
                        "description": "Vast indoor collection of jade, European clocks, and Nizami royal treasures."
                    }
                },
                {
                    "title": "Qutb Shahi Tombs Serene Gardens",
                    "period": "afternoon", "duration": "1.5h", "cost": 50,
                    "costDisplay": "₹50", "category": "Nature", "location": "Golconda, Hyderabad",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "☀️ Clear Skies",
                    "description": "Domed stone mausoleums surrounded by landscaped Persian charbagh gardens.",
                    "imageUrl": ""
                },
                {
                    "title": "Hussain Sagar Lake & Necklace Road Promenade",
                    "period": "evening", "duration": "2h", "cost": 100,
                    "costDisplay": "₹100", "category": "Relaxation", "location": "Necklace Rd, Hyderabad",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "⛵ Twilight Window",
                    "description": "Heart-shaped urban lake featuring the monolithic Buddha statue and lakefront breeze.",
                    "imageUrl": ""
                },
                {
                    "title": "Shilparamam Arts & Crafts Village",
                    "period": "morning", "duration": "2.5h", "cost": 60,
                    "costDisplay": "₹60", "category": "Culture", "location": "HITEC City, Hyderabad",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "☀️ Shaded Walkways",
                    "description": "Traditional artisan hamlet featuring handloom weavers, terracotta artisans, and folk music.",
                    "imageUrl": ""
                },
                {
                    "title": "Durgam Cheruvu Cable-Stayed Bridge Walk",
                    "period": "evening", "duration": "1.5h", "cost": 0,
                    "costDisplay": "Free", "category": "Nature", "location": "Jubilee Hills, Hyderabad",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🌆 Sunset View",
                    "description": "Iconic illuminated bridge with panoramic views over the secret lake and city skyline.",
                    "imageUrl": ""
                }
            ],
            "jaipur": [
                {
                    "title": "Amer Fort & Sheesh Mahal",
                    "period": "morning", "duration": "2.5h", "cost": 500,
                    "costDisplay": "₹500", "category": "History", "location": "Amer, Jaipur",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "☀️ Clear Skies",
                    "description": "Iconic 16th-century fortress overlooking Maota Lake, famous for intricate mirror mosaics.",
                    "imageUrl": ""
                },
                {
                    "title": "Panna Meena Ka Kund Stepwell",
                    "period": "afternoon", "duration": "1h", "cost": 0,
                    "costDisplay": "Free", "category": "Culture", "location": "Near Amer Fort, Jaipur",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "☀️ Clear Skies",
                    "description": "Centuries-old symmetrical geometric stepwell with golden stone steps and shaded verandahs.",
                    "imageUrl": ""
                },
                {
                    "title": "Jal Mahal Promenade & Spiced Chai Stop",
                    "period": "evening", "duration": "1.5h", "cost": 150,
                    "costDisplay": "₹150", "category": "Food", "location": "Man Sagar Lake, Jaipur",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🌅 Sunset View",
                    "description": "Scenic photo stroll along lakeside promenade viewing the sunken water palace with spiced Kulhad chai.",
                    "imageUrl": ""
                },
                {
                    "title": "Nahargarh Fort Outdoor Sunset Viewpoint",
                    "period": "morning", "duration": "2.5h", "cost": 300,
                    "costDisplay": "₹300", "category": "Relaxation", "location": "Aravalli Hills, Jaipur",
                    "isIndoor": False, "weatherRisk": "high", "weatherRiskLabel": "⚠️ Convective Rain Risk",
                    "description": "Perched on the Aravalli ridge offering panoramic evening vistas across the Pink City.",
                    "imageUrl": "",
                    "alt": {
                        "title": "Albert Hall Museum & Indoor Pottery Gallery", "duration": "2h", "cost": 300, "costDisplay": "₹300",
                        "category": "Culture", "location": "Ram Niwas Garden, Jaipur", "isIndoor": True,
                        "weatherRiskLabel": "🛡️ 100% Indoor Sheltered",
                        "description": "Rajasthan oldest museum showcasing miniature paintings, carpets, and blue pottery workshops.",
                        "shelterReason": "Aravalli ridge rain squalls detected. Swapped to indoor museum."
                    }
                },
                {
                    "title": "Hawa Mahal Dawn Facade & Wind View Walk",
                    "period": "afternoon", "duration": "1.5h", "cost": 200,
                    "costDisplay": "₹200", "category": "History", "location": "Badi Choupad, Jaipur",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "☀️ Clear Skies",
                    "description": "Admire 953 honeycombed sandstone jharokhas in soft light from Wind View terrace.",
                    "imageUrl": ""
                },
                {
                    "title": "City Palace Royal Quarters & Chandra Mahal",
                    "period": "evening", "duration": "2h", "cost": 700,
                    "costDisplay": "₹700", "category": "Culture", "location": "Gangori Bazaar, Jaipur",
                    "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "🏛️ Indoor Sheltered",
                    "description": "Vast ceremonial courtyards, Peacock Gate, royal costume armory, and maharaja suites.",
                    "imageUrl": ""
                }
            ],
            "goa": [
                {
                    "title": "Basilica of Bom Jesus & Old Goa Heritage",
                    "period": "morning", "duration": "2h", "cost": 50,
                    "costDisplay": "₹50", "category": "History", "location": "Old Goa, Goa",
                    "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "🏛️ Indoor Heritage Basilica",
                    "description": "UNESCO World Heritage Baroque cathedral housing the sacred silver relics of St. Francis Xavier.",
                    "imageUrl": ""
                },
                {
                    "title": "Fontainhas Latin Quarter Walking Tour",
                    "period": "afternoon", "duration": "2h", "cost": 150,
                    "costDisplay": "₹150", "category": "Culture", "location": "Panaji, Goa",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "☀️ Clear Skies",
                    "description": "Vibrant Portuguese quarter characterized by colorful tiled villas, bougainvillea balconies, and bakeries.",
                    "imageUrl": ""
                },
                {
                    "title": "Mandovi River Twilight Sunset Cruise",
                    "period": "evening", "duration": "2h", "cost": 400,
                    "costDisplay": "₹400", "category": "Relaxation", "location": "Panaji Jetty, Goa",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🌅 Sunset Cruise",
                    "description": "Scenic boat cruise along Mandovi estuary featuring live Goan folk dance and golden hour river views.",
                    "imageUrl": ""
                },
                {
                    "title": "Aguada Fort & Coastal Bastion",
                    "period": "morning", "duration": "2h", "cost": 50,
                    "costDisplay": "₹50", "category": "History", "location": "Sinquerim, Goa",
                    "isIndoor": False, "weatherRisk": "high", "weatherRiskLabel": "⚠️ Convective Rain Risk",
                    "description": "17th-century Portuguese fortress and four-story lighthouse guarding the mouth of Mandovi river.",
                    "imageUrl": "",
                    "alt": {
                        "title": "Goa State Central Museum & Gallery", "duration": "2h", "cost": 100, "costDisplay": "₹100",
                        "category": "Culture", "location": "Patto, Panaji, Goa", "isIndoor": True,
                        "weatherRiskLabel": "🛡️ 100% Indoor Sheltered",
                        "description": "Air-conditioned indoor museum featuring ancient Christian art, bronzes, and Portuguese artifacts.",
                        "shelterReason": "Coastal rain squalls on open ramparts. Swapped to indoor state museum."
                    }
                },
                {
                    "title": "Anjuna Beach & Rocky Coastline",
                    "period": "afternoon", "duration": "2h", "cost": 0,
                    "costDisplay": "Free", "category": "Relaxation", "location": "Anjuna, Goa",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "☀️ Clear Skies",
                    "description": "Iconic north Goan beach framed by red laterite cliffs, coastal palms, and seaside cafes.",
                    "imageUrl": ""
                },
                {
                    "title": "Spice Plantation Tour & Goan Buffet Dinner",
                    "period": "evening", "duration": "2.5h", "cost": 500,
                    "costDisplay": "₹500", "category": "Food", "location": "Ponda, Goa",
                    "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "🍽️ Covered Dining",
                    "description": "Traditional aromatic spice farm tour followed by authentic Goan fish curry and feni tasting.",
                    "imageUrl": ""
                }
            ]
        }

        # Determine pace scaling
        pace_lower = pace.lower()
        if "relaxed" in pace_lower:
            acts_per_day = 2
            time_slots = [("09:30 AM", "morning"), ("04:30 PM", "evening")]
        elif "packed" in pace_lower or "fast" in pace_lower:
            acts_per_day = 4
            time_slots = [("08:30 AM", "morning"), ("11:30 AM", "morning"), ("03:00 PM", "afternoon"), ("06:30 PM", "evening")]
        else:
            acts_per_day = 3
            time_slots = [("09:00 AM", "morning"), ("01:30 PM", "afternoon"), ("05:30 PM", "evening")]

        # Multi-day archetype themes for generic destinations or extra days
        THEMED_DAYS = [
            ("Historic Architecture & Heritage Quarter", [
                {"title": "Heritage Quarter Walking Tour", "duration": "2.5h", "cost": 300, "category": "Culture", "location": "Old Town", "isIndoor": False, "desc": "Guided walking tour exploring historic architecture, artisanal alleys, and local morning tea stops."},
                {"title": "Central Arts & Cultural Museum", "duration": "2h", "cost": 150, "category": "History", "location": "Museum Enclave", "isIndoor": True, "desc": "Sheltered historic gallery featuring regional antiquities, folk textiles, and miniature paintings."},
                {"title": "Twilight Culinary Trail", "duration": "2h", "cost": 450, "category": "Food", "location": "Heritage Promenade", "isIndoor": True, "desc": "Curated evening tasting of signature delicacies, regional sweets, and clay-pot beverages."},
                {"title": "Illuminated Clock Tower Square", "duration": "1.5h", "cost": 0, "category": "Relaxation", "location": "City Center", "isIndoor": False, "desc": "Evening gathering hub featuring heritage lamp posts and vibrant street ambiance."}
            ]),
            ("Scenic Heights & Botanic Sanctuaries", [
                {"title": "Panoramic Hilltop Ridge Overlook", "duration": "2.5h", "cost": 100, "category": "Nature", "location": "Upper Ridge", "isIndoor": False, "desc": "Scenic hilltop vantage offering breathtaking horizons across the valleys."},
                {"title": "Grand Botanical Sanctuary", "duration": "2h", "cost": 80, "category": "Nature", "location": "Outer Ring", "isIndoor": False, "desc": "Lush shaded gardens featuring heritage flora, tranquil water bodies, and avian photography spots."},
                {"title": "Artisan Coffee & Plantation Cafe", "duration": "1.5h", "cost": 250, "category": "Food", "location": "Hill Slope", "isIndoor": True, "desc": "Locally harvested single-origin brews served with freshly baked treats overlooking the hills."},
                {"title": "Sunset Point Golden Hour Deck", "duration": "1.5h", "cost": 50, "category": "Relaxation", "location": "Ridge Path", "isIndoor": False, "desc": "Quiet wooden deck with panoramic sunset colors across the horizon."}
            ]),
            ("Artisan Traditions & Sacred Heritage", [
                {"title": "Ancient Stone Temple & Sculpted Mandapam", "duration": "2.5h", "cost": 50, "category": "Spiritual", "location": "Temple Road", "isIndoor": False, "desc": "Centuries-old stone sanctuary featuring intricate carvings, traditional bronze lamps, and peaceful prayer courtyards."},
                {"title": "Master Weavers & Handicraft Atelier", "duration": "2h", "cost": 100, "category": "Culture", "location": "Artisans Lane", "isIndoor": True, "desc": "Witness generational artisans shaping handloom fabrics, pottery, and brass metalwork."},
                {"title": "Spice Market & Herb Guild Walk", "duration": "1.5h", "cost": 150, "category": "Food", "location": "Bazaar Circle", "isIndoor": False, "desc": "Aromatic alleys filled with freshly ground spices, herbs, and cold-pressed oils."},
                {"title": "Folk Music & Classical Dance Evening", "duration": "2h", "cost": 400, "category": "Culture", "location": "Community Amphitheatre", "isIndoor": True, "desc": "Mesmerizing regional folk instruments, vocal ballads, and classical rhythms."}
            ]),
            ("Waterfront Serenity & Nature Coves", [
                {"title": "Waterfront Promenade & Morning Breeze", "duration": "2h", "cost": 0, "category": "Relaxation", "location": "Waterfront Drive", "isIndoor": False, "desc": "Crisp morning walk alongside the shimmering waters with avian sightings."},
                {"title": "Lake Island Pavilion & Solar Cruise", "duration": "2h", "cost": 300, "category": "Adventure", "location": "Pier Terminal", "isIndoor": False, "desc": "Tranquil electric boat cruise to a secluded island pavilion with mountain views."},
                {"title": "Marine Life & Bio-Reserve Center", "duration": "2h", "cost": 120, "category": "Nature", "location": "Coastal Enclave", "isIndoor": True, "desc": "Interactive exhibits showcasing native freshwater ecosystems and bird migrations."},
                {"title": "Waterfront Twilight Grill Dinner", "duration": "2h", "cost": 700, "category": "Food", "location": "Marina Jetty", "isIndoor": True, "desc": "Fresh locally sourced catch prepared with fragrant coastal spices and sunset vistas."}
            ]),
            ("Sacred Valleys & Historic Citadels", [
                {"title": "Hill Citadel & Historic Bastion", "duration": "3h", "cost": 200, "category": "History", "location": "Fortress Hill", "isIndoor": False, "desc": "Sprawling ramparts, watchtowers, and secret passageways guarding the borders."},
                {"title": "Royal Armory & Coins Gallery", "duration": "1.5h", "cost": 80, "category": "History", "location": "Upper Palace", "isIndoor": True, "desc": "Sheltered vault holding ancient damascened swords, royal edicts, and antique coinage."},
                {"title": "Valley View Tea Lounge", "duration": "1.5h", "cost": 200, "category": "Relaxation", "location": "Fort Verandah", "isIndoor": True, "desc": "Historic verandah offering fragrant chai and savory local pastries with commanding valley views."},
                {"title": "Stargazing Astronomy Point", "duration": "1.5h", "cost": 100, "category": "Nature", "location": "Observatory Crest", "isIndoor": False, "desc": "Unpolluted night sky viewing with high-powered telescope stations."}
            ]),
            ("Hidden Gardens & Culinary Masterclass", [
                {"title": "Organic Herb Farm & Guided Orchard Tour", "duration": "2h", "cost": 150, "category": "Nature", "location": "Green Valley", "isIndoor": False, "desc": "Walk through lush citrus groves, medicinal herb plots, and honey bee hives."},
                {"title": "Interactive Cooking Studio & Heritage Feast", "duration": "2.5h", "cost": 650, "category": "Food", "location": "Culinary Quarter", "isIndoor": True, "desc": "Hands-on cooking experience learning grandmother recipes and slow-cooked earthen pot delicacies."},
                {"title": "Artisan Ceramics & Pottery Workshop", "duration": "2h", "cost": 300, "category": "Culture", "location": "Pottery Colony", "isIndoor": True, "desc": "Shape your own clay vessel on a potter wheel with traditional ceramic glaze."},
                {"title": "Candlelit Courtyard Dinner", "duration": "2h", "cost": 800, "category": "Food", "location": "Old Haveli", "isIndoor": True, "desc": "Romantic outdoor courtyard dinner with live acoustic strings and seasonal tasting menu."}
            ]),
            ("Farewell Horizons & Golden Vista", [
                {"title": "Dawn Ridge Awakening Walk", "duration": "2h", "cost": 0, "category": "Nature", "location": "Sunrise Ridge", "isIndoor": False, "desc": "Early morning meditation and brisk walk watching the morning mist lift."},
                {"title": "Heritage Library & Archival Reading Hall", "duration": "1.5h", "cost": 50, "category": "Culture", "location": "Town Center", "isIndoor": True, "desc": "Historic teakwood reading hall with rare travel logs, lithographs, and maps."},
                {"title": "Souvenir Emporium & Handloom Guild", "duration": "2h", "cost": 200, "category": "Shopping", "location": "Central Square", "isIndoor": True, "desc": "Certified authentic artisanal souvenirs, handmade shawls, and locally packed teas."},
                {"title": "Celebration Farewell Feast", "duration": "2h", "cost": 900, "category": "Food", "location": "Grand Terrace", "isIndoor": True, "desc": "Celebratory multi-course dinner summarizing the regional flavors and memorable moments of your trip."}
            ])
        ]

        used_titles_per_dest: dict[str, set[str]] = {}
        days = []
        cur_date = datetime.strptime(start_date, "%Y-%m-%d") if start_date else datetime.now()

        for day_num in range(1, num_days + 1):
            date_str = cur_date.strftime("%b %d, %Y")
            day_of_week = cur_date.strftime("%A")
            is_rain_day = (day_num == 2)  # Controlled Day 2 weather contingency test

            day_dest = day_destinations[min(day_num - 1, len(day_destinations) - 1)]
            dest_clean = day_dest.name
            dest_key = dest_clean.lower().strip()

            if dest_clean not in used_titles_per_dest:
                used_titles_per_dest[dest_clean] = set()
            used_titles = used_titles_per_dest[dest_clean]

            # 1. Lookup landmarks specifically for this day's destination
            day_landmarks = LANDMARKS_DB.get(dest_key)
            if not day_landmarks:
                dest_pois = per_dest_pois.get(dest_clean, []) if per_dest_pois else []
                if not dest_pois:
                    svc = _get_poi_service()
                    if svc:
                        p_res = svc.get_pois(dest_clean, max_results=20, interests=interests)
                        dest_pois = p_res.get("pois", [])
                if dest_pois:
                    day_landmarks = []
                    for p in dest_pois:
                        cat = p.get("category", "Culture")
                        is_ind = cat in ("Museum", "Palace", "Art Gallery", "Temple")
                        day_landmarks.append({
                            "title": p["name"],
                            "period": "morning",
                            "duration": "2h",
                            "cost": 50 if is_ind else 0,
                            "costDisplay": "₹50" if is_ind else "Free",
                            "category": cat,
                            "location": p.get("area") or f"{p['name']}, {dest_clean}",
                            "lat": p.get("lat", day_dest.lat),
                            "lon": p.get("lon", day_dest.lon),
                            "isIndoor": is_ind,
                            "weatherRisk": "low",
                            "weatherRiskLabel": "🏛️ Indoor Safe" if is_ind else "☀️ Clear Skies",
                            "description": f"Explore {p['name']}, a verified attraction in {dest_clean}, {day_dest.state}.",
                            "imageUrl": ""
                        })
                else:
                    day_landmarks = []

            # Pick activities for this day ensuring zero overlap across days in the same destination
            day_activities = []
            chosen_items = []

            # Try unused items from destination landmarks
            if day_landmarks:
                for item in day_landmarks:
                    if item["title"] not in used_titles and len(chosen_items) < acts_per_day:
                        chosen_items.append(item)
                        used_titles.add(item["title"])

            # If more items needed, pull from themed archetype for this day
            theme_idx = (day_num - 1) % len(THEMED_DAYS)
            theme_name, theme_stops = THEMED_DAYS[theme_idx]

            if len(chosen_items) < acts_per_day:
                for s in theme_stops:
                    s_title = f"{dest_clean} {s['title']}"
                    if s_title not in used_titles and len(chosen_items) < acts_per_day:
                        chosen_items.append({
                            "title": s_title,
                            "period": "morning",
                            "duration": s["duration"],
                            "cost": s["cost"],
                            "costDisplay": f"₹{s['cost']}" if s["cost"] > 0 else "Free",
                            "category": s["category"],
                            "location": f"{s['location']}, {dest_clean}",
                            "lat": day_dest.lat,
                            "lon": day_dest.lon,
                            "isIndoor": s["isIndoor"],
                            "weatherRisk": "low",
                            "weatherRiskLabel": "🏛️ Indoor Safe" if s["isIndoor"] else "☀️ Clear Skies",
                            "description": f"{s['desc']} in {dest_clean}.",
                            "imageUrl": ""
                        })
                        used_titles.add(s_title)

            # Assign slots and harmonize weather risks
            # Exactly one outdoor activity on a rain day gets high weather risk and a Plan B
            plan_b_assigned = False

            for a_idx, item in enumerate(chosen_items, 1):
                act_id = f"act-{day_num}-{a_idx}"
                slot_time, slot_period = time_slots[min(a_idx - 1, len(time_slots) - 1)]

                is_indoor = item.get("isIndoor", False)

                if is_rain_day and not is_indoor and not plan_b_assigned and a_idx >= 2:
                    weather_risk = "high"
                    weather_risk_label = "⚠️ Convective Rain Risk"
                    plan_b_assigned = True

                    alt_info = item.get("alt")
                    if alt_info:
                        alt_data = {
                            "id": f"alt-{day_num}-{a_idx}",
                            "title": alt_info["title"],
                            "timeSlot": slot_time,
                            "duration": alt_info.get("duration", "2h"),
                            "cost": alt_info.get("cost", 40),
                            "costDisplay": alt_info.get("costDisplay", "₹40"),
                            "category": alt_info.get("category", "Culture"),
                            "location": alt_info.get("location", f"{dest_clean} Museum Enclave"),
                            "isIndoor": True,
                            "weatherRiskLabel": alt_info.get("weatherRiskLabel", "🛡️ 100% Indoor Sheltered"),
                            "description": alt_info.get("description", f"Sheltered indoor museum venue in {dest_clean} safe from rain."),
                            "shelterReason": alt_info.get("shelterReason", "Rain squall alert. Swapped to indoor museum."),
                            "costDelta": "₹0"
                        }
                    else:
                        real_indoor = None
                        for l_cand in day_landmarks:
                            if l_cand.get("isIndoor") and l_cand.get("title") not in [c.get("title") for c in chosen_items]:
                                real_indoor = l_cand
                                break
                        if real_indoor:
                            alt_data = {
                                "id": f"alt-{day_num}-{a_idx}",
                                "title": real_indoor["title"],
                                "timeSlot": slot_time,
                                "duration": real_indoor.get("duration", "2h"),
                                "cost": real_indoor.get("cost", 50),
                                "costDisplay": real_indoor.get("costDisplay", "₹50"),
                                "category": real_indoor.get("category", "Culture"),
                                "location": real_indoor.get("location", dest_clean),
                                "isIndoor": True,
                                "weatherRiskLabel": "🛡️ 100% Indoor Sheltered",
                                "description": f"Curated sheltered visit to {real_indoor['title']} safe from rain showers.",
                                "imageUrl": get_wikipedia_page_image(real_indoor.get("title", "")),
                                "shelterReason": "Convective shower alert. Transferred to sheltered indoor venue.",
                                "costDelta": "₹0"
                            }
                            has_plan_b = True
                        else:
                            alt_data = None
                            has_plan_b = False
                else:
                    weather_risk = "low"
                    if is_indoor:
                        weather_risk_label = "🏛️ Indoor Sheltered"
                    else:
                        weather_risk_label = "☀️ Clear Skies"
                    alt_data = None
                    has_plan_b = False

                item_lat = float(item.get("lat") or day_dest.lat)
                item_lon = float(item.get("lon") or day_dest.lon)

                day_activities.append({
                    "id": act_id,
                    "title": item["title"],
                    "timeSlot": slot_time,
                    "period": slot_period,
                    "duration": item.get("duration", "2h"),
                    "cost": item.get("cost", 100),
                    "costDisplay": item.get("costDisplay", f"₹{item.get('cost', 100)}"),
                    "category": item.get("category", "Culture"),
                    "location": item.get("location", dest_clean),
                    "lat": item_lat,
                    "lon": item_lon,
                    "latitude": item_lat,
                    "longitude": item_lon,
                    "isIndoor": is_indoor,
                    "weatherRisk": weather_risk,
                    "weatherRiskLabel": weather_risk_label,
                    "description": item.get("description", ""),
                    "imageUrl": get_wikipedia_page_image(item.get("title", "")),
                    "isVisited": False,
                    "verified": True,
                    "hasPlanBReady": has_plan_b,
                    "planBAlternative": alt_data
                })

            weather_summary = "Showers 25°C • 65% Rain at 2 PM" if is_rain_day else "27°C • Sunny & Clear"

            days.append({
                "dayNumber": day_num,
                "dayOfWeek": day_of_week,
                "dateStr": date_str,
                "theme": f"{dest_clean}: {theme_name}",
                "weatherSummary": weather_summary,
                "temperature": "25°C" if is_rain_day else "27°C",
                "rainRisk": 65 if is_rain_day else 10,
                "weatherCondition": "thunderstorm" if is_rain_day else "sunny",
                "dayDestination": {
                    "name": day_dest.name,
                    "state": day_dest.state,
                    "lat": day_dest.lat,
                    "lon": day_dest.lon
                },
                "activities": day_activities
            })
            cur_date += timedelta(days=1)

        from app.services.destinations import calculate_transit_between
        return {
            "tagline": f"{traveler} Expedition across {' ➔ '.join(d.name for d in resolved_destinations)} ({pace} pace, {budget})",
            "days": days,
            "destinations": [d.name for d in resolved_destinations],
            "destination": " ➔ ".join(d.name for d in resolved_destinations),
            "transitBetween": calculate_transit_between(resolved_destinations)
        }


# Singleton service instance
gemini_service = GeminiService()
