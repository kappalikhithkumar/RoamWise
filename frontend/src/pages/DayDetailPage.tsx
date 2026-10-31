import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { DayTimeline } from '../components/trip/DayTimeline';
import { PlanBBottomSheet } from '../components/plan-b/PlanBBottomSheet';

export const DayDetailPage: React.FC = () => {
  const { dayId } = useParams<{ dayId: string }>();
  const navigate = useNavigate();
  const { state } = useTrip();

  const currentDayNum = parseInt(dayId || '1', 10);
  const currentDay = state.days.find((d) => d.dayNumber === currentDayNum) || state.days[0];

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Header
        title={`Day 0${currentDay.dayNumber} Timeline`}
        showBack={true}
        onBack={() => navigate('/trip')}
      />

      <main className="flex-1 w-full max-w-xl mx-auto pt-20 pb-24 px-margin flex flex-col gap-space-lg">
        {/* Day Header Banner */}
        <section className="bg-surface-container-lowest rounded-2xl p-space-md border border-surface-container/60 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs uppercase tracking-wider font-bold text-secondary">
              {currentDay.dayOfWeek} • {currentDay.dateStr}
            </span>
            <span
              className={`font-label text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                currentDay.rainRisk > 40
                  ? 'bg-secondary-fixed/50 text-on-secondary-container font-semibold'
                  : 'bg-tertiary-fixed/60 text-on-tertiary-fixed-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[13px]">
                {currentDay.rainRisk > 40 ? 'rainy' : 'wb_sunny'}
              </span>
              <span>{currentDay.weatherSummary}</span>
            </span>
          </div>

          <h1 className="font-heading text-xl font-bold text-on-surface leading-tight">
            {currentDay.theme}
          </h1>

          {currentDay.weatherAlert && (
            <div className="mt-1 flex items-center gap-2 p-2.5 rounded-xl bg-error-container text-on-error-container text-xs font-semibold">
              <span className="material-symbols-outlined text-[18px]">thunderstorm</span>
              <span>{currentDay.weatherAlert}</span>
            </div>
          )}
        </section>

        {/* Day Timeline */}
        <DayTimeline day={currentDay} />

        {/* Next / Previous Day Navigation Buttons */}
        <div className="flex items-center justify-between pt-space-xs">
          {currentDay.dayNumber > 1 ? (
            <button
              type="button"
              onClick={() => navigate(`/trip/day/${currentDay.dayNumber - 1}`)}
              className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Day 0{currentDay.dayNumber - 1}</span>
            </button>
          ) : (
            <div />
          )}

          {currentDay.dayNumber < state.days.length && (
            <button
              type="button"
              onClick={() => navigate(`/trip/day/${currentDay.dayNumber + 1}`)}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label text-xs font-semibold flex items-center gap-1 shadow-sm active:scale-95 transition-all"
            >
              <span>Day 0{currentDay.dayNumber + 1}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          )}
        </div>
      </main>

      {/* Plan B Modal */}
      <PlanBBottomSheet />
    </div>
  );
};
