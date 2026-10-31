import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { PlanBBottomSheet } from '../components/plan-b/PlanBBottomSheet';

interface CityWeather {
  id: string;
  name: string;
  stopLabel: string;
  daysLabel: string;
  temp: number;
  high: number;
  low: number;
  condition: string;
  conditionIcon: string;
  conditionDesc: string;
  region: string;
  statusBadge: string;
  humidity: string;
  humidityDesc: string;
  uvIndex: string;
  uvDesc: string;
  aqi: number;
  aqiDesc: string;
  wind: string;
  windDesc: string;
  visibility: string;
  visibilityDesc: string;
  precip: string;
  precipDesc: string;
  goldenHour: string;
  goldenHourRemaining: string;
  sunTimes: string;
}

const CITIES: CityWeather[] = [
  {
    id: 'jaipur',
    name: 'Jaipur',
    stopLabel: 'Stop 1',
    daysLabel: 'Days 1–2',
    temp: 27,
    high: 31,
    low: 22,
    condition: 'Partly Cloudy',
    conditionIcon: 'partly_cloudy_day',
    conditionDesc: 'Partly Cloudy with Humid Southwesterly Breeze',
    region: 'Pink City • Rajasthan',
    statusBadge: 'Day 1 Ongoing',
    humidity: '62%',
    humidityDesc: 'Slightly Muggy',
    uvIndex: '6 Mod',
    uvDesc: 'Peak 1–2:30 PM',
    aqi: 112,
    aqiDesc: 'Moderate',
    wind: '14 km/h',
    windDesc: 'From NW',
    visibility: '7.0 km',
    visibilityDesc: 'Good Optics',
    precip: '15%',
    precipDesc: 'Today dry',
    goldenHour: '05:15 PM – 05:54 PM',
    goldenHourRemaining: 'In 4h 12m',
    sunTimes: 'Sunset 05:54 PM • Sunrise 06:28 AM'
  },
  {
    id: 'delhi',
    name: 'Delhi',
    stopLabel: 'Stop 2',
    daysLabel: 'Days 3–5',
    temp: 28,
    high: 33,
    low: 23,
    condition: 'Hazy Sun',
    conditionIcon: 'wb_sunny',
    conditionDesc: 'Warm Autumn Sunlight with Light Dust Mist',
    region: 'Capital Territory • NCR',
    statusBadge: 'Upcoming Stop',
    humidity: '48%',
    humidityDesc: 'Comfortable',
    uvIndex: '7 High',
    uvDesc: 'Peak 12:30–2 PM',
    aqi: 178,
    aqiDesc: 'Unhealthy for Sensitive',
    wind: '9 km/h',
    windDesc: 'From E',
    visibility: '4.5 km',
    visibilityDesc: 'Hazy Horizon',
    precip: '5%',
    precipDesc: 'Dry & Clear',
    goldenHour: '05:22 PM – 05:58 PM',
    goldenHourRemaining: 'Tomorrow',
    sunTimes: 'Sunset 05:58 PM • Sunrise 06:24 AM'
  },
  {
    id: 'agra',
    name: 'Agra',
    stopLabel: 'Stop 3',
    daysLabel: 'Days 6–7',
    temp: 29,
    high: 32,
    low: 20,
    condition: 'Clear Sky',
    conditionIcon: 'clear_day',
    conditionDesc: 'Crisp Yamuna Basin Air with Pristine Morning Visibility',
    region: 'Heritage Corridor • Uttar Pradesh',
    statusBadge: 'Final Circuit Leg',
    humidity: '54%',
    humidityDesc: 'Moderate',
    uvIndex: '6 Mod',
    uvDesc: 'Peak 1–2 PM',
    aqi: 94,
    aqiDesc: 'Satisfactory',
    wind: '11 km/h',
    windDesc: 'From NE',
    visibility: '9.0 km',
    visibilityDesc: 'Pristine Optics',
    precip: '0%',
    precipDesc: 'Clear Skies',
    goldenHour: '05:18 PM – 05:52 PM',
    goldenHourRemaining: 'Day 6 Prime',
    sunTimes: 'Sunset 05:52 PM • Sunrise 06:20 AM'
  }
];

export const WeatherPage: React.FC = () => {
  const navigate = useNavigate();
  const { applyPlanB } = useTrip();

  const [selectedCityId, setSelectedCityId] = useState('jaipur');
  const [planBSwapped, setPlanBSwapped] = useState(false);
  const [scheduleShifted, setScheduleShifted] = useState(false);

  const activeCity = CITIES.find((c) => c.id === selectedCityId) || CITIES[0];

  const handleInstantPlanBSwap = () => {
    applyPlanB(2, 'act-2-3');
    setPlanBSwapped(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface antialiased">
      <Header title="Weather Dashboard" showBack={true} />

      <main className="flex-1 flex flex-col relative w-full pt-16 pb-28 max-w-xl mx-auto">
        <div className="flex flex-col w-full">
          {/* Circuit Switcher Section */}
          <section className="w-full px-gutter pt-space-sm pb-space-xs">
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-surface-tint" />
                Active Golden Triangle Circuit
              </span>
              <span className="font-label-sm text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-tertiary-fixed-dim animate-spin" style={{ animationDuration: '6s' }}>
                  sync
                </span>
                Simulated Radar (Demo)
              </span>
            </div>

            {/* Multi-city Horizontally Scrollable Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {CITIES.map((city) => {
                const isSelected = city.id === selectedCityId;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => setSelectedCityId(city.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-full flex-shrink-0 transition-transform active:scale-95 shadow-sm ${
                      isSelected
                        ? 'bg-primary text-on-primary'
                        : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                    }`}
                  >
                    {isSelected && <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-ping" />}
                    <div className="flex flex-col text-left">
                      <span className="font-headline-sm text-xs font-bold leading-tight">{city.name}</span>
                      <span className={`font-label-sm text-[10px] ${isSelected ? 'text-primary-fixed-dim opacity-90' : 'text-on-surface-variant'}`}>
                        {city.stopLabel} • {city.daysLabel}
                      </span>
                    </div>
                    <span
                      className={`font-label-md text-xs ml-1 px-2 py-0.5 rounded-full font-bold ${
                        isSelected ? 'bg-primary-container text-primary-fixed' : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {city.temp}°C
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Weather Hero Context Card */}
          <section className="w-full px-gutter mt-space-sm">
            <div className="w-full rounded-2xl bg-surface-container-lowest p-space-md shadow-sm relative overflow-hidden border border-surface-container">
              {/* Decorative Atmospheric Glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-tertiary-fixed/30 via-surface-container/20 to-transparent rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-space-md">
                {/* Top Metadata & Location Status */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-primary text-[18px]">location_on</span>
                      <span className="font-label-md text-xs text-secondary uppercase tracking-wider font-semibold">
                        {activeCity.region}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-display-lg text-4xl text-on-surface font-bold tracking-tight">
                        {activeCity.temp}°
                      </span>
                      <span className="font-body-md text-sm text-on-surface-variant font-medium">C</span>
                      <span className="font-label-md text-xs text-on-surface-variant ml-2 font-medium">
                        H: {activeCity.high}° • L: {activeCity.low}°
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center text-primary shadow-sm">
                      <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {activeCity.conditionIcon}
                      </span>
                    </div>
                    <span className="font-label-sm text-[10px] text-tertiary-container font-semibold mt-1 bg-tertiary-fixed px-2 py-0.5 rounded-full">
                      {activeCity.statusBadge}
                    </span>
                  </div>
                </div>

                {/* Atmospheric Description */}
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-surface-tint shrink-0" />
                  <p className="font-body-md text-xs text-on-surface font-medium">
                    {activeCity.conditionDesc}
                  </p>
                </div>

                {/* Ambient Parameters Bento Grid */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {/* Humidity */}
                  <div className="bg-surface-container-low rounded-xl p-2.5 flex flex-col">
                    <div className="flex items-center justify-between text-on-surface-variant mb-1">
                      <span className="font-label-sm text-[11px]">Humidity</span>
                      <span className="material-symbols-outlined text-[15px] text-surface-tint">water_drop</span>
                    </div>
                    <span className="font-headline-sm text-sm text-on-surface font-bold">{activeCity.humidity}</span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">{activeCity.humidityDesc}</span>
                  </div>

                  {/* UV Index */}
                  <div className="bg-surface-container-low rounded-xl p-2.5 flex flex-col">
                    <div className="flex items-center justify-between text-on-surface-variant mb-1">
                      <span className="font-label-sm text-[11px]">UV Index</span>
                      <span className="material-symbols-outlined text-[15px] text-tertiary-container">sunny</span>
                    </div>
                    <span className="font-headline-sm text-sm text-tertiary-container font-bold">{activeCity.uvIndex}</span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">{activeCity.uvDesc}</span>
                  </div>

                  {/* AQI */}
                  <div className="bg-surface-container-low rounded-xl p-2.5 flex flex-col">
                    <div className="flex items-center justify-between text-on-surface-variant mb-1">
                      <span className="font-label-sm text-[11px]">AQI</span>
                      <span className="material-symbols-outlined text-[15px] text-on-secondary-container">air</span>
                    </div>
                    <span className="font-headline-sm text-sm text-on-surface font-bold">{activeCity.aqi}</span>
                    <span className="font-label-sm text-[10px] text-on-secondary-container font-medium">{activeCity.aqiDesc}</span>
                  </div>

                  {/* Wind */}
                  <div className="bg-surface-container-low rounded-xl p-2.5 flex flex-col">
                    <div className="flex items-center justify-between text-on-surface-variant mb-1">
                      <span className="font-label-sm text-[11px]">Wind</span>
                      <span className="material-symbols-outlined text-[15px] text-surface-tint">airwave</span>
                    </div>
                    <span className="font-headline-sm text-sm text-on-surface font-bold">{activeCity.wind}</span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">{activeCity.windDesc}</span>
                  </div>

                  {/* Visibility */}
                  <div className="bg-surface-container-low rounded-xl p-2.5 flex flex-col">
                    <div className="flex items-center justify-between text-on-surface-variant mb-1">
                      <span className="font-label-sm text-[11px]">Visibility</span>
                      <span className="material-symbols-outlined text-[15px] text-surface-tint">visibility</span>
                    </div>
                    <span className="font-headline-sm text-sm text-on-surface font-bold">{activeCity.visibility}</span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">{activeCity.visibilityDesc}</span>
                  </div>

                  {/* Rain Chance */}
                  <div className="bg-surface-container-low rounded-xl p-2.5 flex flex-col">
                    <div className="flex items-center justify-between text-on-surface-variant mb-1">
                      <span className="font-label-sm text-[11px]">Precipitation</span>
                      <span className="material-symbols-outlined text-[15px] text-primary">umbrella</span>
                    </div>
                    <span className="font-headline-sm text-sm text-on-surface font-bold">{activeCity.precip}</span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">{activeCity.precipDesc}</span>
                  </div>
                </div>

                {/* Golden Hour & Natural Light Visual Tracker */}
                <div className="bg-surface-container rounded-xl p-space-sm flex items-center justify-between">
                  <div className="flex items-center gap-space-sm">
                    <div className="w-9 h-9 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary-container shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        wb_twilight
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-xs text-on-surface font-bold">Golden Hour Window</span>
                        <span className="font-label-sm text-[10px] bg-tertiary-fixed-dim text-tertiary-container px-1.5 py-0.5 rounded font-semibold">
                          {activeCity.goldenHourRemaining}
                        </span>
                      </div>
                      <span className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                        {activeCity.goldenHour} ({activeCity.sunTimes})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Photographer's ephemeris details"
                    className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">camera</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Official IMD Weather Alert Banner */}
          <section className="w-full px-gutter mt-space-md">
            <div className="w-full rounded-2xl bg-tertiary-fixed/30 p-space-sm flex items-start gap-space-sm border border-tertiary-fixed-dim/40 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-tertiary-fixed-dim text-tertiary-container flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  warning
                </span>
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-xs font-bold text-tertiary-container uppercase tracking-wide">
                    SIMULATED IMD WATCH (DEMO MODEL)
                  </span>
                  <span className="font-label-sm text-[11px] text-tertiary-container font-medium">Demo Stream</span>
                </div>
                <p className="font-body-sm text-xs text-on-surface leading-snug">
                  Isolated thundershowers expected across East Rajasthan late afternoon tomorrow. Intercity transit corridors remain unaffected.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/alerts')}
                  className="font-label-sm text-xs text-tertiary-container font-bold inline-flex items-center gap-1 mt-1 hover:underline text-left self-start"
                >
                  <span>View All 4 Weather Alerts & Notifications</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </section>

          {/* CRITICAL SECTION: Weather Impact on Your Trip */}
          <section className="w-full px-gutter mt-space-lg">
            <div className="flex items-center justify-between mb-space-sm">
              <h2 className="font-headline-sm text-base text-on-surface font-bold">
                Weather Impact on Your Trip
              </h2>
              {/* AI Live Pulse Badge */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-surface-tint opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                </span>
                <span className="font-label-sm text-[11px] font-bold tracking-tight">
                  Simulated Doppler Radar
                </span>
              </div>
            </div>

            {/* Impact Card 1: Rain Hazard at Nahargarh Fort */}
            <div className="w-full rounded-2xl bg-surface-container-lowest p-space-md shadow-sm mb-space-md relative overflow-hidden border border-surface-container">
              {/* Color Accenting Strip */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-tertiary-fixed-dim via-tertiary to-error" />

              <div className="flex flex-col gap-space-sm pt-1">
                {/* Status Row */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 bg-error-container text-on-error-container px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[16px]">thunderstorm</span>
                    <span className="font-label-sm text-xs font-bold">Tomorrow 02:00 PM – 04:30 PM</span>
                  </div>
                  <span className="font-label-sm text-xs text-error font-bold">75% Rain Probability</span>
                </div>

                {/* Scheduled Activity Detail */}
                <div>
                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    Scheduled Itinerary Stop
                  </span>
                  <h3 className="font-label-lg text-sm text-on-surface font-bold mt-0.5">
                    Nahargarh Fort Trek & Outdoor Sunset Viewpoint
                  </h3>
                  <p className="font-body-sm text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    Sun, Day 2 • Slot: 03:00 PM – 06:15 PM
                  </p>
                </div>

                {/* Reason & Safety Briefing */}
                <div className="p-space-sm rounded-xl bg-surface-container-low flex items-start gap-space-xs">
                  <span className="material-symbols-outlined text-[18px] text-tertiary-container mt-0.5 shrink-0">
                    report_problem
                  </span>
                  <p className="font-body-sm text-xs text-on-surface leading-relaxed">
                    <span className="font-bold text-tertiary-container">Terrain Alert:</span> Slick basalt stone paths, heavy fog reducing cliff panoramas, and slip hazards along outer ramparts during rain.
                  </p>
                </div>

                {/* AI Suggested Recommendation Component */}
                <div className="mt-1 p-space-sm rounded-xl bg-surface-container">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-label-sm text-xs text-primary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                      RoamWise AI Recommended Substitute
                    </span>
                    <span className="font-label-sm text-[10px] bg-surface-container-lowest px-2 py-0.5 rounded font-semibold text-on-surface">
                      Indoor & Dry
                    </span>
                  </div>

                  <div className="flex gap-space-sm items-center">
                    <img
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 shadow-sm"
                      alt="Albert Hall Museum & Anokhi Hand Block Textile galleries"
                      src="https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=400&q=80"
                    />
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-label-md text-xs text-on-surface font-bold truncate">
                        Albert Hall Museum & Anokhi Textile Gallery
                      </h4>
                      <p className="font-body-sm text-[11px] text-on-surface-variant line-clamp-2">
                        Hand block printing galleries followed by covered heritage cafe tasting. Zero weather exposure.
                      </p>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-space-sm">
                    {planBSwapped ? (
                      <div className="py-2.5 px-space-md rounded-xl bg-secondary-container text-primary font-label-md text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>Plan B Applied! (Day 2 Updated)</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleInstantPlanBSwap}
                        className="w-full py-2.5 px-space-md rounded-xl bg-primary text-on-primary font-label-md text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-transform hover:bg-primary-container"
                      >
                        <span className="material-symbols-outlined text-[18px]">alt_route</span>
                        <span>View Plan B (Instant Swap)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate('/trip/day/2')}
                      className="w-full py-2.5 px-space-md rounded-xl bg-surface-container-high text-on-surface font-label-md text-xs font-semibold hover:bg-surface-container-highest transition-colors flex items-center justify-center"
                    >
                      <span>Review Day 2 Schedule</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Card 2: Heat Advisory Today */}
            <div className="w-full rounded-2xl bg-surface-container-lowest p-space-md shadow-sm border border-surface-container">
              <div className="flex flex-col gap-space-xs">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 bg-tertiary-fixed text-tertiary-container px-2.5 py-1 rounded-full">
                    <span className="material-symbols-outlined text-[16px]">light_mode</span>
                    <span className="font-label-sm text-xs font-bold">Today 01:30 PM Peak</span>
                  </div>
                  <span className="font-label-sm text-xs text-tertiary-container font-bold">
                    31°C • UV Index 7 (High)
                  </span>
                </div>

                <div className="mt-1">
                  <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    Scheduled Itinerary Stop
                  </span>
                  <h3 className="font-label-lg text-sm text-on-surface font-bold mt-0.5">
                    City Palace Open Courtyards & Pritam Niwas Chowk
                  </h3>
                </div>

                <div className="p-space-sm rounded-xl bg-surface-container-low flex items-start gap-space-xs mt-1">
                  <span className="material-symbols-outlined text-[18px] text-surface-tint mt-0.5 shrink-0">
                    wb_shade
                  </span>
                  <p className="font-body-sm text-xs text-on-surface leading-relaxed">
                    <span className="font-bold text-surface-tint">Smart Micro-Adjustment:</span> Direct sun reflection off pink marble courtyards will be intense. We recommend reversing tour flow: explore the shaded Maharaja Sawai Man Singh II Armory & Textile galleries first, moving to outdoor courtyards after 03:15 PM.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setScheduleShifted(!scheduleShifted)}
                    className="font-label-md text-xs text-primary font-bold flex items-center gap-1 hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                    <span>{scheduleShifted ? 'Chronology Shifted ✓' : 'Auto-shift Tour Chronology'}</span>
                  </button>
                  <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
                    Saves 40 min direct sun exposure
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Today's Hourly Forecast Reel */}
          <section className="w-full px-gutter mt-space-lg">
            <div className="flex items-center justify-between mb-space-sm">
              <div>
                <h2 className="font-headline-sm text-base text-on-surface font-bold">
                  Hourly Day 1 Timeline
                </h2>
                <p className="font-body-sm text-xs text-on-surface-variant">
                  Microclimate forecast calibrated for {activeCity.name}
                </p>
              </div>
              <span className="font-label-sm text-[11px] text-primary font-bold">GMT +05:30</span>
            </div>

            {/* Horizontal Hourly Strip */}
            <div className="flex gap-2.5 overflow-x-auto no-scrollbar py-1">
              {/* 10 AM */}
              <div className="flex flex-col items-center p-3 rounded-2xl bg-surface-container-lowest shadow-sm flex-shrink-0 w-20 text-center border border-surface-container">
                <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">10 AM</span>
                <span className="material-symbols-outlined text-surface-tint text-[22px] my-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                  wb_sunny
                </span>
                <span className="font-label-lg text-sm text-on-surface font-bold">26°</span>
                <span className="font-label-sm text-[10px] text-on-surface-variant mt-1">Clear</span>
              </div>

              {/* 01 PM */}
              <div className="flex flex-col items-center p-3 rounded-2xl bg-surface-container-low flex-shrink-0 w-20 text-center border border-surface-container">
                <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">01 PM</span>
                <span className="material-symbols-outlined text-tertiary-container text-[22px] my-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                  wb_sunny
                </span>
                <span className="font-label-lg text-sm text-tertiary-container font-bold">30°</span>
                <span className="font-label-sm text-[10px] text-tertiary-container font-semibold mt-1">Sun Peak</span>
              </div>

              {/* 03 PM */}
              <div className="flex flex-col items-center p-3 rounded-2xl bg-surface-container-low flex-shrink-0 w-20 text-center border border-surface-container">
                <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">03 PM</span>
                <span className="material-symbols-outlined text-secondary text-[22px] my-1">cloud</span>
                <span className="font-label-lg text-sm text-on-surface font-bold">29°</span>
                <span className="font-label-sm text-[10px] text-on-surface-variant mt-1">Hazy</span>
              </div>

              {/* 06 PM */}
              <div className="flex flex-col items-center p-3 rounded-2xl bg-tertiary-fixed/40 flex-shrink-0 w-20 text-center border border-tertiary-fixed">
                <span className="font-label-sm text-[11px] text-tertiary-container font-semibold">06 PM</span>
                <span className="material-symbols-outlined text-tertiary-container text-[22px] my-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                  wb_twilight
                </span>
                <span className="font-label-lg text-sm text-tertiary-container font-bold">25°</span>
                <span className="font-label-sm text-[10px] text-tertiary-container font-semibold mt-1">Sunset</span>
              </div>

              {/* 09 PM */}
              <div className="flex flex-col items-center p-3 rounded-2xl bg-surface-container-lowest shadow-sm flex-shrink-0 w-20 text-center border border-surface-container">
                <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">09 PM</span>
                <span className="material-symbols-outlined text-surface-tint text-[22px] my-1" style={{ fontVariationSettings: "'FILL' 1" }}>
                  nights_stay
                </span>
                <span className="font-label-lg text-sm text-on-surface font-bold">23°</span>
                <span className="font-label-sm text-[10px] text-on-surface-variant mt-1">Breezy</span>
              </div>

              {/* 12 AM */}
              <div className="flex flex-col items-center p-3 rounded-2xl bg-surface-container-lowest shadow-sm flex-shrink-0 w-20 text-center border border-surface-container">
                <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">12 AM</span>
                <span className="material-symbols-outlined text-secondary text-[22px] my-1">bedtime</span>
                <span className="font-label-lg text-sm text-on-surface font-bold">22°</span>
                <span className="font-label-sm text-[10px] text-on-surface-variant mt-1">Crisp</span>
              </div>
            </div>
          </section>

          {/* 5-Day Circuit Forecast Strip */}
          <section className="w-full px-gutter mt-space-lg mb-space-md">
            <div className="flex items-center justify-between mb-space-sm">
              <h2 className="font-headline-sm text-base text-on-surface font-bold">
                5-Day Golden Triangle Outlook
              </h2>
              <span className="font-label-sm text-xs text-on-surface-variant">Synced with Stops</span>
            </div>

            <div className="w-full rounded-2xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container">
              {/* Day 1: Today Jaipur */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-space-sm min-w-[110px]">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
                    D1
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-xs font-bold text-on-surface">Today (Sat)</span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">Jaipur Sightseeing</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-surface-tint">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    partly_cloudy_day
                  </span>
                  <span className="font-body-sm text-xs text-on-surface font-medium">Partly Cloudy</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-xs text-on-surface font-bold">31°</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant">22°</span>
                </div>
              </div>

              <div className="h-px bg-surface-container-high w-full" />

              {/* Day 2: Sun Jaipur (Rain Warning) */}
              <div className="flex items-center justify-between py-1 bg-tertiary-fixed/20 -mx-space-md px-space-md rounded-xl">
                <div className="flex items-center gap-space-sm min-w-[110px]">
                  <div className="w-7 h-7 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center font-bold text-xs">
                    D2
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-xs font-bold text-on-surface">Sun Tomorrow</span>
                    <span className="font-label-sm text-[10px] text-tertiary-container font-semibold">
                      Rain Alert • Nahargarh
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-error">
                  <span className="material-symbols-outlined text-[18px]">rainy</span>
                  <span className="font-body-sm text-xs text-error font-bold">Showers (75%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-xs text-on-surface font-bold">28°</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant">21°</span>
                </div>
              </div>

              <div className="h-px bg-surface-container-high w-full" />

              {/* Day 3: Mon Transit to Delhi */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-space-sm min-w-[110px]">
                  <div className="w-7 h-7 rounded-full bg-secondary-container text-primary flex items-center justify-center font-bold text-xs">
                    D3
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-xs font-bold text-on-surface">Mon</span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">Transit to Delhi</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-surface-tint">
                  <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
                  <span className="font-body-sm text-xs text-on-surface font-medium">Valley Mist / Clear</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-xs text-on-surface font-bold">30°</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant">22°</span>
                </div>
              </div>

              <div className="h-px bg-surface-container-high w-full" />

              {/* Day 4: Tue Delhi Heritage */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-space-sm min-w-[110px]">
                  <div className="w-7 h-7 rounded-full bg-secondary-container text-primary flex items-center justify-center font-bold text-xs">
                    D4
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-xs font-bold text-on-surface">Tue</span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">Delhi Heritage</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-surface-tint">
                  <span className="material-symbols-outlined text-[18px]">wb_sunny</span>
                  <span className="font-body-sm text-xs text-on-surface font-medium">Sunny & Warm</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-xs text-on-surface font-bold">32°</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant">23°</span>
                </div>
              </div>

              <div className="h-px bg-surface-container-high w-full" />

              {/* Day 5: Wed Agra Express & Taj Sunset */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-space-sm min-w-[110px]">
                  <div className="w-7 h-7 rounded-full bg-secondary-container text-primary flex items-center justify-center font-bold text-xs">
                    D5
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-xs font-bold text-on-surface">Wed</span>
                    <span className="font-label-sm text-[10px] text-on-surface-variant">Agra & Taj Sunset</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-tertiary-container">
                  <span className="material-symbols-outlined text-[18px]">wb_twilight</span>
                  <span className="font-body-sm text-xs text-on-surface font-medium">Optimal Golden Hour</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-xs text-on-surface font-bold">29°</span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant">20°</span>
                </div>
              </div>
            </div>
          </section>

          {/* Simulation Designation Footnote */}
          <div className="px-gutter pb-4">
            <div className="p-3 rounded-xl bg-surface-container text-center text-on-surface-variant text-[11px] leading-relaxed border border-surface-container-high">
              <span className="font-semibold text-primary">Radar Telemetry:</span> Simulated IMD Sentinel Doppler Radar Stream for offline demo preview.
            </div>
          </div>
        </div>
      </main>

      <PlanBBottomSheet />
      <BottomNav />
    </div>
  );
};
