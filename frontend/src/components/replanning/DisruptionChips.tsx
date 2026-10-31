import React from 'react';

export interface DisruptionScenario {
  id: string;
  label: string;
  minutes: number;
  icon: string;
  defaultPrompt: string;
}

interface DisruptionChipsProps {
  selectedId: string;
  onSelect: (scenario: DisruptionScenario) => void;
}

export const DISRUPTION_SCENARIOS: DisruptionScenario[] = [
  {
    id: 'running-late',
    label: 'Running late (+45m)',
    minutes: 45,
    icon: 'history_toggle_off',
    defaultPrompt: 'Our cab was delayed by 45 minutes in city traffic. Please reorganize today’s remaining afternoon activities.'
  },
  {
    id: 'extend-stay',
    label: 'Extend stay here',
    minutes: 60,
    icon: 'hourglass_top',
    defaultPrompt: 'We are captivated by the palace and want to spend an extra hour here. Please trim or re-sequence later stops.'
  },
  {
    id: 'vehicle-delay',
    label: 'Vehicle problem',
    minutes: 90,
    icon: 'minor_crash',
    defaultPrompt: 'Our driver had a flat tire on the way to Nahargarh. We need a 1.5-hour delay absorbed gracefully.'
  },
  {
    id: 'skip-activity',
    label: 'Skip an activity',
    minutes: 0,
    icon: 'next_plan',
    defaultPrompt: 'We prefer to skip the afternoon museum and relax at an authentic tea lounge instead.'
  },
  {
    id: 'fatigue',
    label: 'Feeling fatigued / slow pace',
    minutes: 30,
    icon: 'airline_seat_recline_extra',
    defaultPrompt: 'The group is exhausted from morning hill walks. Please convert afternoon stops into restful seated cultural spots.'
  },
  {
    id: 'budget-change',
    label: 'Budget adjustment',
    minutes: 0,
    icon: 'payments',
    defaultPrompt: 'We want to lower our dining spend for tonight while keeping panoramic city views.'
  },
  {
    id: 'other',
    label: 'Other change',
    minutes: 30,
    icon: 'edit_note',
    defaultPrompt: 'Something came up. Please restructure our afternoon itinerary.'
  }
];

export const DisruptionChips: React.FC<DisruptionChipsProps> = ({ selectedId, onSelect }) => {
  return (
    <div className="flex flex-col gap-space-xs">
      <div className="flex items-center justify-between">
        <span className="font-heading text-sm font-semibold text-on-surface">
          Quick Circumstances
        </span>
        <span className="font-label text-xs text-on-surface-variant">Tap to populate request</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {DISRUPTION_SCENARIOS.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-label text-xs transition-all active:scale-95 border ${
                isSelected
                  ? 'bg-primary text-on-primary border-primary shadow-sm font-semibold'
                  : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container-low'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[16px] ${
                  isSelected ? 'text-on-primary' : 'text-secondary'
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
              {isSelected && (
                <span className="material-symbols-outlined text-[14px] ml-0.5">check</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
