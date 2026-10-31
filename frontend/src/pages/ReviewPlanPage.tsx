import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { ItineraryDiffCard } from '../components/replanning/ItineraryDiffCard';

export const ReviewPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, acceptReplan, rejectReplan } = useTrip();
  const [viewMode, setViewMode] = useState<'diff' | 'clean'>('diff');

  const proposal = state.pendingReplan;

  // Fallback if accessed directly without pending proposal
  if (!proposal) {
    return (
      <div className="flex flex-col min-h-screen bg-surface text-on-surface">
        <Header title="Review Plan" showBack={true} onBack={() => navigate('/trip')} />
        <main className="flex-1 w-full max-w-xl mx-auto pt-24 px-margin text-center flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant">
            check_circle
          </span>
          <h2 className="font-heading text-lg font-bold text-on-surface">
            No Active Re-plan Proposal
          </h2>
          <p className="font-body text-xs text-on-surface-variant max-w-xs">
            Your itinerary is already up to date. You can request a new modification anytime.
          </p>
          <button
            type="button"
            onClick={() => navigate('/trip')}
            className="px-5 py-2.5 rounded-full bg-primary text-on-primary font-label text-xs font-semibold shadow-sm active:scale-95"
          >
            Back to Itinerary
          </button>
        </main>
      </div>
    );
  }

  const handleAccept = () => {
    acceptReplan();
    navigate('/trip');
  };

  const handleReject = () => {
    rejectReplan();
    navigate('/trip');
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Header
        title="Review Plan Adjustments"
        showBack={true}
        onBack={() => navigate('/trip')}
      />

      <main className="flex-1 w-full max-w-xl mx-auto pt-20 pb-32 px-margin flex flex-col gap-space-lg">
        {/* Dynamic Atmospheric Notification Header */}
        <section className="flex flex-col gap-1 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-secondary-container text-on-secondary-container">
              <span
                className="material-symbols-outlined text-[13px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
            </span>
            <span className="font-label text-xs text-secondary uppercase tracking-wider font-bold">
              AI Re-route Synthesis
            </span>
          </div>
          <h2 className="font-heading text-xl font-bold text-on-surface">
            Review Schedule Adjustments
          </h2>
          <p className="font-body text-xs text-on-surface-variant">
            RoamWise re-sequenced Day 0{state.activeDayNumber} based on your {proposal.delayMinutes}-minute delay.
          </p>
        </section>

        {/* Impact Metric Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-surface-container-high p-space-md shadow-sm border border-surface-container">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="shrink-0 w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[20px]">bolt</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-heading text-xs font-bold text-on-surface truncate">
                  Impact Assessment
                </span>
                <span className="font-body text-[11px] text-on-surface-variant truncate">
                  Optimal route recovered with zero booking drops
                </span>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-surface-container-lowest font-heading text-xs font-bold text-primary shadow-sm border border-surface-container">
              {proposal.matchScore}% Match
            </span>
          </div>

          <div className="mt-3 pt-2 bg-surface-container-lowest/80 rounded-xl p-2.5 flex items-center justify-around text-center gap-2 border border-surface-container/40">
            <div className="flex flex-col items-center">
              <span className="font-heading text-xs font-bold text-tertiary flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                +{proposal.delayMinutes}m
              </span>
              <span className="font-label text-[10px] text-on-surface-variant">Delay Absorbed</span>
            </div>
            <div className="w-px h-6 bg-surface-container" />
            <div className="flex flex-col items-center">
              <span className="font-heading text-xs font-bold text-primary flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                {proposal.reservationsKept} Kept
              </span>
              <span className="font-label text-[10px] text-on-surface-variant">Reservations</span>
            </div>
            <div className="w-px h-6 bg-surface-container" />
            <div className="flex flex-col items-center">
              <span className="font-heading text-xs font-bold text-secondary flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                {proposal.swappedStopsCount} Added
              </span>
              <span className="font-label text-[10px] text-on-surface-variant">Optimized Rest</span>
            </div>
          </div>
        </section>

        {/* View Mode Switcher: Changes Diff vs Clean View */}
        <section className="flex items-center justify-between bg-surface-container-low p-1 rounded-xl border border-surface-container">
          <button
            type="button"
            onClick={() => setViewMode('diff')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-label text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'diff'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">difference</span>
            <span>Changes Diff</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('clean')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-label text-xs font-semibold text-center transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'clean'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">view_timeline</span>
            <span>Clean Itinerary</span>
          </button>
        </section>

        {/* Visual Legend */}
        <section className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1 shrink-0 bg-tertiary-fixed/60 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-on-tertiary-fixed">
            <span className="w-2 h-2 rounded-full bg-tertiary" />
            <span>Adjusted</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 bg-primary-fixed/60 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-on-primary-fixed">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span>Added</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 bg-surface-container-high px-2.5 py-0.5 rounded-full text-[10px] font-semibold text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-outline" />
            <span>Locked</span>
          </div>
        </section>

        {/* Diff Comparison Feed */}
        <section className="flex flex-col gap-space-sm">
          {proposal.diffItems.map((item) => (
            <ItineraryDiffCard key={item.id} item={item} />
          ))}
        </section>

        {/* Sticky Action Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-surface-container p-3 pb-safe shadow-[0_-4px_20px_rgba(15,23,42,0.08)]">
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <button
              type="button"
              onClick={handleReject}
              className="flex-1 h-12 rounded-2xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label text-xs font-semibold active:scale-95 transition-all border border-surface-container"
            >
              Reject Changes
            </button>

            <button
              type="button"
              onClick={handleAccept}
              className="flex-[2] h-12 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-label text-xs font-bold shadow-lg flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">done_all</span>
              <span>Accept New Plan</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
