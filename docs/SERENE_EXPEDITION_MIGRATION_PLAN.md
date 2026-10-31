# RoamWise — Serene Expedition Visual Design Review & Migration Blueprint

> **Document Type:** Visual Design Review & Phased Migration Specification  
> **Source Project:** Google Stitch `RoamWise AI Travel Planner` (`projects/641303983514701727`)  
> **Design Theme:** Serene Expedition (Natural Forest, Botanical Sage, Warm Amber, Expedition Charcoal)  
> **Working Branch:** `feature/serene-expedition-ui`  
> **Safety Baseline Commit:** `9a2cf63c2b59ddf5fac19797aa81291ea34b8c31` (`baseline-phase2-tripmind`)  
> **Local Reference Directory:** `design-reference-v2/` (Includes standalone `preview.html`, `DESIGN.md`, `manifest.json`, 24 screens, 24 screenshots)

---

## 1. Executive Summary & Design System Foundations

The team lead's Google Stitch project introduces **Serene Expedition**, an editorial, nature-inspired travel aesthetic designed around the rhythm of mindful travel in India. It transitions RoamWise from the initial utility-focused "TripMind" blue/teal theme to an authentic expedition companion characterized by organic earth tones, sophisticated typography, and prominent AI adaptability indicators.

### 1.1 Core Tokens Summary

| Token Role | Value | Name | Usage |
|---|---|---|---|
| **Primary** | `#173F35` | Deep Forest Green | High-contrast actions, active tab indicators, primary buttons, major headers |
| **Secondary** | `#D8E9DD` | Botanical Sage | Soft surfaces, route timeline vertical axes, secondary button fills |
| **Tertiary / Accent** | `#E5A45B` | Warm Ochre / Amber | Real-time AI alerts, weather warnings, Plan B recommendation badges, active stop pulses |
| **Neutral Dark** | `#25332E` | Expedition Charcoal | High-legibility body copy, deep neutral card borders, overlay backdrops |
| **Canvas / Background** | `#F7F5EF` / `#EDFDF5` | Warm Cream / Soft Mint | Main app background, subtle contrasting sections |
| **Surface Lowest** | `#FFFFFF` | Pure White | Elevated card containers, modals, bottom sheets |
| **Display Font** | `Manrope` | Geometric Sans | All headers (H1–H3), trip titles, major statistics (`font-bold`, `tracking-tight`) |
| **Body & Label Font** | `Inter` | Humanist Sans | Body paragraphs, form controls, timeline timestamps, metadata pills |
| **Curvature** | `12px` / `16px` / `24px` | Smooth Rounded | `12px` for buttons/inputs, `16px–20px` for activity cards, `24px` for hero sheets/modals |

---

## 2. Review & Recommendations for Design Variants

The Stitch project contains multiple iterations of key screens. Below is the detailed comparative review and architectural recommendations:

### 2.1 Variant 1: Home Dashboard — Screen 08 vs Screen 20

- **Screen 08 (`08_home_dashboard.html` / `assets/08_home_dashboard.jpg`):**
  - *Theme & Persona:* Pre-Trip Discovery & Inspiration.
  - *Headline:* "Where would you like to go next? — Adaptive journeys crafted around your pace."
  - *Core Elements:* Prominent search bar with voice input; "Upcoming Trip" card (Golden Triangle & Royal Rajasthan in 4 days); "Recently Viewed" horizontal scroll (Manali, Munnar, Gokarna); "Explore by Interest" category chips (Heritage, Serenity, High Altitude, Coastal); "Popular Destinations" grid (Udaipur, Spiti Valley, Varanasi Ghats).
  - *Bottom Bar:* `Explore`, `Trips`, `Weather`, `Saved`, `Profile`.

- **Screen 20 (`20_home_dashboard.html` / `assets/20_home_dashboard.jpg`):**
  - *Theme & Persona:* Active On-Trip Expedition & Live AI Intelligence.
  - *Headline:* "Namaste, Ananya 👋 — Ready for your Himachal Circuit?"
  - *Core Elements:* Current location status bar (`Manali • 18°C ⛅`); Active Expedition hero card (`Himachal Monsoon & Valleys - Day 3 of 7`, High Altitude Transit, 72% progress bar, route dots Shimla ➔ Manali ➔ Kasol); **Prominent Live AI Alert:** "2:00 PM Rain predicted in Solang Valley. Plan B Old Manali indoor cafes ready" with "View Adaptive Timeline" CTA; quick exploration prompt ("Dream a New Expedition" via RoamAI chips); "Intelligence Highlights" widget (Real-Time Sync active).
  - *Bottom Bar:* `Home`, `Itinerary`, `Live Map`, `Alerts`, `Profile`.

- **Recommendation:** **Adopt Screen 20 as the primary Home Dashboard, backed by a contextual dual-state architecture.**
  - *Rationale:* Screen 20 embodies the unique selling proposition of RoamWise: **proactive, live travel adaptation**. Displaying live weather risks, active trip progress, and instant Plan B triggers on the home screen immediately demonstrates AI value.
  - *Architectural Fit:* The discovery features of Screen 08 (search bar, popular destinations, interest categories) already exist in dedicated form inside **Screen 04 (`04_explore_destinations.html`)**. Adopting Screen 20 for Home and Screen 04 for Explore ensures clear separation of concerns without functional duplication.
  - *Smart Fallback:* When a user has an active or upcoming trip, Home renders the Screen 20 active expedition view; when no trip is active, it renders the Screen 08 discovery view.

---

### 2.2 Variant 2: Trip Configuration — Screen 15 vs Screen 16

- **Screen 15 (`15_trip_configuration.html` / `assets/15_trip_configuration.jpg`):**
  - *Title:* "Trip Detail" / "Step 2 of 4: Preferences & Logic".
  - *Scope:* Partial wizard fragment (23 KB). Only covers route reordering for a pre-set Himalayan circuit (New Delhi, Manali, Kasol, Jibhi), a basic date picker, and an unpopulated preferences stub.

- **Screen 16 (`16_trip_configuration.html` / `assets/16_trip_configuration.jpg`):**
  - *Title:* "Trip Configuration" / "Customise Route".
  - *Scope:* Comprehensive production-grade configuration (47 KB).
  - *Core Elements:*
    1. **Region Scope Switcher:** Domestic (India 🇮🇳) vs International (✈️).
    2. **Multi-Stop Route Manager:** Interactive stop chips (Jaipur Stop 1, Delhi Stop 2, Agra Stop 3) with drag handle, remove button, and "+ Add Another Destination" search.
    3. **AI Route Optimisation Suggestion:** "Optimise My Route (Save ~3.5h)" — algorithmically calculates savings ("Changing order to Delhi ➔ Agra ➔ Jaipur saves 142 km and 3.5 hrs transit time").
    4. **Travel Window & Seasonality:** Start/end calendar with seasonal context.
    5. **Budget Tiers:** Backpacker / Moderate / Luxury with real-time rupee estimates.
    6. **Travel Interests:** Multi-select chips (Heritage, High Altitude, Culinary, Spiritual, Wildlife).
    7. **Traveller Type & Pace:** Solo / Couple / Family / Friends, and Relaxed vs Balanced vs Packed.

- **Recommendation:** **Adopt Screen 16 exclusively.**
  - *Rationale:* Screen 16 is a complete, feature-rich interface that directly powers the Gemini AI itinerary generation backend. The AI Route Optimisation banner is a signature capability that shows algorithmic intelligence before itinerary generation even starts. Screen 15 is merely an incomplete subset.

---

### 2.3 Variant 3: Welcome vs Welcome & Onboarding — Screen 05 vs Screen 11

- **Screen 05 (`05_welcome.html` / `assets/05_welcome.jpg`):**
  - *Title:* "Every journey starts with a plan."
  - *Scope:* Minimalist splash screen (9.7 KB). Static hero graphic, 3 bullet points, single "Get Started" button.

- **Screen 11 (`11_welcome_onboarding.html` / `assets/11_welcome_onboarding.jpg`):**
  - *Title:* "Your journey. Your preferences. Your AI travel companion."
  - *Scope:* High-conversion interactive onboarding (14.2 KB).
  - *Core Elements:*
    1. **Simulated Live Engine Badge:** "RoamWise India • Live Engine Active", with an animated card: "Western Ghats • Monsoon Shift Detected ➔ Dynamic Re-routing: Auto-swapped Spice Trail Cafe added, +0 min delay".
    2. **Verified Social Proof:** "48,000+ seamless Indian journeys dynamically adapted".
    3. **Three Core Pillars:** Real-Time Weather Adapting, Curated Indian Circuits, Instant Plan B AI.
    4. **Dual Conversion CTAs:** Primary "Start Planning My Journey" (routes to `/plan`), Secondary "Sign In to Existing Trips" (routes to `/login`).

- **Recommendation:** **Adopt Screen 11 exclusively.**
  - *Rationale:* Screen 11 immediately educates the user about the dynamic adaptive nature of the product through the simulated live engine card. It provides clear user journey paths for both new and returning users. Screen 05 lacks this narrative depth.

---

### 2.4 Variant 4: Itinerary Dashboard vs Itinerary & Plan B Dashboard — Screen 13 vs Screen 02

- **Screen 13 (`13_itinerary_dashboard.html` / `assets/13_itinerary_dashboard.jpg`):**
  - *Focus:* **Macro Circuit Overview & Multi-Destination Allocation.**
  - *Title:* "Golden Triangle Circuit (Jaipur ➔ Delhi ➔ Agra)".
  - *Core Elements:* Date range (18 Oct – 24 Oct 2025); pacing breakdown (7 Days • 3 Boutique Stays); budget breakdown widget (Moderate Tier ₹42,500); destination allocation cards (Days 1–2 Jaipur Pink City Focus, Days 3–5 Delhi, Days 6–7 Agra); high-level schedule summary.

- **Screen 02 (`02_itinerary_plan_b_dashboard.html` / `assets/02_itinerary_plan_b_dashboard.jpg`):**
  - *Focus:* **Micro Day Execution, Timeline, & Real-Time Plan B Interventions.**
  - *Title:* "Himachal Expedition (Manali ➔ Solang Valley)".
  - *Core Elements:* Day selector tabs (`Day 1`, `Day 2`, `Day 3 (Today)`, `Day 4`, `Day 5`); Map View toggle button; live weather alert pill (`🌧️ 70% Rain at 2:30 PM`); **Inline AI Route Guard Banner:** "Solang paragliding suspended due to dense mist & mountain showers. Plan B: Naggar Castle Trail (Indoor & Warm: Historic Himachali woodwork + Artisanal apple cider tasting)" with `Switch to Plan B` and `Dismiss` buttons; chronological activity cards with status indicators (`Visited / Done`, `Active`, `AI Modified`).

- **Recommendation:** **Both screens are essential and form a cohesive two-tier itinerary architecture.**
  - **Screen 13 is the Macro Trip Overview (`/trip`)**: Used when viewing the complete multi-day, multi-city trip plan, budget breakdown, and destination sequence.
  - **Screen 02 is the Micro Day Detail & Live Execution View (`/trip/day/:dayId`)**: Used during day-to-day travel execution, where weather alerts trigger contextual Plan B replacements directly within the timeline.
  - Clicking any Day card on the Screen 13 overview smoothly navigates to Screen 02's day timeline.

---

## 3. Comprehensive 24-Screen Inventory & Mapping Matrix

| # | Stitch Screen ID | Screen Title | Category | Recommended App Route | Migration Action |
|---|---|---|---|---|---|
| **01** | `96afba7dc1f847b1b2f4d14a351ecf8e` | RoamWise - My Trips | Trips | `/trips` | **New Page**: Trip library (Upcoming, Past, Drafts) |
| **02** | `d2b0808946e64ad1b1dbac572887e7ee` | RoamWise - Itinerary & Plan B Dashboard | Itinerary | `/trip/day/:dayId` | **Redesign**: Replaces `DayDetailPage.tsx` with inline Plan B |
| **03** | `2e11ef9a14c14f439edf875c43709e99` | RoamWise - Settings & Preferences | Profile | `/profile/settings` | **New Page**: User preferences, dietary, units, AI toggles |
| **04** | `c5a8b0ec7ea74e3fb783bb5d61db1738` | RoamWise - Explore Destinations | Discovery | `/explore` | **New Page**: Discovery catalog, curated Indian circuits |
| **05** | `96ad0f50258c48cd9eee4fdb7272fdb2` | RoamWise - Welcome | Onboarding | N/A | **Archive / Reference**: Replaced by superior Screen 11 |
| **06** | `254c78f688c34a508d69fc84598f455a` | RoamWise - User Profile | Profile | `/profile` | **Redesign**: Replaces `ProfilePage.tsx` with expedition badges |
| **07** | `f2865ecfd2134a6cadab08d6e8811e8b` | RoamWise - Detailed Daily Itinerary | Itinerary | `/trip/day/:dayId/details` | **Enhance**: Extends `DayTimeline.tsx` with transit steps |
| **08** | `d97769cc452f4f2ea3c81e8a000c9a0c` | RoamWise - Home Dashboard | Discovery | Fallback `/home` | **Secondary State**: Pre-trip discovery state for Home |
| **09** | `25894f0c6b094213a5d4713347269040` | RoamWise - Updated Itinerary | Planning | `/review-plan` | **Redesign**: Replaces `ReviewPlanPage.tsx` with diff cards |
| **10** | `87e80755158b4d1a89584189d339b53f` | RoamWise - AI Itinerary Generation | Planning | `/generating` | **Redesign**: Replaces `GeneratingPage.tsx` with animated steps |
| **11** | `0c4889a6dff24e6cb58dcba1ab3b4ac8` | RoamWise - Welcome & Onboarding | Onboarding | `/welcome` | **New Page**: Primary landing page with live engine simulation |
| **12** | `7f7c331396be40d293795607221cd063` | RoamWise - Adaptive Plan B | Itinerary | Modal / `/plan-b/:id` | **Redesign**: Replaces `PlanBBottomSheet.tsx` with Serene style |
| **13** | `885164e4054240148a9bb272b576e508` | RoamWise - Itinerary Dashboard | Itinerary | `/trip` | **Redesign**: Replaces `ItineraryOverviewPage.tsx` with circuit cards |
| **14** | `ef425219e54d47acb8dcee2536bc18f4` | RoamWise - Weather & Travel Alerts | Alerts | `/alerts` | **Redesign**: Replaces `AlertsPage.tsx` with categorized alerts |
| **15** | `fe1667720a704ae88eba837667700530` | RoamWise - Trip Configuration | Planning | N/A | **Archive / Reference**: Replaced by superior Screen 16 |
| **16** | `2165ea0fd28d4266ae09e5637c1f01ed` | RoamWise - Trip Configuration | Planning | `/plan` | **Redesign**: Replaces `PlanTripPage.tsx` with multi-stop optimizer |
| **17** | `bf3c3056cfe04061ab2aa966c410ea3d` | RoamWise - Destination Detail: Varanasi | Discovery | `/explore/:id` | **New Page**: Deep dive destination guide & direct planning CTA |
| **18** | `17f65c379cd3434c80032365883c27e5` | RoamWise - AI Trip Modification | Planning | `/replan` | **Redesign**: Replaces `ReplanningPage.tsx` with disruption chips |
| **19** | `2a32d804d82d4cb8acef051d7237e3c7` | RoamWise - Live Weather Intelligence | Weather | `/weather` | **Redesign**: Replaces `WeatherPage.tsx` with pass/radar intel |
| **20** | `bda0e1a0e8a3424d9f9864aa367a9a89` | RoamWise - Home Dashboard | Home | `/` (Active Trip) | **New Primary Page**: Dynamic home with live weather & active trip |
| **21** | `5af7702debed4ab5af0ce3ee18ad2274` | RoamWise - Profile Setup | Onboarding | `/profile/setup` | **New Page**: Traveler questionnaire (pace, budget, interests) |
| **22** | `ebd0663dcc104adca955a3b6fb158d00` | RoamWise - Profile Completed | Onboarding | `/profile/completed` | **New Page**: Completion celebration & launch to `/explore` |
| **23** | `89cf68df54af4e238038dea25adcba0f` | RoamWise - Log In | Auth | `/login` | **New Page**: Traveler authentication form |
| **24** | `37e7717a7e384a419ec6f2f9bc9445b5` | RoamWise - Sign Up | Auth | `/signup` | **New Page**: Account creation form |

---

## 4. Gap Analysis: Current Phase 2 App vs Serene Expedition

```
┌─────────────────────────────────┐           ┌──────────────────────────────────────┐
│       Current Phase 2 App       │           │   Serene Expedition Target State     │
│   (TripMind Blue/Teal Theme)    │           │    (Natural Forest / Sage / Amber)   │
├─────────────────────────────────┤           ├──────────────────────────────────────┤
│ • 10 basic routes               │           │ • 18 functional routes               │
│ • No Home page (redirects /trip)│ ───────►  │ • Dynamic Home Dashboard (Screen 20) │
│ • No Auth or Onboarding flow    │           │ • Full Auth & Profile Setup (5 pgs)  │
│ • Single destination input      │           │ • Multi-stop AI Route Optimizer (S16)│
│ • Generic weather cards         │           │ • Mountain pass / radar intel (S19)  │
│ • Separate Plan B bottom sheet  │           │ • Contextual Inline Plan B card (S02)│
│ • Single active trip in memory  │           │ • "My Trips" multi-trip hub (S01)    │
│ • No destination explorer guide │           │ • Curated Circuits & Guides (S04, S17│
└─────────────────────────────────┘           └──────────────────────────────────────┘
```

### 4.1 Identified Functional & Visual Gaps

1. **Missing Entry & Authentication Layer:** Current app begins immediately inside an itinerary or configuration form. New design introduces `/welcome`, `/login`, `/signup`, `/profile/setup`, and `/profile/completed`.
2. **Missing Home & Explore Foundation:** The root URL `/` currently redirects to `/trip`. In Serene Expedition, `/` is the hero Home view displaying active expedition progress, live disruption warnings, and quick-action chips.
3. **Multi-Stop vs Single Destination Routing:** The existing `TripConfigurationForm.tsx` collects only one destination. Screen 16 introduces multi-destination sequencing (e.g. Delhi ➔ Agra ➔ Jaipur) with algorithmic route optimization ("Save 3.5h / 142km").
4. **Contextual Plan B Presentation:** Currently, Plan B is presented exclusively in a modal bottom sheet. Screen 02 shows that during live travel, the Plan B alert belongs directly in the day timeline header with one-click `Switch to Plan B`.
5. **Multi-Trip Management:** Users currently have only one hardcoded mock trip. Screen 01 introduces a trips repository (`/trips`) with filtering for Upcoming, Completed, and Draft trips.

---

## 5. Component Migration Blueprint

### 5.1 Reusable Components (Keep Core Logic, Update Styles)

| Existing Component | Current Role | Migration Action |
|---|---|---|
| `TripContext.tsx` | Central state for trip, weather, alerts | Extend with `userProfile`, `savedTrips`, and `activeTripId` state. Logic is 100% reusable. |
| `api.ts` | Backend integration with Flask | Keep existing endpoints; add stubs for trips collection and user profile preferences. |
| `MapView.tsx` | Interactive Leaflet/OpenStreetMap | Update map pin markers to `#173F35` (standard) and `#E5A45B` (active/modified). |
| `StopCard.tsx` | Map stop details | Restyle with `16px` radius, `#173F35` typography, and frosted badge overlays. |
| `DateRangePicker.tsx` | Calendar date range selector | Restyle calendar cells to `#173F35` selection background with `#D8E9DD` range fill. |
| `BudgetSelector.tsx` | Budget tier chips | Restyle chips to `#F7F5EF` resting and `#173F35` selected with rupee indicators. |
| `InterestSelector.tsx` | Multi-select interest tags | Update with Serene Expedition interest categories (Heritage, Alpine, Culinary, etc.). |
| `TravelPaceSelector.tsx` | Relaxed vs Balanced vs Packed | Restyle cards with Serene Expedition typography and subtle borders. |

### 5.2 Components Requiring Visual Redesign

| Component | Files | Redesign Scope |
|---|---|---|
| **Header** | `components/common/Header.tsx` | Restyle with `#173F35` or transparent frosted cream, location pill with weather badge (`Manali • 18°C ⛅`), notification bell with unread badge, and avatar. |
| **Bottom Navigation** | `components/common/BottomNav.tsx` | Update tabs to: `Home` (`/`), `Explore` (`/explore`), `Trips` (`/trips`), `Alerts` (`/alerts`), `Profile` (`/profile`). Use `#173F35` for active tab and `#E5A45B` for badge count. |
| **Trip Configuration Form** | `components/trip/TripConfigurationForm.tsx` | Redesign to match Screen 16: Domestic/International scope toggle, interactive multi-stop destination manager with drag reorder, and "Optimise My Route" card. |
| **Day Timeline & Cards** | `components/trip/DayTimeline.tsx`, `ActivityCard.tsx` | Update vertical axis to `2px solid #D8E9DD`. Restyle node indicators (hollow `#173F35` for completed, pulsing `#E5A45B` for active/modified). Add status chips. |
| **Inline Plan B Banner** | `components/plan-b/PlanBBottomSheet.tsx` + New `PlanBInlineBanner.tsx` | Implement the prominent amber-bordered card from Screen 02 (`#FFF8F0` surface, `1px solid #E5A45B`, `Switch to Plan B` and `Dismiss` actions). |
| **AI Generation Animation** | `pages/GeneratingPage.tsx` | Match Screen 10: Multi-step animated progress checklist ("Analyzing topography", "Evaluating monsoon forecast", "Selecting boutique stays") with rotating tips. |
| **Weather Dashboard** | `components/weather/*` | Match Screen 19: Add High-Altitude Pass status (e.g. Rohtang Pass, Jalori Pass), precipitation radar graphs, UV index, and packing suggestions. |
| **Replanning Screen** | `pages/ReplanningPage.tsx` | Match Screen 18: Disruption chips ("Heavy Rain", "Road Blocked", "Feeling Tired"), natural language prompt, and affected stops picker. |
| **Diff Review Card** | `components/replanning/ItineraryDiffCard.tsx` | Match Screen 09: Clean visual comparison highlighting inserted Plan B activities in amber/green and canceled stops in strike-through charcoal. |

### 5.3 New Components to Create

1. **`HeroExpeditionCard.tsx`** (Screen 20): Hero active expedition card with progress bar, route stops, and day status.
2. **`LiveIntelligenceBanner.tsx`** (Screen 20 / Screen 11): Live simulation pill showing real-time engine activity.
3. **`DestinationCard.tsx`** (Screen 04 / Screen 17): Curated destination visual card with photography, duration, tags, and ratings.
4. **`TripLibraryCard.tsx`** (Screen 01): Trip summary card for "My Trips" library with date range, destination chips, and action menu.
5. **`RouteOptimiserCard.tsx`** (Screen 16): AI route calculation preview showing distance/time savings.
6. **`MountainPassStatus.tsx`** (Screen 19): Real-time road and mountain pass advisories for high-altitude routes.
7. **`OnboardingStepIndicator.tsx`** (Screen 21): Progress tracker for the 3-step profile onboarding flow.

---

## 6. Route & Navigation Architecture Blueprint

```
                      ┌────────────────────────────┐
                      │   Welcome & Landing Page   │  /welcome (Screen 11)
                      └─────────────┬──────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  ▼                                   ▼
        ┌───────────────────┐               ┌───────────────────┐
        │  Sign Up / In     │               │   Plan As Guest   │
        │  /signup, /login  │               │   /plan           │
        └─────────┬─────────┘               └─────────┬─────────┘
                  │                                   │
                  ▼                                   ▼
        ┌───────────────────┐               ┌───────────────────┐
        │ Profile Onboarding│               │   AI Generator    │
        │ /profile/setup    │               │   /generating     │
        └─────────┬─────────┘               └─────────┬─────────┘
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    ▼
       ==============================================================
                          PRIMARY APP BOTTOM NAVIGATION
       ==============================================================
               │               │            │             │
               ▼               ▼            ▼             ▼
          [ Home ]        [ Explore ]   [ Trips ]     [ Alerts ]    [ Profile ]
             /              /explore     /trips         /alerts       /profile
         (Screen 20)       (Screen 04)  (Screen 01)   (Screen 14)   (Screen 06)
               │               │            │
               │               ▼            ▼
               │         [ Destination ] [ Itinerary ]
               │         /explore/:id      /trip (Overview - S13)
               │          (Screen 17)       │
               │                            ▼
               └──────────────────────►  [ Day Timeline + Plan B ]
                                         /trip/day/:dayId (S02)
                                            │
                                            ├─► [ Replan ] /replan (S18)
                                            ├─► [ Diff Review ] /review-plan (S09)
                                            └─► [ Live Weather ] /weather (S19)
```

---

## 7. Phased Implementation Roadmap

To ensure 100% safety, zero regression, and clear checkpoints, the migration will be executed in **5 distinct phases**:

### Phase 2.1: Design Tokens & Foundation Migration
- Update `frontend/tailwind.config.js` with Serene Expedition color palette, Manrope/Inter typography, and radii tokens.
- Add Google Fonts imports for `Manrope` and `Inter` in `index.html`.
- Update base styles in `src/index.css`.
- *Verification Checkpoint:* Run `npm run build` to confirm zero build regressions.

### Phase 2.2: Core Shell, Navigation, & Home Dashboard
- Update `BottomNav.tsx` and `Header.tsx` to Serene Expedition specifications.
- Implement `HomePage.tsx` (Screen 20 active trip view with Screen 08 fallback).
- Implement `MyTripsPage.tsx` (Screen 01).
- Update routing in `App.tsx` so `/` serves `HomePage`.
- *Verification Checkpoint:* Verify navigation transitions and home dashboard rendering.

### Phase 2.3: Itinerary & Adaptive Plan B Transformation
- Redesign `ItineraryOverviewPage.tsx` to match Screen 13 (circuit cards, budget widget).
- Redesign `DayDetailPage.tsx` and `DayTimeline.tsx` to match Screen 02 (day tabs, visited checks, inline Plan B banner).
- Restyle `PlanBBottomSheet.tsx` (Screen 12).
- Update `ReviewPlanPage.tsx` (Screen 09) and `ReplanningPage.tsx` (Screen 18).
- *Verification Checkpoint:* Test the full adaptive Plan B trigger and approval workflow.

### Phase 2.4: Trip Configuration & AI Generation Upgrade
- Redesign `PlanTripPage.tsx` and `TripConfigurationForm.tsx` to match Screen 16 (multi-stop route manager, AI route optimizer).
- Redesign `GeneratingPage.tsx` to match Screen 10 (animated multi-step checklist, rotating tips).
- Redesign `WeatherPage.tsx` to match Screen 19 (mountain pass advisories, hourly radar charts).
- Redesign `AlertsPage.tsx` to match Screen 14 (severe weather and travel advisories).
- *Verification Checkpoint:* Execute end-to-end trip configuration and generation flow.

### Phase 2.5: Discovery, Destination Detail, & Onboarding/Auth
- Implement `ExplorePage.tsx` (Screen 04) and `DestinationDetailPage.tsx` (Screen 17).
- Implement `WelcomePage.tsx` (Screen 11), `LoginPage.tsx` (Screen 23), `SignUpPage.tsx` (Screen 24).
- Implement `ProfileSetupPage.tsx` (Screen 21) and `ProfileCompletedPage.tsx` (Screen 22).
- Final UI polish, responsiveness check, and Git checkpoint commit.

---

## 8. Verification & Acceptance Criteria

1. **Visual Fidelity:** Every redesigned screen must faithfully reproduce the colors (`#173F35`, `#D8E9DD`, `#E5A45B`), typography (`Manrope` / `Inter`), and geometry (`12px` / `16px` / `24px`) defined in `design-reference-v2/DESIGN.md`.
2. **Local Preview Accuracy:** The standalone `design-reference-v2/preview.html` gallery functions as the visual benchmark for comparison.
3. **Build Integrity:** `npm run build` must succeed with zero TypeScript or Tailwind compilation errors.
4. **Data Continuity:** The existing mock data (`sampleTrip.ts`, `weatherData.ts`, `notificationsData.ts`) and Flask backend API integration must remain fully compatible.
5. **Git Safety:** All work remains isolated on branch `feature/serene-expedition-ui`, with `baseline-phase2-tripmind` preserving the original baseline.

---

*Report prepared and submitted for user approval before beginning Phase 2.1 implementation.*
