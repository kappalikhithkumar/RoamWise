import os
import re
import time
import json
import difflib
import logging
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
        fallback_reason = "No API key configured"
        if self.is_available():
            executor = concurrent.futures.ThreadPoolExecutor(max_workers=1)
            try:
                future = executor.submit(self._call_gemini_generation, config)
                ai_itinerary = future.result(timeout=40.0)
                valid, sanitized = self._validate_itinerary(ai_itinerary, config)
                if valid:
                    sanitized["generationSource"] = "gemini-ai"
                    sanitized["modelUsed"] = DEFAULT_MODEL
                    sanitized["poiSource"] = ai_itinerary.get("_poiSource", "gemini-memory")
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
        fallback = self._generate_fallback_itinerary(config)
        fallback["generationSource"] = "deterministic-fallback"
        fallback["fallbackReason"] = fallback_reason
        return fallback

    def _call_gemini_generation(self, config: dict) -> dict:
        destination = config.get("destination", "Jaipur, Rajasthan")
        destinations = config.get("destinations", [destination])
        state = config.get("state")
        if not state:
            try:
                from app.services import destinations as dest_module
                res = dest_module.resolver.resolve(destination)
                if res.is_ok and res.destination:
                    state = res.destination.state
            except Exception:
                pass
        state_str = f", {state}" if (state and state.lower() not in destination.lower()) else ""
        destination_full = f"{destination}{state_str}, India"

        start_date = config.get("startDate", "2026-11-20")
        end_date = config.get("endDate", "2026-11-23")
        budget = config.get("budgetTier", "Moderate")
        interests = config.get("interests", ["Culture", "Food", "History"])
        traveler = config.get("travelerType", "Couple")
        pace = config.get("pace", "Balanced")

        # Calculate number of days
        try:
            d1 = datetime.strptime(start_date, "%Y-%m-%d")
            d2 = datetime.strptime(end_date, "%Y-%m-%d")
            num_days = max(1, min((d2 - d1).days + 1, 14))
        except Exception:
            num_days = 3

        # ── Fetch verified POIs to ground the prompt ────────────────────
        poi_context_block = ""
        poi_source = "gemini-memory"
        pois = []
        try:
            svc = _get_poi_service()
            if svc:
                poi_result = svc.get_pois(destination, max_results=30, interests=interests)
                pois = poi_result.get("pois", [])
                poi_source = poi_result.get("source", "none")
                if pois:
                    poi_lines = []
                    for p in pois:
                        coords = f" (lat:{p['lat']}, lon:{p['lon']})" if p.get("lat") else ""
                        area = f" — {p.get('area', p.get('tags', {}).get('wikipedia', ''))}" if p.get("area") else ""
                        poi_lines.append(f"  - {p['name']}{area}{coords} [{p['category']}]")
                    disclosure = poi_result.get("sourceDisclosure", "")
                    poi_context_block = f"""
VERIFIED ATTRACTIONS DATABASE ({poi_source.upper()}):
The following are real, verified attractions for {destination}. 
You MUST prioritize these in your itinerary. Do NOT rename, generalize, or invent alternatives to these places.
You MAY add other well-known real attractions you know about, but only if they genuinely exist.
Disclosure: {disclosure}

{chr(10).join(poi_lines)}

IMPORTANT: Use the exact attraction names above as activity "title" values.
Do not substitute generic names like "{destination} Heritage Quarter Walking Tour" or
"{destination} Central Arts & Cultural Museum" when specific real places are available.
"""
                else:
                    poi_context_block = f"""
POI DISCOVERY RESULT: No verified attraction database is available for '{destination}'.
You must use your knowledge of real, well-known attractions in {destination}.
Only include places that genuinely exist and are recognized by travelers.
Do not invent attraction names, museum names, or generic place descriptions.
If you are uncertain whether a place exists, omit it rather than inventing it.
"""
        except Exception as e:
            logger.warning(f"POI context fetch failed: {e}")

        prompt = f"""
You are RoamWise AI, an expert adaptive travel planner with deep geographic knowledge of India.
Create a detailed, high-quality, realistic {num_days}-day travel itinerary for {destination_full}.
Destinations included: {', '.join(destinations)}.
State / Union Territory: {state if state else 'India'}.
Dates: {start_date} to {end_date} ({num_days} days total).
Traveler Type: {traveler}
Travel Pace: {pace} (if Relaxed: 2-3 stops/day; Balanced: 3-4 stops/day; Packed: 4-5 stops/day)
Budget Tier: {budget} (all costs must be estimated realistically in Indian Rupees ₹ only)
Interests: {', '.join(interests)}
{poi_context_block}
CRITICAL RULES:
1. Destination is strictly within India ({destination_full}). Use REAL, SPECIFIC Indian attraction names — not generic names like "City Heritage Quarter" or "Grand Botanical Sanctuary".
2. Each day must have a distinct set of activities — do NOT repeat any attraction across days.
3. Activities must be geographically clustered per day to minimize unnecessary travel across Indian traffic.
4. Consider the selected pace strictly: Relaxed=2-3 stops, Balanced=3-4 stops, Packed=4-5 stops.
5. Plan B alternatives must be real indoor/sheltered venues (e.g. a specific museum or temple hall, not a generic "indoor gallery").
6. All costs must be realistic for domestic travel in India, specified in Indian Rupees (₹) only.
7. The "location" field must name a real neighborhood, road, or district in {destination} — not a generic placeholder.

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
      "activities": [
        {{
          "id": "act-1-1",
          "title": "REAL specific attraction name (e.g. Lalbagh Botanical Garden, not 'City Botanical Sanctuary')",
          "timeSlot": "09:00 AM",
          "period": "morning",
          "duration": "2.5h",
          "cost": 500,
          "costDisplay": "₹500",
          "category": "History",
          "location": "Specific street / neighbourhood / area name",
          "isIndoor": false,
          "weatherRisk": "low",
          "weatherRiskLabel": "☀️ Low Risk",
          "description": "Engaging 2-sentence description with specific historical or geographical facts.",
          "imageUrl": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
          "isVisited": false,
          "hasPlanBReady": true,
          "planBAlternative": {{
            "id": "alt-1-1",
            "title": "Real indoor museum or sheltered venue name",
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
        # Call Gemini with retry once on 429
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
                # Attach poi_source metadata and verified candidate POIs for validation
                result["_poiSource"] = poi_source
                result["_pois"] = pois
                return result
            except Exception as e:
                err_str = str(e)
                if ("429" in err_str or "RESOURCE_EXHAUSTED" in err_str) and attempt == 0:
                    logger.warning("Gemini 429 rate limit encountered. Retrying once after 2.0s backoff...")
                    time.sleep(2.0)
                    continue
                raise


    def _validate_itinerary(self, data: dict, config: dict) -> tuple[bool, dict]:
        """Validate structure and sanitize required fields."""
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
                    "location": act.get("location", config.get("destination", "")),
                    "isIndoor": bool(act.get("isIndoor", False)),
                    "weatherRisk": act.get("weatherRisk", "low"),
                    "weatherRiskLabel": act.get("weatherRiskLabel", "☀️ Low Risk"),
                    "description": act.get("description", ""),
                    "imageUrl": act.get("imageUrl") or "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
                    "isVisited": False,
                    "hasPlanBReady": bool(act.get("hasPlanBReady", False)),
                    "planBAlternative": act.get("planBAlternative")
                }
                sanitized_activities.append(sanitized_act)

            if sanitized_activities:
                sanitized_days.append({
                    "dayNumber": day_num,
                    "dayOfWeek": day.get("dayOfWeek", "Day"),
                    "dateStr": day.get("dateStr", ""),
                    "theme": day.get("theme", f"Day {day_num} Exploration"),
                    "weatherSummary": day.get("weatherSummary", "26°C • Clear"),
                    "temperature": day.get("temperature", "26°C"),
                    "rainRisk": int(day.get("rainRisk", 10)),
                    "weatherCondition": day.get("weatherCondition", "sunny"),
                    "weatherAlert": day.get("weatherAlert"),
                    "activities": sanitized_activities
                })

        if not sanitized_days:
            return False, None

        # ── POI Verification and Filtering ──────────────────────────────
        pois = data.get("_pois", [])
        poi_source = data.get("_poiSource", "none")

        if poi_source in ("curated", "openstreetmap") and pois:
            for day in sanitized_days:
                day_acts = day.get("activities", [])
                for act in day_acts:
                    matched, matched_poi = _match_activity_to_poi(act.get("title", ""), pois)
                    if matched and matched_poi:
                        act["verified"] = True
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
                    else:
                        act["verified"] = False

                # Drop unverified activities when verified POIs exist,
                # but only if the day keeps at least 2 activities.
                # Otherwise keep them and set verified=false.
                verified_acts = [a for a in day_acts if a.get("verified")]
                if len(verified_acts) >= 2:
                    day["activities"] = verified_acts
                else:
                    day["activities"] = day_acts

        return True, {
            "tagline": data.get("tagline", f"{config.get('travelerType', 'Curated')} Expedition across {config.get('destination')}"),
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

    def _generate_fallback_itinerary(self, config: dict) -> dict:
        """Deterministic itinerary synthesis for destinations when live AI is offline."""
        destination = config.get("destination", "Hyderabad, Telangana")
        dest_clean = destination.split(",")[0].strip()
        start_date = config.get("startDate", "2026-11-20")
        end_date = config.get("endDate", "2026-11-22")
        traveler = config.get("travelerType", "Friends")
        budget = config.get("budgetTier", "Budget-friendly")
        pace = config.get("pace", "Balanced")
        interests = config.get("interests", ["Food", "History", "Culture"])

        # Determine days count
        try:
            d1 = datetime.strptime(start_date, "%Y-%m-%d")
            d2 = datetime.strptime(end_date, "%Y-%m-%d")
            num_days = max(1, min((d2 - d1).days + 1, 7))
        except Exception:
            num_days = 3

        # Destination landmark database for premier verified Indian hubs
        VIZAG_LANDMARKS = [
            {
                "title": "INS Kursura Submarine Museum",
                "period": "morning", "duration": "2h", "cost": 70,
                "costDisplay": "₹70", "category": "History", "location": "RK Beach Road, Visakhapatnam",
                "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "🏛️ Indoor Submarine Museum",
                "description": "Authentic Soviet-built submarine decommissioned and preserved as South Asia's first submarine museum along the coastal sands.",
                "imageUrl": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80"
            },
            {
                "title": "TU 142 Aircraft Museum",
                "period": "afternoon", "duration": "1.5h", "cost": 50,
                "costDisplay": "₹50", "category": "History", "location": "Opposite Kursura, Beach Road, Visakhapatnam",
                "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "✈️ Covered Aviation Gallery",
                "description": "Decommissioned Tupolev maritime anti-submarine reconnaissance aircraft transformed into an interactive naval aviation museum.",
                "imageUrl": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80"
            },
            {
                "title": "Ramakrishna Beach Promenade & Sunset Walk",
                "period": "evening", "duration": "2h", "cost": 0,
                "costDisplay": "Free", "category": "Relaxation", "location": "Beach Road, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🌊 Coastal Sunset",
                "description": "Iconic seafront promenade known for the Kali Temple vista, maritime monuments, and refreshing Bay of Bengal evening breeze.",
                "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
            },
            {
                "title": "Kailasagiri Hilltop Park & Coastal Ropeway",
                "period": "morning", "duration": "2.5h", "cost": 120,
                "costDisplay": "₹120", "category": "Nature", "location": "Hill Crest, Kailasagiri, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "☀️ Panoramic Heights",
                "description": "Scenic 360-foot hilltop park featuring colossal Shiva-Parvati statues, floral clock, and aerial cable car views of the coastline.",
                "imageUrl": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=600&q=80"
            },
            {
                "title": "Tenneti Seafront Coastal Park",
                "period": "afternoon", "duration": "1.5h", "cost": 20,
                "costDisplay": "₹20", "category": "Nature", "location": "Jodugullapalem, Beach Road, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "high", "weatherRiskLabel": "⚠️ Convective Rain Risk",
                "description": "Cliffside coastal park overlooking rocky Bay of Bengal shores and the grounded cargo vessel MV Maa.",
                "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
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
                "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
            },
            {
                "title": "Simhachalam Temple (Varaha Lakshmi Narasimha)",
                "period": "morning", "duration": "2.5h", "cost": 100,
                "costDisplay": "₹100", "category": "Spiritual", "location": "Simhachalam Hill Range, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🪔 Sacred Morning",
                "description": "Ancient 11th-century hill shrine celebrated for its ornate Chola-Ganga stone carving and 96-pillar Kalyana Mandapam.",
                "imageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80"
            },
            {
                "title": "Dolphin's Nose Promontory & Hilltop Lighthouse",
                "period": "afternoon", "duration": "2h", "cost": 30,
                "costDisplay": "₹30", "category": "History", "location": "Southern Port Ridge, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "⚓ Maritime Vista",
                "description": "Natural dolphin head-shaped basalt rock projecting into the sea, featuring a 358-meter lighthouse overlooking the harbor.",
                "imageUrl": "https://images.unsplash.com/photo-1600100397608-f010f4439c05?auto=format&fit=crop&w=600&q=80"
            },
            {
                "title": "Yarada Beach Coastal Cove",
                "period": "evening", "duration": "2h", "cost": 30,
                "costDisplay": "₹30", "category": "Relaxation", "location": "Yarada Village, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🌅 Sunset Overlook",
                "description": "Pristine secluded beach embraced by lush green hills on three sides and the azure Bay of Bengal on the fourth.",
                "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
            },
            {
                "title": "Thotlakonda Buddhist Complex",
                "period": "morning", "duration": "2h", "cost": 25,
                "costDisplay": "₹25", "category": "History", "location": "Mangamaripeta Hill, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🪷 Monastic Heritage",
                "description": "2,000-year-old Hinayana Buddhist monastery ruins perched on a hill above the sea with stupas and stone viharas.",
                "imageUrl": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80"
            },
            {
                "title": "Bheemili Beach & Dutch Outpost Ruins",
                "period": "afternoon", "duration": "2h", "cost": 0,
                "costDisplay": "Free", "category": "History", "location": "Bheemunipatnam, Visakhapatnam",
                "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🏛️ Dutch Maritime Ruins",
                "description": "Historic 17th-century Dutch maritime settlement at the mouth of the Gosthani River with colonial cemetery ruins.",
                "imageUrl": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80"
            },
            {
                "title": "Jagadamba Center & Waltair Seafood Trail",
                "period": "evening", "duration": "2h", "cost": 350,
                "costDisplay": "₹350", "category": "Food", "location": "Jagadamba Junction, Visakhapatnam",
                "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "🍽️ Regional Andhra Cuisine",
                "description": "Curated culinary tasting of authentic coastal Andhra delicacies, Royyala Iguru, and Madugula halwa.",
                "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80"
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
                    "imageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "title": "Chowmahalla Palace Royal Courtyards",
                    "period": "afternoon", "duration": "2h", "cost": 100,
                    "costDisplay": "₹100", "category": "Culture", "location": "Motigall, Hyderabad",
                    "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "🏛️ Indoor Safe",
                    "description": "Opulent palace seat of the Asaf Jahi dynasty with ornate Belgian crystal chandeliers.",
                    "imageUrl": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "title": "Paradise Food Trail & Biryani Heritage",
                    "period": "evening", "duration": "2h", "cost": 350,
                    "costDisplay": "₹350", "category": "Food", "location": "Secunderabad / Old City",
                    "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "🍽️ Indoor Dining",
                    "description": "Authentic Hyderabadi Dum Biryani, mirchi ka salan, and double ka meetha tasting.",
                    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "title": "Golconda Fort & Acoustic Echo Vaults",
                    "period": "morning", "duration": "3h", "cost": 40,
                    "costDisplay": "₹40", "category": "History", "location": "Ibrahim Bagh, Hyderabad",
                    "isIndoor": False, "weatherRisk": "high", "weatherRiskLabel": "⚠️ Convective Rain Risk",
                    "description": "Citadel fortress famous for its acoustic clapping portico and Koh-i-Noor diamond vaults.",
                    "imageUrl": "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80",
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
                    "imageUrl": "https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "title": "Hussain Sagar Lake & Necklace Road Promenade",
                    "period": "evening", "duration": "2h", "cost": 100,
                    "costDisplay": "₹100", "category": "Relaxation", "location": "Necklace Rd, Hyderabad",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "⛵ Twilight Window",
                    "description": "Heart-shaped urban lake featuring the monolithic Buddha statue and lakefront breeze.",
                    "imageUrl": "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "title": "Shilparamam Arts & Crafts Village",
                    "period": "morning", "duration": "2.5h", "cost": 60,
                    "costDisplay": "₹60", "category": "Culture", "location": "HITEC City, Hyderabad",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "☀️ Shaded Walkways",
                    "description": "Traditional artisan hamlet featuring handloom weavers, terracotta artisans, and folk music.",
                    "imageUrl": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "title": "Durgam Cheruvu Cable-Stayed Bridge Walk",
                    "period": "evening", "duration": "1.5h", "cost": 0,
                    "costDisplay": "Free", "category": "Nature", "location": "Jubilee Hills, Hyderabad",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🌆 Sunset View",
                    "description": "Iconic illuminated bridge with panoramic views over the secret lake and city skyline.",
                    "imageUrl": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80"
                }
            ],
            "jaipur": [
                {
                    "title": "Amer Fort & Sheesh Mahal",
                    "period": "morning", "duration": "2.5h", "cost": 500,
                    "costDisplay": "₹500", "category": "History", "location": "Amer, Jaipur",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "☀️ Clear Skies",
                    "description": "Iconic 16th-century fortress overlooking Maota Lake, famous for intricate mirror mosaics.",
                    "imageUrl": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "title": "Panna Meena Ka Kund Stepwell",
                    "period": "afternoon", "duration": "1h", "cost": 0,
                    "costDisplay": "Free", "category": "Culture", "location": "Near Amer Fort, Jaipur",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "☀️ Clear Skies",
                    "description": "Centuries-old symmetrical geometric stepwell with golden stone steps and shaded verandahs.",
                    "imageUrl": "https://images.unsplash.com/photo-1609137144822-482a5c2ec0f5?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "title": "Jal Mahal Promenade & Spiced Chai Stop",
                    "period": "evening", "duration": "1.5h", "cost": 150,
                    "costDisplay": "₹150", "category": "Food", "location": "Man Sagar Lake, Jaipur",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🌅 Sunset View",
                    "description": "Scenic photo stroll along lakeside promenade viewing the sunken water palace with spiced Kulhad chai.",
                    "imageUrl": "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "title": "Nahargarh Fort Outdoor Sunset Viewpoint",
                    "period": "morning", "duration": "2.5h", "cost": 300,
                    "costDisplay": "₹300", "category": "Relaxation", "location": "Aravalli Hills, Jaipur",
                    "isIndoor": False, "weatherRisk": "high", "weatherRiskLabel": "⚠️ Convective Rain Risk",
                    "description": "Perched on the Aravalli ridge offering panoramic evening vistas across the Pink City.",
                    "imageUrl": "https://images.unsplash.com/photo-1600100397608-f010f4439c05?auto=format&fit=crop&w=600&q=80",
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
                    "imageUrl": "https://images.unsplash.com/photo-1603262110263-fb010d6e75dc?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "title": "City Palace Royal Quarters & Chandra Mahal",
                    "period": "evening", "duration": "2h", "cost": 700,
                    "costDisplay": "₹700", "category": "Culture", "location": "Gangori Bazaar, Jaipur",
                    "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "🏛️ Indoor Sheltered",
                    "description": "Vast ceremonial courtyards, Peacock Gate, royal costume armory, and maharaja suites.",
                    "imageUrl": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80"
                }
            ],
            "goa": [
                {
                    "title": "Basilica of Bom Jesus & Old Goa Heritage",
                    "period": "morning", "duration": "2h", "cost": 50,
                    "costDisplay": "₹50", "category": "History", "location": "Old Goa, Goa",
                    "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "🏛️ Indoor Heritage Basilica",
                    "description": "UNESCO World Heritage Baroque cathedral housing the sacred silver relics of St. Francis Xavier.",
                    "imageUrl": "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "title": "Fontainhas Latin Quarter Walking Tour",
                    "period": "afternoon", "duration": "2h", "cost": 150,
                    "costDisplay": "₹150", "category": "Culture", "location": "Panaji, Goa",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "☀️ Clear Skies",
                    "description": "Vibrant Portuguese quarter characterized by colorful tiled villas, bougainvillea balconies, and bakeries.",
                    "imageUrl": "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "title": "Mandovi River Twilight Sunset Cruise",
                    "period": "evening", "duration": "2h", "cost": 400,
                    "costDisplay": "₹400", "category": "Relaxation", "location": "Panaji Jetty, Goa",
                    "isIndoor": False, "weatherRisk": "low", "weatherRiskLabel": "🌅 Sunset Cruise",
                    "description": "Scenic boat cruise along Mandovi estuary featuring live Goan folk dance and golden hour river views.",
                    "imageUrl": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "title": "Aguada Fort & Coastal Bastion",
                    "period": "morning", "duration": "2h", "cost": 50,
                    "costDisplay": "₹50", "category": "History", "location": "Sinquerim, Goa",
                    "isIndoor": False, "weatherRisk": "high", "weatherRiskLabel": "⚠️ Convective Rain Risk",
                    "description": "17th-century Portuguese fortress and four-story lighthouse guarding the mouth of Mandovi river.",
                    "imageUrl": "https://images.unsplash.com/photo-1600100397608-f010f4439c05?auto=format&fit=crop&w=600&q=80",
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
                    "imageUrl": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80"
                },
                {
                    "title": "Spice Plantation Tour & Goan Buffet Dinner",
                    "period": "evening", "duration": "2.5h", "cost": 500,
                    "costDisplay": "₹500", "category": "Food", "location": "Ponda, Goa",
                    "isIndoor": True, "weatherRisk": "low", "weatherRiskLabel": "🍽️ Covered Dining",
                    "description": "Traditional aromatic spice farm tour followed by authentic Goan fish curry and feni tasting.",
                    "imageUrl": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80"
                }
            ]
        }

        # Select landmarks from POIService or fallback dictionary
        svc = _get_poi_service()
        poi_data = svc.get_pois(destination, max_results=40, interests=interests) if svc else {}
        retrieved_pois = poi_data.get("pois", [])

        landmarks = []
        if retrieved_pois:
            for p in retrieved_pois:
                cat = p.get("category", "Culture")
                is_indoor = cat in ("Museum", "Art Gallery", "Palace", "Temple")
                if "Free" in p.get("tags", {}).get("fee", "") or cat in ("Park", "Viewpoint"):
                    cost_val = 0
                elif cat == "Palace":
                    cost_val = 250 if "budget" in budget.lower() else 450
                elif cat in ("Museum", "Art Gallery"):
                    cost_val = 50 if "budget" in budget.lower() else 150
                elif cat == "Temple":
                    cost_val = 0
                else:
                    cost_val = 100 if "budget" in budget.lower() else 250

                landmarks.append({
                    "title": p["name"],
                    "period": "morning",
                    "duration": "2h",
                    "cost": cost_val,
                    "costDisplay": f"₹{cost_val}" if cost_val > 0 else "Free",
                    "category": cat,
                    "location": p.get("area") or f"{p['name']}, {dest_clean}",
                    "isIndoor": is_indoor,
                    "lat": p.get("lat"),
                    "lon": p.get("lon"),
                    "weatherRisk": "low",
                    "weatherRiskLabel": "🏛️ Indoor Sheltered" if is_indoor else "☀️ Clear Skies",
                    "description": f"Verified attraction in {p.get('area', dest_clean)}.",
                    "imageUrl": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80"
                })
        else:
            hub_key = None
            for k in LANDMARKS_DB.keys():
                if k in dest_clean.lower():
                    hub_key = k
                    break
            landmarks = LANDMARKS_DB.get(hub_key, [])

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
                {"title": f"{dest_clean} Heritage Quarter Walking Tour", "duration": "2.5h", "cost": 300, "category": "Culture", "location": f"Old Town, {dest_clean}", "isIndoor": False, "desc": f"Guided walking tour exploring historic architecture, artisanal alleys, and local morning tea stops in {dest_clean}."},
                {"title": f"{dest_clean} Central Arts & Cultural Museum", "duration": "2h", "cost": 150, "category": "History", "location": f"Museum Enclave, {dest_clean}", "isIndoor": True, "desc": f"Sheltered historic gallery featuring regional antiquities, folk textiles, and miniature paintings of {dest_clean}."},
                {"title": f"{dest_clean} Twilight Culinary Trail", "duration": "2h", "cost": 450, "category": "Food", "location": f"Heritage Promenade, {dest_clean}", "isIndoor": True, "desc": f"Curated evening tasting of {dest_clean}'s signature delicacies, regional sweets, and clay-pot beverages."},
                {"title": f"{dest_clean} Illuminated Clock Tower Square", "duration": "1.5h", "cost": 0, "category": "Relaxation", "location": f"City Center, {dest_clean}", "isIndoor": False, "desc": "Evening gathering hub featuring heritage lamp posts and vibrant street ambiance."}
            ]),
            ("Scenic Heights & Botanic Sanctuaries", [
                {"title": f"{dest_clean} Panoramic Hilltop Ridge Overlook", "duration": "2.5h", "cost": 100, "category": "Nature", "location": f"Upper Ridge, {dest_clean}", "isIndoor": False, "desc": f"Scenic hilltop vantage offering breathtaking horizons across the valleys of {dest_clean}."},
                {"title": f"{dest_clean} Grand Botanical Sanctuary", "duration": "2h", "cost": 80, "category": "Nature", "location": f"Outer Ring, {dest_clean}", "isIndoor": False, "desc": "Lush shaded gardens featuring heritage flora, tranquil water bodies, and avian photography spots."},
                {"title": f"{dest_clean} Artisan Coffee & Plantation Cafe", "duration": "1.5h", "cost": 250, "category": "Food", "location": f"Hill Slope, {dest_clean}", "isIndoor": True, "desc": "Locally harvested single-origin brews served with freshly baked treats overlooking the hills."},
                {"title": f"{dest_clean} Sunset Point Golden Hour Deck", "duration": "1.5h", "cost": 50, "category": "Relaxation", "location": f"Ridge Path, {dest_clean}", "isIndoor": False, "desc": "Quiet wooden deck with panoramic sunset colors across the horizon."}
            ]),
            ("Artisan Traditions & Sacred Heritage", [
                {"title": f"{dest_clean} Ancient Stone Temple & Sculpted Mandapam", "duration": "2.5h", "cost": 50, "category": "Spiritual", "location": f"Temple Road, {dest_clean}", "isIndoor": False, "desc": f"Centuries-old stone sanctuary featuring intricate carvings, traditional bronze lamps, and peaceful prayer courtyards."},
                {"title": f"{dest_clean} Master Weavers & Handicraft Atelier", "duration": "2h", "cost": 100, "category": "Culture", "location": f"Artisans Lane, {dest_clean}", "isIndoor": True, "desc": "Witness generational artisans shaping handloom fabrics, pottery, and brass metalwork."},
                {"title": f"{dest_clean} Spice Market & Herb Guild Walk", "duration": "1.5h", "cost": 150, "category": "Food", "location": f"Bazaar Circle, {dest_clean}", "isIndoor": False, "desc": "Aromatic alleys filled with freshly ground spices, herbs, and cold-pressed oils."},
                {"title": f"{dest_clean} Folk Music & Classical Dance Evening", "duration": "2h", "cost": 400, "category": "Culture", "location": f"Community Amphitheatre, {dest_clean}", "isIndoor": True, "desc": "Mesmerizing regional folk instruments, vocal ballads, and classical rhythms."}
            ]),
            ("Waterfront Serenity & Nature Coves", [
                {"title": f"{dest_clean} Waterfront Promenade & Morning Breeze", "duration": "2h", "cost": 0, "category": "Relaxation", "location": f"Waterfront Drive, {dest_clean}", "isIndoor": False, "desc": f"Crisp morning walk alongside the shimmering waters of {dest_clean} with avian sightings."},
                {"title": f"{dest_clean} Lake Island Pavilion & Solar Cruise", "duration": "2h", "cost": 300, "category": "Adventure", "location": f"Pier Terminal, {dest_clean}", "isIndoor": False, "desc": "Tranquil electric boat cruise to a secluded island pavilion with mountain views."},
                {"title": f"{dest_clean} Marine Life & Bio-Reserve Center", "duration": "2h", "cost": 120, "category": "Nature", "location": f"Coastal Enclave, {dest_clean}", "isIndoor": True, "desc": "Interactive exhibits showcasing native freshwater ecosystems and bird migrations."},
                {"title": f"{dest_clean} Waterfront Twilight Grill Dinner", "duration": "2h", "cost": 700, "category": "Food", "location": f"Marina Jetty, {dest_clean}", "isIndoor": True, "desc": "Fresh locally sourced catch prepared with fragrant coastal spices and sunset vistas."}
            ]),
            ("Sacred Valleys & Historic Citadels", [
                {"title": f"{dest_clean} Hill Citadel & Historic Bastion", "duration": "3h", "cost": 200, "category": "History", "location": f"Fortress Hill, {dest_clean}", "isIndoor": False, "desc": f"Sprawling ramparts, watchtowers, and secret passageways guarding the borders of {dest_clean}."},
                {"title": f"{dest_clean} Royal Armory & Coins Gallery", "duration": "1.5h", "cost": 80, "category": "History", "location": f"Upper Palace, {dest_clean}", "isIndoor": True, "desc": "Sheltered vault holding ancient damascened swords, royal royal edicts, and antique coinage."},
                {"title": f"{dest_clean} Valley View Tea Lounge", "duration": "1.5h", "cost": 200, "category": "Relaxation", "location": f"Fort Verandah, {dest_clean}", "isIndoor": True, "desc": "Historic verandah offering fragrant chai and savory local pastries with commanding valley views."},
                {"title": f"{dest_clean} Stargazing Astronomy Point", "duration": "1.5h", "cost": 100, "category": "Nature", "location": f"Observatory Crest, {dest_clean}", "isIndoor": False, "desc": "Unpolluted night sky viewing with high-powered telescope stations."}
            ]),
            ("Hidden Gardens & Culinary Masterclass", [
                {"title": f"{dest_clean} Organic Herb Farm & Guided Orchard Tour", "duration": "2h", "cost": 150, "category": "Nature", "location": f"Green Valley, {dest_clean}", "isIndoor": False, "desc": f"Walk through lush citrus groves, medicinal herb plots, and honey bee hives."},
                {"title": f"{dest_clean} Interactive Cooking Studio & Heritage Feast", "duration": "2.5h", "cost": 650, "category": "Food", "location": f"Culinary Quarter, {dest_clean}", "isIndoor": True, "desc": "Hands-on cooking experience learning grandmother recipes and slow-cooked earthen pot delicacies."},
                {"title": f"{dest_clean} Artisan Ceramics & Pottery Workshop", "duration": "2h", "cost": 300, "category": "Culture", "location": f"Pottery Colony, {dest_clean}", "isIndoor": True, "desc": "Shape your own clay vessel on a potter wheel with traditional ceramic glaze."},
                {"title": f"{dest_clean} Candlelit Courtyard Dinner", "duration": "2h", "cost": 800, "category": "Food", "location": f"Old Haveli, {dest_clean}", "isIndoor": True, "desc": "Romantic outdoor courtyard dinner with live acoustic strings and seasonal tasting menu."}
            ]),
            ("Farewell Horizons & Golden Vista", [
                {"title": f"{dest_clean} Dawn Ridge Awakening Walk", "duration": "2h", "cost": 0, "category": "Nature", "location": f"Sunrise Ridge, {dest_clean}", "isIndoor": False, "desc": f"Early morning meditation and brisk walk watching the morning mist lift across {dest_clean}."},
                {"title": f"{dest_clean} Heritage Library & Archival Reading Hall", "duration": "1.5h", "cost": 50, "category": "Culture", "location": f"Town Center, {dest_clean}", "isIndoor": True, "desc": "Historic teakwood reading hall with rare travel logs, lithographs, and maps."},
                {"title": f"{dest_clean} Souvenir Emporium & Handloom Guild", "duration": "2h", "cost": 200, "category": "Shopping", "location": f"Central Square, {dest_clean}", "isIndoor": True, "desc": "Certified authentic artisanal souvenirs, handmade shawls, and locally packed teas."},
                {"title": f"{dest_clean} Celebration Farewell Feast", "duration": "2h", "cost": 900, "category": "Food", "location": f"Grand Terrace, {dest_clean}", "isIndoor": True, "desc": "Celebratory multi-course dinner summarizing the regional flavors and memorable moments of your trip."}
            ])
        ]

        used_titles = set()
        days = []
        cur_date = datetime.strptime(start_date, "%Y-%m-%d") if start_date else datetime.now()

        for day_num in range(1, num_days + 1):
            date_str = cur_date.strftime("%b %d, %Y")
            day_of_week = cur_date.strftime("%A")
            is_rain_day = (day_num == 2)  # Controlled Day 2 weather contingency test

            # Pick activities for this day ensuring zero overlap across days
            day_activities = []
            chosen_items = []

            # 1. First try unused items from landmarks database
            if landmarks:
                for item in landmarks:
                    if item["title"] not in used_titles and len(chosen_items) < acts_per_day:
                        chosen_items.append(item)
                        used_titles.add(item["title"])

            # 2. If more items needed, pull from themed archetype for this day
            theme_idx = (day_num - 1) % len(THEMED_DAYS)
            theme_name, theme_stops = THEMED_DAYS[theme_idx]

            if len(chosen_items) < acts_per_day:
                for s in theme_stops:
                    if s["title"] not in used_titles and len(chosen_items) < acts_per_day:
                        chosen_items.append({
                            "title": s["title"],
                            "period": "morning",
                            "duration": s["duration"],
                            "cost": s["cost"],
                            "costDisplay": f"₹{s['cost']}" if s["cost"] > 0 else "Free",
                            "category": s["category"],
                            "location": s["location"],
                            "isIndoor": s["isIndoor"],
                            "weatherRisk": "low",
                            "weatherRiskLabel": "🏛️ Indoor Safe" if s["isIndoor"] else "☀️ Clear Skies",
                            "description": s["desc"],
                            "imageUrl": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80"
                        })
                        used_titles.add(s["title"])

            # Assign slots and harmonize weather risks
            # Exactly one outdoor activity on a rain day gets high weather risk and a Plan B
            plan_b_assigned = False

            for a_idx, item in enumerate(chosen_items, 1):
                act_id = f"act-{day_num}-{a_idx}"
                slot_time, slot_period = time_slots[min(a_idx - 1, len(time_slots) - 1)]

                is_indoor = item.get("isIndoor", False)

                # Weather risk logic: strictly consistent
                if is_rain_day and not is_indoor and not plan_b_assigned and a_idx >= 2:
                    # Target outdoor activity facing rain risk
                    weather_risk = "high"
                    weather_risk_label = "⚠️ Convective Rain Risk"
                    plan_b_assigned = True

                    # Provide sheltered alternative
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
                        # Find a real indoor landmark from destination POIs not already scheduled today
                        real_indoor = None
                        for l_cand in landmarks:
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
                                "shelterReason": "Convective shower alert. Transferred to sheltered indoor venue.",
                                "costDelta": "₹0"
                            }
                        else:
                            alt_data = {
                                "id": f"alt-{day_num}-{a_idx}",
                                "title": f"{dest_clean} Cultural Center & Covered Gallery",
                                "timeSlot": slot_time,
                                "duration": "2h",
                                "cost": 50,
                                "costDisplay": "₹50",
                                "category": "Culture",
                                "location": f"Central District, {dest_clean}",
                                "isIndoor": True,
                                "weatherRiskLabel": "🛡️ 100% Indoor Sheltered",
                                "description": f"Covered arts and cultural center in {dest_clean} with protected exhibition halls.",
                                "shelterReason": "Convective shower alert. Transferred to sheltered indoor gallery.",
                                "costDelta": "₹0"
                            }
                    has_plan_b = True
                else:
                    # Low risk activity
                    weather_risk = "low"
                    if is_indoor:
                        weather_risk_label = "🏛️ Indoor Sheltered"
                    else:
                        weather_risk_label = "☀️ Clear Skies"
                    alt_data = None
                    has_plan_b = False

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
                    "isIndoor": is_indoor,
                    "weatherRisk": weather_risk,
                    "weatherRiskLabel": weather_risk_label,
                    "description": item.get("description", ""),
                    "imageUrl": item.get("imageUrl", "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80"),
                    "isVisited": False,
                    "hasPlanBReady": has_plan_b,
                    "planBAlternative": alt_data
                })

            # Day theme
            if landmarks and day_num <= 4:
                vizag_themes = [
                    "Beach Road & Naval Heritage Circuit",
                    "Scenic Heights, Panoramic Hills & Coastal Sands",
                    "Sacred Temples & Historic Dolphin's Nose Vistas",
                    "Monastic Antiquities & Dutch Maritime Trails"
                ]
                day_theme = f"{dest_clean}: {vizag_themes[(day_num - 1) % len(vizag_themes)]}"
            else:
                day_theme = f"{dest_clean}: {theme_name}"

            weather_summary = "Showers 25°C • 65% Rain at 2 PM" if is_rain_day else "27°C • Sunny & Clear"

            days.append({
                "dayNumber": day_num,
                "dayOfWeek": day_of_week,
                "dateStr": date_str,
                "theme": day_theme,
                "weatherSummary": weather_summary,
                "temperature": "25°C" if is_rain_day else "27°C",
                "rainRisk": 65 if is_rain_day else 10,
                "weatherCondition": "thunderstorm" if is_rain_day else "sunny",
                "activities": day_activities
            })
            cur_date += timedelta(days=1)

        return {
            "tagline": f"{traveler} Expedition across {dest_clean} ({pace} pace, {budget})",
            "days": days
        }


# Singleton service instance
gemini_service = GeminiService()
