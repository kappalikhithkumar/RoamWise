import React from 'react';
import { JAIPUR_HOURLY_FORECAST } from '../../mock/weatherData';

export const HourlyForecast: React.FC = () => {
  return (
    <section className="flex flex-col gap-space-xs">
      <div className="flex items-center justify-between">
        <span className="font-heading text-sm font-bold text-on-surface uppercase tracking-wider">
          Hourly Trajectory
        </span>
        <span className="font-label text-xs text-on-surface-variant">Next 12 Hours</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-margin px-margin">
        {JAIPUR_HOURLY_FORECAST.map((item, idx) => (
          <div
            key={idx}
            className={`flex flex-col items-center justify-between p-3 rounded-2xl min-w-[76px] transition-all border ${
              item.isAlert
                ? 'bg-error-container/40 border-error/40 text-on-error-container shadow-sm'
                : item.isCurrent
                ? 'bg-primary text-on-primary border-primary shadow-sm font-semibold'
                : 'bg-surface-container-lowest text-on-surface border-surface-container/60 shadow-sm'
            }`}
          >
            <span
              className={`font-label text-[11px] ${
                item.isCurrent ? 'opacity-90' : 'text-on-surface-variant'
              }`}
            >
              {item.time.replace(':00 ', '')}
            </span>

            <span
              className={`material-symbols-outlined text-[24px] my-2 ${
                item.isAlert
                  ? 'text-error animate-bounce'
                  : item.isCurrent
                  ? 'text-on-primary'
                  : 'text-secondary'
              }`}
            >
              {item.icon}
            </span>

            <span className="font-heading text-sm font-bold">{item.temp}°</span>

            {/* Precipitation probability */}
            <span
              className={`font-label text-[10px] mt-1 px-1.5 py-0.5 rounded-full ${
                item.pop > 50
                  ? 'bg-error text-on-error font-bold'
                  : item.isCurrent
                  ? 'bg-on-primary/20 text-on-primary'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              {item.pop}% Rain
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};
