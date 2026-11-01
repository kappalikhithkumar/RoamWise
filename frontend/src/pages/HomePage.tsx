import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';
import { CURATED_CIRCUITS } from '../data/curatedCircuits';

const POPULAR_DESTINATIONS = [
  {
    id: 'udaipur',
    name: 'Udaipur, Rajasthan',
    tag: 'Lakes & Palaces',
    season: 'Best: Oct – Mar',
    category: 'history',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'spiti',
    name: 'Spiti Valley, Himachal',
    tag: 'High Altitude Desert',
    season: 'Best: Jun – Sep',
    category: 'adventure',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'varanasi',
    name: 'Varanasi Ghats, Uttar Pradesh',
    tag: 'Ancient Cultural Hub',
    season: 'Best: Oct – Mar',
    category: 'spiritual',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'hampi',
    name: 'Hampi, Karnataka',
    tag: 'Vijayanagara Ruins & Boulders',
    season: 'Best: Nov – Feb',
    category: 'history',
    image: 'https://images.unsplash.com/photo-1600100397608-f010f4219b16?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'munnar',
    name: 'Munnar, Kerala',
    tag: 'Tea Plantations & Misty Hills',
    season: 'Best: Sep – Mar',
    category: 'nature',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'goa',
    name: 'Goa Coastline',
    tag: 'Heritage Chapels & Sunsets',
    season: 'Best: Nov – Mar',
    category: 'wellness',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
  },
];

const CATEGORIES = [
  { id: 'all', label: '✨ All' },
  { id: 'adventure', label: '🧗 Adventure' },
  { id: 'nature', label: '🌿 Nature' },
  { id: 'food', label: '☕ Food & Cafes' },
  { id: 'history', label: '🏛️ History & Forts' },
  { id: 'spiritual', label: '🪔 Spiritual' },
  { id: 'wellness', label: '🧘 Wellness' },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    hasActiveTrip,
    savedTrips,
    selectTrip
  } = useTrip();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterest, setSelectedInterest] = useState<string>('all');

  // Compute active or upcoming trip details
  const activeOrUpcomingTrip = (hasActiveTrip && state.days.length > 0)
    ? {
        isHydrated: true,
        tripId: state.backendTripId,
        destinations: state.config.destinations && state.config.destinations.length > 0
          ? state.config.destinations
          : state.config.destination
          ? state.config.destination.split(/➔|,|to/).map((s) => s.trim()).filter(Boolean)
          : ['India'],
        startDate: state.config.startDate,
        endDate: state.config.endDate,
        dates: state.config.startDate && state.config.endDate
          ? `${state.config.startDate} – ${state.config.endDate}`
          : (state.config.startDate || ''),
        totalDays: state.days.length,
        nextStop: (() => {
          const allActs = state.days.flatMap((d) => d.activities || []);
          const nextAct = allActs.find((a) => !a.isVisited) || allActs[0];
          if (!nextAct) return undefined;
          return `${nextAct.title}${nextAct.location ? ` (${nextAct.location})` : ''}`;
        })(),
      }
    : savedTrips.length > 0
    ? {
        isHydrated: false,
        tripId: savedTrips[0].id,
        destinations: [savedTrips[0].subtitle || savedTrips[0].title],
        startDate: savedTrips[0].dates?.split('–')?.[0]?.trim(),
        endDate: savedTrips[0].dates?.split('–')?.[1]?.trim(),
        dates: savedTrips[0].dates || '',
        totalDays: savedTrips[0].totalDays || 1,
        nextStop: savedTrips[0].subtitle || undefined,
      }
    : null;

  // Compute status badge: "In N days" or "Day X of Y"
  const computeStatusBadge = (startDateStr?: string, endDateStr?: string, totalDays: number = 1) => {
    if (!startDateStr) {
      return { text: `Day 1 of ${Math.max(1, totalDays)}`, type: 'ongoing' as const };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return { text: `In ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`, type: 'upcoming' as const };
    }

    if (endDateStr) {
      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
      if (today.getTime() <= end.getTime()) {
        const dayNum = Math.max(1, Math.min(totalDays, Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1));
        return { text: `Day ${dayNum} of ${totalDays}`, type: 'ongoing' as const };
      }
      return { text: `Trip completed • ${totalDays} Days`, type: 'completed' as const };
    }

    return { text: `Day 1 of ${Math.max(1, totalDays)}`, type: 'ongoing' as const };
  };

  const statusBadge = activeOrUpcomingTrip
    ? computeStatusBadge(activeOrUpcomingTrip.startDate, activeOrUpcomingTrip.endDate, activeOrUpcomingTrip.totalDays)
    : null;

  const handleOpenItinerary = async () => {
    if (!activeOrUpcomingTrip?.isHydrated && activeOrUpcomingTrip?.tripId) {
      await selectTrip(activeOrUpcomingTrip.tripId);
    }
    navigate('/trip');
  };

  const handlePlanDestination = (destinationName?: string) => {
    const trimmed = destinationName?.trim();
    if (trimmed) {
      navigate(`/plan?destination=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/plan');
    }
  };

  const handlePlanSearch = () => {
    handlePlanDestination(searchQuery);
  };

  // Filter destinations by search & category
  const filteredPopular = POPULAR_DESTINATIONS.filter((d) => {
    const matchesSearch = searchQuery.trim() === '' ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedInterest === 'all' || d.category === selectedInterest;
    return matchesSearch && matchesCategory;
  });

  const filteredCircuits = CURATED_CIRCUITS.filter((c) => {
    if (searchQuery.trim() === '') return true;
    const query = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(query) ||
      c.route.toLowerCase().includes(query) ||
      c.highlights.some((h) => h.toLowerCase().includes(query))
    );
  });

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface pb-24">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-20">

        {/* 1. YOUR TRIP CARD (Shown first if there is an active or upcoming trip) */}
        {activeOrUpcomingTrip && statusBadge && (
          <section className="mb-6 animate-fadeIn">
            <div className="relative rounded-2xl bg-white border border-[#25332E]/10 p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#EDFDF5] text-primary border border-[#D8E9DD]">
                      Your trip
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      statusBadge.type === 'upcoming'
                        ? 'bg-amber/15 text-amber-900 border border-amber/30'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}>
                      {statusBadge.text}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold font-display text-primary leading-tight">
                    {activeOrUpcomingTrip.destinations.map((d) => d.split(',')[0]).join(' ➔ ')}
                  </h2>

                  {activeOrUpcomingTrip.dates && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-[#414845] font-medium">
                      <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                      <span>{activeOrUpcomingTrip.dates}</span>
                    </div>
                  )}

                  {activeOrUpcomingTrip.nextStop && (
                    <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-[#EDFDF5]/60 border border-[#D8E9DD] text-xs">
                      <span className="material-symbols-outlined text-primary text-[18px]">near_me</span>
                      <span className="text-[#414845]">
                        <strong className="text-primary font-semibold">Next stop:</strong> {activeOrUpcomingTrip.nextStop}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start sm:items-end justify-between shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#25332E]/10">
                  <button
                    onClick={handleOpenItinerary}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] active:scale-95 transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <span>Open itinerary</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. SEARCH & PLAN A TRIP CTA (Always shown below "Your trip", or at top if no trip) */}
        <section className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-primary font-display tracking-tight">
                Where would you like to explore?
              </h1>
              <p className="text-xs sm:text-sm text-[#414845] mt-0.5">
                Multi-day itineraries across India with real-time weather and verified local attractions.
              </p>
            </div>

            <button
              onClick={() => handlePlanDestination()}
              className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] active:scale-95 transition shadow-sm flex items-center justify-center gap-1.5 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Plan a trip</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full">
            <div className="flex items-center rounded-2xl bg-white border border-[#25332E]/15 shadow-sm overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent">
              <span className="material-symbols-outlined text-[#414845] pl-4 text-[22px]">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handlePlanSearch();
                  }
                }}
                placeholder="Search Indian destinations (e.g. Udaipur, Spiti, Varanasi, Hampi)..."
                className="w-full px-3 py-3.5 text-sm bg-transparent outline-none placeholder-[#414845]/60 text-charcoal font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="p-2 text-[#414845] hover:text-primary"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
              <button
                onClick={handlePlanSearch}
                className="m-1.5 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] active:scale-95 transition shadow-sm flex items-center gap-1 shrink-0"
              >
                <span>Plan Journey</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </section>

        {/* 3. EXPLORE SECTION OF INDIAN DESTINATIONS */}
        <section className="flex flex-col gap-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedInterest(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  selectedInterest === cat.id
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-charcoal border-[#25332E]/15 hover:border-primary hover:bg-[#EDFDF5]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Popular Destinations Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
                <h3 className="font-display font-bold text-base text-primary">Popular Destinations in India</h3>
              </div>
              <button
                onClick={() => handlePlanDestination()}
                className="text-xs font-bold text-primary hover:underline"
              >
                Plan Custom Trip
              </button>
            </div>

            {filteredPopular.length === 0 ? (
              <div className="p-6 rounded-xl bg-white border border-[#25332E]/10 text-center">
                <p className="text-sm text-[#414845]">No destinations found matching &quot;{searchQuery}&quot;.</p>
                <button
                  onClick={() => handlePlanDestination(searchQuery)}
                  className="mt-3 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-[#204E43] transition"
                >
                  Plan a trip to {searchQuery}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {filteredPopular.map((dest) => (
                  <div
                    key={dest.id}
                    className="rounded-xl bg-white border border-[#25332E]/10 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-card-hover transition-all"
                  >
                    <div className="h-40 w-full overflow-hidden relative">
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover transition duration-300 hover:scale-105"
                      />
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-semibold backdrop-blur-sm">
                        {dest.season}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-display font-bold text-sm text-primary">{dest.name}</h4>
                        <p className="text-xs text-[#414845] mt-0.5">{dest.tag}</p>
                      </div>
                      <button
                        onClick={() => handlePlanDestination(dest.name)}
                        className="mt-3 w-full py-2 rounded-lg bg-[#EDFDF5] hover:bg-secondary-container text-primary font-semibold text-xs transition border border-[#D8E9DD] active:scale-95"
                      >
                        Plan This Trip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Curated Indian Circuits */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">map</span>
                <h3 className="font-display font-bold text-base text-primary">Curated Indian Circuits</h3>
              </div>
              <button
                onClick={() => navigate('/trips')}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View All Trips
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {filteredCircuits.map((circuit) => (
                <div
                  key={circuit.id}
                  className="rounded-xl bg-white border border-[#25332E]/10 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-card-hover transition-all"
                >
                  <div className="h-36 w-full overflow-hidden relative">
                    <img
                      src={circuit.imageUrl}
                      alt={circuit.title}
                      className="w-full h-full object-cover transition duration-300 hover:scale-105"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-white/90 text-primary font-bold text-[10px] backdrop-blur-sm">
                      ★ {circuit.rating}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-display font-bold text-sm text-primary line-clamp-1">{circuit.title}</h4>
                      <p className="text-xs text-[#414845] mt-0.5 font-medium">{circuit.route}</p>
                      <span className="text-[11px] text-[#414845] block mt-1">
                        {circuit.duration} • {circuit.bestSeason}
                      </span>
                    </div>
                    <button
                      onClick={() => handlePlanDestination(circuit.route.split('➔')[0]?.trim())}
                      className="mt-3 w-full py-2 rounded-lg bg-[#EDFDF5] hover:bg-secondary-container text-primary font-semibold text-xs transition border border-[#D8E9DD] active:scale-95"
                    >
                      Plan This Circuit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};