import React from 'react';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { MapView } from '../components/map/MapView';

export const MapPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Header title="Live Route Map" />

      <main className="flex-1 w-full max-w-xl mx-auto pt-20 pb-28 px-margin">
        <MapView />
      </main>

      <BottomNav />
    </div>
  );
};
