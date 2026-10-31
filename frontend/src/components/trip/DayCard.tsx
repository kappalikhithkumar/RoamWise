import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DayItinerary } from '../../types';
import { ActivityCard } from './ActivityCard';

interface DayCardProps {
  day: DayItinerary;
  defaultExpanded?: boolean;
}

export const DayCard: React.FC<DayCardProps> = ({ day, defaultExpanded = true }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <article className="relative bg-surface-container-lowest rounded-[20px] p-space-md shadow-[0_6px_20px_-4px_rgba(15,23,42,0.06)] border border-surface-container/60 flex flex-col gap-space-md transition-all">
      {/* Ambient Weather Alert Highlight Bar if day has alert */}
      {day.weatherAlert && (
        <div className="flex items-center gap-space-xs bg-error-container text-on-error-container px-space-sm py-1.5 rounded-xl font-label text-xs font-semibold">
          <span className="material-symbols-outlined text-[16px]">thunderstorm</span>
          <span>{day.weatherAlert}</span>
        </div>
      )}

      {/* Date & Theme Banner */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-label text-xs text-secondary font-bold tracking-wide uppercase">
            Day 0{day.dayNumber} • {day.dayOfWeek}
          </span>
          <span
            className={`inline-flex items-center gap-1 font-label text-xs px-2.5 py-0.5 rounded-full ${
              day.rainRisk > 40
                ? 'bg-secondary-fixed/50 text-on-secondary-container font-semibold'
                : 'bg-tertiary-fixed/60 text-on-tertiary-fixed-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">
              {day.rainRisk > 40 ? 'rainy' : 'wb_sunny'}
            </span>
            <span>{day.weatherSummary}</span>
          </span>
        </div>

        <div className="flex items-start justify-between gap-2 mt-0.5">
          <div className="flex flex-col">
            <h2 className="font-heading text-lg font-bold text-on-surface leading-snug">
              {day.theme}
            </h2>
            <span className="font-body text-xs text-on-surface-variant">{day.dateStr}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors shrink-0"
            aria-label={isExpanded ? 'Collapse day' : 'Expand day'}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isExpanded ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {/* Collapsible Activities List */}
      {isExpanded && (
        <div className="flex flex-col gap-space-sm animate-fadeIn">
          {day.activities.map((act) => (
            <ActivityCard key={act.id} activity={act} dayNumber={day.dayNumber} />
          ))}

          {/* Footer Action to open dedicated Day Detail Timeline */}
          <button
            type="button"
            onClick={() => navigate(`/trip/day/${day.dayNumber}`)}
            className="flex items-center justify-between pt-space-xs text-primary font-label text-xs font-semibold hover:underline active:scale-[0.99] transition-all"
          >
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>View Full Day Timeline</span>
            </span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        </div>
      )}
    </article>
  );
};
