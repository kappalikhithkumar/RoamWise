import React from 'react';
import { useTrip } from '../../context/TripContext';
import { getCategoryGradientAndIcon } from '../../utils/categoryTheme';

export const PlanBBottomSheet: React.FC = () => {
  const { state, closePlanB, applyPlanB } = useTrip();
  const { isOpen, activity, dayNumber } = state.planBModal;

  if (!isOpen || !activity) return null;

  const alt = activity.planBAlternative;

  const handleApply = () => {
    applyPlanB(dayNumber, activity.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        onClick={closePlanB}
        className="fixed inset-0 bg-inverse-surface/60 backdrop-blur-sm transition-opacity"
      />

      {/* Sheet Container with 24px top rounded corners */}
      <div className="relative w-full max-h-[85vh] overflow-y-auto bg-surface-container-lowest rounded-t-[28px] shadow-[0_-8px_32px_rgba(11,28,48,0.22)] flex flex-col z-10 animate-slideUp pb-safe">
        {/* Top Drag Handle & Close */}
        <div className="sticky top-0 z-20 bg-surface-container-lowest/95 backdrop-blur-md px-margin pt-3 pb-2 flex flex-col items-center border-b border-surface-container/40">
          <div className="w-12 h-1.5 rounded-full bg-outline-variant/60 mb-2" />
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-space-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-error animate-ping" />
              <span className="font-label text-xs uppercase tracking-wider text-error font-bold">
                Meteorological Shield Alert
              </span>
            </div>
            <button
              type="button"
              onClick={closePlanB}
              aria-label="Close Plan B sheet"
              className="w-8 h-8 rounded-full bg-surface-container-low hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-margin py-space-md flex flex-col gap-space-md">
          {/* High-visibility Warning Banner */}
          <div className="bg-error-container text-on-error-container rounded-2xl p-space-md shadow-sm flex flex-col gap-1">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-full bg-error text-on-error flex items-center justify-center shrink-0 shadow-sm">
                <span className="material-symbols-outlined text-[18px]">thunderstorm</span>
              </div>
              <h3 className="font-heading text-base font-bold text-error leading-snug">
                Rain Threat: 65% Downpour at 2:00 PM
              </h3>
            </div>
            <p className="font-body text-xs text-on-error-container pl-10 leading-relaxed">
              Sudden cloudburst and high winds predicted over Jaipur heritage basin. Open-air stonework at {activity.title} will become slippery and hazardous.
            </p>
          </div>

          {/* Comparison Container */}
          <div className="flex flex-col gap-3">
            <span className="font-label text-xs text-on-surface-variant uppercase tracking-wider font-bold">
              Itinerary Swap Comparison
            </span>

            {/* Original Card (Under Threat) */}
            <div className="p-3.5 rounded-2xl bg-surface-container-low border border-error/30 flex flex-col gap-2 relative">
              <div className="flex items-center justify-between">
                <span className="font-label text-[10px] uppercase font-bold text-error bg-error-container px-2 py-0.5 rounded-full">
                  Original Plan (Exposed)
                </span>
                <span className="font-label text-xs text-on-surface-variant">{activity.timeSlot}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                  {activity.imageUrl ? (
                    <img src={activity.imageUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getCategoryGradientAndIcon(activity.category).gradient} flex items-center justify-center text-white`}>
                      <span className="material-symbols-outlined text-[20px] opacity-95">
                        {getCategoryGradientAndIcon(activity.category).icon}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <h4 className="font-heading text-sm font-semibold text-on-surface truncate">
                    {activity.title}
                  </h4>
                  <span className="font-body text-xs text-on-surface-variant truncate">
                    {activity.location}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="font-label text-error font-semibold">⚠️ Open-Air Ground</span>
                    <span>•</span>
                    <span className="text-on-surface font-medium">{activity.costDisplay}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Down Arrow / VS Divider */}
            <div className="flex items-center justify-center -my-1">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[18px]">swap_vert</span>
              </div>
            </div>

            {/* Alternative Card (Plan B Sheltered) */}
            {alt && (
              <div className="p-3.5 rounded-2xl bg-secondary-fixed/25 border-2 border-secondary-container shadow-md flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                  <span className="font-label text-[10px] uppercase font-bold text-primary bg-primary-fixed px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">shield</span>
                    AI Plan B Recommendation
                  </span>
                  <span className="font-label text-xs font-semibold text-secondary">{alt.timeSlot}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-surface-container">
                    {alt.imageUrl ? (
                      <img src={alt.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getCategoryGradientAndIcon(alt.category).gradient} flex items-center justify-center text-white`}>
                        <span className="material-symbols-outlined text-[20px] opacity-95">
                          {getCategoryGradientAndIcon(alt.category).icon}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <h4 className="font-heading text-sm font-bold text-on-surface truncate">
                      {alt.title}
                    </h4>
                    <span className="font-body text-xs text-on-surface-variant truncate">
                      {alt.location}
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="font-label text-primary font-semibold">
                        {alt.weatherRiskLabel}
                      </span>
                      <span>•</span>
                      <span className="text-on-surface font-semibold">{alt.costDisplay}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-lowest/80 text-xs text-on-surface leading-relaxed mt-1">
                  <strong className="text-primary font-semibold">Why this works: </strong>
                  {alt.shelterReason}
                </div>
              </div>
            )}
          </div>

          {/* Cost and Time Impact Grid */}
          <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-3 rounded-2xl">
            <div className="flex flex-col">
              <span className="font-label text-[11px] text-on-surface-variant">Cost Difference</span>
              <span className="font-heading text-sm font-bold text-primary mt-0.5">
                {alt?.costDelta || '₹0 (Zero extra charge)'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label text-[11px] text-on-surface-variant">Transit Impact</span>
              <span className="font-heading text-sm font-bold text-secondary mt-0.5">
                10 mins via auto-rickshaw
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 mt-2">
            <button
              type="button"
              onClick={handleApply}
              className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-label text-sm font-bold shadow-lg flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Apply Alternative (Switch to Plan B)</span>
            </button>

            <button
              type="button"
              onClick={closePlanB}
              className="w-full h-11 rounded-2xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label text-xs font-semibold active:scale-98 transition-all"
            >
              Keep Original Plan & Braving Weather
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
