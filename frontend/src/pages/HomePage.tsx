import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { CURATED_CIRCUITS } from '../mock/sampleTrip';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    hasActiveTrip,
    toggleActiveTrip,
    isDemoMode,
    enterDemoMode,
    exitDemoMode,
    savedTrips,
    selectTrip
  } = useTrip();

  // Search input state for Screen 08 discovery view
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);

  const rawDestinations = state.config.destinations && state.config.destinations.length > 0
    ? state.config.destinations
    : state.config.destination
    ? state.config.destination.split(/➔|,|to/).map((s) => s.trim()).filter(Boolean)
    : ['Jaipur, Rajasthan'];

  const activeTripCity = rawDestinations[0]?.split(',')[0] || 'Rajasthan';
  const activeTripTitle = state.config.tagline || `${activeTripCity} Expedition`;

  // Compute dynamic progress
  const allActivities = state.days.flatMap((d) => d.activities || []);
  const completedActivities = allActivities.filter((a) => a.isVisited);
  const completedCount = completedActivities.length;
  const totalCount = allActivities.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Compute weather alert state
  const riskDay = state.days.find((d) => (d.rainRisk && d.rainRisk > 40) || d.weatherAlert || d.activities?.some((a) => a.hasPlanBReady && a.weatherRisk === 'high' && !a.isPlanBAlternative));
  const activeAlert = state.alerts.find((al) => al.unread && al.type === 'weather');
  const hasWeatherRisk = isDemoMode || Boolean(riskDay) || Boolean(activeAlert);
  const weatherRiskMessage = isDemoMode
    ? `2:00 PM Rain predicted in ${activeTripCity}. Plan B sheltered indoor alternatives ready.`
    : riskDay?.weatherAlert || activeAlert?.message || `Rain risk predicted in ${activeTripCity}. Adaptive alternatives prepared.`;

  const interestCategories = [
    { id: 'adventure', label: '🧗 Adventure', hint: 'Trekking & High Passes' },
    { id: 'nature', label: '🌿 Nature', hint: 'Tea Gardens & Canopies' },
    { id: 'food', label: '☕ Food & Cafes', hint: 'Artisanal & Street Food' },
    { id: 'history', label: '🏛️ History & Forts', hint: 'Palaces & Heritage' },
    { id: 'spiritual', label: '🪔 Spiritual', hint: 'Ghats & Monasteries' },
    { id: 'wellness', label: '🧘 Wellness', hint: 'Ayurveda & Mountain Yoga' },
    { id: 'shopping', label: '🛍️ Bazaars', hint: 'Textiles & Handcrafts' },
  ];

  const popularDestinations = [
    {
      id: 'udaipur',
      name: 'Udaipur, Rajasthan',
      tag: 'Lakes & Palaces',
      season: 'Best: Oct – Mar',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'spiti',
      name: 'Spiti Valley, Himachal',
      tag: 'High Altitude Desert',
      season: 'Best: Jun – Sep',
      image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'varanasi',
      name: 'Varanasi Ghats, UP',
      tag: 'Ancient Cultural Hub',
      season: 'Best: Oct – Mar',
      image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const recentlyViewed = [
    { name: 'Manali & Solang Valley', tag: 'Adventure & Pine Cafes', time: 'Viewed 2h ago' },
    { name: 'Munnar Tea Sanctuaries', tag: 'High Altitude Mist Trails', time: 'Viewed yesterday' },
    { name: 'Gokarna & Murudeshwar', tag: 'Coastal Temples & Serenity', time: 'Viewed 3d ago' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface pb-24">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-20">
        
        {/* State Toggle Pill (Serene Expedition: Live Trip vs Discovery Demo Switcher) */}
        <div className="flex items-center justify-between my-3 p-1.5 rounded-xl bg-white border border-[#25332E]/10 shadow-sm">
          <div className="flex items-center gap-2 pl-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-xs font-semibold text-primary">
              View Mode: <span className="font-bold">{hasActiveTrip ? 'Active Trip Dashboard (Screen 20)' : 'Discovery Hub (Screen 08)'}</span>
            </span>
          </div>
          <button
            onClick={toggleActiveTrip}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-[#EDFDF5] text-primary hover:bg-[#D8E9DD] border border-[#D8E9DD] transition-all active:scale-95"
            title="Toggle between Screen 20 (Active Trip) and Screen 08 (Discovery) views"
          >
            Switch to {hasActiveTrip ? 'Discovery View' : 'Active Trip View'}
          </button>
        </div>

        {/* ========================================================================= */}
        {/* STATE 1: ACTIVE EXPEDITION DASHBOARD (Screen 20)                          */}
        {/* ========================================================================= */}
        {hasActiveTrip ? (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Demo Mode Notice Banner (When running in presentation/demo mode) */}
            {isDemoMode && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-amber/15 border border-amber/35 text-primary shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-amber text-[22px]">science</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">Demo Presentation Mode</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber/25 font-bold text-primary">Sample Data</span>
                    </div>
                    <p className="text-xs text-[#414845] mt-0.5">
                      Viewing sample Jaipur expedition. Changes are simulated in-memory and will not alter the production database.
                    </p>
                  </div>
                </div>
                <button
                  onClick={exitDemoMode}
                  className="px-3.5 py-1.5 rounded-lg bg-white border border-amber/40 text-xs font-bold text-primary hover:bg-[#FFF8F0] active:scale-95 transition shadow-sm shrink-0 flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]">close</span>
                  <span>Exit Demo Mode</span>
                </button>
              </div>
            )}

            {/* Greeting & Active Expedition Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-primary font-display tracking-tight">
                  Namaste, {state.userProfile.name.split(' ')[0]} 👋
                </h1>
                <p className="text-sm text-[#414845] mt-0.5">
                  Ready for your <span className="font-semibold text-primary">{activeTripCity} Expedition</span> today?
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1 rounded-full bg-white border border-[#D8E9DD] shadow-sm">
                <span className="material-symbols-outlined text-amber text-[16px]">cloud_sync</span>
                <span className="text-xs font-semibold text-primary">
                  {isDemoMode ? 'Demo Mode Active' : 'Live Context Active'}
                </span>
              </div>
            </div>

            {/* HERO ACTIVE EXPEDITION CARD (Screen 20 Spec) */}
            <div className="relative rounded-2xl bg-white border border-[#25332E]/10 p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#EDFDF5] text-primary border border-[#D8E9DD]">
                      {activeTripCity} Circuit {isDemoMode ? '(Demo)' : ''}
                    </span>
                    <span className="text-xs font-medium text-[#414845]">
                      Day 1 of {Math.max(1, state.days.length)} • {state.config.pace || 'Balanced'} Cadence
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-display text-primary leading-tight">
                    {activeTripTitle}
                  </h2>

                  {/* Route Sequence Pills */}
                  <div className="flex items-center gap-1.5 mt-3 text-xs font-semibold text-primary flex-wrap">
                    {rawDestinations.map((dest, i) => (
                      <React.Fragment key={dest}>
                        {i > 0 && <span className="text-[#414845]">➔</span>}
                        <span
                          className={`px-2 py-0.5 rounded-md ${
                            i === 0 ? 'bg-secondary-container font-bold text-primary' : 'bg-[#EDFDF5]'
                          }`}
                        >
                          {dest.split(',')[0]} {i === 0 ? '(Current)' : ''}
                        </span>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Progress Circle / Stat */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-[#25332E]/10">
                  <div className="text-right">
                    <span className="text-2xl font-black font-display text-primary">{progressPercent}%</span>
                    <span className="text-[11px] text-[#414845] block font-medium">
                      {completedCount} of {totalCount} Activities Completed
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 w-full bg-[#EDFDF5] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* LIVE ADAPTIVE ALERT BANNER (Screen 20 Signature Feature) */}
              {hasWeatherRisk ? (
                <div className="mt-5 p-4 rounded-xl bg-[#FFF8F0] border border-amber/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber/20 text-amber flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[20px]">warning</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber">
                          Adaptive Reroute Suggested
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber/20 font-bold text-primary">
                          {isDemoMode ? 'Demo Risk' : 'Weather Risk'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-charcoal mt-0.5">
                        {weatherRiskMessage}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/trip/day/${Math.min(2, Math.max(1, state.days.length))}`)}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] active:scale-95 transition-all shadow-sm shrink-0 flex items-center gap-1.5"
                  >
                    <span>View Adaptive Timeline</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              ) : (
                <div className="mt-5 p-3.5 rounded-xl bg-[#EDFDF5] border border-[#D8E9DD] shadow-sm flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-primary text-[20px]">wb_sunny</span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">Weather Optimal</span>
                      <p className="text-xs text-[#414845] mt-0.5">
                        Clear conditions predicted across all stops in {activeTripCity}. All scheduled activities are safe.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/trip')}
                    className="text-xs font-bold text-primary hover:underline shrink-0"
                  >
                    View Timeline ➔
                  </button>
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="mt-5 pt-4 border-t border-[#25332E]/10 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/trip')}
                    className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] active:scale-95 transition shadow-sm"
                  >
                    Open Full Itinerary
                  </button>
                  <button
                    onClick={() => navigate('/map')}
                    className="px-3.5 py-2 rounded-xl bg-[#EDFDF5] text-primary text-xs font-semibold hover:bg-secondary-container border border-[#D8E9DD] active:scale-95 transition"
                  >
                    Spatial Map
                  </button>
                </div>

                <button
                  onClick={() => navigate('/replan')}
                  className="text-xs font-bold text-primary hover:text-amber transition flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                  <span>Something Came Up? Re-plan</span>
                </button>
              </div>
            </div>

            {/* Quick AI Prompts ("Dream a New Expedition" chips from Screen 20) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#414845]">
                  Dream a New Expedition (AI Assisted)
                </span>
                <span className="text-xs text-primary font-semibold">Powered by RoamAI</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => navigate('/plan')}
                  className="px-3 py-2 rounded-xl bg-white border border-[#25332E]/10 hover:border-primary text-xs font-medium text-primary hover:bg-[#EDFDF5] transition shadow-sm flex items-center gap-1.5"
                >
                  <span>☕</span>
                  <span>Munnar Mist Trails</span>
                </button>
                <button
                  onClick={() => navigate('/plan')}
                  className="px-3 py-2 rounded-xl bg-white border border-[#25332E]/10 hover:border-primary text-xs font-medium text-primary hover:bg-[#EDFDF5] transition shadow-sm flex items-center gap-1.5"
                >
                  <span>🏰</span>
                  <span>Jaisalmer Desert Forts</span>
                </button>
                <button
                  onClick={() => navigate('/plan')}
                  className="px-3 py-2 rounded-xl bg-white border border-[#25332E]/10 hover:border-primary text-xs font-medium text-primary hover:bg-[#EDFDF5] transition shadow-sm flex items-center gap-1.5"
                >
                  <span>🌊</span>
                  <span>Gokarna Coastal Calm</span>
                </button>
                <button
                  onClick={() => navigate('/plan')}
                  className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] transition shadow-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  <span>Custom Plan</span>
                </button>
              </div>
            </div>

            {/* Intelligence Highlights (Screen 20 Spec) */}
            <div className="rounded-2xl bg-white border border-[#25332E]/10 p-5 shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">radar</span>
                  <h3 className="font-display font-bold text-base text-primary">Intelligence Highlights</h3>
                </div>
                <button onClick={() => navigate('/weather')} className="text-xs font-semibold text-primary hover:underline">
                  View Full Weather Intel ↗
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#EDFDF5] border border-[#D8E9DD]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Pass Advisory</span>
                  <div className="text-sm font-bold text-primary mt-1">Rohtang Pass</div>
                  <p className="text-xs text-[#414845] mt-0.5">Heavy mist advisory. Open for 4x4 vehicles only.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FFF8F0] border border-amber/30">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber">Precipitation Spike</span>
                  <div className="text-sm font-bold text-primary mt-1">Solang 70% Rain</div>
                  <p className="text-xs text-[#414845] mt-0.5">Showers begin 2:00 PM. Indoor buffer activated.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#EDFDF5] border border-[#D8E9DD]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Air & Altitude</span>
                  <div className="text-sm font-bold text-primary mt-1">AQI 22 • 2,050m</div>
                  <p className="text-xs text-[#414845] mt-0.5">Crisp Himalayan alpine air. Hydration on schedule.</p>
                </div>
              </div>
            </div>

            {/* Curated Circuits Section (Screen 20) */}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-lg text-primary">Curated Indian Circuits</h3>
                <button onClick={() => navigate('/trips')} className="text-xs font-semibold text-primary hover:underline">
                  View All Circuits
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {CURATED_CIRCUITS.map((circuit) => (
                  <div key={circuit.id} className="rounded-xl bg-white border border-[#25332E]/10 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="h-32 w-full overflow-hidden relative">
                      <img src={circuit.imageUrl} alt={circuit.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 text-primary font-bold text-[10px] backdrop-blur-sm">
                        ★ {circuit.rating}
                      </div>
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-display font-bold text-sm text-primary line-clamp-1">{circuit.title}</h4>
                        <p className="text-xs text-[#414845] mt-0.5 font-medium">{circuit.route}</p>
                        <span className="text-[11px] text-[#414845] block mt-1">{circuit.duration} • {circuit.bestSeason}</span>
                      </div>
                      <button
                        onClick={() => navigate('/plan')}
                        className="mt-3 w-full py-1.5 rounded-lg bg-[#EDFDF5] hover:bg-secondary-container text-primary font-semibold text-xs transition border border-[#D8E9DD]"
                      >
                        Plan This Circuit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* STATE 2: DISCOVERY HUB & NO ACTIVE TRIP (Screen 08)                       */
          /* ========================================================================= */
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Hero Header */}
            <div className="pt-2 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDFDF5] text-primary text-xs font-bold uppercase tracking-wider mb-2 border border-[#D8E9DD]">
                <span>Tailored for Your Rhythm</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-primary font-display tracking-tight leading-tight">
                Where would you like to go next?
              </h1>
              <p className="text-sm sm:text-base text-[#414845] mt-1 max-w-xl">
                Adaptive journeys crafted around your pace, real-time weather conditions, and cultural interests.
              </p>
            </div>

            {/* Search and Voice Bar */}
            <div className="relative w-full">
              <div className="flex items-center rounded-2xl bg-white border border-[#25332E]/15 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
                <span className="material-symbols-outlined text-[#414845] pl-4 text-[22px]">search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search destinations, mountain passes, heritage havelis..."
                  className="w-full px-3 py-3.5 text-sm bg-transparent outline-none placeholder-[#414845]/60 text-charcoal font-medium"
                />
                <button
                  onClick={() => navigate('/plan')}
                  className="m-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] active:scale-95 transition shadow-sm flex items-center gap-1 shrink-0"
                >
                  <span>Plan Journey</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Presentation & Demo Mode Card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#25332E]/10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber/15 text-amber flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">play_circle</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary block">Presentation & Demo Mode</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber/20 font-bold text-primary">Demo</span>
                  </div>
                  <span className="text-xs text-[#414845]">Load a sample expedition with live weather alerts and Plan B adaptive rerouting.</span>
                </div>
              </div>
              <button
                onClick={enterDemoMode}
                className="px-4 py-2 rounded-xl bg-amber/20 hover:bg-amber/30 text-primary border border-amber/40 text-xs font-bold transition active:scale-95 shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                <span>Try Demo Mode</span>
              </button>
            </div>

            {/* Upcoming Trip Preview (Only when real saved trips exist, or clean invitation card) */}
            {savedTrips.length > 0 ? (
              <div className="rounded-2xl bg-white border border-[#25332E]/10 p-5 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">flight_takeoff</span>
                    <h3 className="font-display font-bold text-base text-primary">Upcoming Trip</h3>
                    <span className="px-2 py-0.5 rounded-md bg-[#EDFDF5] text-primary text-[10px] font-bold uppercase">
                      Scheduled
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      const firstTrip = savedTrips[0];
                      if (firstTrip) {
                        await selectTrip(firstTrip.id);
                        navigate('/trip');
                      }
                    }}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    View Full Itinerary ➔
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F7F5EF] border border-[#25332E]/10">
                  <div>
                    <h4 className="font-display font-bold text-base text-primary">
                      {savedTrips[0].title}
                    </h4>
                    <p className="text-xs text-[#414845] mt-0.5">
                      {savedTrips[0].subtitle} • {savedTrips[0].duration}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs font-medium text-primary">
                      <span>📅 {savedTrips[0].dates}</span>
                      <span>•</span>
                      <span>☀️ {savedTrips[0].weatherSummary}</span>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await selectTrip(savedTrips[0].id);
                      navigate('/trip');
                    }}
                    className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] transition shadow-sm shrink-0"
                  >
                    Manage Itinerary
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-[#25332E]/10 p-5 shadow-card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">travel_explore</span>
                    <h3 className="font-display font-bold text-base text-primary">Start Your Adventure</h3>
                    <span className="px-2 py-0.5 rounded-md bg-[#EDFDF5] text-primary text-[10px] font-bold uppercase">
                      Adaptive AI
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-[#F7F5EF] border border-[#25332E]/10">
                  <div>
                    <h4 className="font-display font-bold text-base text-primary">
                      No Expeditions Planned Yet
                    </h4>
                    <p className="text-xs text-[#414845] mt-1 max-w-md">
                      Plan an adaptive multi-day itinerary with real-time weather rerouting, or try Demo Mode to see Serene Expedition in action.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate('/plan')}
                      className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] transition shadow-sm flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      <span>Plan Journey</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Recently Viewed Destinations (Screen 08) */}
            <div>
              <h3 className="font-display font-bold text-base text-primary mb-3">Recently Viewed</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recentlyViewed.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate('/plan')}
                    className="p-3.5 rounded-xl bg-white border border-[#25332E]/10 hover:border-primary cursor-pointer transition shadow-sm"
                  >
                    <span className="text-[10px] text-[#414845] font-semibold">{item.time}</span>
                    <h4 className="font-display font-bold text-sm text-primary mt-1">{item.name}</h4>
                    <p className="text-xs text-[#414845] mt-0.5">{item.tag}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Explore by Interest (Screen 08) */}
            <div>
              <h3 className="font-display font-bold text-base text-primary mb-3">Explore by Interest</h3>
              <div className="flex flex-wrap gap-2">
                {interestCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedInterest(selectedInterest === cat.id ? null : cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
                      selectedInterest === cat.id
                        ? 'bg-primary text-white border-primary shadow-sm'
                        : 'bg-white text-charcoal border-[#25332E]/15 hover:border-primary hover:bg-[#EDFDF5]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Destinations Grid (Screen 08) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-base text-primary">Popular Destinations in India</h3>
                <button onClick={() => navigate('/plan')} className="text-xs font-bold text-primary hover:underline">
                  See More
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {popularDestinations.map((dest) => (
                  <div key={dest.id} className="rounded-xl bg-white border border-[#25332E]/10 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="h-36 w-full overflow-hidden relative">
                      <img src={dest.image} alt={dest.name} className="w-full h-full object-cover" />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-semibold backdrop-blur-sm">
                        {dest.season}
                      </span>
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-display font-bold text-sm text-primary">{dest.name}</h4>
                        <p className="text-xs text-[#414845] mt-0.5">{dest.tag}</p>
                      </div>
                      <button
                        onClick={() => navigate('/plan')}
                        className="mt-3 w-full py-1.5 rounded-lg bg-[#EDFDF5] hover:bg-secondary-container text-primary font-semibold text-xs transition border border-[#D8E9DD]"
                      >
                        Plan This Trip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
