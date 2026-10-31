import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';

export const GeneratingPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useTrip();
  const [progress, setProgress] = useState(25);
  const [currentStep, setCurrentStep] = useState(1);

  const destinationCity = state.config.destination.split(',')[0] || 'Jaipur';

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(55);
      setCurrentStep(2);
    }, 900);

    const timer2 = setTimeout(() => {
      setProgress(85);
      setCurrentStep(3);
    }, 1800);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setCurrentStep(4);
    }, 2800);

    const timer4 = setTimeout(() => {
      navigate('/trip');
    }, 3800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface select-none relative overflow-hidden">
      {/* Subtle Ambient Glow Orbs */}
      <div className="absolute -top-10 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-48 -right-12 w-56 h-56 bg-tertiary-fixed-dim/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-6 w-72 h-72 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none" />

      <main className="flex-1 w-full max-w-md mx-auto pt-10 pb-16 px-margin flex flex-col items-center justify-between">
        {/* Header & Sparkle Badge */}
        <div className="flex flex-col items-center text-center mt-2 mb-4 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low shadow-sm mb-2 border border-surface-container">
            <span
              className="material-symbols-outlined text-primary text-[18px] animate-pulse"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span className="font-label text-xs text-primary uppercase tracking-wider font-bold">
              RoamWise Intelligence
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
          </div>

          <h1 className="font-heading text-2xl font-bold text-on-surface tracking-tight">
            Crafting Your {destinationCity} Journey
          </h1>
          <p className="font-body text-xs text-on-surface-variant max-w-[280px] mt-1 leading-relaxed">
            Tailoring daily flows, dynamic weather shields & authentic royal heritage stops.
          </p>
        </div>

        {/* Centerpiece: Pulsing AI Orb & Glowing Weather Radar */}
        <div className="relative w-full flex items-center justify-center my-4 z-10">
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer Rotating Radar Compass SVG Ring */}
            <svg
              className="absolute inset-0 w-full h-full animate-[spin_22s_linear_infinite]"
              fill="none"
              viewBox="0 0 256 256"
            >
              <circle
                cx="128"
                cy="128"
                r="118"
                stroke="#006765"
                strokeDasharray="6 8"
                strokeOpacity="0.18"
                strokeWidth="1.5"
              />
              <circle
                cx="128"
                cy="128"
                r="102"
                stroke="#ffb95f"
                strokeDasharray="2 12"
                strokeOpacity="0.25"
                strokeWidth="1.5"
              />
              {/* Radar ticks */}
              <line stroke="#006765" strokeLinecap="round" strokeWidth="2" x1="128" x2="128" y1="6" y2="16" />
              <line stroke="#006765" strokeLinecap="round" strokeWidth="2" x1="128" x2="128" y1="240" y2="250" />
              <line stroke="#006765" strokeLinecap="round" strokeWidth="2" x1="6" x2="16" y1="128" y2="128" />
              <line stroke="#006765" strokeLinecap="round" strokeWidth="2" x1="240" x2="250" y1="128" y2="128" />
              {/* Radar satellite dots */}
              <circle cx="210" cy="80" fill="#40c2fd" r="3.5" />
              <circle cx="48" cy="170" fill="#ffb95f" r="2.5" />
            </svg>

            {/* Counter-rotating Concentric Particle Ring with soft sweep beam */}
            <svg
              className="absolute w-48 h-48 animate-[spin_14s_linear_infinite_reverse]"
              fill="none"
              viewBox="0 0 200 200"
            >
              <circle
                cx="100"
                cy="100"
                r="92"
                stroke="#008280"
                strokeDasharray="14 18 4 18"
                strokeOpacity="0.25"
                strokeWidth="2"
              />
              <circle
                cx="100"
                cy="100"
                r="76"
                stroke="#a36700"
                strokeOpacity="0.2"
                strokeWidth="1"
              />
              <path
                d="M100 100 L170 60 A92 92 0 0 0 100 8 Z"
                fill="url(#radarGradient)"
                opacity="0.45"
              />
              <defs>
                <linearGradient id="radarGradient" x1="100" y1="100" x2="170" y2="60">
                  <stop stopColor="#65d8d4" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#006765" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Compass needle crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-40 h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className="absolute h-40 w-[1px] bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
            </div>

            {/* Core Breathing Sphere */}
            <div className="relative w-32 h-32 rounded-full p-2 bg-gradient-to-tr from-primary via-primary-container to-secondary-container shadow-[0_0_36px_rgba(0,103,101,0.35)] flex items-center justify-center animate-pulse">
              <div className="w-full h-full rounded-full bg-surface-container-lowest/20 backdrop-blur-md flex flex-col items-center justify-center text-on-primary relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent animate-[spin_8s_linear_infinite]" />
                <span className="material-symbols-outlined text-[36px] drop-shadow-md text-on-primary">
                  wb_twilight
                </span>
                <span className="font-label text-[11px] font-bold tracking-widest text-on-primary mt-1 opacity-95 uppercase">
                  {destinationCity.toUpperCase()} AI
                </span>
              </div>
            </div>

            {/* Floating Micro Badges */}
            <div className="absolute top-2 left-2 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 text-on-surface transform -rotate-6 border border-surface-container">
              <span className="material-symbols-outlined text-tertiary text-[14px]">sunny</span>
              <span className="font-label text-[10px] font-semibold">28°C Clear</span>
            </div>
            <div className="absolute bottom-2 right-2 bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 text-on-surface transform rotate-3 border border-surface-container">
              <span className="material-symbols-outlined text-secondary text-[14px]">shield</span>
              <span className="font-label text-[10px] font-semibold">Adaptive V3</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Status */}
        <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md shadow-md border border-surface-container/60 mb-space-md z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold text-primary">
                {progress}%
              </span>
              <span className="font-heading text-xs font-semibold text-on-surface">
                {progress === 100 ? 'Itinerary Finalized!' : 'Synthesizing Itinerary'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant font-label text-xs">
              <span className="material-symbols-outlined text-[15px] animate-spin">timelapse</span>
              <span>Takes ~3s</span>
            </div>
          </div>

          <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-primary via-primary-container to-secondary-container rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            >
              <div className="w-full h-full bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Checklist Checkpoint Stack */}
        <div className="w-full bg-surface-container-lowest rounded-2xl p-space-md shadow-md border border-surface-container/60 z-10 flex flex-col gap-2.5">
          <div className="flex items-center justify-between pb-1">
            <span className="font-label text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">
              Real-Time Plan Engine
            </span>
            <span className="font-label text-[10px] text-primary bg-surface-container-low px-2 py-0.5 rounded-full font-semibold">
              5 Checkpoints
            </span>
          </div>

          {/* Checkpoint 1 */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-surface-container-low flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-heading text-xs font-semibold text-on-surface truncate">
                Surveyed 42 royal forts, palaces & bazaars
              </span>
              <span className="font-body text-[11px] text-on-surface-variant">
                Amer, Pink City & Nahargarh hill ridge
              </span>
            </div>
          </div>

          {/* Checkpoint 2 */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-surface-container-low flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-primary text-[16px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-heading text-xs font-semibold text-on-surface truncate">
                Matching {state.config.travelerType} & {state.config.pace} pace profile
              </span>
              <span className="font-body text-[11px] text-on-surface-variant">
                Interests: {state.config.interests.join(', ')}
              </span>
            </div>
          </div>

          {/* Checkpoint 3 */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-surface-container-low flex items-center justify-center shrink-0">
              {currentStep >= 3 ? (
                <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              ) : (
                <span className="material-symbols-outlined text-primary text-[16px] animate-spin">
                  progress_activity
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-heading text-xs font-semibold text-on-surface truncate">
                Checking live Doppler weather & rain forecasts
              </span>
              <span className="font-body text-[11px] text-on-surface-variant">
                Pre-generating Plan B for Day 2 afternoon thunderstorm
              </span>
            </div>
          </div>

          {/* Checkpoint 4 */}
          <div className={`flex items-center gap-2.5 ${currentStep >= 4 ? 'opacity-100' : 'opacity-50'}`}>
            <div className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center shrink-0">
              {currentStep >= 4 ? (
                <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant text-[16px]">
                  route
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-heading text-xs font-semibold text-on-surface truncate">
                Optimizing transit corridors & entry queues
              </span>
              <span className="font-body text-[11px] text-on-surface-variant">
                Minimizing midday sun exposure
              </span>
            </div>
          </div>
        </div>

        {/* Manual Skip/Proceed Button */}
        <button
          type="button"
          onClick={() => navigate('/trip')}
          className="mt-4 text-primary font-label text-xs font-semibold flex items-center gap-1 hover:underline active:scale-95"
        >
          <span>Skip to overview</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </main>
    </div>
  );
};
