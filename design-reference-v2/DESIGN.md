---
name: Serene Expedition
colors:
  surface: '#edfdf5'
  surface-dim: '#ceded6'
  surface-bright: '#edfdf5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e7f7ef'
  surface-container: '#e1f2ea'
  surface-container-high: '#dcece4'
  surface-container-highest: '#d6e6df'
  on-surface: '#101e1a'
  on-surface-variant: '#414845'
  inverse-surface: '#25332e'
  inverse-on-surface: '#e4f4ed'
  outline: '#717975'
  outline-variant: '#c0c8c4'
  surface-tint: '#3f665a'
  primary: '#002920'
  on-primary: '#ffffff'
  primary-container: '#173f35'
  on-primary-container: '#82aa9d'
  inverse-primary: '#a6cfc1'
  secondary: '#526259'
  on-secondary: '#ffffff'
  secondary-container: '#d6e7db'
  on-secondary-container: '#58685f'
  tertiary: '#361d00'
  on-tertiary: '#ffffff'
  tertiary-container: '#543000'
  on-tertiary-container: '#d4954e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c1ecdd'
  primary-fixed-dim: '#a6cfc1'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#274e43'
  secondary-fixed: '#d6e7db'
  secondary-fixed-dim: '#bacbbf'
  on-secondary-fixed: '#101e17'
  on-secondary-fixed-variant: '#3b4a41'
  tertiary-fixed: '#ffdcbb'
  tertiary-fixed-dim: '#fdb96e'
  on-tertiary-fixed: '#2c1700'
  on-tertiary-fixed-variant: '#683d00'
  background: '#edfdf5'
  on-background: '#101e1a'
  surface-variant: '#d6e6df'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
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
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies mindful exploration, modern intelligence, and quiet luxury. Designed for discerning travelers seeking bespoke, context-aware itineraries, the interface balances editorial composure with algorithmic precision.

### Aesthetic Foundation
- **Modern Minimalist Naturalism:** Grounded organic tones combined with clean, expansive white space and uncluttered visual hierarchy.
- **Tone:** Calming, intelligent, proactive, and unhurried. The experience replaces travel-planning anxiety with clear, ambient guidance.
- **Imagery & Atmosphere:** Full-bleed natural photography, soft edges, muted mossy undertones, and warm tactile surfaces that evoke high-end field notebooks and curated travel journals.

## Colors

The palette draws directly from balanced forest atmospheres and raw parchment paper, eschewing synthetic vibrant primaries for organic, grounded hues.

### Palette Architecture
- **Primary (`#173F35` - Forest Green):** Anchor tone used for primary interactive states, strong navigational headers, and authoritative confirmations.
- **Secondary (`#D8E9DD` - Sage Green):** Calming tint used for secondary container fills, passive selection states, progress meters, and gentle highlight surfaces.
- **Tertiary (`#E5A45B` - Amber Accent):** Warm, luminous accent dedicated strictly to AI dynamic interventions, real-time alerts, weather anomalies, and high-priority travel status tags.
- **Neutral (`#25332E` - Charcoal Neutral):** High-legibility deep evergreen-charcoal for typography and micro-borders, softening contrast compared to pure `#000000`.
- **Canvas (`#F7F5EF` - Warm Cream):** Base app background, lending warmth and reduced optical glare during both daylight and night travels.
- **Surface (`#FFFFFF` - Pure White):** Elevated interaction planes, modal sheets, and content card backdrops.

## Typography

The pairing combines the architectural, open geometry of **Manrope** for display and section headers with the neutral, hyper-legible mechanics of **Inter** for dense itinerary information, timeline readouts, and UI controls.

### Implementation Guidelines
- Use `display-lg` exclusively for destination titles and hero itinerary headers. Fallback to `display-lg-mobile` under 600px viewport widths.
- Keep body paragraph text strictly in `Inter` with relaxed line heights (`1.5` minimum) to preserve scanning comfort on mobile screens in motion.
- Apply uppercase styling to `label-sm` with slightly widened tracking for flight codes, gate designations, and categorization markers.

## Layout & Spacing

A mobile-first adaptive fluid grid built around an 8-point base spacing metric. Layouts prioritize thumb-zone ergonomics, persistent glanceability, and continuous narrative vertical scrolling.

### Grid & Breakpoints
- **Mobile (< 768px):** Single-column fluid architecture with `16px` (`1rem`) outer margins and vertical spacing rhythm. All primary actions rest within the bottom 40% vertical viewport.
- **Tablet (768px – 1024px):** 6-column grid with `24px` margins and gutters. Day plans and itinerary route maps split into a 4:2 responsive distribution.
- **Desktop (> 1024px):** 12-column layout max-width constrained to `1280px` centered on canvas. 8 columns for itinerary timelines and media feeds; 4 columns for sticky contextual maps and live AI assistants.

## Elevation & Depth

Depth in this design system is structural and organic, rejecting heavy drop shadows in favor of tinted ambient occlusion and distinct surface color hierarchies.

### Surface Tiers
- **Base Canvas (`#F7F5EF`):** The ground level for all non-interactive page backdrops.
- **Sub-Surface (`#D8E9DD` with 30% alpha):** Recessed slots, progress rails, and inactive timeline tracks.
- **Resting Surface (`#FFFFFF`):** Base card plane elevated with a warm ambient shadow: `box-shadow: 0 4px 20px -2px rgba(23, 63, 53, 0.05)`.
- **Raised Interactive Layer (Modals, Active Cards, Menus):** `box-shadow: 0 12px 32px -4px rgba(23, 63, 53, 0.08), 0 2px 6px 0 rgba(23, 63, 53, 0.03)`.
- **Floating Overlays (Map Pin Cards, Urgent AI Bottom Sheets):** `box-shadow: 0 20px 40px -8px rgba(37, 51, 46, 0.12)`.

## Shapes

The geometry strikes a balance between contemporary architectural precision and soft organic hand-feel.

### Curvature Tokens
- **Controls & Small Elements (`12px` / `0.75rem`):** Buttons, inputs, search fields, segmented controls, and pill badges.
- **Content Blocks (`16px` to `20px`):** Itinerary day cards, media previews, nested timeline segments, and map preview popups.
- **Containers & Surfaces (`24px` / `1.5rem`):** Hero cards, primary destination containers, bottom sheet dialogs, and modal dialogs.
- **Full Radius (Pill):** Floating indicator badges, status chips, and travel route markers.

## Components

### Buttons
- **Primary:** Solid `#173F35` Forest Green background, `#FFFFFF` text, `12px` border radius, `14px` padding vertical by `24px` horizontal. Subtle scale compression (`scale(0.98)`) on press.
- **Secondary:** Filled `#D8E9DD` Sage Green surface, `#173F35` text, borderless, `12px` radius.
- **Tertiary / Ghost:** Transparent surface with `#173F35` text, active tint overlay (`#173F35` at 6% opacity on hover/active).

### Travel Cards
- **Destination & Experience Cards:** `#FFFFFF` background, `20px` radius, `16px` internal padding. Imagery styled with `12px` internal radius and `16:9` or `4:5` aspect ratios. Micro-badges (e.g., duration, rating) float over imagery with a frosted `rgba(247, 245, 239, 0.85)` background and `backdrop-filter: blur(8px)`.

### Timeline Elements
- **Vertical Route Axis:** `2px` solid line styled in `#D8E9DD`.
- **Node Points:** `12px` circular indicators; unfilled with a `3px` border of `#173F35` for completed items; solid `#E5A45B` with subtle outer pulse ring for active or AI-altered stops.
- **Timeline Stop Card:** Offset horizontally by `16px`, hosted in a `#FFFFFF` container with `16px` radius.

### Chips & Filters
- **Resting:** `#F7F5EF` Warm Cream background, `1px` solid `rgba(37, 51, 46, 0.12)`, text `#25332E`.
- **Selected:** Solid `#173F35` background, text `#FFFFFF`, border-color transparent.

### Adaptive Alert Badges
- **AI Recommendation / Delay Notifications:** Surface of `#FFF8F0` with a subtle `1px` border of `#E5A45B`. Left icon in solid `#E5A45B`. Text styled in `#25332E` with `label-md` weight.

### Inputs & Search Bars
- **Search Field:** `#FFFFFF` background, `12px` radius, `1px` border of `rgba(37, 51, 46, 0.15)`. Focused state shifts border to `1.5px` solid `#173F35` without external glows.

### Map Indicators
- **Waypoints:** Minimalist circular discs (`28px` diameter) in `#173F35` with white numeric labels.
- **AI Recommendation Node:** `#E5A45B` core with an outer breathing ring of `rgba(229, 164, 91, 0.25)`.