import React, { useState } from 'react';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { NotificationCard } from '../components/alerts/NotificationCard';
import { PlanBBottomSheet } from '../components/plan-b/PlanBBottomSheet';

export const AlertsPage: React.FC = () => {
  const { state, unreadAlertsCount, clearReadAlerts } = useTrip();
  const [filter, setFilter] = useState<'all' | 'weather' | 'plan'>('all');

  const filteredAlerts = state.alerts.filter((alert) => {
    if (filter === 'weather') return alert.type === 'weather';
    if (filter === 'plan') return alert.type === 'plan';
    return true;
  });

  const weatherCount = state.alerts.filter((a) => a.type === 'weather').length;
  const planCount = state.alerts.filter((a) => a.type === 'plan').length;

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Header title="Alerts & Radar" />

      <main className="flex-1 w-full max-w-xl mx-auto pt-20 pb-28 px-margin flex flex-col gap-space-lg">
        {/* Header Context Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {unreadAlertsCount > 0 ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-error-container text-on-error-container font-label text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-error mr-1.5 animate-pulse" />
                {unreadAlertsCount} Unread
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label text-xs font-bold">
                All caught up
              </span>
            )}
            <span className="font-body text-xs text-on-surface-variant">
              Jaipur Atmospheric Stream
            </span>
          </div>

          <button
            type="button"
            onClick={clearReadAlerts}
            className="flex items-center gap-1 font-label text-xs text-primary hover:text-primary-container transition-colors py-1 px-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">done_all</span>
            <span>Clear read</span>
          </button>
        </div>

        {/* Filter Control Segmented Bar */}
        <div className="flex p-1 rounded-full bg-surface-container-low border border-surface-container shadow-sm">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center font-label text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All ({state.alerts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('weather')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center font-label text-xs font-semibold transition-all ${
              filter === 'weather'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Weather ({weatherCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('plan')}
            className={`flex-1 py-1.5 px-3 rounded-full text-center font-label text-xs font-semibold transition-all ${
              filter === 'plan'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Plan Changes ({planCount})
          </button>
        </div>

        {/* Live Weather Sensory Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-surface-container-high to-surface-container p-space-md shadow-sm border border-surface-container">
          <div className="flex items-start justify-between relative z-10">
            <div className="flex flex-col gap-0.5">
              <span className="font-label text-[10px] text-secondary uppercase tracking-wider font-bold">
                Atmospheric Doppler Sync
              </span>
              <h3 className="font-heading text-sm font-bold text-on-surface">
                Precipitation Monitoring Active
              </h3>
              <p className="font-body text-xs text-on-surface-variant mt-0.5">
                Dual Doppler radar watching Eastern Rajasthan basin & Aravalli ridges
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-on-secondary-container shrink-0">
              <span className="material-symbols-outlined text-[22px]">radar</span>
            </div>
          </div>
          <div className="absolute -right-4 -bottom-6 w-24 h-24 rounded-full bg-secondary-fixed/30 blur-xl pointer-events-none" />
        </div>

        {/* Alerts Stack Feed */}
        <div className="flex flex-col gap-space-md">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <NotificationCard key={alert.id} alert={alert} />
            ))
          ) : (
            <div className="p-8 rounded-2xl bg-surface-container-lowest border border-surface-container text-center flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-[36px] text-primary">
                notifications_off
              </span>
              <p className="font-heading text-sm font-semibold text-on-surface">
                No alerts in this category
              </p>
              <p className="font-body text-xs text-on-surface-variant">
                We will notify you immediately if weather or venue changes occur.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Plan B Modal */}
      <PlanBBottomSheet />

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
};
