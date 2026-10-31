import React from 'react';

interface DestinationSelectorProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export const DestinationSelector: React.FC<DestinationSelectorProps> = ({
  value,
  onChange,
  error
}) => {
  const trendingSuggestions = [
    { name: 'Jaipur, Rajasthan', tag: '🕌 Jaipur' },
    { name: 'Kyoto, Japan', tag: '⛩️ Kyoto' },
    { name: 'Udaipur, Rajasthan', tag: '🏰 Udaipur' },
    { name: 'Reykjavik, Iceland', tag: '🌋 Reykjavik' }
  ];

  return (
    <section className="flex flex-col gap-space-xs">
      <div className="flex items-center justify-between">
        <label htmlFor="dest-input" className="font-label text-sm text-on-surface font-semibold">
          Destination
        </label>
        <button
          type="button"
          onClick={() => onChange('Jaipur, Rajasthan, India')}
          className="font-label text-xs text-primary flex items-center gap-0.5 hover:underline"
        >
          <span className="material-symbols-outlined text-[14px]">my_location</span>
          Sample: Jaipur
        </button>
      </div>

      <div className="relative w-full shadow-sm rounded-xl bg-surface-container-lowest border border-surface-container-high/60 focus-within:border-primary transition-all">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-primary">
          <span className="material-symbols-outlined text-[22px]">search</span>
        </div>
        <input
          id="dest-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search city, region or heritage site..."
          className="w-full h-12 pl-11 pr-10 rounded-xl bg-transparent font-body text-sm text-on-surface focus:outline-none placeholder:text-outline"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear destination"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
          </button>
        )}
      </div>

      {error && <p className="font-body text-xs text-error mt-0.5">{error}</p>}

      {/* Quick Trending Chips */}
      <div className="flex items-center gap-space-xs overflow-x-auto no-scrollbar pt-1 pb-1 -mx-1 px-1">
        <span className="font-label text-xs text-on-surface-variant whitespace-nowrap mr-1">
          Trending:
        </span>
        {trendingSuggestions.map((item) => (
          <button
            key={item.name}
            type="button"
            onClick={() => onChange(item.name)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-label text-xs hover:bg-surface-container-highest active:scale-95 transition-all whitespace-nowrap"
          >
            <span>{item.tag}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
