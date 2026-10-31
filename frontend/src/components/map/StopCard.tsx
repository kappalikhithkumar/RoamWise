import React from 'react';
import { Activity } from '../../types';

interface StopCardProps {
  activity: Activity;
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const StopCard: React.FC<StopCardProps> = ({
  activity,
  index,
  isSelected = false,
  onSelect
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
        isSelected
          ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/30'
          : 'bg-surface-container-lowest border-surface-container/60 hover:border-surface-container-highest shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Number badge */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-heading text-xs font-bold ${
            activity.isVisited
              ? 'bg-surface-container-high text-on-surface-variant'
              : isSelected
              ? 'bg-primary text-on-primary shadow-sm'
              : 'bg-secondary-fixed text-on-secondary-fixed'
          }`}
        >
          {activity.isVisited ? (
            <span className="material-symbols-outlined text-[16px]">check</span>
          ) : (
            index + 1
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-heading text-sm font-semibold text-on-surface truncate">
              {activity.title}
            </h4>
            {activity.isVisited && (
              <span className="font-label text-[10px] text-primary font-medium bg-primary-fixed/40 px-1.5 py-0.2 rounded">
                Visited
              </span>
            )}
          </div>
          <span className="font-body text-xs text-on-surface-variant truncate">
            {activity.location}
          </span>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-on-surface-variant">
            <span>{activity.timeSlot}</span>
            <span>•</span>
            <span>{activity.duration}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end shrink-0">
        <span className="font-label text-xs font-semibold text-primary">
          {activity.costDisplay}
        </span>
        <span className="font-label text-[10px] text-on-surface-variant mt-0.5">
          {index === 0 ? 'Start' : `Leg ${index}`}
        </span>
      </div>
    </div>
  );
};
