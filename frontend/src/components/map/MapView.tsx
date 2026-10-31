import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { StopCard } from './StopCard';

export const MapView: React.FC = () => {
  const { state, setActiveDay } = useTrip();
  const currentDay = state.days.find((d) => d.dayNumber === state.activeDayNumber) || state.days[0];
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const stops = currentDay.activities;
  const activeStop = stops[selectedStopIndex] || stops[0];

  const handleOpenInMaps = () => {
    setToastMessage(`Opening ${activeStop.title} in native maps app... (Illustrative data)`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="flex flex-col w-full pb-10">
      {/* Day Selector Pill Carousel */}
      <section className="flex items-center gap-space-sm overflow-x-auto no-scrollbar py-2 -mx-margin px-margin border-b border-surface-container/60 bg-surface">
        {state.days.map((day) => {
          const isSelected = state.activeDayNumber === day.dayNumber;
          return (
            <button
              key={day.dayNumber}
              type="button"
              onClick={() => {
                setActiveDay(day.dayNumber);
                setSelectedStopIndex(0);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-label text-xs shrink-0 transition-all active:scale-95 ${
                isSelected
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">calendar_today</span>
              <span>Day {day.dayNumber}</span>
            </button>
          );
        })}
      </section>

      {/* Illustrative Interactive Map Canvas */}
      <div className="relative w-full h-[360px] overflow-hidden bg-surface-container-high rounded-2xl my-space-md border border-surface-container shadow-inner">
        {/* Background Stylized Map Pattern */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center filter saturate-75 opacity-90"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/30 via-transparent to-surface/70 pointer-events-none" />

        {/* Dynamic Route SVG Polyline */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 390 360"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="jaipurRouteGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#006765" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#008280" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#40c2fd" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Underlay route shadow */}
          <path
            d="M 60 70 Q 110 130, 160 170 T 240 230 T 310 290"
            fill="none"
            stroke="#bcc9c8"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />

          {/* Glowing Animated Dash Route */}
          <path
            d="M 60 70 Q 110 130, 160 170 T 240 230 T 310 290"
            fill="none"
            stroke="url(#jaipurRouteGlow)"
            strokeWidth="5"
            strokeDasharray="9 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Pin Markers for Stops */}
        {stops.map((stop, idx) => {
          // Approximate relative coordinate spread
          const positions = [
            { top: '65px', left: '48px' },
            { top: '150px', left: '145px' },
            { top: '215px', left: '225px' },
            { top: '280px', left: '295px' }
          ];
          const pos = positions[idx % positions.length];
          const isSelected = selectedStopIndex === idx;

          return (
            <div
              key={stop.id}
              onClick={() => setSelectedStopIndex(idx)}
              style={{ top: pos.top, left: pos.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group z-20"
            >
              {/* Floating Pill Label */}
              <div
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full shadow-md text-xs font-label mb-1 transition-all ${
                  isSelected
                    ? 'bg-primary text-on-primary ring-2 ring-primary-container scale-105 font-bold animate-bounce'
                    : 'bg-surface-container-lowest text-on-surface border border-surface-container group-hover:scale-105'
                }`}
              >
                {stop.isVisited ? (
                  <span className="material-symbols-outlined text-[14px] text-primary">check_circle</span>
                ) : (
                  <span className="font-bold">{idx + 1}</span>
                )}
                <span className="truncate max-w-[90px]">{stop.title}</span>
              </div>

              {/* Pin Icon Dot */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                  isSelected
                    ? 'bg-primary text-on-primary ring-4 ring-primary/30 scale-110'
                    : stop.isVisited
                    ? 'bg-surface-container-high text-on-surface-variant'
                    : 'bg-secondary text-on-secondary'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {stop.isVisited ? 'check' : 'place'}
                </span>
              </div>
            </div>
          );
        })}

        {/* Top Floating Map Info Pill */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-30">
          <div className="pointer-events-auto flex items-center gap-1.5 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-xs font-label text-on-surface border border-surface-container/60">
            <span className="material-symbols-outlined text-primary text-[16px]">navigation</span>
            <span>Illustrative Route • Jaipur Transit</span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedStopIndex(0)}
            aria-label="Recenter map"
            className="pointer-events-auto w-8 h-8 rounded-full bg-surface-container-lowest/95 backdrop-blur-md flex items-center justify-center text-on-surface shadow-md active:scale-95 transition-transform border border-surface-container"
          >
            <span className="material-symbols-outlined text-[18px]">my_location</span>
          </button>
        </div>

        {/* Bottom Floating Maps Action */}
        <div className="absolute bottom-3 right-3 pointer-events-auto z-30">
          <button
            type="button"
            onClick={handleOpenInMaps}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-container text-on-primary px-3.5 py-1.5 rounded-full shadow-lg font-label text-xs font-semibold active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>Open in Maps</span>
          </button>
        </div>
      </div>

      {/* Toast feedback */}
      {toastMessage && (
        <div className="mb-space-md p-3 rounded-xl bg-surface-container-high text-on-surface font-body text-xs flex items-center gap-2 border border-primary/20 animate-fadeIn">
          <span className="material-symbols-outlined text-primary text-[18px]">info</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Route Distance & Travel Time Header Card */}
      <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md shadow-md border border-surface-container/60 flex flex-col gap-2 mb-space-md">
        <div className="flex items-center justify-between">
          <span className="font-label text-xs text-primary uppercase tracking-wider font-bold">
            Day 0{currentDay.dayNumber} Route Leg
          </span>
          <span className="bg-surface-container text-on-secondary-container px-2.5 py-0.5 rounded-full font-label text-xs">
            {currentDay.activities.length} Stops Planned
          </span>
        </div>

        <h3 className="font-heading text-base font-bold text-on-surface">
          {currentDay.theme}
        </h3>
        <p className="font-body text-xs text-on-surface-variant">
          Est. total route: 9.4 km • ~40 mins transit & walking in Jaipur
        </p>

        {/* Selected stop highlight card */}
        <div className="mt-1 p-3 rounded-xl bg-surface-container-low border border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">near_me</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label text-[10px] text-on-surface-variant uppercase font-semibold">
                Focused Stop
              </span>
              <span className="font-heading text-sm font-semibold text-on-surface truncate">
                {activeStop.title}
              </span>
              <span className="font-body text-xs text-on-surface-variant">
                {activeStop.timeSlot} • {activeStop.duration}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Stops List */}
      <div className="flex flex-col gap-2">
        <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1">
          Waypoints Sequence
        </span>
        {stops.map((stop, idx) => (
          <StopCard
            key={stop.id}
            activity={stop}
            index={idx}
            isSelected={selectedStopIndex === idx}
            onSelect={() => setSelectedStopIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
};
