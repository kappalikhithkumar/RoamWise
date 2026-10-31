import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { StopCard } from './StopCard';

export const MapView: React.FC = () => {
  const { state, setActiveDay } = useTrip();
  const currentDay = state.days.find((d) => d.dayNumber === state.activeDayNumber) || state.days[0];
  const [selectedStopIndex, setSelectedStopIndex] = useState(0);

  const stops = currentDay ? currentDay.activities : [];
  const activeStop = stops[selectedStopIndex] || stops[0] || {
    id: 'placeholder',
    title: 'Heritage Stop',
    location: state.config.destination,
    timeSlot: '10:00 AM',
    duration: '2h'
  };

  const destClean = state.config.destination.split(',')[0].split('➔')[0].trim();
  const estDistanceKm = (stops.length * 2.8).toFixed(1);
  const estDurationMins = stops.length * 22;

  const handleOpenInMaps = () => {
    const locQuery = encodeURIComponent(`${activeStop.title}, ${activeStop.location || destClean}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${locQuery}`, '_blank');
  };

  const handleGetDirections = () => {
    const locQuery = encodeURIComponent(`${activeStop.title}, ${activeStop.location || destClean}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${locQuery}`, '_blank');
  };

  // Generate waypoint coordinates across SVG canvas
  const getStopPosition = (idx: number) => {
    const positions = [
      { top: '22%', left: '24%' },
      { top: '48%', left: '52%' },
      { top: '74%', left: '32%' },
      { top: '35%', left: '76%' },
      { top: '80%', left: '78%' }
    ];
    return positions[idx % positions.length];
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
                  ? 'bg-primary text-white shadow-sm font-semibold'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">calendar_today</span>
              <span>Day {day.dayNumber}</span>
            </button>
          );
        })}
      </section>

      {/* Interactive Map Canvas with OpenStreetMap Attribution */}
      <div className="relative w-full h-[360px] overflow-hidden bg-surface-container-high rounded-2xl my-space-md border border-surface-container shadow-inner">
        {/* Stylized Topographic Map Background */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center filter saturate-75 opacity-90"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-surface/20 via-transparent to-surface/60 pointer-events-none" />

        {/* Dynamic Route SVG Polyline */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 390 360"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#173F35" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#2D6A4F" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#E5A45B" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Underlay route shadow */}
          <path
            d="M 85 80 Q 180 160, 120 250 T 280 130 T 290 280"
            fill="none"
            stroke="#bcc9c8"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />

          {/* Animated Route Line */}
          <path
            d="M 85 80 Q 180 160, 120 250 T 280 130 T 290 280"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="5"
            strokeDasharray="9 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Pin Markers for Stops */}
        {stops.map((stop, idx) => {
          const pos = getStopPosition(idx);
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
                    ? 'bg-primary text-white ring-2 ring-amber scale-105 font-bold animate-bounce'
                    : 'bg-white text-on-surface border border-surface-container group-hover:scale-105'
                }`}
              >
                {stop.isVisited ? (
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                ) : (
                  <span className="font-bold">{idx + 1}</span>
                )}
                <span className="truncate max-w-[90px]">{stop.title}</span>
              </div>

              {/* Pin Icon Dot */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                  isSelected
                    ? 'bg-primary text-white ring-4 ring-primary/30 scale-110'
                    : stop.isVisited
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber text-primary'
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
          <div className="pointer-events-auto flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-sm text-xs font-label text-primary border border-surface-container/60">
            <span className="material-symbols-outlined text-primary text-[16px]">navigation</span>
            <span>{destClean} • Day {currentDay?.dayNumber || 1} Circuit</span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedStopIndex(0)}
            aria-label="Recenter map"
            className="pointer-events-auto w-8 h-8 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center text-primary shadow-md active:scale-95 transition-transform border border-surface-container"
          >
            <span className="material-symbols-outlined text-[18px]">my_location</span>
          </button>
        </div>

        {/* Bottom Floating Navigation Actions */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-auto z-30">
          <button
            type="button"
            onClick={handleGetDirections}
            className="flex items-center gap-1 bg-white hover:bg-stone-50 text-primary border border-[#D8E9DD] px-3 py-1.5 rounded-full shadow-md font-label text-xs font-semibold active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">directions</span>
            <span>Directions</span>
          </button>

          <button
            type="button"
            onClick={handleOpenInMaps}
            className="flex items-center gap-1 bg-primary hover:bg-[#204E43] text-white px-3.5 py-1.5 rounded-full shadow-md font-label text-xs font-semibold active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>Open in Maps</span>
          </button>
        </div>
      </div>

      {/* Map Provider Attribution & Fallback Notice */}
      <div className="flex items-center justify-between text-[11px] text-[#414845] px-1 mb-4">
        <span>Map data & spatial routing © OpenStreetMap contributors</span>
        <span className="text-[10px] text-stone-500">Waypoints transit estimate</span>
      </div>

      {/* Route Distance & Travel Time Header Card */}
      <div className="w-full bg-white rounded-2xl p-space-md shadow-sm border border-[#25332E]/10 flex flex-col gap-2 mb-space-md">
        <div className="flex items-center justify-between">
          <span className="font-label text-xs text-primary uppercase tracking-wider font-bold">
            Day 0{currentDay?.dayNumber || 1} Route Leg
          </span>
          <span className="bg-[#EDFDF5] text-primary font-bold px-2.5 py-0.5 rounded-full font-label text-xs">
            {stops.length} Stops Planned
          </span>
        </div>

        <h3 className="font-heading text-base font-bold text-primary">
          {currentDay?.theme || `${destClean} Expedition`}
        </h3>
        <p className="font-body text-xs text-[#414845]">
          Est. total route: ~{estDistanceKm} km • ~{estDurationMins} mins transit & walking in {destClean}
        </p>

        {/* Selected stop highlight card */}
        <div className="mt-1 p-3 rounded-xl bg-[#F7F5EF] border border-[#25332E]/10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px]">near_me</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label text-[10px] text-[#414845] uppercase font-semibold">
                Focused Stop #{selectedStopIndex + 1}
              </span>
              <span className="font-heading text-sm font-semibold text-primary truncate">
                {activeStop.title}
              </span>
              <span className="font-body text-xs text-[#414845]">
                {activeStop.timeSlot} • {activeStop.duration} • {activeStop.location || destClean}
              </span>
            </div>
          </div>

          <button
            onClick={handleGetDirections}
            className="px-2.5 py-1 rounded-lg bg-white border border-[#25332E]/10 text-primary text-xs font-semibold hover:bg-stone-50 transition"
          >
            Go
          </button>
        </div>
      </div>

      {/* Ordered Stops List */}
      <div className="flex flex-col gap-2">
        <span className="font-label text-xs text-primary uppercase tracking-wider font-bold mb-1">
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
