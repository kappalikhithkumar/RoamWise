import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { getCategoryGradientAndIcon } from '../utils/categoryTheme';

export const DayDetailPage: React.FC = () => {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const { state, toggleVisited, applyPlanB } = useTrip();

  const [dismissedPlanB, setDismissedPlanB] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [quickInput, setQuickInput] = useState('');

  const currentDayNum = parseInt(dayId || '1', 10);
  const currentDay = state.days.find((d) => d.dayNumber === currentDayNum) || state.days[0];

  if (!currentDay) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-on-surface">
        <Header title="Day Timeline" showBack={true} onBack={() => navigate('/trip')} />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center pt-24">
          <p className="text-sm text-secondary font-medium">Day schedule not found.</p>
          <button
            onClick={() => navigate('/trip')}
            className="mt-3 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-sm"
          >
            Return to Itinerary
          </button>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Find if this day has any activity with a Plan B ready
  const planBActivity = currentDay.activities.find((a) => a.hasPlanBReady && a.planBAlternative && a.weatherRisk === 'high');
  const isPlanBApplied = currentDay.activities.some((a) => a.isPlanBAlternative);

  const handleSwitchToPlanB = (originalActivityId: string) => {
    applyPlanB(currentDay.dayNumber, originalActivityId);
    setToastMessage('Switched to Plan B successfully! Timeline safeguarded from weather risk.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleQuickRebalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    navigate('/replan');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface pb-28">
      {/* Header */}
      <Header
        title={`Day 0${currentDay.dayNumber} Timeline`}
        showBack={true}
        onBack={() => navigate('/trip')}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-20 flex flex-col gap-5">
        
        {/* Day Header Bar (Screen 02 Spec) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                {currentDay.dayOfWeek} • {currentDay.dateStr}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber" />
              <span className="text-xs font-semibold text-emerald-800">
                {currentDay.weatherSummary}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold font-display text-primary mt-1">
              {currentDay.theme}
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => navigate('/map')}
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#D8E9DD] hover:bg-[#EDFDF5] text-primary text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">map</span>
              <span>Map View</span>
            </button>
            <button
              onClick={() => navigate('/weather')}
              className="px-3.5 py-1.5 rounded-xl bg-[#FFF8F0] border border-amber/30 text-primary text-xs font-bold transition flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-amber">radar</span>
              <span>Weather</span>
            </button>
          </div>
        </div>

        {(state.verification === 'unverified' || state.poiSource === 'none' || state.config.verification === 'unverified' || state.config.poiSource === 'none') && (
          <div className="rounded-xl bg-amber-50 border border-amber-300 p-3.5 text-xs text-amber-950 flex items-center gap-2.5 shadow-xs">
            <span className="material-symbols-outlined text-[20px] text-amber-700 shrink-0">
              warning
            </span>
            <span className="text-amber-900 text-xs font-semibold">
              Places not verified against map data. Please double-check before travel.
            </span>
          </div>
        )}

        {/* Day Selector Tabs (Screen 02 Spec) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 border-b border-[#25332E]/10">
          {state.days.map((d) => (
            <button
              key={d.dayNumber}
              onClick={() => navigate(`/trip/day/${d.dayNumber}`)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                d.dayNumber === currentDay.dayNumber
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-charcoal border border-[#25332E]/10 hover:bg-[#EDFDF5]'
              }`}
            >
              Day {d.dayNumber} {d.dayNumber === 3 ? '(Today)' : ''}
            </button>
          ))}
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className="p-3.5 rounded-xl bg-white border border-emerald-600 text-primary font-semibold text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* INLINE PLAN B ROUTE GUARD BANNER (Screen 02 Signature Element)            */}
        {/* ========================================================================= */}
        {planBActivity && !dismissedPlanB[planBActivity.id] && (
          <div className="rounded-2xl bg-[#FFF8F0] border border-amber/50 p-5 shadow-sm animate-fadeIn">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber text-white flex items-center justify-center shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-extrabold text-sm text-primary">
                      Adaptive Route Guard Contingency Alert (Demo)
                    </h3>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber/20 text-primary font-bold">
                      Updated 8m ago
                    </span>
                  </div>
                  <p className="text-xs text-[#414845] mt-0.5">
                    Outdoor stop <span className="font-bold text-primary">"{planBActivity.title}"</span> has elevated weather risk ({planBActivity.weatherRiskLabel}).
                  </p>
                </div>
              </div>

              <button
                onClick={() => setDismissedPlanB({ ...dismissedPlanB, [planBActivity.id]: true })}
                className="text-[#414845] hover:text-primary p-1"
                title="Dismiss banner"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Proposed Plan B Alternative Details */}
            {planBActivity.planBAlternative && (
              <div className="mt-3.5 p-3.5 rounded-xl bg-white border border-amber/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EDFDF5] text-primary">
                      {planBActivity.planBAlternative.weatherRiskLabel}
                    </span>
                    <span className="text-xs font-bold text-primary">
                      Plan B: {planBActivity.planBAlternative.title}
                    </span>
                  </div>
                  <p className="text-xs text-[#414845] mt-1">
                    {planBActivity.planBAlternative.shelterReason}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-[#414845]">
                    <span>📍 {planBActivity.planBAlternative.location}</span>
                    <span>•</span>
                    <span>Cost Delta: {planBActivity.planBAlternative.costDelta}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <button
                    onClick={() => handleSwitchToPlanB(planBActivity.id)}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] active:scale-95 transition shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px] text-amber">swap_horiz</span>
                    <span>Switch to Plan B</span>
                  </button>
                  <button
                    onClick={() => setDismissedPlanB({ ...dismissedPlanB, [planBActivity.id]: true })}
                    className="px-3 py-2 rounded-xl bg-[#EDFDF5] hover:bg-secondary-container text-primary text-xs font-semibold transition border border-[#D8E9DD]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* If Plan B is active */}
        {isPlanBApplied && (
          <div className="p-3.5 rounded-xl bg-[#EDFDF5] border border-[#D8E9DD] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
              <span className="text-xs font-semibold text-primary">
                Plan B Active: Schedule has been safeguarded with indoor alternatives.
              </span>
            </div>
            <button
              onClick={() => navigate('/review-plan')}
              className="text-xs font-bold text-primary hover:underline"
            >
              Review Diff ➔
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TIMELINE OF STOPS (Screen 02 Spec)                                        */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-white border border-[#25332E]/10 p-5 sm:p-6 shadow-card">
          <div className="flex items-center justify-between pb-4 border-b border-[#25332E]/10">
            <h2 className="font-display font-bold text-base text-primary">
              Day 0{currentDay.dayNumber} Timeline & Stops
            </h2>
            <span className="text-xs font-semibold text-[#414845]">
              {currentDay.activities.filter((a) => a.isVisited).length} of {currentDay.activities.length} completed
            </span>
          </div>

          <div className="relative mt-6 pl-4 sm:pl-6 border-l-2 border-[#D8E9DD] flex flex-col gap-6">
            {currentDay.activities.map((act) => {
              const isCompleted = act.isVisited;
              const hasAlert = act.hasPlanBReady && act.weatherRisk === 'high' && !act.isPlanBAlternative;
              const isSwapped = act.isPlanBAlternative;

              return (
                <div key={act.id} className="relative group">
                  {/* Timeline Node Ring */}
                  <button
                    onClick={() => toggleVisited(currentDay.dayNumber, act.id)}
                    className={`absolute -left-[25px] sm:-left-[33px] top-4 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-primary text-white shadow-sm'
                        : hasAlert
                        ? 'bg-amber text-white ring-4 ring-amber/20 animate-pulse'
                        : 'bg-white border-2 border-primary text-transparent hover:border-amber'
                    }`}
                    title={isCompleted ? 'Completed (Click to uncheck)' : 'Click to mark visited'}
                  >
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </button>

                  {/* Stop Card */}
                  <div
                    className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-sm ${
                      isCompleted
                        ? 'bg-[#F7F5EF] border-[#25332E]/10 opacity-80'
                        : hasAlert
                        ? 'bg-[#FFF8F0] border-amber/50 shadow-md'
                        : 'bg-white border-[#25332E]/10 hover:border-primary/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        {/* Time & Badges Row */}
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="font-bold text-xs text-primary">{act.timeSlot}</span>
                          <span className="text-xs text-[#414845]">({act.duration})</span>

                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EDFDF5] text-primary">
                              Done ✓
                            </span>
                          )}

                          {isSwapped && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8F0] text-amber border border-amber/30">
                              Plan B Swapped
                            </span>
                          )}

                          {hasAlert && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber text-white">
                              Weather Warning
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#EDFDF5] text-primary">
                            {act.category}
                          </span>
                        </div>

                        {/* Title & Location */}
                        <h3 className="font-display font-extrabold text-base sm:text-lg text-primary">
                          {act.title}
                        </h3>
                        <p className="text-xs text-[#414845] mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
                          <span>{act.location}</span>
                        </p>

                        <p className="text-xs text-charcoal mt-2 leading-relaxed">
                          {act.description}
                        </p>
                      </div>

                      {/* Photo Thumbnail or Category Gradient Placeholder */}
                      <div className="w-full sm:w-28 h-24 rounded-xl overflow-hidden shrink-0 border border-[#25332E]/10">
                        {act.imageUrl ? (
                          <img
                            src={act.imageUrl}
                            alt={act.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className={`w-full h-full bg-gradient-to-br ${getCategoryGradientAndIcon(act.category).gradient} flex items-center justify-center text-white shadow-inner`}
                            title={act.category}
                          >
                            <span className="material-symbols-outlined text-[28px] opacity-95">
                              {getCategoryGradientAndIcon(act.category).icon}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="mt-4 pt-3 border-t border-[#25332E]/10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 text-xs text-primary font-bold">
                        <span>{act.costDisplay}</span>
                        <span className="text-[#414845] font-normal">•</span>
                        <span className="text-[11px] text-[#414845] font-medium">{act.weatherRiskLabel}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasAlert && act.planBAlternative && (
                          <button
                            onClick={() => handleSwitchToPlanB(act.id)}
                            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-[#204E43] transition shadow-sm flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px] text-amber">swap_horiz</span>
                            <span>Switch Plan B</span>
                          </button>
                        )}

                        <button
                          onClick={() => toggleVisited(currentDay.dayNumber, act.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#EDFDF5] hover:bg-secondary-container text-primary text-xs font-semibold transition border border-[#D8E9DD]"
                        >
                          {isCompleted ? 'Mark Pending' : 'Mark Visited'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Natural Language Rebalancing Bar (Screen 02 Spec) */}
        <form onSubmit={handleQuickRebalance} className="sticky bottom-20 z-30">
          <div className="flex items-center rounded-2xl bg-white border border-[#25332E]/20 p-1.5 shadow-overlay focus-within:ring-2 focus-within:ring-primary">
            <span className="material-symbols-outlined text-[#414845] pl-3 text-[20px]">mic</span>
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Ask RoamWise AI to rebalance: “Swap afternoon stop with an art gallery”"
              className="w-full px-3 py-2 text-xs bg-transparent outline-none placeholder-[#414845]/60 text-charcoal font-medium"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-primary text-white hover:bg-[#204E43] transition shadow-sm shrink-0 flex items-center justify-center"
              title="Send rebalancing request"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>
        </form>

        {/* Prev / Next Day Navigation Footer */}
        <div className="flex items-center justify-between pt-2">
          {currentDay.dayNumber > 1 ? (
            <button
              onClick={() => navigate(`/trip/day/${currentDay.dayNumber - 1}`)}
              className="px-4 py-2 rounded-xl bg-white border border-[#D8E9DD] hover:bg-[#EDFDF5] text-primary text-xs font-bold transition flex items-center gap-1 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Day 0{currentDay.dayNumber - 1}</span>
            </button>
          ) : (
            <div />
          )}

          {currentDay.dayNumber < state.days.length && (
            <button
              onClick={() => navigate(`/trip/day/${currentDay.dayNumber + 1}`)}
              className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] transition flex items-center gap-1 shadow-sm"
            >
              <span>Day 0{currentDay.dayNumber + 1}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          )}
        </div>
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
};
