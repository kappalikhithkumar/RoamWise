import React from 'react';
import { BudgetTier } from '../../types';

interface BudgetSelectorProps {
  value: BudgetTier;
  onChange: (tier: BudgetTier) => void;
}

export const BudgetSelector: React.FC<BudgetSelectorProps> = ({ value, onChange }) => {
  const tiers: { id: BudgetTier; label: string; range: string; icon: string }[] = [
    { id: 'Budget-friendly', label: 'Budget', range: '₹ (<₹2.5k/d)', icon: 'savings' },
    { id: 'Moderate', label: 'Moderate', range: '₹₹ (₹2.5k–6k)', icon: 'account_balance_wallet' },
    { id: 'Premium', label: 'Premium', range: '₹₹₹ (₹6k+/d)', icon: 'diamond' }
  ];

  return (
    <section className="flex flex-col gap-space-xs">
      <div className="flex items-center justify-between">
        <span className="font-label text-sm text-on-surface font-semibold">Budget Tier</span>
        <span className="font-label text-xs text-on-surface-variant">Includes stays & transit</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-surface-container">
        {tiers.map((tier) => {
          const isSelected = value === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onChange(tier.id)}
              className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-lg font-label text-xs transition-all active:scale-95 ${
                isSelected
                  ? 'bg-primary text-on-primary shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>{tier.label}</span>
              <span className={`text-[10px] mt-0.5 ${isSelected ? 'opacity-90' : 'opacity-70'}`}>
                {tier.range}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
