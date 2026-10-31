import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';

export const MyTripsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    savedTrips,
    selectTrip,
    deleteTrip,
    isDemoMode,
    enterDemoMode,
    exitDemoMode
  } = useTrip();
  const [activeFilter, setActiveFilter] = useState<'all' | 'ongoing' | 'upcoming' | 'completed'>('all');

  const ongoingTrip = savedTrips.find((t) => t.status === 'ongoing');
  const upcomingTrips = savedTrips.filter((t) => t.status === 'upcoming');
  const completedTrips = savedTrips.filter((t) => t.status === 'completed');

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface pb-24">
      {/* Top Header */}
      <Header title="My Trips" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-20">
        {/* Demo Mode Notice Banner (When running in presentation/demo mode) */}
        {isDemoMode && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 my-3 rounded-xl bg-amber/15 border border-amber/35 text-primary shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-amber text-[22px]">science</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary">Demo Presentation Mode</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber/25 font-bold text-primary">Sample Data</span>
                </div>
                <p className="text-xs text-[#414845] mt-0.5">
                  Displaying sample trips for testing and UI demonstration. The production SQLite database is untouched.
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
        
        {/* Title & Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary font-display tracking-tight">
              My Trips & Expeditions
            </h1>
            <p className="text-sm text-[#414845] mt-0.5">
              Review your ongoing expeditions, upcoming reservations, and past travel memories.
            </p>
          </div>

          <button
            onClick={() => navigate('/plan')}
            className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] active:scale-95 transition shadow-sm flex items-center gap-1.5 self-start sm:self-center"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Plan New Trip</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 border-b border-[#25332E]/10">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              activeFilter === 'all'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-charcoal border border-[#25332E]/10 hover:bg-[#EDFDF5]'
            }`}
          >
            All Trips ({savedTrips.length})
          </button>

          <button
            onClick={() => setActiveFilter('ongoing')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeFilter === 'ongoing'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-charcoal border border-[#25332E]/10 hover:bg-[#EDFDF5]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ongoing ({ongoingTrip ? 1 : 0})</span>
          </button>

          <button
            onClick={() => setActiveFilter('upcoming')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              activeFilter === 'upcoming'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-charcoal border border-[#25332E]/10 hover:bg-[#EDFDF5]'
            }`}
          >
            Upcoming ({upcomingTrips.length})
          </button>

          <button
            onClick={() => setActiveFilter('completed')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              activeFilter === 'completed'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-charcoal border border-[#25332E]/10 hover:bg-[#EDFDF5]'
            }`}
          >
            Completed ({completedTrips.length})
          </button>
        </div>

        <div className="flex flex-col gap-8 mt-6">
          {savedTrips.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#25332E]/10 p-10 text-center shadow-card flex flex-col items-center justify-center my-4">
              <div className="w-16 h-16 rounded-full bg-[#EDFDF5] border border-[#D8E9DD] flex items-center justify-center text-primary mb-4">
                <span className="material-symbols-outlined text-3xl">travel_explore</span>
              </div>
              <h2 className="text-xl font-bold font-display text-primary">No Expeditions Planned Yet</h2>
              <p className="text-sm text-[#414845] max-w-md mt-1 mb-6">
                You haven't saved any trips yet. Create your first adaptive journey tailored to your rhythm and real-time conditions, or load demo sample data for presentation.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/plan')}
                  className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] active:scale-95 transition shadow-sm flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  <span>Plan Your First Journey</span>
                </button>
                <button
                  onClick={enterDemoMode}
                  className="px-4 py-2.5 rounded-xl bg-[#EDFDF5] text-primary border border-[#D8E9DD] text-xs font-semibold hover:bg-secondary-container active:scale-95 transition flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">play_circle</span>
                  <span>Try Demo Mode</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Filter empty messages if specific filter is active with 0 results */}
              {activeFilter === 'ongoing' && !ongoingTrip && (
                <div className="p-8 rounded-2xl bg-white border border-[#25332E]/10 text-center my-2 shadow-sm">
                  <span className="material-symbols-outlined text-3xl text-primary mb-2">directions_walk</span>
                  <p className="text-sm font-semibold text-primary">No Ongoing Expeditions</p>
                  <p className="text-xs text-[#414845] mt-0.5">You have no trips currently marked in transit.</p>
                  <button onClick={() => setActiveFilter('all')} className="mt-3 px-3 py-1.5 rounded-lg bg-[#EDFDF5] text-primary text-xs font-bold hover:bg-secondary-container transition">
                    View All Trips ({savedTrips.length})
                  </button>
                </div>
              )}

              {activeFilter === 'upcoming' && upcomingTrips.length === 0 && (
                <div className="p-8 rounded-2xl bg-white border border-[#25332E]/10 text-center my-2 shadow-sm">
                  <span className="material-symbols-outlined text-3xl text-primary mb-2">flight_takeoff</span>
                  <p className="text-sm font-semibold text-primary">No Upcoming Expeditions</p>
                  <p className="text-xs text-[#414845] mt-0.5">No upcoming itineraries currently scheduled.</p>
                  <button onClick={() => setActiveFilter('all')} className="mt-3 px-3 py-1.5 rounded-lg bg-[#EDFDF5] text-primary text-xs font-bold hover:bg-secondary-container transition">
                    View All Trips ({savedTrips.length})
                  </button>
                </div>
              )}

              {activeFilter === 'completed' && completedTrips.length === 0 && (
                <div className="p-8 rounded-2xl bg-white border border-[#25332E]/10 text-center my-2 shadow-sm">
                  <span className="material-symbols-outlined text-3xl text-primary mb-2">history_edu</span>
                  <p className="text-sm font-semibold text-primary">No Completed Memories Yet</p>
                  <p className="text-xs text-[#414845] mt-0.5">Your past expedition logs will be archived here once finished.</p>
                  <button onClick={() => setActiveFilter('all')} className="mt-3 px-3 py-1.5 rounded-lg bg-[#EDFDF5] text-primary text-xs font-bold hover:bg-secondary-container transition">
                    View All Trips ({savedTrips.length})
                  </button>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SECTION 1: ACTIVE RIGHT NOW (Screen 01 Spec)                             */}
              {/* ========================================================================= */}
              {(activeFilter === 'all' || activeFilter === 'ongoing') && ongoingTrip && (
            <section className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-primary">Active Right Now</h2>
              </div>

              <div className="rounded-2xl bg-white border border-[#25332E]/10 overflow-hidden shadow-card hover:shadow-card-hover transition-all">
                <div className="flex flex-col md:flex-row">
                  {/* Trip Image */}
                  <div className="md:w-5/12 h-48 md:h-auto relative overflow-hidden">
                    <img
                      src={ongoingTrip.imageUrl}
                      alt={ongoingTrip.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary/90 text-white font-bold text-[11px] backdrop-blur-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Day {ongoingTrip.currentDay} of {ongoingTrip.totalDays}</span>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="p-5 md:w-7/12 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#414845]">
                        <span className="font-semibold text-primary">{ongoingTrip.dates}</span>
                        <span className="px-2 py-0.5 rounded bg-[#EDFDF5] text-primary font-bold">
                          {ongoingTrip.weatherSummary}
                        </span>
                      </div>

                      <h3 className="font-display font-extrabold text-xl text-primary mt-1">
                        {ongoingTrip.title}
                      </h3>
                      <p className="text-xs text-[#414845] mt-1 font-medium">
                        {ongoingTrip.subtitle}
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1 font-medium">
                          <span className="text-primary font-semibold">Itinerary Progress</span>
                          <span className="text-primary font-bold">{ongoingTrip.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-[#EDFDF5] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${ongoingTrip.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Matrix (Screen 01 Spec) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5 pt-4 border-t border-[#25332E]/10">
                      <button
                        onClick={async () => {
                          if (ongoingTrip) await selectTrip(ongoingTrip.id);
                          navigate('/trip');
                        }}
                        className="p-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] transition flex items-center justify-center gap-1 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                        <span>Today</span>
                      </button>

                      <button
                        onClick={() => navigate('/weather')}
                        className="p-2 rounded-xl bg-[#EDFDF5] text-primary text-xs font-semibold hover:bg-secondary-container transition border border-[#D8E9DD] flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-amber text-[16px]">cloud</span>
                        <span>Weather</span>
                      </button>

                      <button
                        onClick={() => navigate('/map')}
                        className="p-2 rounded-xl bg-[#EDFDF5] text-primary text-xs font-semibold hover:bg-secondary-container transition border border-[#D8E9DD] flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">map</span>
                        <span>Map</span>
                      </button>

                      <button
                        onClick={() => navigate('/replan')}
                        className="p-2 rounded-xl bg-[#FFF8F0] text-amber border border-amber/30 text-xs font-bold hover:bg-amber/10 transition flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit_calendar</span>
                        <span>Re-plan</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECTION 2: UPCOMING JOURNEYS (Screen 01 Spec)                            */}
          {/* ========================================================================= */}
          {(activeFilter === 'all' || activeFilter === 'upcoming') && upcomingTrips.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-primary">
                Upcoming Expeditions ({upcomingTrips.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="rounded-2xl bg-white border border-[#25332E]/10 overflow-hidden shadow-sm hover:shadow-card transition flex flex-col justify-between"
                  >
                    <div className="h-40 w-full overflow-hidden relative">
                      <img src={trip.imageUrl} alt={trip.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 text-primary font-bold text-xs backdrop-blur-sm">
                        {trip.duration}
                      </div>
                      <div className="absolute bottom-3 left-3 px-2.5 py-0.5 rounded-md bg-black/60 text-white font-medium text-xs backdrop-blur-sm">
                        {trip.dates}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display font-bold text-base text-primary">
                          {trip.title}
                        </h3>
                        <p className="text-xs text-[#414845] mt-0.5 font-medium">
                          {trip.subtitle}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#25332E]/10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              await selectTrip(trip.id);
                              navigate('/trip');
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] transition shadow-sm flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                            <span>View Itinerary</span>
                          </button>

                          <button
                            onClick={() => navigate('/plan')}
                            className="px-3 py-1.5 rounded-xl bg-[#EDFDF5] text-primary text-xs font-semibold hover:bg-secondary-container transition border border-[#D8E9DD] flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                            <span>Edit</span>
                          </button>
                        </div>

                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete expedition "${trip.title}"?`)) {
                              await deleteTrip(trip.id);
                            }
                          }}
                          title="Delete trip"
                          aria-label={`Delete ${trip.title}`}
                          className="w-8 h-8 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-200 flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ========================================================================= */}
          {/* SECTION 3: TRAVEL MEMORIES & LOGS (Completed - Screen 01 Spec)            */}
          {/* ========================================================================= */}
          {(activeFilter === 'all' || activeFilter === 'completed') && completedTrips.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#414845]">
                Travel Memories & Completed Logs
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="rounded-2xl bg-white border border-[#25332E]/10 overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="h-36 w-full overflow-hidden relative">
                      <img src={trip.imageUrl} alt={trip.title} className="w-full h-full object-cover opacity-90" />
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#173F35]/90 text-white font-bold text-xs">
                        Completed
                      </div>
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/60 text-white font-medium text-xs">
                        {trip.dates}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-display font-bold text-base text-primary">
                          {trip.title}
                        </h3>
                        <p className="text-xs text-[#414845] mt-0.5 font-medium">
                          {trip.subtitle}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#25332E]/10 flex items-center justify-between gap-2">
                        <button
                          onClick={async () => {
                            await selectTrip(trip.id);
                            navigate('/trip');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#EDFDF5] text-primary text-xs font-semibold hover:bg-secondary-container transition border border-[#D8E9DD] flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">menu_book</span>
                          <span>View Log</span>
                        </button>

                        <button
                          onClick={() => navigate('/plan')}
                          className="text-xs font-semibold text-primary hover:text-amber transition flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                          <span>Revisit Circuit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
            </>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
