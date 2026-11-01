import React from 'react';
import { JAIPUR_CURRENT_WEATHER } from '../../mock/weatherData';

export const WeatherHero: React.FC = () => {
  const data = JAIPUR_CURRENT_WEATHER;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-surface-container-low text-on-surface shadow-md p-space-md border border-surface-container">
      {/* Ambient Atmospheric Glow Orbs */}
      <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-primary-container/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-space-md">
        {/* Header Location and Status Stamp */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
              <h2 className="font-heading text-xl font-bold text-on-surface">Jaipur, Rajasthan</h2>
            </div>
            <p className="font-label text-xs text-on-surface-variant">
              Amer & Old City Basins • Live Atmospheric Sync
            </p>
          </div>

          <span className="inline-flex items-center gap-1 bg-surface-container text-on-surface font-label text-[11px] px-2.5 py-1 rounded-full border border-surface-container-high">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live Sensors
          </span>
        </div>

        {/* Main Temperature Display */}
        <div className="flex items-center justify-between py-space-xs">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="font-heading text-4xl font-bold text-on-surface tracking-tight">
                {data.temperature}°
              </span>
              <span className="font-heading text-xl text-on-surface-variant">C</span>
            </div>
            <span className="font-heading text-base font-semibold text-on-surface mt-0.5">
              {data.condition}
            </span>
            <span className="font-body text-xs text-on-surface-variant">
              High {data.highTemp}° • Low {data.lowTemp}° • Pleasant dry breeze
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-secondary-fixed/40 flex items-center justify-center text-secondary shadow-sm">
              <span
                className="material-symbols-outlined text-[36px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                partly_cloudy_day
              </span>
            </div>
            <span className="font-label text-[11px] text-secondary font-semibold mt-1">
              UV {data.uvIndex} ({data.uvLevel})
            </span>
          </div>
        </div>

        {/* Sensory Metrics Clusters */}
        <div className="grid grid-cols-3 gap-2 pt-space-xs">
          <div className="bg-surface-container-lowest p-2.5 rounded-xl flex flex-col items-center text-center shadow-sm border border-surface-container/40">
            <div className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-[16px]">humidity_mid</span>
              <span className="font-label text-[10px] text-on-surface-variant">Humidity</span>
            </div>
            <span className="font-label text-xs font-semibold text-on-surface mt-0.5">
              {data.humidity}%
            </span>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-xl flex flex-col items-center text-center shadow-sm border border-surface-container/40">
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[16px]">air</span>
              <span className="font-label text-[10px] text-on-surface-variant">Wind</span>
            </div>
            <span className="font-label text-xs font-semibold text-on-surface mt-0.5">
              {data.wind}
            </span>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-xl flex flex-col items-center text-center shadow-sm border border-surface-container/40">
            <div className="flex items-center gap-1 text-tertiary">
              <span className="material-symbols-outlined text-[16px]">wb_twilight</span>
              <span className="font-label text-[10px] text-on-surface-variant">Daylight</span>
            </div>
            <span className="font-label text-xs font-semibold text-on-surface mt-0.5">
              {data.daylight}
            </span>
          </div>
        </div>

        {/* Sunrise & Sunset */}
        <div className="flex items-center justify-between bg-surface-container/70 px-space-md py-2 rounded-xl text-xs">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-tertiary text-[18px]">wb_sunny</span>
            <span className="font-body text-on-surface">
              Sunrise <strong className="font-semibold">{data.sunrise}</strong>
            </span>
          </div>
          <div className="h-3 w-px bg-outline-variant/60" />
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[18px]">wb_twilight</span>
            <span className="font-body text-on-surface">
              Sunset <strong className="font-semibold">{data.sunset}</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
