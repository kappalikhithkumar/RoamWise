import os
import sys
import io
import json
import time

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', write_through=True)
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', write_through=True)

from google import genai
from google.genai import types

api_key = os.getenv("GEMINI_API_KEY", "")
client = genai.Client(api_key=api_key)

model_name = "gemini-3.5-flash-lite"
print(f"Testing live generation with model: {model_name}", flush=True)

prompt = """
You are RoamWise AI. Generate a realistic 2-day travel itinerary for Paris, France.
Return ONLY valid JSON matching this schema:
{
  "tagline": "Brief tagline",
  "days": [
    {
      "dayNumber": 1,
      "theme": "Theme title",
      "activities": [
        {
          "title": "Real attraction name in Paris",
          "timeSlot": "09:30 AM",
          "category": "Culture",
          "location": "Real district or street in Paris",
          "isIndoor": false,
          "weatherRisk": "low",
          "weatherRiskLabel": "☀️ Clear Skies",
          "cost": 1500,
          "costDisplay": "€17 (~₹1,500)",
          "description": "Accurate description of this real landmark."
        }
      ]
    }
  ]
}
"""

t0 = time.time()
try:
    resp = client.models.generate_content(
        model=model_name,
        contents=prompt
    )
    raw_text = resp.text.strip()
    dur = time.time() - t0
    print(f"SUCCESS in {dur:.2f}s!", flush=True)
    if raw_text.startswith("```json"):
        raw_text = raw_text[7:]
    if raw_text.startswith("```"):
        raw_text = raw_text[3:]
    if raw_text.endswith("```"):
        raw_text = raw_text[:-3]
    data = json.loads(raw_text.strip())
    print(f"Tagline: {data.get('tagline')}", flush=True)
    for day in data.get("days", []):
        print(f"\nDay {day.get('dayNumber')}: {day.get('theme')}", flush=True)
        for act in day.get("activities", []):
            print(f"  - {act.get('title')} ({act.get('location')})", flush=True)
except Exception as e:
    print(f"FAILED in {time.time()-t0:.2f}s: {e}", flush=True)
