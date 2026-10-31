import React from 'react';
import { JAIPUR_DAILY_FORECAST } from '../../mock/weatherData';

export const MultiDayForecast: React.FC = () => {
  return (
    <section className="flex flex-col gap-space-xs">
      <div className="flex items-center justify-between">
        <span className="font-heading text-sm font-bold text-on-surface uppercase tracking-wider">
          5-Day Weather Outlook
        </span>
        <span className="font-label text-xs text-primary font-medium">Nov 14 – 18, 2026</span>
      </div>

      <div className="flex flex-col gap-2 bg-surface-container-lowest p-3 rounded-2xl border border-surface-container/60 shadow-sm">
        {JAIPUR_DAILY_FORECAST.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between p-2.5 rounded-xl transition-colors ${
              item.hasAlert
                ? 'bg-error-container/20 border border-error/30'
                : 'hover:bg-surface-container-low'
            }`}
          >
            <div className="flex items-center gap-3 min-w-[100px]">
              <div className="flex flex-col">
                <span className="font-heading text-sm font-semibold text-on-surface">
                  {item.day}
                </span>
                <span className="font-label text-[11px] text-on-surface-variant">
                  {item.date}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-1 justify-center">
              <span
                className={`material-symbols-outlined text-[20px] ${
                  item.hasAlert ? 'text-error animate-pulse' : 'text-secondary'
                }`}
              >
                {item.icon}
              </span>
              <span className="font-body text-xs text-on-surface truncate max-w-[130px]">
                {item.condition}
              </span>
            </div>

            <div className="flex items-center gap-3 text-right">
              {item.rainRisk > 40 ? (
                <span className="font-label text-[10px] px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-bold">
                  {item.rainRisk}% Rain
                </span>
              ) : (
                <span className="font-label text-[10px] text-on-surface-variant">
                  {item.rainRisk}%
                </span>
              )}
              <div className="flex items-center gap-1 font-heading text-xs font-semibold text-on-surface">
                <span>{item.tempHigh}°</span>
                <span className="text-on-surface-variant font-normal">/ {item.tempLow}°</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
