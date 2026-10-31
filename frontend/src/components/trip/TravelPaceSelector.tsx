import React from 'react';
import { TravelPace } from '../../types';

interface TravelPaceSelectorProps {
  value: TravelPace;
  onChange: (pace: TravelPace) => void;
}

export const TravelPaceSelector: React.FC<TravelPaceSelectorProps> = ({ value, onChange }) => {
  const paces: { id: TravelPace; label: string; desc: string; icon: string }[] = [
    { id: 'Relaxed', label: 'Relaxed', desc: '1-2 stops/day', icon: 'nordic_walking' },
    { id: 'Balanced', label: 'Balanced', desc: '3-4 stops/day', icon: 'directions_walk' },
    { id: 'Packed', label: 'Packed', desc: '5+ stops/day', icon: 'sprint' }
  ];

  return (
    <section className="flex flex-col gap-space-xs">
      <div className="flex items-center justify-between">
        <span className="font-label text-sm text-on-surface font-semibold">Preferred Pace</span>
        <span className="font-label text-xs text-primary font-medium">
          {value === 'Relaxed' && 'Leisurely pace, extended tea breaks'}
          {value === 'Balanced' && 'Balanced exploration & cultural depth'}
          {value === 'Packed' && 'Fast-paced, maximize daily spots'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {paces.map((item) => {
          const isSelected = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all active:scale-95 border ${
                isSelected
                  ? 'bg-primary text-on-primary border-primary shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container-low'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] mb-1 ${
                  isSelected ? 'text-on-primary' : 'text-on-surface-variant'
                }`}
              >
                {item.icon}
              </span>
              <span className="font-label text-xs font-semibold">{item.label}</span>
              <span
                className={`font-label text-[10px] mt-0.5 ${
                  isSelected ? 'opacity-90' : 'text-on-surface-variant'
                }`}
              >
                {item.desc}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
