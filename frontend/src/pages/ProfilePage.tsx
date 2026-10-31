import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { state, toggleTheme, updateProfile } = useTrip();
  const { userProfile, config } = state;

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Header title="My Profile" />

      <main className="flex-1 w-full max-w-xl mx-auto pt-20 pb-28 px-margin flex flex-col gap-space-lg">
        {/* Profile User Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-space-md shadow-md border border-surface-container/60 flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-md ring-4 ring-primary/20 shrink-0">
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="font-heading text-lg font-bold text-on-surface truncate">
                {userProfile.name}
              </h2>
              <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>
            <span className="font-label text-xs text-primary font-semibold">
              {userProfile.persona}
            </span>
            <span className="font-body text-xs text-on-surface-variant mt-0.5">
              {userProfile.homeCity} • {userProfile.email}
            </span>
          </div>
        </section>

        {/* Active Trip Configuration Summary */}
        <section className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container/60 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-heading text-xs font-bold text-on-surface uppercase tracking-wider">
              Current Expedition
            </span>
            <button
              type="button"
              onClick={() => navigate('/plan')}
              className="font-label text-xs text-primary font-semibold hover:underline"
            >
              Modify Plan
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-surface-container-low p-2.5 rounded-xl">
              <span className="text-on-surface-variant font-label text-[10px]">Destination</span>
              <p className="font-heading font-semibold text-on-surface mt-0.5 truncate">
                {config.destination.split(',')[0]}
              </p>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-xl">
              <span className="text-on-surface-variant font-label text-[10px]">Dates</span>
              <p className="font-heading font-semibold text-on-surface mt-0.5 truncate">
                Nov 14 – 18, 2026
              </p>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-xl">
              <span className="text-on-surface-variant font-label text-[10px]">Travel Style</span>
              <p className="font-heading font-semibold text-on-surface mt-0.5 truncate">
                {config.travelerType} • {config.pace}
              </p>
            </div>
            <div className="bg-surface-container-low p-2.5 rounded-xl">
              <span className="text-on-surface-variant font-label text-[10px]">Budget</span>
              <p className="font-heading font-semibold text-on-surface mt-0.5 truncate">
                {config.budgetTier} (INR)
              </p>
            </div>
          </div>
        </section>

        {/* Application & Preference Settings */}
        <section className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container/60 flex flex-col gap-3">
          <span className="font-heading text-xs font-bold text-on-surface uppercase tracking-wider">
            Preferences & Appearance
          </span>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between py-1 border-b border-surface-container-low">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">
                  {userProfile.theme === 'dark' ? 'dark_mode' : 'light_mode'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-sm font-semibold text-on-surface">
                  Theme Appearance
                </span>
                <span className="font-body text-[11px] text-on-surface-variant">
                  Current: {userProfile.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label text-xs font-semibold active:scale-95 transition-all"
            >
              Switch to {userProfile.theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>

          {/* Currency */}
          <div className="flex items-center justify-between py-1 border-b border-surface-container-low">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">currency_rupee</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-sm font-semibold text-on-surface">
                  Base Currency
                </span>
                <span className="font-body text-[11px] text-on-surface-variant">
                  Standard travel pricing
                </span>
              </div>
            </div>
            <span className="font-heading text-xs font-bold text-primary bg-primary-fixed/40 px-2.5 py-1 rounded-full">
              INR (₹)
            </span>
          </div>

          {/* Temperature Units */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[18px]">thermostat</span>
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-sm font-semibold text-on-surface">
                  Temperature Units
                </span>
                <span className="font-body text-[11px] text-on-surface-variant">
                  Atmospheric radar measurements
                </span>
              </div>
            </div>

            <div className="flex rounded-lg bg-surface-container p-0.5">
              <button
                type="button"
                onClick={() => updateProfile({ temperatureUnit: 'C' })}
                className={`px-2.5 py-1 rounded-md font-label text-xs font-bold transition-all ${
                  userProfile.temperatureUnit === 'C'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant'
                }`}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => updateProfile({ temperatureUnit: 'F' })}
                className={`px-2.5 py-1 rounded-md font-label text-xs font-bold transition-all ${
                  userProfile.temperatureUnit === 'F'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant'
                }`}
              >
                °F
              </button>
            </div>
          </div>
        </section>

        {/* Start Fresh / Reconfigure Button */}
        <button
          type="button"
          onClick={() => navigate('/plan')}
          className="w-full h-12 rounded-2xl bg-surface-container hover:bg-surface-container-high text-primary font-label text-xs font-bold flex items-center justify-center gap-2 border border-surface-container-high active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Plan Another Trip</span>
        </button>
      </main>

      <BottomNav />
    </div>
  );
};
