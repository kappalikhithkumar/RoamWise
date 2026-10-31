---
name: TripMind Adaptive Travel
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#3d4948'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#6d7a79'
  outline-variant: '#bcc9c8'
  surface-tint: '#006a68'
  primary: '#006765'
  on-primary: '#ffffff'
  primary-container: '#008280'
  on-primary-container: '#f3fffd'
  inverse-primary: '#65d8d4'
  secondary: '#00668a'
  on-secondary: '#ffffff'
  secondary-container: '#40c2fd'
  on-secondary-container: '#004d6a'
  tertiary: '#825100'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#83f5f1'
  primary-fixed-dim: '#65d8d4'
  on-primary-fixed: '#00201f'
  on-primary-fixed-variant: '#00504e'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Outfit
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Outfit
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style
The design system establishes an intelligent, reassuring, and atmospheric mobile travel companion. It delivers a modern hybrid aesthetic: clean utilitarian precision paired with ambient, weather-reactive sensory cues.

### Brand Personality & Philosophy
- **Proactive & Calm:** Navigating travel changes and delays can cause anxiety. The interface prioritizes calm reassurance, delivering real-time re-routing and adjustments without alarmist styling.
- **Adaptive Atmosphere:** The interface dynamically shifts ambient tone according to localized contextual states: golden warm hues during clear sunny conditions, cool slate-tinted chrome during rain, and muted starlit indigos at dusk and night.
- **Precision Utility:** Information architecture is glanceable, thumb-accessible, and structured around fast decision-making on mobile screens.

### Design Movement: Modern Ambient Utility
A fusion of clean modern UI patterns with soft glassmorphism and ambient tonal illumination:
- Crisp typography and structured cards grounded on neutral canvases.
- Weather-reactive surface tints and dynamic accents that ground the itinerary in the user's immediate physical environment.
- Tactile, ergonomically optimized touch targets tailored specifically for single-handed mobile navigation (390×844 canvas).

## Colors

The color architecture is built for outdoor sunlight readability, strict WCAG 2.1 AA accessibility, and dynamic atmospheric reactivity.

### Base Color Roles
- **Primary (`#0F9D9A`):** Deep Adaptive Teal. Anchors core interactive targets, active tabs, primary confirmations, and AI recommendation tags.
- **Secondary (`#38BDF8`):** Sky Cerulean. Denotes live status tracking, transit paths, active sync states, and calm meteorological feedback.
- **Tertiary (`#F59E0B`):** Warm Amber. Accents morning/sunny itinerary blocks, time-sensitive schedule shifts, and highlights.
- **Severe / Critical Alert (`#EF4444`):** Clear vermilion red reserved strictly for weather cancellations, transit shutdowns, and critical itinerary conflicts.

### Neutral & Surface Foundation
- **Light Mode Canvas (`#F8FAFC`):** Slate tinted off-white reducing outdoor glare.
- **Light Mode Surface (`#FFFFFF`):** High-contrast elevated cards and sheets.
- **Dark Mode Canvas (`#0F172A`):** Deep slate-navy base.
- **Dark Mode Surface (`#1E293B`):** Elevated midnight panels with reduced luminescent fatigue.
- **Text & Borders:**
  - Primary Label: `#0F172A` (Light) / `#F8FAFC` (Dark)
  - Secondary Label: `#475569` (Light) / `#94A3B8` (Dark)
  - Border Subdued: `#E2E8F0` (Light) / `#334155` (Dark)

### Dynamic Weather Accent Palettes
The UI applies situational tints across itinerary timelines and card backdrops:
- **Sunny / Golden:** Subtle amber-sand ambient gradients (`#FFFBEB` light / `#2A2315` dark), secondary gold icons (`#D97706`).
- **Rain / Overcast:** Cool slate-blue glow (`#F1F5F9` light / `#1E2638` dark), droplet cerulean badges (`#0284C7`).
- **Night / Clear:** Deep midnight indigo gradients (`#EEF2FF` light / `#161B33` dark), moonlit accents (`#818CF8`).

## Typography

The type scale balances the contemporary, geometric warmth of **Outfit** for landmarks, weather status, and screen titles with the high-legibility engineered performance of **Inter** for dense itinerary timelines, travel logistics, and flight details.

### Typographic Hierarchy Rules
- **Display & Large Headlines (`Outfit`):** Used strictly for high-impact travel destinations, ambient temperature badges, and primary itinerary milestones. On compact mobile viewports (≤390px), headlines scale via `headline-lg-mobile` to maintain balanced card padding without text truncating.
- **Section Headers (`headline-md`, `headline-sm`):** Anchor dynamic itinerary phases (e.g., "Morning in Montmartre", "Weather Contingency Plan").
- **Body (`Inter`):** Renders activity descriptions, routing details, and AI explanatory summaries with generous line heights to preserve legibility when users view screens while walking or in varying lighting conditions.
- **Labels & Micro-data (`label-sm`, `label-md`):** Form-factor specific metrics: flight departure times, weather badge metrics, and quick-filter toggle chips. All uppercase micro-labels utilize tabular numerals and a `0.03em` letter-spacing boost for instant scannability.

## Layout & Spacing

The layout is optimized mobile-first for modern handheld displays (baseline 390×844pt viewports across iOS and Android), scaling to adaptive multi-column arrangements on tablets and foldable viewports.

### Grid & Canvas Structure
- **Mobile Handheld (390px – 430px):**
  - Outer screen horizontal margin: `1rem` (16px).
  - Internal card gutter: `0.75rem` (12px) to `1rem` (16px).
  - Single primary vertical scroll container with horizontal swiping carousels for alternate activity options.
  - Safe-area inset aware padding (`padding-bottom: env(safe-area-inset-bottom, 24px)`) ensures critical action triggers sit clear of OS navigation bars.
- **Tablet / Large Screen (≥768px):**
  - Converts into a 12-column adaptive fluid layout with a maximum container width of 1024px.
  - Split viewport: Left pane (5 columns) for interactive live itinerary cards, right pane (7 columns) for weather-mapped timeline routes.

### Spacing Token Rules
- `space-xs` (4px): Micro-spacing between category icons and status badge text.
- `space-sm` (8px): Gaps between horizontal tag chips and inner metric clusters.
- `space-md` (16px): Standard internal padding for cards, form fields, and sheet dialogs.
- `space-lg` (24px): Structural vertical separation between timeline hours and itinerary milestones.
- `space-xl` (32px): Major chapter division between morning, afternoon, and evening travel segments.

## Elevation & Depth

Visual hierarchy leverages a hybrid layer stack: physical surface elevation blended with subtle environmental backlight blurs to reflect local weather ambiance.

### Tonal Hierarchy & Layers
1. **Base Surface (Level 0):** Canvas `#F8FAFC` (Light) / `#0F172A` (Dark). Completely flat, anchor level for full-screen maps and scrollable backdrops.
2. **Structural Container (Level 1):** `#FFFFFF` (Light) / `#1E293B` (Dark). Default state for itinerary timeline cards, restaurant recommendations, and transport cards. Outlined with a hairline border `1px solid rgba(148, 163, 184, 0.2)` to ensure definition against washed-out displays in bright sunlight.
3. **Floating Contextual Cards & Modals (Level 2):** Raised bottom sheets, live re-planning prompts, and sticky weather bars. Rendered with an ambient diffused drop-shadow: `0 8px 24px -4px rgba(15, 23, 42, 0.08)`.
4. **Persistent Overlays & Floating Actions (Level 3):** Primary navigation bar and contextual re-plan button. Soft frosted glass backdrop (`backdrop-filter: blur(16px); background: rgba(255, 255, 255, 0.85)` in light, `rgba(15, 23, 42, 0.85)` in dark) floating with an ambient shadow `0 12px 32px -4px rgba(15, 23, 42, 0.14)`.

### Weather-Tinted Ambient Illumination
When critical weather transitions trigger itinerary updates, the elevated cards emit a soft 16px peripheral glow:
- **Sunny Glow:** `0 0 20px 0 rgba(245, 158, 11, 0.15)`
- **Rain Glow:** `0 0 20px 0 rgba(56, 189, 248, 0.18)`
- **Severe Hazard Glow:** `0 0 24px 0 rgba(239, 68, 68, 0.22)`

## Shapes

The design system employs a rounded, human-centric shape language (`roundedness: 2`) configured for touch surfaces.

### Radius Assignments
- **Core Cards & Modules (`rounded-lg` / 16px to 20px):** Itinerary activity cards, weather alert containers, and accommodation previews utilize a refined 16px–20px outer corner radius, ensuring elements feel tactile and friendly.
- **Interactive Buttons & Chips (`rounded-md` / 8px to Pill):**
  - Standard input fields and secondary cards: 8px to 12px.
  - Interactive status chips, quick-filter tags, and weather badges: Fully pill-shaped (`border-radius: 9999px`) to invite tapping and distinguish metadata from layout containers.
  - Floating Action Buttons & Primary Re-Plan CTAs: Pill-shaped or 16px smoothed squircle.
- **Nested Corners Rule:** When chips or images reside within a card (e.g., a 16px corner radius card), inner nested elements use half-radius (8px) or pill geometries to maintain optical harmony.

## Components

### 1. Primary & Secondary Buttons
- **Touch Target:** Ergonomic thumb-height between 48px and 52px with a minimum horizontal width of 120px.
- **Primary Action (e.g., "Accept New Route", "Generate Plan"):** Solid `#0F9D9A` background, white label (`label-lg`), pill or 14px border radius. Micro-shadow `0 4px 12px rgba(15, 157, 154, 0.3)`. Pressed state scales gently down (`transform: scale(0.98)`).
- **Secondary Action (e.g., "Keep Original", "Details"):** Clean ghost surface `#FFFFFF`, border `1px solid #CBD5E1`, text `#0F172A`. In dark mode, `#1E293B` with border `#334155` and text `#F8FAFC`.

### 2. Interactive Chips & Filters
- **Height & Spacing:** 36px touch height, pill-shaped (`9999px`), horizontal padding `14px`.
- **Default State:** Muted background `rgba(226, 232, 240, 0.5)` with `label-md` colored in `#475569`.
- **Selected State:** Active `#0F9D9A` background with crisp white typography and a leading check or status icon.
- **Tactile Weather Filter Chips:** Weather-specific toggles integrate dynamic inline iconography (sun, cloud, rain) and tinted micro-backgrounds.

### 3. Itinerary Activity Cards
- **Geometry:** 16px–20px border radius, 16px internal padding.
- **Visual Composition:** Timeline node indicator on the left border; title in `headline-sm`; time and duration in `label-md`.
- **Weather Adaptation Badge:** Embedded micro-pill in the top-right corner indicating indoor/outdoor status (e.g., "☀️ UV High" or "🌧️ Covered Venue").
- **Live Re-Plan Card State:** When altered by weather, the card shifts border to `#38BDF8` with a top header pill: "Auto-shifted 45 min earlier due to rain".

### 4. Input Fields
- **Height & Style:** 48px height, 12px radius, neutral background `#FFFFFF` (Light) / `#1E293B` (Dark).
- **States:** Border `1px solid #CBD5E1`. On focus, transitions to `2px solid #0F9D9A` with an ambient glow (`box-shadow: 0 0 0 3px rgba(15, 157, 154, 0.15)`).

### 5. Checkboxes & Radio Controls
- **Hit Area:** 44×44px hit-box bounding a 22×22px visual indicator.
- **Active Fill:** `#0F9D9A` featuring crisp white SVG checkmarks. Unchecked border `2px solid #94A3B8`.

### 6. Micro-Badges & Status Tags
- **Dimensions:** 20px–24px compact height, pill-shaped, 8px horizontal padding, `label-sm` font.
- **Severity Roles:**
  - *Normal / Info:* Sky blue tint (`#E0F2FE` background, `#0369A1` text).
  - *Caution / Weather Alert:* Amber tint (`#FEF3C7` background, `#B45309` text).
  - *Disruption / Severe:* Red tint (`#FEE2E2` background, `#B91C1C` text).

### 7. Skeleton Loaders
- **Style:** 12px–16px rounded rectangular blocks mimicking text lines and card shapes.
- **Animation:** Continuous subtle wave shimmer from `#E2E8F0` to `#F1F5F9` (Light) and `#1E293B` to `#334155` (Dark) across a 1.4-second linear period. Used during AI itinerary synthesis and real-time route calculation.