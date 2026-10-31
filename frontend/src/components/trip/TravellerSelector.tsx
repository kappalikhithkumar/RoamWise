import React from 'react';
import { TravelerType } from '../../types';

interface TravellerSelectorProps {
  value: TravelerType;
  onChange: (type: TravelerType) => void;
}

export const TravellerSelector: React.FC<TravellerSelectorProps> = ({ value, onChange }) => {
  const types: { id: TravelerType; label: string; icon: string }[] = [
    { id: 'Solo', label: 'Solo', icon: 'person' },
    { id: 'Couple', label: 'Couple', icon: 'favorite' },
    { id: 'Friends', label: 'Friends', icon: 'group' },
    { id: 'Family', label: 'Family', icon: 'family_restroom' },
    { id: 'Group', label: 'Group', icon: 'groups' }
  ];

  return (
    <section className="flex flex-col gap-space-xs">
      <span className="font-label text-sm text-on-surface font-semibold">
        Who are you travelling with?
      </span>
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
        {types.map((type) => {
          const isSelected = value === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onChange(type.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-label text-xs shrink-0 transition-all active:scale-95 border ${
                isSelected
                  ? 'bg-primary text-on-primary border-primary shadow-sm font-semibold'
                  : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container-low'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{type.icon}</span>
              <span>{type.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
