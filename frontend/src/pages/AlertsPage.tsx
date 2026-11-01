import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';

type FilterType = 'all' | 'disruption' | 'official' | 'favourable';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const { applyPlanB, clearReadAlerts } = useTrip();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [planBActivated, setPlanBActivated] = useState(false);
  const [card1Acknowledged, setCard1Acknowledged] = useState(false);
  const [scheduleReordered, setScheduleReordered] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);
  const [photoBookmarked, setPhotoBookmarked] = useState(false);

  const handleActivatePlanB = () => {
    applyPlanB(2, 'act-2-3');
    setPlanBActivated(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface antialiased">
      <Header title="Weather Notifications" showBack={true} />

      <main className="flex-1 flex flex-col relative w-full pt-16 pb-28 max-w-xl mx-auto">
        <div className="flex flex-col w-full">
          {/* Interactive Filter Tabs */}
          <div className="px-gutter pt-space-xs pb-space-sm">
            <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar py-space-xs">
              <button
                type="button"
                onClick={() => setActiveFilter('all')}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-xs font-semibold shadow-sm transition-all ${
                  activeFilter === 'all'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All Alerts (4)
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('disruption')}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-xs font-semibold transition-all ${
                  activeFilter === 'disruption'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Trip Disruptions (2)
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('official')}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-xs font-semibold transition-all ${
                  activeFilter === 'official'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Simulated IMD (1)
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('favourable')}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full font-label-md text-xs font-semibold transition-all ${
                  activeFilter === 'favourable'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Favourable (1)
              </button>
            </div>
          </div>

          {/* Live Pulse Status Subhead */}
          <div className="px-gutter mb-space-sm">
            <div className="flex items-center justify-between px-space-md py-2.5 rounded-xl bg-surface-container-low text-on-surface border border-surface-container">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error" />
                </span>
                <span className="font-label-sm text-[11px] tracking-wide uppercase text-on-surface-variant font-semibold truncate">
                  IMD Weather Radar Stream • Active Sync
                </span>
              </div>
              <button
                type="button"
                onClick={clearReadAlerts}
                className="flex items-center gap-1 font-label-sm text-xs text-primary font-semibold hover:opacity-80 transition-opacity"
              >
                <span className="material-symbols-outlined text-[16px]">done_all</span>
                <span>Clear Read</span>
              </button>
            </div>
          </div>

          {/* Alert Stream Container */}
          <div className="px-gutter flex flex-col gap-space-md pb-space-lg">
            {/* NOTIFICATION CARD 1: SEVERE RED ALERT (Official IMD Advisory + Disruption) */}
            {(activeFilter === 'all' || activeFilter === 'disruption' || activeFilter === 'official') && !card1Acknowledged && (
              <div className="alert-card group relative bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_-2px_rgba(23,63,53,0.08)] overflow-hidden transition-all duration-300 border border-surface-container">
                <div className="w-full h-1.5 bg-error" />
                <div className="p-space-md flex flex-col gap-space-sm">
                  {/* Header & Classification Badges */}
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label-sm text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        shield
                      </span>
                      <span>OFFICIAL IMD WEATHER ADVISORY</span>
                    </div>
                    <span className="font-label-sm text-xs text-error font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">crisis_alert</span>
                      Severe Risk
                    </span>
                  </div>

                  {/* Affected Trip Activity Context */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-xs font-medium">
                      <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                      <span>Jaipur, Rajasthan • Tomorrow, 02:00 PM – 05:00 PM</span>
                    </div>
                    <h2 className="font-headline-sm text-base text-on-surface font-bold">
                      Nahargarh Fort Outdoor Trek & Sunset Terrace
                    </h2>
                  </div>

                  {/* Visual Hero Thumbnail */}
                  <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-sm">
                    <img
                      className="w-full h-full object-cover"
                      alt="Nahargarh ridge fort overlooking Jaipur under dark convective storm clouds"
                      src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-on-primary font-label-sm text-xs">
                      <span className="flex items-center gap-1 bg-surface-container-lowest/30 backdrop-blur-md px-2 py-0.5 rounded-lg font-medium">
                        <span className="material-symbols-outlined text-[14px]">air</span>
                        45 km/h Squalls
                      </span>
                      <span className="bg-error px-2 py-0.5 rounded-lg font-bold text-on-error">
                        Ramparts Closing
                      </span>
                    </div>
                  </div>

                  {/* Meteorological Report Body */}
                  <div className="p-space-sm rounded-xl bg-error-container/30 text-on-surface flex flex-col gap-1 border border-error/20">
                    <p className="font-body-md text-xs text-on-surface leading-relaxed">
                      Heavy convective showers with squalls (45 km/h wind gusts) detected moving towards Amber-Nahargarh ridge. Open ramparts closing early.
                    </p>
                  </div>

                  {/* RoamAI Recommended Plan B Engine */}
                  <div className="p-space-sm rounded-xl bg-surface-container-low text-on-surface flex flex-col gap-1.5 border border-surface-container">
                    <div className="flex items-center gap-1.5 text-primary-container font-label-sm text-xs uppercase font-bold tracking-wide">
                      <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        auto_fix_high
                      </span>
                      RoamWise Adaptive Action
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                      Cancel open-air ridge walk. Auto-reroute to Albert Hall Museum & Indoor Blue Pottery Workshop.
                    </p>
                  </div>

                  {/* Interactive Direct Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    {planBActivated ? (
                      <button
                        type="button"
                        onClick={() => navigate('/trip/day/2')}
                        className="w-full py-3 px-space-md rounded-xl bg-secondary-container text-primary font-label-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                        <span>Plan B Activated! Review Day 2</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleActivatePlanB}
                        className="w-full py-3 px-space-md rounded-xl bg-primary text-on-primary font-label-lg text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all hover:bg-primary-container"
                      >
                        <span className="material-symbols-outlined text-[18px]">alt_route</span>
                        <span>Activate Plan B Now</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setCard1Acknowledged(true)}
                      className="w-full py-3 px-space-md rounded-xl bg-surface-container-high text-on-surface font-label-lg text-xs font-semibold hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[18px]">done_all</span>
                      <span>Acknowledge</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATION CARD 2: AMBER ADVISORY (RoamAI Recommendation + Heat Peak) */}
            {(activeFilter === 'all' || activeFilter === 'disruption') && (
              <div className="alert-card group relative bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_-2px_rgba(23,63,53,0.05)] overflow-hidden transition-all duration-300 border border-surface-container">
                <div className="w-full h-1.5 bg-tertiary-fixed-dim" />
                <div className="p-space-md flex flex-col gap-space-sm">
                  {/* Badge */}
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        lightbulb
                      </span>
                      <span>ROAMAI ADAPTIVE RECOMMENDATION</span>
                    </div>
                    <span className="font-label-sm text-xs text-on-tertiary-container font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
                      Heat & UV Peak
                    </span>
                  </div>

                  {/* Context & Title */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-xs font-medium">
                      <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                      <span>Jaipur Old Quarter • Today, 01:00 PM – 03:00 PM</span>
                    </div>
                    <h2 className="font-headline-sm text-base text-on-surface font-bold">
                      Badi Chaupar & Hawa Mahal Street Exploration
                    </h2>
                  </div>

                  {/* Description */}
                  <div className="p-space-sm rounded-xl bg-surface-container-low text-on-surface flex flex-col gap-1 border border-surface-container">
                    <p className="font-body-md text-xs text-on-surface leading-relaxed">
                      Surface temperature reaching 32°C with high solar radiation. Open street bazaar has limited canopy shade during midday.
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-on-surface-variant font-label-sm text-[10px] font-semibold">
                      <span className="px-2 py-0.5 rounded bg-surface-container-highest">UV Index 8.4 (Very High)</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-highest">Canopy Shade: Low</span>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="p-space-sm rounded-xl bg-secondary-container/40 text-on-surface flex flex-col gap-1 border border-secondary-container">
                    <div className="flex items-center gap-1.5 text-on-secondary-container font-label-sm text-xs uppercase font-bold">
                      <span className="material-symbols-outlined text-[16px]">schedule_send</span>
                      Smart Reschedule Opportunity
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                      RoamWise suggests shifting Johari Bazaar street walk to 05:15 PM and visiting air-cooled Central Museum galleries now.
                    </p>
                  </div>

                  {/* Direct Action */}
                  <button
                    type="button"
                    onClick={() => setScheduleReordered(!scheduleReordered)}
                    className="w-full py-3 px-space-md rounded-xl bg-secondary-container text-primary font-label-lg text-xs font-bold hover:bg-secondary-fixed transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">update</span>
                    <span>
                      {scheduleReordered
                        ? 'Schedule Reordered (Saved 40m Heat Exposure) ✓'
                        : 'Reorder Schedule (Save 40m Heat Exposure)'}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* NOTIFICATION CARD 3: AMBER ADVISORY (Transit Delay Intelligence) */}
            {(activeFilter === 'all' || activeFilter === 'disruption') && (
              <div className="alert-card group relative bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_-2px_rgba(23,63,53,0.05)] overflow-hidden transition-all duration-300 border border-surface-container">
                <div className="w-full h-1.5 bg-secondary" />
                <div className="p-space-md flex flex-col gap-space-sm">
                  {/* Badge */}
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-[15px]">departure_board</span>
                      <span>ROAMAI TRANSIT INTELLIGENCE</span>
                    </div>
                    <span className="font-label-sm text-xs text-secondary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      +25m Road Delay
                    </span>
                  </div>

                  {/* Context & Title */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-xs font-medium">
                      <span className="material-symbols-outlined text-[16px] text-primary">route</span>
                      <span>Intercity NH48 Corridor (Jaipur ➔ Delhi) • Day 3 (Mon), 08:00 AM</span>
                    </div>
                    <h2 className="font-headline-sm text-base text-on-surface font-bold">
                      Vande Bharat Express Departure / Highway Connection
                    </h2>
                  </div>

                  {/* Inline Visual Route Sparkline / Status Track */}
                  <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col gap-2 border border-surface-container">
                    <div className="flex items-center justify-between text-xs font-label-sm text-on-surface-variant font-medium">
                      <span>Jaipur Junction</span>
                      <span className="text-error font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">foggy</span>
                        Aravali Pass Mist
                      </span>
                      <span>New Delhi Central</span>
                    </div>
                    <div className="relative w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-2/5 bg-secondary rounded-full" />
                      <div className="absolute left-[38%] top-0 bottom-0 w-1/4 bg-tertiary-fixed-dim rounded-full animate-pulse" />
                    </div>
                    <p className="font-body-sm text-xs text-on-surface leading-relaxed">
                      Morning valley mist and intermittent wet tarmac forecast along Aravali pass. Road transit will encounter +25 min delay.
                    </p>
                  </div>

                  {/* Transit Guidance Note */}
                  <div className="px-space-sm py-2 rounded-xl bg-surface-container text-on-surface font-body-sm text-xs flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-primary-container">train</span>
                    <span>Rail journey (Vande Bharat) unaffected. Advance cab by 30 mins if taking road.</span>
                  </div>

                  {/* Direct Action */}
                  <button
                    type="button"
                    onClick={() => setReminderSet(!reminderSet)}
                    className="w-full py-3 px-space-md rounded-xl bg-surface-container-high text-on-surface font-label-lg text-xs font-semibold hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">alarm_add</span>
                    <span>{reminderSet ? 'Departure Reminder Set for 07:30 AM ✓' : 'Set Departure Reminder (+30m)'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* NOTIFICATION CARD 4: GREEN FAVORABLE (Golden Photography Window) */}
            {(activeFilter === 'all' || activeFilter === 'favourable') && (
              <div className="alert-card group relative bg-surface-container-lowest rounded-2xl shadow-[0_4px_20px_-2px_rgba(23,63,53,0.05)] overflow-hidden transition-all duration-300 border border-surface-container">
                <div className="w-full h-1.5 bg-primary-fixed-dim" />
                <div className="p-space-md flex flex-col gap-space-sm">
                  {/* Badge */}
                  <div className="flex items-start justify-between gap-space-xs">
                    <div className="flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-[11px] font-semibold">
                      <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      <span>ROAMAI OPTIMAL CONDITIONS</span>
                    </div>
                    <span className="font-label-sm text-xs text-primary font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">sunny</span>
                      100% Prime
                    </span>
                  </div>

                  {/* Context & Title */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-on-surface-variant font-label-md text-xs font-medium">
                      <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                      <span>Agra, Taj Mahal Corridor • Day 6 (Thu), 06:15 AM – 08:30 AM</span>
                    </div>
                    <h2 className="font-headline-sm text-base text-on-surface font-bold">
                      Sunrise Taj Mahal Reflection Tour
                    </h2>
                  </div>

                  {/* Photographic Preview Card */}
                  <div className="relative w-full h-36 rounded-xl overflow-hidden shadow-sm">
                    <img
                      className="w-full h-full object-cover"
                      alt="Sunrise reflection of the white marble Taj Mahal in quiet water pavilion garden pools"
                      src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-on-primary font-label-sm text-xs">
                      <span className="bg-surface-container-lowest/30 backdrop-blur-md px-2 py-0.5 rounded-lg font-semibold">
                        AQI 58 • 98% Visibility
                      </span>
                      <span className="bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-lg font-bold">
                        Golden Light Window
                      </span>
                    </div>
                  </div>

                  {/* Meteorological Report Body */}
                  <div className="p-space-sm rounded-xl bg-surface-container-low text-on-surface flex flex-col gap-1 border border-surface-container">
                    <p className="font-body-md text-xs text-on-surface leading-relaxed">
                      Pristine autumnal atmosphere over Yamuna basin. Zero haze or river mist expected during first two hours of daylight.
                    </p>
                  </div>

                  {/* RoamAI Photographic Guidance */}
                  <div className="p-space-sm rounded-xl bg-surface-container text-on-surface flex flex-col gap-1 border border-surface-container-high">
                    <div className="flex items-center gap-1.5 text-primary font-label-sm text-xs uppercase font-bold">
                      <span className="material-symbols-outlined text-[16px]">camera</span>
                      Photographic Guidance
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                      Unrestricted photography illumination. Ideal angle from Mehtab Bagh reflection pond between 06:25 AM and 07:10 AM.
                    </p>
                  </div>

                  {/* Direct Action */}
                  <button
                    type="button"
                    onClick={() => setPhotoBookmarked(!photoBookmarked)}
                    className="w-full py-3 px-space-md rounded-xl bg-primary text-on-primary font-label-lg text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm hover:bg-primary-container"
                  >
                    <span className="material-symbols-outlined text-[18px]">bookmark</span>
                    <span>{photoBookmarked ? 'Bookmarked for Day 6 Sunrise ✓' : 'Bookmark Photography Window'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
