import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TripProvider } from './context/TripContext';
import { HomePage } from './pages/HomePage';
import { MyTripsPage } from './pages/MyTripsPage';
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
          {/* Phase 2.2 Serene Expedition Entry Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/trips" element={<MyTripsPage />} />

          {/* Core Itinerary & Day Execution */}
          <Route path="/trip" element={<ItineraryOverviewPage />} />
          <Route path="/trip/day/:dayId" element={<DayDetailPage />} />

          {/* Planning & AI Generation */}
          <Route path="/plan" element={<PlanTripPage />} />
          <Route path="/generating" element={<GeneratingPage />} />

          {/* Live Intelligence & Maps */}
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/map" element={<MapPage />} />

          {/* Adaptive Re-planning & Plan B Review */}
          <Route path="/replan" element={<ReplanningPage />} />
          <Route path="/review-plan" element={<ReviewPlanPage />} />

          {/* Alerts & Profile */}
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </TripProvider>
  );
};

export default App;
