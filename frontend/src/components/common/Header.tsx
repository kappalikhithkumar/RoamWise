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
  const { state, isBackendOnline, isSyncing, hasActiveTrip } = useTrip();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const displayTitle = title || (hasActiveTrip && state.config.destination
    ? `${state.config.destination.split(',')[0]} Expedition`
    : 'Explore & Discover');

  const displayWeatherCity = hasActiveTrip && state.config.destination
    ? state.config.destination.split(',')[0]
    : 'India';

  return (
    <header className="fixed top-0 w-full z-40 pt-safe bg-white/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(23,63,53,0.05)] border-b border-[#25332E]/10">
      <div className="h-16 px-margin flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-space-sm">
          {showBack ? (
            <button
              onClick={handleBack}
              aria-label="Go back"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-[#EDFDF5] text-primary hover:bg-secondary-container active:scale-95 transition-all border border-[#D8E9DD]"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[18px]">explore</span>
            </div>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-label text-[10px] text-primary font-bold uppercase tracking-wider">
                RoamWise AI
              </span>
              <span
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  isSyncing
                    ? 'bg-amber animate-ping'
                    : isBackendOnline
                    ? 'bg-emerald-500'
                    : 'bg-amber/60'
                }`}
                title={
                  isSyncing
                    ? 'Syncing with RoamWise Flask API...'
                    : isBackendOnline
                    ? 'Connected to Flask Backend & SQLite Database'
                    : 'Offline Mode (Local Storage)'
                }
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-base sm:text-lg font-bold text-primary leading-tight truncate max-w-[170px] sm:max-w-xs">
                {displayTitle}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          {/* Live weather chip */}
          <button
            onClick={() => navigate('/weather')}
            aria-label="View live weather"
            className="flex items-center gap-1.5 bg-[#EDFDF5] border border-[#D8E9DD] px-2.5 sm:px-3 py-1 rounded-full shadow-sm hover:bg-secondary-container transition-colors"
          >
            <span className="material-symbols-outlined text-amber text-[16px]">partly_cloudy_day</span>
            <span className="font-label text-xs font-semibold text-primary">
              {displayWeatherCity} · 22°C
            </span>
          </button>

          {/* Profile avatar button */}
          <button
            onClick={() => navigate('/profile')}
            aria-label="View profile"
            className="w-8 h-8 rounded-full overflow-hidden shadow-sm ring-2 ring-primary/20 hover:ring-primary transition-all active:scale-95"
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
