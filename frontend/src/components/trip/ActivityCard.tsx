import React from 'react';
import { Activity } from '../../types';
import { useTrip } from '../../context/TripContext';

interface ActivityCardProps {
  activity: Activity;
  dayNumber: number;
  showVisitedToggle?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  dayNumber,
  showVisitedToggle = true
}) => {
  const { toggleVisited, openPlanB } = useTrip();

  return (
    <div
      className={`group relative flex items-start gap-space-sm p-3 rounded-2xl transition-all border ${
        activity.isVisited
          ? 'bg-surface-container-low/70 border-surface-container-high opacity-75'
          : activity.isPlanBAlternative
          ? 'bg-secondary-fixed/20 border-secondary-container/40'
          : activity.hasPlanBReady
          ? 'bg-error-container/20 border-error/20'
          : 'bg-surface-container-lowest border-surface-container/60 hover:border-primary/40 shadow-sm'
      }`}
    >
      {/* Activity Image Thumbnail */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm bg-surface-container">
        {activity.imageUrl ? (
          <img
            src={activity.imageUrl}
            alt={activity.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">location_on</span>
          </div>
        )}

        {/* Visited Overlay Badge if visited */}
        {activity.isVisited && (
          <div className="absolute inset-0 bg-primary/30 backdrop-blur-[1px] flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>
        )}
      </div>

      {/* Main Info */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <div className="flex flex-col min-w-0">
            <h4
              className={`font-heading text-sm font-semibold truncate leading-tight ${
                activity.isVisited ? 'line-through text-on-surface-variant' : 'text-on-surface'
              }`}
            >
              {activity.title}
            </h4>
            <span className="font-label text-[11px] text-on-surface-variant truncate mt-0.5">
              {activity.location}
            </span>
          </div>

          {/* Visited Toggle Button */}
          {showVisitedToggle && (
            <button
              type="button"
              onClick={() => toggleVisited(dayNumber, activity.id)}
              aria-label={activity.isVisited ? 'Mark as unvisited' : 'Mark as visited'}
              title={activity.isVisited ? 'Mark as unvisited' : 'Mark as visited'}
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                activity.isVisited
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {activity.isVisited ? 'check' : 'radio_button_unchecked'}
              </span>
            </button>
          )}
        </div>

        {/* Badges and metadata */}
        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
          {/* Weather status chip */}
          <span
            className={`font-label text-[10px] px-2 py-0.5 rounded-full font-medium ${
              activity.weatherRisk === 'high'
                ? 'bg-error-container text-on-error-container font-bold animate-pulse'
                : activity.isIndoor
                ? 'bg-secondary-fixed text-on-secondary-fixed'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {activity.weatherRiskLabel}
          </span>

          {/* Plan B Activated Badge */}
          {activity.isPlanBAlternative && (
            <span className="font-label text-[10px] px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-semibold flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">shield</span>
              Plan B Applied
            </span>
          )}

          {/* Category */}
          <span className="font-label text-[10px] px-1.5 py-0.5 rounded bg-surface-container-low text-on-surface-variant">
            {activity.category}
          </span>
        </div>

        {/* Timings, duration and cost */}
        <div className="flex items-center gap-2 mt-2 text-on-surface-variant font-label text-xs">
          <span className="font-semibold text-on-surface">{activity.timeSlot}</span>
          <span>•</span>
          <span>{activity.duration}</span>
          <span>•</span>
          <span className="font-semibold text-primary">{activity.costDisplay}</span>
        </div>

        {/* Plan B Trigger Button if weather threat is present */}
        {activity.hasPlanBReady && activity.weatherRisk === 'high' && !activity.isPlanBAlternative && (
          <div className="mt-2.5 pt-2 border-t border-error/20 flex items-center justify-between">
            <span className="font-label text-[11px] text-error font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              {activity.weatherRiskLabel.includes('⚠️') ? activity.weatherRiskLabel : `⚠️ ${activity.weatherRiskLabel} Alert`}
            </span>
            <button
              type="button"
              onClick={() => openPlanB(activity, dayNumber)}
              className="px-2.5 py-1 rounded-full bg-primary text-on-primary font-label text-[11px] font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
            >
              <span>View Plan B</span>
              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
