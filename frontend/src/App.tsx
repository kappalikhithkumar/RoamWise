import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import { ItineraryOverviewPage } from './pages/ItineraryOverviewPage';
import { DayDetailPage } from './pages/DayDetailPage';
import { PlanTripPage } from './pages/PlanTripPage';
import { GeneratingPage } from './pages/GeneratingPage';
import { WeatherPage } from './pages/WeatherPage';
import { MapPage } from './pages/MapPage';
import { ReplanningPage } from './pages/ReplanningPage';
import { ReviewPlanPage } from './pages/ReviewPlanPage';
import { AlertsPage } from './pages/AlertsPage';
import { ProfilePage } from './pages/ProfilePage';

export const App: React.FC = () => {
  return (
    <TripProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/trip" replace />} />
          <Route path="/trip" element={<ItineraryOverviewPage />} />
          <Route path="/trip/day/:dayId" element={<DayDetailPage />} />
          <Route path="/plan" element={<PlanTripPage />} />
          <Route path="/generating" element={<GeneratingPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/replan" element={<ReplanningPage />} />
          <Route path="/review-plan" element={<ReviewPlanPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/trip" replace />} />
        </Routes>
      </Router>
    </TripProvider>
  );
};

export default App;
