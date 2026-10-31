import React from 'react';
import { InterestType } from '../../types';

interface InterestSelectorProps {
  selectedInterests: InterestType[];
  onChange: (interests: InterestType[]) => void;
}

interface InterestOption {
  id: InterestType;
  label: string;
  sub: string;
  icon: string;
}

export const InterestSelector: React.FC<InterestSelectorProps> = ({
  selectedInterests,
  onChange
}) => {
  const options: InterestOption[] = [
    { id: 'Adventure', label: 'Adventure', sub: 'Hikes & trails', icon: 'explore' },
    { id: 'Nature', label: 'Nature', sub: 'Gardens, parks', icon: 'park' },
    { id: 'Food', label: 'Food', sub: 'Street food & dining', icon: 'restaurant' },
    { id: 'History', label: 'History', sub: 'Forts & palaces', icon: 'castle' },
    { id: 'Culture', label: 'Culture', sub: 'Crafts & folk shows', icon: 'theater_comedy' },
    { id: 'Spiritual', label: 'Spiritual', sub: 'Temples & shrines', icon: 'self_improvement' },
    { id: 'Shopping', label: 'Shopping', sub: 'Bazaars & crafts', icon: 'shopping_bag' },
    { id: 'Relaxation', label: 'Relaxation', sub: 'Cafes & terraces', icon: 'spa' }
  ];

  const handleToggle = (id: InterestType) => {
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length > 1) {
        onChange(selectedInterests.filter((item) => item !== id));
      }
    } else {
      onChange([...selectedInterests, id]);
    }
  };

  return (
    <section className="flex flex-col gap-space-xs">
      <div className="flex items-center justify-between">
        <span className="font-label text-sm text-on-surface font-semibold">
          Travel Style & Interests
        </span>
        <span className="font-label text-xs text-primary font-semibold">
          {selectedInterests.length} selected
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {options.map((option) => {
          const isSelected = selectedInterests.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleToggle(option.id)}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all active:scale-95 border ${
                isSelected
                  ? 'bg-primary text-on-primary border-primary shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container-low'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? 'bg-on-primary/15 text-on-primary' : 'bg-surface-container text-primary'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{option.icon}</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label text-xs font-semibold truncate">{option.label}</span>
                <span
                  className={`font-label text-[11px] truncate ${
                    isSelected ? 'opacity-80' : 'text-on-surface-variant'
                  }`}
                >
                  {option.sub}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
