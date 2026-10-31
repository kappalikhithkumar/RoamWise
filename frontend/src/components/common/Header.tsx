import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack
}) => {
  const navigate = useNavigate();
  const { state } = useTrip();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container/40">
      <div className="h-16 px-margin flex items-center justify-between max-w-2xl mx-auto">
        <div className="flex items-center gap-space-sm">
          {showBack ? (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-surface-container-low text-on-surface hover:bg-surface-container active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            </button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">explore</span>
            </div>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-label text-[11px] text-primary font-bold uppercase tracking-wider">
                RoamWise AI
              </span>
            </div>
            <span className="font-heading text-lg font-semibold text-on-surface leading-none capitalize">
              {title || 'Jaipur Expedition'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          {/* Live weather chip */}
          <div
            onClick={() => navigate('/weather')}
            className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-1 rounded-full shadow-[0_2px_8px_rgba(15,23,42,0.04)] cursor-pointer hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-secondary text-[16px]">partly_cloudy_day</span>
            <span className="font-label text-xs font-medium text-on-secondary-container">
              Jaipur · 28°C
            </span>
          </div>

          {/* Profile avatar button */}
          <button
            onClick={() => navigate('/profile')}
            aria-label="View profile"
            className="w-8 h-8 rounded-full overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.08)] ring-2 ring-primary/20 hover:ring-primary transition-all active:scale-95"
          >
            <img
              src={state.userProfile.avatarUrl}
              alt={state.userProfile.name}
              className="w-full h-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
