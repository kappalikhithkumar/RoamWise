import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';

export const ItineraryOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, toggleVisited } = useTrip();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');

  if (!state.hasActiveTrip || state.days.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-on-surface pb-24">
        <Header title="Itinerary Dashboard" />
        <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-24 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#EDFDF5] border border-[#D8E9DD] flex items-center justify-center text-primary mb-4 shadow-sm">
            <span className="material-symbols-outlined text-3xl">route</span>
          </div>
          <h2 className="text-xl font-bold font-display text-primary">No Active Itinerary Loaded</h2>
          <p className="text-sm text-[#414845] mt-1 mb-6">
            You don't have an active itinerary selected yet. Create a new tailored trip to get started.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/plan')}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] active:scale-95 transition shadow-sm flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Plan your first trip</span>
            </button>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  const handleExport = () => {
    setToastMessage('Itinerary exported to calendar.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const rawDestinations = state.config.destinations && state.config.destinations.length > 0
    ? state.config.destinations
    : state.config.destination
    ? state.config.destination.split(/➔|,|to/).map((s) => s.trim()).filter(Boolean)
    : ['Jaipur, Rajasthan'];

  const primaryCity = rawDestinations[0]?.split(',')[0] || 'Rajasthan';
  const circuitTitle = state.config.tagline || `${primaryCity} Curated Circuit Expedition`;

  // Compute budget estimate dynamically
  const budgetMultiplier = state.config.budgetTier === 'Budget-friendly' ? 2400 : state.config.budgetTier === 'Premium' ? 13500 : 5800;
  const estimatedBudgetDisplay = `₹${(budgetMultiplier * state.days.length).toLocaleString('en-IN')}`;

  const handleAiAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setShowAiModal(false);
    navigate('/replan');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface pb-24">
      {/* Header */}
      <Header title="Itinerary Dashboard" />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-20 flex flex-col gap-6">
        {state.generationSource === 'deterministic-fallback' && (
          <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-4 text-xs text-amber-950 flex items-start gap-3 shadow-xs">
            <span className="material-symbols-outlined text-[20px] text-amber-700 shrink-0 mt-0.5">
              info
            </span>
            <div className="flex-1">
              <span className="font-bold block text-sm text-amber-950">
                Deterministic Fallback Itinerary
              </span>
              <p className="text-amber-900 text-xs mt-0.5 leading-relaxed">
                {state.fallbackReason || 'Generated using RoamWise offline fallback engine.'}
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 1: CIRCUIT MACRO HEADER (Screen 13 Spec)                          */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-white border border-[#25332E]/10 p-5 sm:p-6 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#25332E]/10">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EDFDF5] text-primary border border-[#D8E9DD]">
                Curated Circuit
              </span>
              <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-amber">wb_sunny</span>
                <span>96% Weather Score</span>
              </span>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                onClick={handleExport}
                className="px-3 py-1.5 rounded-lg bg-[#EDFDF5] text-primary hover:bg-secondary-container border border-[#D8E9DD] text-xs font-semibold transition flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                <span>Sync Calendar</span>
              </button>
              <button
                onClick={() => navigate('/map')}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-[#204E43] transition shadow-sm flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">map</span>
                <span>View Map</span>
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary font-display tracking-tight">
              {circuitTitle}
            </h1>
            <p className="text-sm font-semibold text-secondary mt-1 flex items-center gap-1.5 flex-wrap">
              {rawDestinations.map((dest, i) => (
                <React.Fragment key={dest}>
                  {i > 0 && <span className="text-primary font-bold">➔</span>}
                  <span>{dest.split(',')[0]}</span>
                </React.Fragment>
              ))}
            </p>
          </div>

          {/* Quick Metrics Grid (Screen 13 Spec) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="p-3 rounded-xl bg-[#EDFDF5] border border-[#D8E9DD]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">Dates</span>
              <span className="text-xs sm:text-sm font-bold text-primary mt-0.5 block">{state.config.startDate} – {state.config.endDate}</span>
              <span className="text-[11px] text-[#414845]">Autumn Foliage</span>
            </div>

            <div className="p-3 rounded-xl bg-[#EDFDF5] border border-[#D8E9DD]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">Pacing</span>
              <span className="text-xs sm:text-sm font-bold text-primary mt-0.5 block">
                {state.days.length} Days • {rawDestinations.length} Stop{rawDestinations.length > 1 ? 's' : ''}
              </span>
              <span className="text-[11px] text-[#414845]">{state.config.pace} Cadence</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FFF8F0] border border-amber/30">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber block">Estimated Budget</span>
              <span className="text-xs sm:text-sm font-bold text-primary mt-0.5 block">{estimatedBudgetDisplay}</span>
              <span className="text-[11px] text-[#414845]">{state.config.budgetTier} Tier</span>
            </div>

            <div className="p-3 rounded-xl bg-[#EDFDF5] border border-[#D8E9DD]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary block">Avg Weather</span>
              <span className="text-xs sm:text-sm font-bold text-primary mt-0.5 block">
                {state.days[0]?.temperature || '25°C'} – {state.days[Math.min(1, state.days.length - 1)]?.temperature || '28°C'}
              </span>
              <span className="text-[11px] text-emerald-800 font-semibold">Mild Season</span>
            </div>
          </div>

          {/* Route Allocation Breakdown across destinations */}
          <div className="mt-5 pt-4 border-t border-[#25332E]/10">
            <div className="flex items-center justify-between text-xs font-bold text-primary mb-2">
              <span>Route Allocation</span>
              <span>{rawDestinations.length} Destination{rawDestinations.length > 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {rawDestinations.map((dest, idx) => {
                const total = state.days.length;
                const startDay = Math.floor((idx / rawDestinations.length) * total) + 1;
                const endDay = Math.floor(((idx + 1) / rawDestinations.length) * total);
                const daysLabel = startDay === endDay ? `Day ${startDay}` : `Days ${startDay}–${endDay}`;
                const cityName = dest.split(',')[0];
                const regionName = dest.split(',')[1] || 'Region';
                return (
                  <div key={dest} className="p-2.5 rounded-lg bg-[#EDFDF5] border border-[#D8E9DD]">
                    <span className="text-[10px] font-bold uppercase text-primary">{daysLabel}</span>
                    <div className="font-display font-bold text-xs text-primary">{cityName}</div>
                    <span className="text-[11px] text-[#414845]">{regionName}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Intercity Transit Card */}
          <div className="mt-4 p-3 rounded-xl bg-[#FFF8F0] border border-amber/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber/20 text-amber flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">
                  {rawDestinations.length > 1 ? 'train' : 'directions_car'}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber block">
                  {rawDestinations.length > 1 ? 'Upcoming Intercity Transit' : 'Local Heritage Mobility'}
                </span>
                <span className="text-xs font-bold text-primary">
                  {rawDestinations.length > 1
                    ? `Transit • ${rawDestinations[0].split(',')[0]} ➔ ${rawDestinations[1].split(',')[0]} via Vande Bharat / Express (3h 45m)`
                    : `Dedicated AC Chauffeur & Heritage Circuit Transfers (${state.config.budgetTier} Tier)`}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate('/map')}
              className="text-xs font-bold text-primary hover:text-amber underline shrink-0"
            >
              Route Map
            </button>
          </div>

          {/* Quick Action Matrix (Screen 13 Spec) */}
          <div className="mt-4 pt-3 border-t border-[#25332E]/10 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/weather')}
                className="px-3 py-1.5 rounded-lg bg-[#EDFDF5] text-primary hover:bg-secondary-container text-xs font-semibold transition border border-[#D8E9DD] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px] text-amber">radar</span>
                <span>Weather Radar</span>
              </button>
              <button
                onClick={() => navigate('/replan')}
                className="px-3 py-1.5 rounded-lg bg-[#EDFDF5] text-primary hover:bg-secondary-container text-xs font-semibold transition border border-[#D8E9DD] flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
                <span>Modify Plan</span>
              </button>
            </div>

            <button
              onClick={() => setShowAiModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-[#204E43] transition shadow-sm flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px] text-amber">auto_awesome</span>
              <span>Ask RoamAI</span>
            </button>
          </div>
        </div>

        {/* Feedback Toast */}
        {toastMessage && (
          <div className="p-3 rounded-xl bg-white border border-primary/20 text-primary font-semibold text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: DAILY SCHEDULE TIMELINE (Screen 13 Spec)                       */}
        {/* ========================================================================= */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold font-display text-primary">Daily Schedule</h2>
              <p className="text-xs text-[#414845]">Curated pacing with optimal light windows and weather safety</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-secondary-container text-primary font-bold text-xs">
              {state.days.length} Days Active
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {state.days.map((day) => (
              <div
                key={day.dayNumber}
                className="rounded-2xl bg-white border border-[#25332E]/10 p-5 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#25332E]/10">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary text-white font-display font-extrabold flex items-center justify-center text-sm">
                      {day.dayNumber}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-base text-primary">
                        Day {day.dayNumber}: {day.theme}
                      </h3>
                      <p className="text-xs text-[#414845] mt-0.5">
                        {day.dayOfWeek}, {day.dateStr} • {day.activities.length} Curated Stops
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#EDFDF5] text-primary">
                      {day.weatherSummary}
                    </span>
                    <button
                      onClick={() => navigate(`/trip/day/${day.dayNumber}`)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-[#204E43] transition shadow-sm flex items-center gap-1"
                    >
                      <span>Day Timeline</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Day Activity Stops Preview */}
                <div className="mt-4 flex flex-col gap-3">
                  {day.activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[#F7F5EF] border border-[#25332E]/10 hover:border-primary/40 transition"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <button
                          onClick={() => toggleVisited(day.dayNumber, act.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition border ${
                            act.isVisited
                              ? 'bg-primary border-primary text-white'
                              : 'bg-white border-[#25332E]/30 text-transparent hover:border-primary'
                          }`}
                          title={act.isVisited ? 'Marked visited' : 'Click to mark visited'}
                        >
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-primary">{act.timeSlot}</span>
                            <span className="text-[11px] text-[#414845]">({act.duration})</span>
                            {act.isPlanBAlternative && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#FFF8F0] text-amber border border-amber/30 font-bold">
                                Plan B Active
                              </span>
                            )}
                            {act.hasPlanBReady && act.weatherRisk === 'high' && !act.isPlanBAlternative && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#FFF8F0] text-amber border border-amber/30 font-bold">
                                ⚠️ Plan B Ready
                              </span>
                            )}
                          </div>
                          <div className="font-display font-bold text-sm text-primary truncate mt-0.5">{act.title}</div>
                          <p className="text-xs text-[#414845] truncate mt-0.5">{act.location}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-primary">{act.costDisplay}</span>
                        <span className="text-[10px] text-[#414845] block">{act.weatherRiskLabel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Ask RoamAI Prompt Modal */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-[#25332E]/10 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#25332E]/10">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber text-[20px]">auto_awesome</span>
                <h3 className="font-display font-bold text-base text-primary">Ask RoamAI Itinerary Assistant</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-[#414845] hover:text-primary">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleAiAsk} className="mt-4 flex flex-col gap-3">
              <p className="text-xs text-[#414845]">
                Ask to swap stops, adjust pacing, insert a coffee break, or prepare an indoor contingency plan.
              </p>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. 'I feel tired this afternoon, replace Nahargarh hike with an indoor tea haveli' or 'Show me art galleries nearby'"
                className="w-full p-3 rounded-xl border border-[#25332E]/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[90px]"
                rows={3}
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-[#EDFDF5] text-primary text-xs font-semibold hover:bg-secondary-container transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-[#204E43] transition shadow-sm"
                >
                  Generate Plan Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
};
