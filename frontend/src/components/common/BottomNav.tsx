import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { TabType } from '../../types';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadAlertsCount } = useTrip();

  const tabs: { id: TabType; path: string; label: string; icon: string }[] = [
    { id: 'trip', path: '/trip', label: 'Trip', icon: 'event_note' },
    { id: 'weather', path: '/weather', label: 'Weather', icon: 'wb_sunny' },
    { id: 'map', path: '/map', label: 'Map', icon: 'map' },
    { id: 'alerts', path: '/alerts', label: 'Alerts', icon: 'notifications' },
    { id: 'profile', path: '/profile', label: 'Profile', icon: 'account_circle' },
  ];

  // Determine active tab
  const getIsActive = (path: string) => {
    if (path === '/trip') {
      return (
        location.pathname === '/' ||
        location.pathname === '/trip' ||
        location.pathname.startsWith('/trip/') ||
        location.pathname === '/review-plan'
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-surface/85 backdrop-blur-xl shadow-[0_-4px_20px_rgba(15,23,42,0.06)] border-t border-surface-container/40">
      <div className="flex justify-around items-center h-16 px-space-xs max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = getIsActive(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-all active:scale-95 ${
                isActive ? 'text-primary font-semibold' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {tab.icon}
                </span>
                {tab.id === 'alerts' && unreadAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-error text-on-error font-label text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                    {unreadAlertsCount}
                  </span>
                )}
              </span>
              <span className="font-label text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5 animate-fadeIn" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
