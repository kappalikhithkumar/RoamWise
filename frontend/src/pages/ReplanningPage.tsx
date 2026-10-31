import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { DisruptionChips, DisruptionScenario } from '../components/replanning/DisruptionChips';
import { ReplanningInput } from '../components/replanning/ReplanningInput';

export const ReplanningPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, createReplanProposal } = useTrip();

  const [selectedScenarioId, setSelectedScenarioId] = useState('running-late');
  const [delayMinutes, setDelayMinutes] = useState(45);
  const [detailsText, setDetailsText] = useState(
    'Our cab was delayed by 45 minutes in city traffic near Hawa Mahal. Please adjust our afternoon visits.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeDay = state.days.find((d) => d.dayNumber === state.activeDayNumber) || state.days[0];
  const anchorStop = activeDay.activities[0] || { title: 'Old City Heritage Center', location: 'Jaipur' };

  const handleScenarioSelect = (scenario: DisruptionScenario) => {
    setSelectedScenarioId(scenario.id);
    setDelayMinutes(scenario.minutes);
    setDetailsText(scenario.defaultPrompt);
  };

  const handlePreviewProposal = () => {
    setIsSubmitting(true);
    createReplanProposal(detailsText, delayMinutes);

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/review-plan');
    }, 700);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Header
        title="Adaptive Replanning"
        showBack={true}
        onBack={() => navigate('/trip')}
      />

      <main className="flex-1 w-full max-w-xl mx-auto pt-20 pb-24 px-margin flex flex-col gap-space-lg">
        {/* Header Intro */}
        <section className="flex flex-col gap-1 pt-1">
          <div className="inline-flex items-center gap-1.5 bg-surface-container-high px-3 py-1 rounded-full w-fit border border-surface-container-highest">
            <span
              className="material-symbols-outlined text-[15px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_fix_high
            </span>
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Live Adaptive Reroute
            </span>
          </div>

          <h1 className="font-heading text-2xl font-bold text-on-surface tracking-tight mt-1">
            Something Came Up?
          </h1>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed">
            Tell RoamWise what changed, and AI will reshape the rest of Day 0{activeDay.dayNumber} seamlessly without losing key reservations.
          </p>
        </section>

        {/* Real-time Location Pin Banner */}
        <section className="bg-surface-container-low rounded-2xl p-space-md flex items-center justify-between shadow-sm border border-surface-container">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center shrink-0 text-on-primary-fixed shadow-sm">
              <span className="material-symbols-outlined text-[20px]">near_me</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">
                Current Anchor Stop
              </span>
              <span className="font-heading text-sm font-semibold text-on-surface truncate">
                {anchorStop.title}
              </span>
              <span className="font-body text-xs text-on-surface-variant truncate">
                {anchorStop.location}
              </span>
            </div>
          </div>
          <span className="font-label text-xs font-semibold text-primary bg-surface-container-highest px-3 py-1 rounded-full whitespace-nowrap ml-2">
            14:15 IST
          </span>
        </section>

        {/* Quick Scenario Chips */}
        <DisruptionChips
          selectedId={selectedScenarioId}
          onSelect={handleScenarioSelect}
        />

        {/* Textarea Details Input */}
        <ReplanningInput
          value={detailsText}
          onChange={setDetailsText}
        />

        {/* AI Engine Live Simulation Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-surface-container-low via-surface-container to-surface-container-high rounded-2xl p-space-md shadow-sm border border-surface-container">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-primary-fixed-dim/30 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between pb-2 relative z-10 border-b border-surface-container-highest/60">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
              </div>
              <span className="font-heading text-xs font-bold text-on-surface">
                Adaptive Reroute Engine Ready
              </span>
            </div>
            <span className="font-label text-[10px] px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-bold">
              SIMULATED AI
            </span>
          </div>

          <p className="font-body text-xs text-on-surface-variant mt-2 leading-relaxed">
            Will preserve your evening dining booking, shift later stops by +{delayMinutes}m, and suggest a relaxing shaded teahouse in Nahargarh to bridge the gap.
          </p>
        </div>

        {/* CTA Submit Button */}
        <div className="sticky bottom-6 z-20 pt-1 pb-1">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handlePreviewProposal}
            className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-label text-sm font-semibold shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                <span>Calculating Route Changes...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                <span>Preview Revised Itinerary</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
};
