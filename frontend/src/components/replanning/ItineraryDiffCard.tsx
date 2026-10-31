import React from 'react';
import { ItineraryDiffItem } from '../../types';

interface ItineraryDiffCardProps {
  item: ItineraryDiffItem;
}

export const ItineraryDiffCard: React.FC<ItineraryDiffCardProps> = ({ item }) => {
  const getBadgeStyle = () => {
    switch (item.type) {
      case 'adjusted':
        return {
          barColor: 'bg-tertiary',
          badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed font-bold',
          badgeText: 'Adjusted Timing',
          icon: 'schedule'
        };
      case 'added':
        return {
          barColor: 'bg-primary',
          badgeClass: 'bg-primary-fixed text-on-primary-fixed font-bold',
          badgeText: 'Newly Added',
          icon: 'add_circle'
        };
      case 'removed':
        return {
          barColor: 'bg-error',
          badgeClass: 'bg-error-container text-on-error-container font-bold',
          badgeText: 'Removed to Save Time',
          icon: 'remove_circle'
        };
      case 'locked':
      default:
        return {
          barColor: 'bg-outline',
          badgeClass: 'bg-surface-container-high text-on-surface-variant font-semibold',
          badgeText: 'Locked & Preserved',
          icon: 'lock'
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <div className="relative bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container/60 overflow-hidden flex flex-col gap-2">
      {/* Color Accent Indicator Strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${style.barColor}`} />

      {/* Header row with badge and cost */}
      <div className="flex items-center justify-between pl-1">
        <span className={`inline-flex items-center gap-1 font-label text-[10px] px-2 py-0.5 rounded-full ${style.badgeClass}`}>
          <span className="material-symbols-outlined text-[13px]">{style.icon}</span>
          <span>{style.badgeText}</span>
        </span>
        <span className="font-heading text-xs font-semibold text-primary">{item.costDisplay}</span>
      </div>

      {/* Activity Details */}
      <div className="flex flex-col pl-1">
        <h4 className="font-heading text-sm font-bold text-on-surface leading-snug">
          {item.title}
        </h4>
        <span className="font-body text-xs text-on-surface-variant">{item.location}</span>
      </div>

      {/* Timings comparison */}
      <div className="flex items-center gap-2 pl-1 font-label text-xs">
        {item.originalTime && item.originalTime !== item.newTime ? (
          <>
            <span className="line-through text-outline">{item.originalTime}</span>
            <span className="material-symbols-outlined text-[14px] text-tertiary">arrow_forward</span>
            <span className="font-bold text-tertiary">{item.newTime}</span>
          </>
        ) : (
          <span className="font-medium text-on-surface">{item.newTime || item.originalTime}</span>
        )}
        <span className="text-outline">•</span>
        <span className="text-on-surface-variant">{item.duration}</span>
      </div>

      {/* AI Rationale Note */}
      <div className="mt-1 p-2 rounded-xl bg-surface-container-low text-xs text-on-surface pl-2 border border-surface-container">
        <span className="font-semibold text-primary">AI Strategy: </span>
        <span className="text-on-surface-variant">{item.notes}</span>
      </div>
    </div>
  );
};
