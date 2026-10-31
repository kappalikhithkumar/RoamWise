import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DayItinerary } from '../../types';
import { ActivityCard } from './ActivityCard';

interface DayTimelineProps {
  day: DayItinerary;
}

export const DayTimeline: React.FC<DayTimelineProps> = ({ day }) => {
  const navigate = useNavigate();

  const morningActivities = day.activities.filter((a) => a.period === 'morning');
  const afternoonActivities = day.activities.filter((a) => a.period === 'afternoon');
  const eveningActivities = day.activities.filter((a) => a.period === 'evening');

  const visitedCount = day.activities.filter((a) => a.isVisited).length;
  const totalCount = day.activities.length;

  return (
    <div className="flex flex-col gap-space-lg">
      {/* Day Progress Summary Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-low border border-surface-container">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">
            {visitedCount === totalCount ? 'check_circle' : 'flag'}
          </span>
          <span className="font-label text-xs font-semibold text-on-surface">
            {visitedCount} of {totalCount} stops visited
          </span>
        </div>
        <button
          onClick={() => navigate('/replan')}
          className="px-3 py-1 rounded-full bg-surface-container-highest hover:bg-surface-container text-primary font-label text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[14px]">tune</span>
          <span>Re-plan Day</span>
        </button>
      </div>

      {/* Morning Section */}
      {morningActivities.length > 0 && (
        <section className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
              <span className="material-symbols-outlined text-[14px]">wb_twilight</span>
            </div>
            <h3 className="font-heading text-sm font-bold text-on-surface uppercase tracking-wider">
              Morning Flow
            </h3>
            <div className="h-px bg-surface-container-high flex-1" />
          </div>
          <div className="flex flex-col gap-2.5">
            {morningActivities.map((act) => (
              <ActivityCard key={act.id} activity={act} dayNumber={day.dayNumber} />
            ))}
          </div>
        </section>
      )}

      {/* Afternoon Section */}
      {afternoonActivities.length > 0 && (
        <section className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
              <span className="material-symbols-outlined text-[14px]">wb_sunny</span>
            </div>
            <h3 className="font-heading text-sm font-bold text-on-surface uppercase tracking-wider">
              Afternoon Exploration
            </h3>
            <div className="h-px bg-surface-container-high flex-1" />
          </div>
          <div className="flex flex-col gap-2.5">
            {afternoonActivities.map((act) => (
              <ActivityCard key={act.id} activity={act} dayNumber={day.dayNumber} />
            ))}
          </div>
        </section>
      )}

      {/* Evening Section */}
      {eveningActivities.length > 0 && (
        <section className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
              <span className="material-symbols-outlined text-[14px]">nights_stay</span>
            </div>
            <h3 className="font-heading text-sm font-bold text-on-surface uppercase tracking-wider">
              Evening & Dinner
            </h3>
            <div className="h-px bg-surface-container-high flex-1" />
          </div>
          <div className="flex flex-col gap-2.5">
            {eveningActivities.map((act) => (
              <ActivityCard key={act.id} activity={act} dayNumber={day.dayNumber} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
