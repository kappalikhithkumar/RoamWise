import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';

interface StageItem {
  id: number;
  label: string;
  sublabel: string;
  threshold: number;
  completedThreshold: number;
}

const GENERATION_STAGES: StageItem[] = [
  { id: 1, label: 'Understanding your preferences', sublabel: 'Calibrated', threshold: 0, completedThreshold: 20 },
  { id: 2, label: 'Resolving Indian destination coordinates', sublabel: 'Geospatial Verified', threshold: 20, completedThreshold: 38 },
  { id: 3, label: 'Calculating travel route & pace', sublabel: 'Expressways & Transit', threshold: 38, completedThreshold: 55 },
  { id: 4, label: 'Curating authentic Indian attractions', sublabel: 'Verified Points of Interest', threshold: 55, completedThreshold: 72 },
  { id: 5, label: 'Checking live weather forecasts', sublabel: 'Open-Meteo Meteorology Sync', threshold: 72, completedThreshold: 86 },
  { id: 6, label: 'Balancing INR (₹) budget and timings', sublabel: 'Balanced Allocation', threshold: 86, completedThreshold: 95 },
  { id: 7, label: 'Preparing your itinerary', sublabel: 'Finalizing', threshold: 95, completedThreshold: 100 }
];

const ENGINE_FACTS = [
  'October in Rajasthan offers clear 26°C skies for Amber Fort, with zero monsoon delays anticipated.',
  'Yamuna Expressway traffic flow is optimal between 07:00 and 10:30 for your Agra transfer.',
  "Delhi evening light shows at Humayun's Tomb have been pinned for Golden Hour alignment.",
  'High-elevation tea gardens in Munnar experience afternoon mist; sheltered cultural stops are prioritized.'
];

export const GeneratingPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, isGenerating, generationError, destinationError, retryGeneration } = useTrip();

  const [progress, setProgress] = useState(15);
  const [factIndex, setFactIndex] = useState(0);

  // Dynamic route label from state
  const destinationDisplay = state.config.destination || 'Jaipur, Rajasthan';
  const paceDisplay = state.config.pace || 'Balanced';

  // Calculate days duration
  const getDays = () => {
    if (!state.config.startDate || !state.config.endDate) return '7 Days';
    const s = new Date(state.config.startDate);
    const e = new Date(state.config.endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return '7 Days';
    const diff = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return `${diff} Days`;
  };

  const daysDisplay = getDays();

  // Redirect to plan if landed here without generating, error, or active trip
  useEffect(() => {
    if (!isGenerating && !generationError && (!state.hasActiveTrip || state.days.length === 0) && !state.config.destination) {
      navigate('/plan', { replace: true });
    }
  }, [isGenerating, generationError, state.hasActiveTrip, state.days.length, state.config.destination, navigate]);

  // Handle generation success -> navigate to /trip ONLY when complete
  useEffect(() => {
    if (!isGenerating && !generationError && state.hasActiveTrip && state.days.length > 0) {
      setProgress(100);
      const timer = setTimeout(() => {
        navigate('/trip', { replace: true });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, generationError, state.hasActiveTrip, state.days.length, navigate]);

  // Smooth progressive animation while generating
  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 92) return 92;
          const inc = Math.floor(Math.random() * 5) + 3;
          return Math.min(prev + inc, 92);
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  // Rotating facts timer
  useEffect(() => {
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % ENGINE_FACTS.length);
    }, 3200);
    return () => clearInterval(factInterval);
  }, []);

  const handleRetry = async () => {
    setProgress(15);
    await retryGeneration();
  };

  // Compute active stage
  const currentStageIndex = GENERATION_STAGES.findIndex(
    (s) => progress >= s.threshold && progress < s.completedThreshold
  );
  const activeStage = currentStageIndex !== -1 ? GENERATION_STAGES[currentStageIndex] : GENERATION_STAGES[GENERATION_STAGES.length - 1];
  const stageNum = currentStageIndex !== -1 ? currentStageIndex + 1 : 7;

  // Remaining time estimate
  const estRemaining = progress < 40 ? '~5s' : progress < 75 ? '~3s' : progress < 99 ? '~1s' : 'Ready';

  // SVG circle calculation
  const circleRadius = 15.9155;
  const strokeDash = `${progress}, 100`;

  // ERROR STATE VIEW
  if (generationError) {
    return (
      <div className="bg-surface text-on-surface antialiased flex flex-col min-h-screen relative overflow-x-hidden selection:bg-secondary-container selection:text-primary">
        <main className="flex-1 flex flex-col justify-center items-center relative w-full bg-surface z-10 py-12 max-w-md mx-auto px-4">
          <div className="w-full rounded-2xl bg-surface-container-lowest p-6 sm:p-7 shadow-card border border-error/30 text-center flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-error-container text-on-error-container flex items-center justify-center mb-4 shadow-sm">
              <span className="material-symbols-outlined text-[28px] text-error">
                {destinationError ? 'location_off' : 'cloud_off'}
              </span>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-error-container/60 text-on-error-container font-label-sm text-[11px] font-semibold mb-2">
              {destinationError ? 'Destination Verification' : 'Generation Error'}
            </span>

            <h2 className="font-headline-sm text-lg sm:text-xl text-primary font-bold mb-2">
              {destinationError ? 'Destination Not Supported' : 'Itinerary Generation Failed'}
            </h2>

            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mb-6 leading-relaxed bg-surface-container-low p-3.5 rounded-xl border border-surface-container text-left w-full">
              {generationError}
            </p>

            <div className="flex flex-col gap-2.5 w-full">
              <button
                type="button"
                onClick={handleRetry}
                className="w-full py-3 px-4 rounded-xl bg-primary text-white font-label-lg text-xs font-bold shadow hover:bg-[#204E43] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                <span>Retry Generation</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/plan')}
                className="w-full py-3 px-4 rounded-xl bg-surface-container text-primary font-label-lg text-xs font-semibold hover:bg-surface-container-high active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">edit_location_alt</span>
                <span>Change Destination / Edit Details</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // GENERATING LOADING VIEW
  return (
    <div className="bg-surface text-on-surface antialiased flex flex-col min-h-screen relative overflow-x-hidden selection:bg-secondary-container selection:text-primary">
      {/* Subtle Background Icon Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-[0.03] z-0">
        <span className="material-symbols-outlined text-[360px] text-primary">explore</span>
      </div>

      <main className="flex-1 flex flex-col relative w-full bg-surface z-10 pt-safe pb-safe max-w-md mx-auto">
        <div className="flex flex-col w-full px-margin pb-space-xl">
          {/* Top Bar / App Brand Presence */}
          <div className="flex items-center justify-between py-space-sm">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-[18px]">explore</span>
              </div>
              <span className="font-headline-sm text-base text-primary font-bold tracking-tight">
                RoamWise
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-ping" />
              <span className="font-label-sm text-[10px] uppercase tracking-wider font-semibold">
                Adaptive AI Engine
              </span>
            </div>
          </div>

          {/* Hero Status Section */}
          <div className="flex flex-col items-center text-center mt-space-md mb-space-lg">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-primary-container mb-space-sm shadow-sm">
              <span className="material-symbols-outlined text-[15px] text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <span className="font-label-md text-xs font-semibold text-primary">
                Adaptive Route Synthesis
              </span>
            </div>

            <h1 className="font-display-lg text-2xl sm:text-3xl text-primary font-bold tracking-tight max-w-[320px] mb-2">
              Crafting Your Adaptive Journey
            </h1>
            <p className="font-body-md text-xs text-on-surface-variant max-w-[290px] mb-space-md">
              RoamWise is preparing your personalised Indian travel itinerary.
            </p>

            {/* Route Overview Pill */}
            <div className="w-full flex items-center justify-center px-4 py-2.5 rounded-xl bg-surface-container text-primary shadow-sm border border-surface-container-high">
              <span className="material-symbols-outlined text-[18px] text-secondary mr-2">route</span>
              <span className="font-label-md text-xs font-semibold truncate text-primary">
                {destinationDisplay} • {daysDisplay} • {paceDisplay} Pace
              </span>
            </div>
          </div>

          {/* Ambient Progress Radial & Telemetry */}
          <div className="relative w-full rounded-2xl bg-surface-container-lowest p-5 shadow-sm mb-space-lg overflow-hidden border border-surface-container">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-11 h-11 shrink-0">
                  <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container"
                      d={`M18 2.0845 a ${circleRadius} ${circleRadius} 0 0 1 0 31.831 a ${circleRadius} ${circleRadius} 0 0 1 0 -31.831`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-tertiary-fixed-dim stroke-current transition-all duration-700 ease-out"
                      d={`M18 2.0845 a ${circleRadius} ${circleRadius} 0 0 1 0 31.831 a ${circleRadius} ${circleRadius} 0 0 1 0 -31.831`}
                      fill="none"
                      strokeDasharray={strokeDash}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <span className="absolute font-label-md text-xs text-primary font-bold">
                    {progress}%
                  </span>
                </div>
                <div>
                  <span className="font-label-lg text-sm text-primary font-semibold block">
                    {activeStage.label}
                  </span>
                  <span className="font-body-sm text-xs text-secondary">
                    Step {stageNum} of 7 underway
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-label-sm text-[10px] text-secondary uppercase tracking-wider font-semibold">
                  Est. Remaining
                </span>
                <span className="font-headline-sm text-sm text-primary font-bold">
                  {estRemaining}
                </span>
              </div>
            </div>

            {/* Micro Linear Layered Bar */}
            <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-primary-container rounded-full relative transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-tertiary-fixed-dim/40 to-transparent w-full animate-pulse" />
              </div>
            </div>

            <p className="font-body-sm text-xs text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-tertiary-fixed-dim">query_stats</span>
              <span>Synthesising geospatial POIs across Indian circuits & live weather...</span>
            </p>
          </div>

          {/* Sequential Stage Checklist */}
          <div className="w-full flex flex-col space-y-2 mb-space-lg">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="font-label-sm text-xs text-secondary uppercase tracking-wider font-bold">
                Engine Execution Log
              </span>
              <span className="font-label-sm text-xs text-tertiary-fixed-dim font-semibold">
                Real-Time Sync
              </span>
            </div>

            {GENERATION_STAGES.map((stage) => {
              const isCompleted = progress >= stage.completedThreshold;
              const isActive = progress >= stage.threshold && !isCompleted;

              if (isCompleted) {
                return (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest shadow-sm transition-all border border-surface-container/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[15px] font-bold">check</span>
                      </div>
                      <span className="font-body-md text-xs font-semibold text-primary">
                        {stage.label}
                      </span>
                    </div>
                    <span className="font-label-sm text-[11px] text-secondary font-medium">
                      {stage.sublabel}
                    </span>
                  </div>
                );
              }

              if (isActive) {
                return (
                  <div
                    key={stage.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low shadow-sm relative overflow-hidden border border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary-container animate-spin">
                        <span className="material-symbols-outlined text-[15px]">sync</span>
                      </div>
                      <span className="font-body-md text-xs font-bold text-primary">
                        {stage.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-lowest text-tertiary-container shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-pulse" />
                      <span className="font-label-sm text-[10px] font-bold">Active Sync</span>
                    </div>
                  </div>
                );
              }

              // Pending
              return (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container/40 opacity-70"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-surface-container-high flex items-center justify-center text-outline">
                      <span className="material-symbols-outlined text-[14px]">hourglass_empty</span>
                    </div>
                    <span className="font-body-md text-xs text-secondary">{stage.label}</span>
                  </div>
                  <span className="font-label-sm text-[10px] text-secondary/70">Queued</span>
                </div>
              );
            })}
          </div>

          {/* Live Adaptive Context Card */}
          <div className="relative w-full rounded-2xl bg-surface-container p-4 shadow-sm mb-space-md overflow-hidden border border-surface-container-high">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-surface-container-lowest text-tertiary-container shadow-sm mt-0.5">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lightbulb
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-sm text-[10px] uppercase tracking-wider text-tertiary font-bold">
                    Live Engine Fact
                  </span>
                  <span className="font-label-sm text-[10px] text-secondary font-medium">
                    Regional Insights
                  </span>
                </div>
                <p className="font-body-md text-xs text-on-surface leading-snug mb-2 transition-opacity duration-300">
                  {ENGINE_FACTS[factIndex]}
                </p>
                <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-[11px] bg-surface-container-lowest/70 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-[15px] text-primary shrink-0">shield</span>
                  <span>RoamWise automatically prepares smart Plan B contingencies for outdoor stops.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cancel / Secondary Action */}
          <div className="w-full flex items-center justify-center pt-space-xs">
            <button
              type="button"
              onClick={() => navigate('/plan')}
              className="px-4 py-2 text-secondary hover:text-primary transition-colors font-label-md text-xs font-semibold inline-flex items-center gap-1.5 focus:outline-none"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              <span>Cancel Generation</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
