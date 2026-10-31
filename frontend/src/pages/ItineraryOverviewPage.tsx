import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { DayCard } from '../components/trip/DayCard';
import { PlanBBottomSheet } from '../components/plan-b/PlanBBottomSheet';

export const ItineraryOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useTrip();
  const [showAllDays, setShowAllDays] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const totalDays = state.days.length;
  // Progressive disclosure: show 3 days initially if total > 3
  const visibleDays = showAllDays || totalDays <= 3 ? state.days : state.days.slice(0, 3);
  const remainingCount = totalDays - visibleDays.length;

  const handleExportCalendar = () => {
    setToastMessage('Itinerary exported to Google Calendar & Apple iCal format (.ics)!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Header title="Trip Overview" />

      <main className="flex-1 w-full max-w-xl mx-auto pt-20 pb-28 px-margin flex flex-col gap-space-lg">
        {/* Trip Header Overview Card */}
        <section className="relative w-full bg-surface-container-lowest rounded-[22px] p-space-md shadow-[0_8px_24px_-4px_rgba(15,23,42,0.06)] border border-surface-container/60 overflow-hidden">
          <div className="absolute -right-12 -top-12 w-44 h-44 bg-secondary-fixed-dim/20 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col gap-space-sm relative z-10">
            {/* Top Badge Row */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 bg-surface-container px-2.5 py-1 rounded-full font-label text-xs text-on-surface-variant font-medium">
                <span className="material-symbols-outlined text-[14px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  group
                </span>
                <span>{state.config.travelerType} • {state.config.pace} Pace</span>
              </span>

              <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed px-2.5 py-1 rounded-full font-label text-xs font-bold shadow-sm">
                <span className="material-symbols-outlined text-[14px]">wb_sunny</span>
                <span>28°C Sunny • 10% Rain Risk</span>
              </span>
            </div>

            {/* Trip Title & Subtitle */}
            <div className="flex flex-col mt-0.5">
              <h1 className="font-heading text-xl font-bold text-on-surface tracking-tight leading-snug">
                {state.config.destination.split(',')[0]} Royal Cultural Expedition
              </h1>
              <div className="flex items-center gap-2 text-on-surface-variant font-label text-xs mt-1">
                <span className="material-symbols-outlined text-[15px] text-secondary">calendar_today</span>
                <span>Nov 14 – 18 (5 Days)</span>
                <span className="text-outline">•</span>
                <span className="text-primary font-semibold">AI Adaptive</span>
              </div>
            </div>

            {/* Destination Photo Snippet */}
            <div className="relative w-full h-32 rounded-xl overflow-hidden mt-1 shadow-inner bg-surface-container">
              <img
                src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80"
                alt="Amer Fort, Jaipur"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/20 to-transparent flex items-end p-2.5">
                <span className="text-inverse-on-surface font-label text-xs font-medium flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-secondary-fixed-dim">
                    location_on
                  </span>
                  <span>Amer & Pink City Heritage Arcades</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Day Jump Carousel */}
        <section className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-margin px-margin">
          {state.days.map((day) => (
            <button
              key={day.dayNumber}
              type="button"
              onClick={() => navigate(`/trip/day/${day.dayNumber}`)}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label text-xs shrink-0 transition-all active:scale-95 border border-surface-container-high/60"
            >
              <span className="font-semibold">Day {day.dayNumber}</span>
              <span className="text-on-surface-variant text-[11px]">({day.dayOfWeek.slice(0, 3)})</span>
            </button>
          ))}
        </section>

        {/* Toast notification feedback */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-surface-container-high text-on-surface font-body text-xs flex items-center gap-2 border border-primary/20 animate-fadeIn">
            <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Progressive Itinerary Days Feed */}
        <div className="flex flex-col gap-space-md">
          {visibleDays.map((day) => (
            <DayCard key={day.dayNumber} day={day} />
          ))}
        </div>

        {/* Progressive Load Button: Show Remaining Days */}
        {remainingCount > 0 ? (
          <button
            type="button"
            onClick={() => setShowAllDays(true)}
            className="w-full py-3.5 px-space-md bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-2xl flex items-center justify-center gap-2 font-label text-xs font-bold active:scale-[0.99] transition-all shadow-sm border border-surface-container"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary">expand_more</span>
            <span>
              Show remaining {remainingCount} days ({state.days[3]?.dateStr} – {state.days[4]?.dateStr})
            </span>
          </button>
        ) : totalDays > 3 ? (
          <button
            type="button"
            onClick={() => setShowAllDays(false)}
            className="w-full py-2.5 px-space-md bg-surface-container-low hover:bg-surface-container text-on-surface-variant rounded-2xl flex items-center justify-center gap-1 font-label text-xs active:scale-[0.99] transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">expand_less</span>
            <span>Collapse to Days 1–3</span>
          </button>
        ) : null}

        {/* Quick Actions Bar (Export & Edit) */}
        <div className="flex items-center gap-space-sm pt-1">
          <button
            type="button"
            onClick={handleExportCalendar}
            className="flex-1 h-12 bg-primary hover:bg-primary-container text-on-primary rounded-xl font-label text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
            <span>Export to Calendar</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/plan')}
            className="flex-1 h-12 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-xl font-label text-xs font-semibold flex items-center justify-center gap-1.5 border border-surface-container shadow-sm active:scale-98 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-secondary">tune</span>
            <span>Edit Preferences</span>
          </button>
        </div>
      </main>

      {/* Plan B Modal */}
      <PlanBBottomSheet />

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
};
