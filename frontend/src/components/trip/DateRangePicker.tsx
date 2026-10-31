import React from 'react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  error?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  error
}) => {
  // Calculate duration in days
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const daysCount = calculateDays();
  const nightsCount = Math.max(0, daysCount - 1);

  return (
    <section className="flex flex-col gap-space-xs">
      <div className="flex items-center justify-between">
        <span className="font-label text-sm text-on-surface font-semibold">Travel Dates</span>
        {daysCount > 0 && (
          <span className="font-label text-xs text-primary font-medium">
            {daysCount} Days • {nightsCount} Nights
          </span>
        )}
      </div>

      <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-sm flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="start-date" className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
              Departure
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full h-10 px-2.5 rounded-lg bg-surface-container-low font-body text-xs text-on-surface border border-transparent focus:border-primary focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="end-date" className="font-label text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
              Return
            </label>
            <input
              id="end-date"
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full h-10 px-2.5 rounded-lg bg-surface-container-low font-body text-xs text-on-surface border border-transparent focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Climate indicator pill */}
        <div className="flex items-center gap-2 pt-1 border-t border-surface-container-low">
          <span className="material-symbols-outlined text-primary text-[18px]">calendar_month</span>
          <span className="font-label text-xs text-on-surface-variant">
            {daysCount > 0 ? (
              <>
                <strong className="text-on-surface font-semibold">
                  {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} —{' '}
                  {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </strong>
                <span className="mx-1.5 text-outline">•</span>
                <span className="text-primary font-semibold">Pleasant Winter Season</span>
              </>
            ) : (
              'Select valid departure and return dates'
            )}
          </span>
        </div>
      </div>

      {error && <p className="font-body text-xs text-error mt-0.5">{error}</p>}
    </section>
  );
};
