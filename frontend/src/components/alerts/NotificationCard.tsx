import React from 'react';
import { TravelAlert } from '../../types';
import { useTrip } from '../../context/TripContext';

interface NotificationCardProps {
  alert: TravelAlert;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({ alert }) => {
  const { state, markAlertRead, openPlanB } = useTrip();

  const handleReviewPlanB = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAlertRead(alert.id);
    if (alert.dayNumber && alert.activityId) {
      const day = state.days.find((d) => d.dayNumber === alert.dayNumber);
      const act = day?.activities.find((a) => a.id === alert.activityId);
      if (act) {
        openPlanB(act, alert.dayNumber);
      }
    }
  };

  return (
    <article
      onClick={() => markAlertRead(alert.id)}
      className={`group relative flex flex-col p-space-md rounded-2xl transition-all border cursor-pointer ${
        alert.unread
          ? 'bg-surface-container-lowest border-primary/30 shadow-md ring-1 ring-primary/20'
          : 'bg-surface-container-lowest/80 border-surface-container/60 shadow-sm opacity-85'
      }`}
    >
      {/* Top row: Category tag, time, and unread dot */}
      <div className="flex items-center justify-between pb-space-xs">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded-full font-label text-[10px] font-bold flex items-center gap-1 ${
              alert.type === 'weather'
                ? 'bg-error-container text-on-error-container'
                : 'bg-secondary-fixed text-on-secondary-fixed'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">
              {alert.type === 'weather' ? 'thunderstorm' : 'auto_awesome'}
            </span>
            <span>{alert.category}</span>
          </span>
          <span className="font-label text-xs text-on-surface-variant">· {alert.timeAgo}</span>
        </div>

        {alert.unread && (
          <span className="w-2.5 h-2.5 rounded-full bg-error ring-4 ring-error-container/40" />
        )}
      </div>

      {/* Main Content */}
      <div className="mt-2 flex gap-3">
        {alert.imageUrl && (
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-surface-container shadow-sm">
            <img src={alert.imageUrl} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex flex-col min-w-0 flex-1">
          <h3 className="font-heading text-sm font-bold text-on-surface leading-snug">
            {alert.title}
          </h3>
          <p className="font-body text-xs text-on-surface-variant mt-1 leading-relaxed line-clamp-2">
            {alert.message}
          </p>
        </div>
      </div>

      {/* Action CTA */}
      {alert.hasPlanB && (
        <div className="mt-3 pt-2 border-t border-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-secondary text-xs">
            <span className="material-symbols-outlined text-[16px]">umbrella</span>
            <span className="font-label text-xs">Sheltered alternative ready</span>
          </div>

          <button
            type="button"
            onClick={handleReviewPlanB}
            className="px-3.5 py-1.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
          >
            <span>Review Plan B</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </button>
        </div>
      )}
    </article>
  );
};
