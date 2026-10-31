import React from 'react';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { WeatherAlertBanner } from '../components/weather/WeatherAlertBanner';
import { WeatherHero } from '../components/weather/WeatherHero';
import { HourlyForecast } from '../components/weather/HourlyForecast';
import { MultiDayForecast } from '../components/weather/MultiDayForecast';
import { PlanBBottomSheet } from '../components/plan-b/PlanBBottomSheet';

export const WeatherPage: React.FC = () => {
  const { state, openPlanB } = useTrip();

  // Find activities affected by weather
  const affectedItems: { dayNumber: number; activity: any }[] = [];
  state.days.forEach((day) => {
    day.activities.forEach((act) => {
      if (act.hasPlanBReady) {
        affectedItems.push({ dayNumber: day.dayNumber, activity: act });
      }
    });
  });

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Header title="Weather Radar" />

      <main className="flex-1 w-full max-w-xl mx-auto pt-20 pb-28 px-margin flex flex-col gap-space-lg">
        {/* Active Weather Threat Banner */}
        <WeatherAlertBanner />

        {/* Current Weather Hero */}
        <WeatherHero />

        {/* Weather Affected Activities List */}
        {affectedItems.length > 0 && (
          <section className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-heading text-sm font-bold text-on-surface uppercase tracking-wider">
                Weather-Affected Activities
              </span>
              <span className="font-label text-xs text-error font-semibold">
                {affectedItems.length} Threat Detected
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {affectedItems.map(({ dayNumber, activity }) => (
                <div
                  key={activity.id}
                  className="p-3.5 rounded-2xl bg-error-container/20 border border-error/30 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">thunderstorm</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-label text-[10px] text-error font-bold uppercase">
                          Day 0{dayNumber} Afternoon
                        </span>
                        <span className="text-outline">•</span>
                        <span className="font-label text-[10px] text-on-surface-variant font-medium">
                          65% Rain Risk
                        </span>
                      </div>
                      <h4 className="font-heading text-sm font-semibold text-on-surface truncate">
                        {activity.title}
                      </h4>
                      <span className="font-body text-xs text-on-surface-variant truncate">
                        Open-air stonework vulnerable to rain
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => openPlanB(activity, dayNumber)}
                    className="px-3 py-1.5 rounded-full bg-primary hover:bg-primary-container text-on-primary font-label text-xs font-semibold shrink-0 shadow-sm active:scale-95 transition-all"
                  >
                    Plan B
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Hourly Forecast */}
        <HourlyForecast />

        {/* Multi-Day Forecast */}
        <MultiDayForecast />
      </main>

      {/* Plan B Modal */}
      <PlanBBottomSheet />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
