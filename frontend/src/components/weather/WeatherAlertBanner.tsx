import React from 'react';
import { useTrip } from '../../context/TripContext';

export const WeatherAlertBanner: React.FC = () => {
  const { state, openPlanB } = useTrip();

  // Find day 2 activity that has Plan B ready
  const day2 = state.days.find((d) => d.dayNumber === 2);
  const targetActivity = day2?.activities.find((a) => a.hasPlanBReady && a.weatherRisk === 'high' && !a.isPlanBAlternative);

  if (!targetActivity) return null;

  const destName = targetActivity.location || state.config?.destination || 'your destination';

  return (
    <aside className="relative overflow-hidden rounded-2xl bg-tertiary-container text-on-tertiary-container p-space-md shadow-md border border-tertiary/20">
      <div className="flex items-start gap-space-sm">
        <div className="w-9 h-9 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
          <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-space-xs mb-1">
            <span className="font-label text-[10px] uppercase tracking-wide bg-tertiary-fixed text-on-tertiary-fixed px-2 py-0.5 rounded-full font-bold">
              Front Approaching
            </span>
            <span className="font-label text-xs opacity-90 font-medium">Day 2 • 2:00 PM</span>
          </div>

          <p className="font-body text-xs text-on-tertiary-container leading-relaxed">
            Rain risk increases during open-air visits to {targetActivity.title} ({destName}). We have automatically structured a sheltered Plan B alternative.
          </p>

          <div className="mt-space-sm flex items-center justify-between pt-1 border-t border-on-tertiary-container/10">
            <button
              type="button"
              onClick={() => openPlanB(targetActivity, 2)}
              className="inline-flex items-center gap-1 font-label text-xs font-bold text-tertiary-fixed hover:underline active:scale-95 transition-transform"
            >
              <span>View Plan B Itinerary</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
            <span className="font-label text-[10px] bg-on-tertiary-container/10 px-2 py-0.5 rounded-full font-semibold">
              Plan B ready
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
