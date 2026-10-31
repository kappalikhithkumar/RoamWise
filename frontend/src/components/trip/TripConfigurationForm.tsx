import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { TripConfig, BudgetTier, TravelPace, TravelerType, InterestType } from '../../types';
import { DestinationSelector } from './DestinationSelector';
import { DateRangePicker } from './DateRangePicker';
import { BudgetSelector } from './BudgetSelector';
import { InterestSelector } from './InterestSelector';
import { TravellerSelector } from './TravellerSelector';
import { TravelPaceSelector } from './TravelPaceSelector';

export const TripConfigurationForm: React.FC = () => {
  const navigate = useNavigate();
  const { state, updateConfig } = useTrip();

  const [destination, setDestination] = useState(state.config.destination);
  const [startDate, setStartDate] = useState(state.config.startDate);
  const [endDate, setEndDate] = useState(state.config.endDate);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>(state.config.budgetTier);
  const [interests, setInterests] = useState<InterestType[]>(state.config.interests);
  const [travelerType, setTravelerType] = useState<TravelerType>(state.config.travelerType);
  const [pace, setPace] = useState<TravelPace>(state.config.pace);
  const [weatherAdaptive, setWeatherAdaptive] = useState(state.config.weatherAdaptive);

  const [errors, setErrors] = useState<{ destination?: string; dates?: string }>({});

  const validate = (): boolean => {
    const errs: { destination?: string; dates?: string } = {};
    if (!destination.trim()) {
      errs.destination = 'Please enter a destination.';
    }
    if (!startDate || !endDate) {
      errs.dates = 'Please select departure and return dates.';
    } else if (new Date(endDate) < new Date(startDate)) {
      errs.dates = 'Return date cannot be earlier than departure date.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newConfig: TripConfig = {
      destination,
      startDate,
      endDate,
      budgetTier,
      interests,
      travelerType,
      pace,
      weatherAdaptive,
      tagline: `${travelerType} Expedition in ${destination.split(',')[0]}`
    };

    updateConfig(newConfig);
    navigate('/generating');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-space-lg pb-10">
      {/* AI Version Badge & Hero Title */}
      <section className="flex flex-col gap-1 pt-1">
        <div className="inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed shadow-sm">
          <span className="material-symbols-outlined text-[15px] animate-spin" style={{ animationDuration: '6s' }}>
            magic_button
          </span>
          <span className="font-label text-xs font-bold uppercase tracking-wider">
            Atmospheric AI V3
          </span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-on-surface tracking-tight mt-1">
          Where to next?
        </h1>
        <p className="font-body text-sm text-on-surface-variant">
          AI weather-aware itinerary planner tailored to real-time climate forecasts.
        </p>
      </section>

      {/* Destination */}
      <DestinationSelector
        value={destination}
        onChange={(val) => {
          setDestination(val);
          if (errors.destination) setErrors({ ...errors, destination: undefined });
        }}
        error={errors.destination}
      />

      {/* Travel Dates */}
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={(val) => {
          setStartDate(val);
          if (errors.dates) setErrors({ ...errors, dates: undefined });
        }}
        onEndDateChange={(val) => {
          setEndDate(val);
          if (errors.dates) setErrors({ ...errors, dates: undefined });
        }}
        error={errors.dates}
      />

      {/* Budget */}
      <BudgetSelector value={budgetTier} onChange={setBudgetTier} />

      {/* Interests */}
      <InterestSelector selectedInterests={interests} onChange={setInterests} />

      {/* Who are you travelling with? */}
      <TravellerSelector value={travelerType} onChange={setTravelerType} />

      {/* Travel Pace */}
      <TravelPaceSelector value={pace} onChange={setPace} />

      {/* Weather Intelligence Active Card */}
      <section className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-container shadow-sm flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[22px]">cloud_sync</span>
        </div>
        <div className="flex flex-col gap-0.5 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-label text-xs text-on-surface font-semibold">
                Weather Intelligence Active
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label text-[10px] font-bold">
                LIVE
              </span>
            </div>
            <button
              type="button"
              onClick={() => setWeatherAdaptive(!weatherAdaptive)}
              className={`w-9 h-5 rounded-full transition-colors relative ${
                weatherAdaptive ? 'bg-primary' : 'bg-outline-variant'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  weatherAdaptive ? 'left-4' : 'left-0.5'
                }`}
              />
            </button>
          </div>
          <p className="font-body text-xs text-on-surface-variant leading-relaxed mt-0.5">
            Real-time heat & rain adaptation enabled. Outdoor treks automatically relocate to sheltered museums or artisan craft ateliers during extreme weather.
          </p>
        </div>
      </section>

      {/* CTA Submit Button */}
      <div className="sticky bottom-20 z-20 pt-1 pb-1">
        <button
          type="submit"
          className="w-full h-12 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-label text-sm font-semibold shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
          <span>Generate My Itinerary</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </form>
  );
};
