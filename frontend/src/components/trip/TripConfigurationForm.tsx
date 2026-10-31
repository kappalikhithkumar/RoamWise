import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { TripConfig, BudgetTier, TravelPace, TravelerType, InterestType } from '../../types';

interface StopItem {
  id: string;
  name: string;
  desc: string;
  city: string;
}

const DEFAULT_STOPS: StopItem[] = [
  { id: 'stop-1', name: 'Jaipur, Rajasthan', desc: 'Stop 1 • Gateway City', city: 'Jaipur' },
  { id: 'stop-2', name: 'Delhi, NCR', desc: 'Stop 2 • Capital Circuit', city: 'Delhi' },
  { id: 'stop-3', name: 'Agra, Uttar Pradesh', desc: 'Stop 3 • Heritage Wonder', city: 'Agra' }
];

const SUGGESTED_ORDER_STOPS: StopItem[] = [
  { id: 'stop-opt-1', name: 'Delhi, NCR', desc: 'Stop 1 • Capital Circuit (Hub)', city: 'Delhi' },
  { id: 'stop-opt-2', name: 'Agra, Uttar Pradesh', desc: 'Stop 2 • Heritage Wonder (Expressway)', city: 'Agra' },
  { id: 'stop-opt-3', name: 'Jaipur, Rajasthan', desc: 'Stop 3 • Gateway City (Return)', city: 'Jaipur' }
];

const QUICK_ADD_CITIES = [
  { name: 'Udaipur, Rajasthan', desc: 'Lakes & Royal Palaces', city: 'Udaipur' },
  { name: 'Varanasi, Uttar Pradesh', desc: 'Sacred Ghats & Evening Aarti', city: 'Varanasi' },
  { name: 'Jodhpur, Rajasthan', desc: 'Blue City & Mehrangarh Fort', city: 'Jodhpur' },
  { name: 'Rishikesh, Uttarakhand', desc: 'Yoga Capital & Foothills', city: 'Rishikesh' }
];

const INTEREST_OPTIONS: { id: InterestType; label: string; icon: string }[] = [
  { id: 'Adventure', label: 'Adventure', icon: 'hiking' },
  { id: 'Nature', label: 'Nature', icon: 'park' },
  { id: 'Food', label: 'Food', icon: 'restaurant' },
  { id: 'History', label: 'History', icon: 'castle' },
  { id: 'Culture', label: 'Culture', icon: 'palette' },
  { id: 'Spiritual', label: 'Spiritual', icon: 'self_improvement' },
  { id: 'Shopping', label: 'Shopping', icon: 'shopping_bag' },
  { id: 'Relaxation', label: 'Relaxation', icon: 'spa' }
];

export const TripConfigurationForm: React.FC = () => {
  const navigate = useNavigate();
  const { updateConfig } = useTrip();

  // Region Scope
  const [isDomestic, setIsDomestic] = useState<boolean>(true);

  // Multi-stop destinations
  const [stops, setStops] = useState<StopItem[]>(DEFAULT_STOPS);
  const [searchCity, setSearchCity] = useState('');
  const [quickCityIdx, setQuickCityIdx] = useState(0);
  const [suggestionDismissed, setSuggestionDismissed] = useState(false);
  const [suggestionApplied, setSuggestionApplied] = useState(false);
  const [highlightSuggestion, setHighlightSuggestion] = useState(false);

  // Dates
  const [startDate, setStartDate] = useState('2025-10-18');
  const [endDate, setEndDate] = useState('2025-10-24');

  // Budget
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('Moderate');

  // Interests
  const [interests, setInterests] = useState<InterestType[]>(['Nature', 'Food', 'History', 'Culture']);

  // Traveler Type
  const [travelerType, setTravelerType] = useState<TravelerType>('Couple');

  // Travel Pace
  const [pace, setPace] = useState<TravelPace>('Balanced');

  // Weather Adaptive
  const [weatherAdaptive, setWeatherAdaptive] = useState(true);

  // Form State
  const [errors, setErrors] = useState<{ destination?: string; dates?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Duration helper
  const getDuration = () => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return { days: 7, nights: 6 };
    const diff = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    return { days: diff, nights: Math.max(0, diff - 1) };
  };

  const duration = getDuration();

  // Handle Add Stop
  const handleAddStop = () => {
    let nameToAdd = searchCity.trim();
    let descToAdd = 'Curated Circuit Extension';
    let cityToAdd = nameToAdd.split(',')[0] || nameToAdd;

    if (!nameToAdd) {
      const chosen = QUICK_ADD_CITIES[quickCityIdx % QUICK_ADD_CITIES.length];
      setQuickCityIdx((prev) => prev + 1);
      nameToAdd = chosen.name;
      descToAdd = chosen.desc;
      cityToAdd = chosen.city;
    } else {
      setSearchCity('');
    }

    const newStop: StopItem = {
      id: `stop-${Date.now()}`,
      name: nameToAdd,
      desc: `Stop ${stops.length + 1} • ${descToAdd}`,
      city: cityToAdd
    };

    setStops([...stops, newStop]);
    if (errors.destination) setErrors({ ...errors, destination: undefined });
  };

  // Handle Remove Stop
  const handleRemoveStop = (id: string) => {
    if (stops.length <= 1) return;
    const remaining = stops.filter((s) => s.id !== id);
    setStops(
      remaining.map((s, idx) => ({
        ...s,
        desc: `Stop ${idx + 1} • ${s.desc.replace(/^Stop \d+ • /, '')}`
      }))
    );
  };

  // Reorder Stops
  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stops.length) return;
    const updated = [...stops];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setStops(
      updated.map((s, idx) => ({
        ...s,
        desc: `Stop ${idx + 1} • ${s.desc.replace(/^Stop \d+ • /, '')}`
      }))
    );
  };

  // Apply AI Suggested Order
  const handleApplySuggestedOrder = () => {
    setStops(SUGGESTED_ORDER_STOPS);
    setSuggestionApplied(true);
    setHighlightSuggestion(false);
  };

  // Toggle Interest
  const toggleInterest = (interest: InterestType) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  // Form Validation & Submit
  const validate = (): boolean => {
    const errs: { destination?: string; dates?: string } = {};
    if (stops.length === 0) {
      errs.destination = 'Please add at least one destination stop.';
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

    setIsSubmitting(true);

    const destinationSummary = stops.map((s) => s.city).join(' ➔ ');
    const newConfig: TripConfig = {
      destination: destinationSummary,
      destinations: stops.map((s) => s.name),
      isDomestic,
      startDate,
      endDate,
      budgetTier,
      interests,
      travelerType,
      pace,
      weatherAdaptive,
      tagline: `${travelerType} Expedition across ${stops.map((s) => s.city).join(', ')}`
    };

    updateConfig(newConfig);

    setTimeout(() => {
      navigate('/generating');
    }, 400);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-space-lg">
      {/* Visual Header Narrative Strip */}
      <div className="flex flex-col gap-space-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-sm text-[11px] uppercase tracking-wider font-semibold">
              Step 1 of 3
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              Circuit Optimizer
            </span>
          </div>
          <span className="font-label-md text-xs text-on-surface-variant font-medium">Customise Route</span>
        </div>
        <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
          Configure stops, cadence, and pace for your bespoke Indian circuit.
        </p>
      </div>

      {/* Section 1: Country & Destination Multi-Stop Engine */}
      <section className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-md border border-surface-container/60">
        {/* Country Segmented Switch */}
        <div className="flex flex-col gap-space-xs">
          <label className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
            Region Scope
          </label>
          <div className="grid grid-cols-2 p-1 bg-surface-container rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setIsDomestic(true)}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-label-lg text-xs font-semibold transition-all ${
                isDomestic
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span>Domestic (India)</span>
              <span className="text-sm">🇮🇳</span>
            </button>
            <button
              type="button"
              onClick={() => setIsDomestic(false)}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg font-label-lg text-xs font-semibold transition-all ${
                !isDomestic
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span>International</span>
              <span className="text-sm">✈️</span>
            </button>
          </div>
        </div>

        {/* Feature Highlight Header */}
        <div className="pt-space-xs flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-base text-primary font-bold flex items-center gap-1.5">
              Route & Destinations
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-[11px] font-semibold">
              Multi-Stop Circuit Enabled
            </span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
            Add multiple destinations to one journey. RoamWise can reorder and optimize your circuit transit paths dynamically.
          </p>
        </div>

        {/* Error notice if empty */}
        {errors.destination && (
          <div className="p-2.5 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errors.destination}</span>
          </div>
        )}

        {/* Ordered Multi-Stop Interactive List */}
        <div className="flex flex-col gap-2.5">
          {stops.map((stop, index) => (
            <div
              key={stop.id}
              className={`group flex items-center justify-between p-3 rounded-xl transition-all ${
                suggestionApplied ? 'bg-secondary-container/50 border border-primary/20' : 'bg-surface-container-low'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Reorder controls */}
                <div className="flex flex-col gap-0.5 text-outline">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveStop(index, 'up')}
                    className="hover:text-primary disabled:opacity-30 disabled:hover:text-outline transition-colors"
                    title="Move stop up"
                  >
                    <span className="material-symbols-outlined text-[16px]">keyboard_arrow_up</span>
                  </button>
                  <button
                    type="button"
                    disabled={index === stops.length - 1}
                    onClick={() => handleMoveStop(index, 'down')}
                    className="hover:text-primary disabled:opacity-30 disabled:hover:text-outline transition-colors"
                    title="Move stop down"
                  >
                    <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
                  </button>
                </div>

                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-sm text-xs font-semibold shrink-0">
                  {index + 1}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-label-lg text-sm text-on-surface font-semibold truncate">
                    {stop.name}
                  </span>
                  <span className="font-body-sm text-xs text-on-surface-variant truncate">
                    {stop.desc}
                  </span>
                </div>
              </div>

              {stops.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveStop(stop.id)}
                  aria-label={`Remove ${stop.name}`}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error-container/30 transition-colors ml-2"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Destination Inline Block */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
            <input
              type="text"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddStop();
                }
              }}
              placeholder="Search & add destination (e.g. Udaipur, Pushkar)..."
              className="w-full bg-surface-container rounded-xl py-2.5 pl-10 pr-3 font-body-md text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <button
            type="button"
            onClick={handleAddStop}
            className="w-full py-2.5 px-3 rounded-xl bg-surface-container text-on-primary-fixed-variant hover:bg-surface-container-high active:scale-[0.99] font-label-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">add_location_alt</span>
            <span>+ Add Another Destination</span>
          </button>
        </div>

        {/* Route Optimization Trigger Button */}
        {!suggestionApplied && (
          <button
            type="button"
            onClick={() => {
              setHighlightSuggestion(true);
              setSuggestionDismissed(false);
            }}
            className="w-full py-3 px-4 rounded-xl bg-surface-container-high text-primary hover:bg-secondary-container font-label-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px] text-on-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
              auto_fix_high
            </span>
            <span>Optimise My Route</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-bold">
              Save ~3.5h
            </span>
          </button>
        )}

        {/* Prominent AI Route Suggestion Card */}
        {!suggestionDismissed && !suggestionApplied && (
          <div
            className={`rounded-xl p-3.5 bg-surface-container-low flex flex-col gap-3 relative overflow-hidden transition-all duration-300 ${
              highlightSuggestion ? 'ring-2 ring-primary bg-secondary-container/30' : ''
            }`}
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-tertiary-fixed flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-label-lg text-xs text-primary font-bold">
                    Route Optimisation Suggestion (Simulated Model)
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-secondary-container text-on-secondary-container font-medium">
                    Heuristic Loop
                  </span>
                </div>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
                  Changing order to <strong className="text-primary font-semibold">Delhi ➔ Agra ➔ Jaipur</strong> saves{' '}
                  <span className="text-tertiary font-semibold">142 km</span> and{' '}
                  <span className="text-tertiary font-semibold">3.5 hrs</span> transit time.
                </p>
              </div>
            </div>

            {/* Suggestion Mini Map Micro-Preview */}
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-container-lowest/80 text-on-surface font-label-sm text-[11px]">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>Delhi</span>
                <span className="material-symbols-outlined text-[14px] text-outline">arrow_forward</span>
                <span className="w-2 h-2 rounded-full bg-surface-tint" />
                <span>Agra</span>
                <span className="material-symbols-outlined text-[14px] text-outline">arrow_forward</span>
                <span className="w-2 h-2 rounded-full bg-on-tertiary-container" />
                <span>Jaipur</span>
              </div>
              <span className="text-on-surface-variant font-medium">Yamuna & NH48</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleApplySuggestedOrder}
                className="py-2 px-3 rounded-lg bg-primary text-on-primary font-label-md text-xs font-semibold text-center hover:bg-primary-container transition-all shadow-sm active:scale-95"
              >
                Apply Suggested Order
              </button>
              <button
                type="button"
                onClick={() => setSuggestionDismissed(true)}
                className="py-2 px-3 rounded-lg bg-surface-container text-on-surface font-label-md text-xs font-medium text-center hover:bg-surface-container-high transition-all"
              >
                Keep My Order
              </button>
            </div>
          </div>
        )}

        {/* Suggested Order Applied Toast */}
        {suggestionApplied && (
          <div className="p-3 rounded-xl bg-secondary-container text-primary font-label-sm text-xs font-semibold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-primary">check_circle</span>
              <span>Suggested Order Applied: Delhi ➔ Agra ➔ Jaipur (Saved 3.5h)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSuggestionApplied(false);
                setStops(DEFAULT_STOPS);
              }}
              className="text-[11px] underline opacity-80 hover:opacity-100"
            >
              Reset
            </button>
          </div>
        )}

        {/* International Note */}
        {!isDomestic && (
          <div className="flex items-center gap-1.5 px-1 text-on-surface-variant font-label-sm text-[11px]">
            <span className="material-symbols-outlined text-[14px] text-outline">info</span>
            <span>Note: International trips currently support curated single-destination immersions.</span>
          </div>
        )}
      </section>

      {/* Section 2: Travel Dates & Live Duration Summary */}
      <section className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-md border border-surface-container/60">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-base text-primary font-bold">Travel Dates</h2>
          <span className="font-label-sm text-xs text-on-surface-variant">IST (UTC+05:30)</span>
        </div>

        {errors.dates && (
          <div className="p-2.5 rounded-xl bg-error-container text-on-error-container text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errors.dates}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2.5">
          {/* Departure Card */}
          <div className="flex flex-col p-3 rounded-xl bg-surface-container-low">
            <div className="flex items-center justify-between text-outline-variant mb-1">
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase font-semibold">
                Departure
              </span>
              <span className="material-symbols-outlined text-[18px] text-primary">calendar_today</span>
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (errors.dates) setErrors({ ...errors, dates: undefined });
              }}
              className="bg-transparent font-label-lg text-sm text-primary font-bold focus:outline-none cursor-pointer"
            />
            <span className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
              Saturday • Morning
            </span>
          </div>

          {/* Return Card */}
          <div className="flex flex-col p-3 rounded-xl bg-surface-container-low">
            <div className="flex items-center justify-between text-outline-variant mb-1">
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase font-semibold">
                Return
              </span>
              <span className="material-symbols-outlined text-[18px] text-primary">event_available</span>
            </div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (errors.dates) setErrors({ ...errors, dates: undefined });
              }}
              className="bg-transparent font-label-lg text-sm text-primary font-bold focus:outline-none cursor-pointer"
            />
            <span className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
              Friday • Evening
            </span>
          </div>
        </div>

        {/* Live Trip Duration Summary Banner */}
        <div className="p-3.5 rounded-xl bg-surface-container flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">wb_sunny</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-label-lg text-xs text-primary font-bold">
              Total Duration: {duration.days} Days, {duration.nights} Nights
            </span>
            <p className="font-body-sm text-[11px] text-on-surface-variant truncate">
              {stops.length} Destinations • Auto-Adapts to Live Weather & Golden Hour
            </p>
          </div>
        </div>
      </section>

      {/* Visual Narrative Break: Destination Atmosphere Preview */}
      <div className="grid grid-cols-3 gap-2">
        <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-surface-container shadow-sm">
          <img
            className="w-full h-full object-cover"
            alt="Warm golden sunrise over Hawa Mahal in Jaipur Rajasthan"
            src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 right-2 text-on-primary">
            <span className="font-label-sm text-xs font-semibold block truncate">Jaipur</span>
            <span className="text-[10px] opacity-90">2 Days</span>
          </div>
        </div>
        <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-surface-container shadow-sm">
          <img
            className="w-full h-full object-cover"
            alt="India Gate Delhi in morning mist and warm golden hour light"
            src="https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=400&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 right-2 text-on-primary">
            <span className="font-label-sm text-xs font-semibold block truncate">Delhi</span>
            <span className="text-[10px] opacity-90">2 Days</span>
          </div>
        </div>
        <div className="relative rounded-xl overflow-hidden aspect-[4/5] bg-surface-container shadow-sm">
          <img
            className="w-full h-full object-cover"
            alt="Reflecting pool in front of the Taj Mahal in Agra Uttar Pradesh"
            src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
          <div className="absolute bottom-2 left-2 right-2 text-on-primary">
            <span className="font-label-sm text-xs font-semibold block truncate">Agra</span>
            <span className="text-[10px] opacity-90">3 Days</span>
          </div>
        </div>
      </div>

      {/* Section 3: Budget Tier Segmented Picker */}
      <section className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-md border border-surface-container/60">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-base text-primary font-bold">Budget Tier</h2>
          <span className="font-label-sm text-xs text-on-surface-variant">Includes Stay & Intercity</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {/* Budget Friendly */}
          <button
            type="button"
            onClick={() => setBudgetTier('Budget-friendly')}
            className={`flex items-center justify-between p-3.5 rounded-xl text-left transition-all ${
              budgetTier === 'Budget-friendly'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low hover:bg-surface-container'
            }`}
          >
            <div className="flex flex-col">
              <span className={`font-label-lg text-xs font-bold ${budgetTier === 'Budget-friendly' ? 'text-on-primary' : 'text-on-surface'}`}>
                Budget-friendly
              </span>
              <span className={`font-body-sm text-[11px] mt-0.5 ${budgetTier === 'Budget-friendly' ? 'text-primary-fixed' : 'text-on-surface-variant'}`}>
                Hostels, experiential dorms & scenic Vande Bharat / Express trains
              </span>
            </div>
            {budgetTier === 'Budget-friendly' ? (
              <div className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0 ml-3">
                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-surface-container-highest shrink-0 ml-3" />
            )}
          </button>

          {/* Moderate */}
          <button
            type="button"
            onClick={() => setBudgetTier('Moderate')}
            className={`flex items-center justify-between p-3.5 rounded-xl text-left transition-all ${
              budgetTier === 'Moderate'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low hover:bg-surface-container'
            }`}
          >
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className={`font-label-lg text-xs font-bold ${budgetTier === 'Moderate' ? 'text-on-primary' : 'text-on-surface'}`}>
                  Moderate
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-secondary text-on-secondary font-medium">
                  Recommended
                </span>
              </div>
              <span className={`font-body-sm text-[11px] mt-0.5 ${budgetTier === 'Moderate' ? 'text-primary-fixed' : 'text-on-surface-variant'}`}>
                Comfort boutique stays, curated homestays & private AC cabs
              </span>
            </div>
            {budgetTier === 'Moderate' ? (
              <div className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0 ml-3">
                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-surface-container-highest shrink-0 ml-3" />
            )}
          </button>

          {/* Premium */}
          <button
            type="button"
            onClick={() => setBudgetTier('Premium')}
            className={`flex items-center justify-between p-3.5 rounded-xl text-left transition-all ${
              budgetTier === 'Premium'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low hover:bg-surface-container'
            }`}
          >
            <div className="flex flex-col">
              <span className={`font-label-lg text-xs font-bold ${budgetTier === 'Premium' ? 'text-on-primary' : 'text-on-surface'}`}>
                Premium
              </span>
              <span className={`font-body-sm text-[11px] mt-0.5 ${budgetTier === 'Premium' ? 'text-primary-fixed' : 'text-on-surface-variant'}`}>
                Heritage Havalis, palace suites & private chauffeur escort
              </span>
            </div>
            {budgetTier === 'Premium' ? (
              <div className="w-6 h-6 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center shrink-0 ml-3">
                <span className="material-symbols-outlined text-[16px] font-bold">check</span>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-surface-container-highest shrink-0 ml-3" />
            )}
          </button>
        </div>
      </section>

      {/* Section 4: Travel Interests (Multi-select Chips) */}
      <section className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-sm border border-surface-container/60">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-base text-primary font-bold">Travel Interests</h2>
          <span className="font-label-sm text-xs text-on-surface-variant">Select 3 or more</span>
        </div>
        <p className="font-body-sm text-xs text-on-surface-variant">
          We tailor your daily narrative around your personal curiosity points.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          {INTEREST_OPTIONS.map((opt) => {
            const isSelected = interests.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleInterest(opt.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-label-md text-xs font-semibold transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {isSelected ? (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                ) : (
                  <span className="material-symbols-outlined text-[14px] text-outline">{opt.icon}</span>
                )}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 5: Traveller Type & Travel Pace */}
      <section className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col gap-space-lg border border-surface-container/60">
        {/* Traveller Type */}
        <div className="flex flex-col gap-space-xs">
          <h2 className="font-headline-sm text-base text-primary font-bold">Traveller Type</h2>
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {(['Solo', 'Couple', 'Family', 'Friends', 'Group'] as TravelerType[]).map((type) => {
              const isSelected = travelerType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTravelerType(type)}
                  className={`py-2.5 rounded-xl font-label-md text-xs font-semibold text-center transition-all ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Travel Pace */}
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-base text-primary font-bold">Travel Pace</h2>
            <span className="font-label-sm text-xs text-on-surface-variant">Daily Activity Cadence</span>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-1">
            {/* Relaxed */}
            <button
              type="button"
              onClick={() => setPace('Relaxed')}
              className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                pace === 'Relaxed'
                  ? 'bg-secondary-container text-on-secondary-container border border-primary/20'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] mt-0.5 ${pace === 'Relaxed' ? 'text-primary' : 'text-on-surface-variant'}`}>
                bedtime
              </span>
              <div className="flex flex-col">
                <span className={`font-label-lg text-xs font-bold ${pace === 'Relaxed' ? 'text-primary' : 'text-on-surface'}`}>
                  Relaxed (1–2 stops/day)
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                  Slow-travel pace, leisurely mornings, ambient haveli tea breaks.
                </span>
              </div>
            </button>

            {/* Balanced */}
            <button
              type="button"
              onClick={() => setPace('Balanced')}
              className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                pace === 'Balanced'
                  ? 'bg-secondary-container text-on-secondary-container border border-primary/20'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] mt-0.5 ${pace === 'Balanced' ? 'text-primary' : 'text-on-surface-variant'}`}>
                balance
              </span>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className={`font-label-lg text-xs font-bold ${pace === 'Balanced' ? 'text-primary' : 'text-on-surface'}`}>
                    Balanced (3 stops/day)
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-primary text-on-primary font-medium">
                    Ideal Flow
                  </span>
                </div>
                <span className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                  Equilibrium between iconic heritage landmarks, artisanal bazaars, and golden hour rests.
                </span>
              </div>
            </button>

            {/* Packed */}
            <button
              type="button"
              onClick={() => setPace('Packed')}
              className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                pace === 'Packed'
                  ? 'bg-secondary-container text-on-secondary-container border border-primary/20'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface'
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] mt-0.5 ${pace === 'Packed' ? 'text-primary' : 'text-on-surface-variant'}`}>
                bolt
              </span>
              <div className="flex flex-col">
                <span className={`font-label-lg text-xs font-bold ${pace === 'Packed' ? 'text-primary' : 'text-on-surface'}`}>
                  Packed (4–5 stops/day)
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                  High-tempo explorer track covering maximum ground from dawn to dusk.
                </span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Delight Accent Banner: Ambient Weather Integration */}
      <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between border border-surface-container/60">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-tertiary text-[20px]">cloudy_snowing</span>
          <div className="flex flex-col">
            <span className="font-label-md text-xs text-primary font-bold">
              Adaptive Monsoons & Heat Engine
            </span>
            <span className="font-body-sm text-[11px] text-on-surface-variant">
              October weather in Golden Triangle is optimal (~24°C avg).
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setWeatherAdaptive(!weatherAdaptive)}
          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
            weatherAdaptive ? 'bg-secondary-container text-primary' : 'bg-surface-container text-outline'
          }`}
        >
          {weatherAdaptive ? 'Active' : 'Off'}
        </button>
      </div>

      {/* Sticky Bottom Action Bar */}
      <aside className="fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-margin py-3 pb-safe flex flex-col gap-2">
        <div className="max-w-xl mx-auto w-full flex flex-col gap-2">
          {/* Live Configuration Pill Summary */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-xs overflow-hidden truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span className="font-semibold text-primary">{stops.length} Stops</span>
              <span>•</span>
              <span>{duration.days} Days</span>
              <span>•</span>
              <span>{budgetTier}</span>
              <span>•</span>
              <span>{travelerType}</span>
            </div>
            <span className="text-on-tertiary-container font-label-sm text-[11px] font-semibold flex items-center gap-0.5 shrink-0">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              Circuit Optimized
            </span>
          </div>

          {/* Main Generator Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-primary text-on-primary font-headline-sm text-sm font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all hover:bg-primary-container disabled:opacity-80"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-[18px] text-tertiary-fixed">
                  progress_activity
                </span>
                <span>Synthesizing Optimal Circuit...</span>
              </>
            ) : (
              <>
                <span>Generate Adaptive Itinerary</span>
                <span className="material-symbols-outlined text-[18px] text-tertiary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
              </>
            )}
          </button>
        </div>
      </aside>
    </form>
  );
};
