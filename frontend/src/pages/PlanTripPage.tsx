import React from 'react';
import { Header } from '../components/common/Header';
import { TripConfigurationForm } from '../components/trip/TripConfigurationForm';

export const PlanTripPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface">
      <Header title="Plan Trip" showBack={false} />

      <main className="flex-1 w-full max-w-xl mx-auto pt-20 pb-24 px-margin">
        <TripConfigurationForm />
      </main>
    </div>
  );
};
