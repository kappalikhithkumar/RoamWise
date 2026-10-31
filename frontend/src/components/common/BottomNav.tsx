import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTrip } from '../../context/TripContext';
import { TabType } from '../../types';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadAlertsCount } = useTrip();

  const tabs: { id: TabType; path: string; label: string; icon: string }[] = [
    { id: 'home', path: '/', label: 'Home', icon: 'explore' },
    { id: 'trips', path: '/trips', label: 'My Trips', icon: 'luggage' },
    { id: 'trip', path: '/trip', label: 'Itinerary', icon: 'alt_route' },
    { id: 'alerts', path: '/alerts', label: 'Alerts', icon: 'notifications' },
    { id: 'profile', path: '/profile', label: 'Profile', icon: 'person' },
  ];

  // Determine active tab
  const getIsActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path === '/trips') {
      return location.pathname === '/trips';
    }
    if (path === '/trip') {
      return (
        location.pathname === '/trip' ||
        location.pathname.startsWith('/trip/') ||
        location.pathname === '/review-plan'
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-white/90 backdrop-blur-xl shadow-[0_-4px_20px_rgba(23,63,53,0.06)] border-t border-[#25332E]/10">
      <div className="flex justify-around items-center h-16 px-space-xs max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = getIsActive(tab.path);
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`relative flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-all active:scale-95 ${
                isActive ? 'text-primary font-semibold' : 'text-[#25332E]/60 hover:text-primary font-medium'
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
                  <span className="absolute -top-1 -right-2 bg-amber text-primary font-label text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-sm">
                    {unreadAlertsCount}
                  </span>
                )}
              </span>
              <span className="font-label text-[11px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
