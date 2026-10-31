import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../context/TripContext';
import { Header } from '../components/common/Header';
import { BottomNav } from '../components/common/BottomNav';

export const ReviewPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, acceptReplan, rejectReplan } = useTrip();

  const proposal = state.pendingReplan;

  const handleConfirm = () => {
    if (proposal) {
      acceptReplan();
    }
    navigate('/trip');
  };

  const handleDecline = () => {
    if (proposal) {
      rejectReplan();
    }
    navigate('/trip');
  };

  // Demo fallback diff data if accessed directly without pending proposal
  const diffItems = proposal?.diffItems || [
    {
      id: 'diff-1',
      type: 'retained',
      activityId: 'act-2-1',
      title: 'Hawa Mahal Dawn Facade & Heritage Walk',
      location: 'Hawa Mahal Rd, Jaipur',
      duration: '1.5h',
      cost: 200,
      costDisplay: '₹200',
      notes: 'Completed earlier today. Retained without alteration.'
    },
    {
      id: 'diff-2',
      type: 'retained',
      activityId: 'act-2-2',
      title: 'City Palace Royal Quarters',
      location: 'Tulsi Marg, Gangori Bazaar',
      duration: '2h',
      cost: 700,
      costDisplay: '₹700',
      notes: 'Indoor museum verified dry. Schedule locked.'
    },
    {
      id: 'diff-3',
      type: 'adjusted',
      activityId: 'act-2-3',
      title: 'Albert Hall Museum & Indo-Saracenic Gallery',
      location: 'Ram Niwas Garden, Jaipur',
      originalTime: '02:00 PM (Jantar Mantar - Outdoor)',
      newTime: '02:15 PM (Albert Hall - Sheltered)',
      duration: '2h',
      cost: 300,
      costDisplay: '₹300',
      notes: 'Intelligent Swap: Replaced rain-exposed stone instruments with royal state museum.'
    },
    {
      id: 'diff-4',
      type: 'retained',
      activityId: 'act-2-4',
      title: 'Johari Bazaar Spices & Sweet Tasting',
      location: 'Johari Bazaar, Pink City',
      duration: '2h',
      cost: 450,
      costDisplay: '₹450',
      notes: 'Covered veranda walk. Retained for 05:00 PM.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-surface pb-32">
      {/* Header */}
      <Header
        title="Updated Itinerary Review"
        showBack={true}
        onBack={() => navigate('/trip')}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-20 flex flex-col gap-6">

        {/* Top Banner (Screen 09 Spec) */}
        <div className="rounded-2xl bg-white border border-[#25332E]/10 p-5 shadow-card">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EDFDF5] text-primary border border-[#D8E9DD] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              <span>AI Rebalance Complete</span>
            </span>
            <span className="text-xs font-semibold text-emerald-800">
              Optimal route recovered with zero booking drops
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-primary tracking-tight">
            Review Adaptive Itinerary Updates
          </h1>
          <p className="text-xs sm:text-sm text-[#414845] mt-1">
            RoamWise synthesized dynamic weather telemetry and re-sequenced Day 02 to shield your route from afternoon rain.
          </p>

          {/* Key Metric Highlights (Screen 09 Spec) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="p-3 rounded-xl bg-[#EDFDF5] border border-[#D8E9DD]">
              <span className="material-symbols-outlined text-primary text-[20px]">tour</span>
              <div className="text-sm font-bold text-primary mt-1">4 Total Stops</div>
              <span className="text-[11px] text-[#414845]">Pacing Preserved</span>
            </div>

            <div className="p-3 rounded-xl bg-[#EDFDF5] border border-[#D8E9DD]">
              <span className="material-symbols-outlined text-emerald-700 text-[20px]">umbrella</span>
              <div className="text-sm font-bold text-primary mt-1">100% Rain Safe</div>
              <span className="text-[11px] text-emerald-800 font-semibold">Dry Sheltered Stops</span>
            </div>

            <div className="p-3 rounded-xl bg-[#FFF8F0] border border-amber/30">
              <span className="material-symbols-outlined text-amber text-[20px]">payments</span>
              <div className="text-sm font-bold text-primary mt-1">₹2,900</div>
              <span className="text-[11px] text-amber font-semibold">-₹500 Optimized</span>
            </div>

            <div className="p-3 rounded-xl bg-[#EDFDF5] border border-[#D8E9DD]">
              <span className="material-symbols-outlined text-primary text-[20px]">hourglass_top</span>
              <div className="text-sm font-bold text-primary mt-1">2h 45m Buffer</div>
              <span className="text-[11px] text-[#414845]">Relaxed Cadence</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUMMARY OF ADAPTIVE CHANGES (Screen 09 Spec)                              */}
        {/* ========================================================================= */}
        <div className="rounded-2xl bg-white border border-[#25332E]/10 p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-[#25332E]/10">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber text-[20px]">swap_horiz</span>
              <h2 className="font-display font-bold text-base text-primary">Summary of Adaptive Changes</h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EDFDF5] text-primary">
              Recalculated
            </span>
          </div>

          {/* Swap Diff Card */}
          <div className="mt-4 p-4 rounded-xl bg-[#FFF8F0] border border-amber/40 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber">
                Intelligent Stop Swap
              </span>
              <span className="text-xs font-semibold text-emerald-800">
                Weather Shield Triggered
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex-1 p-3 rounded-lg bg-white/80 border border-gray-200 line-through text-gray-500">
                <span className="text-[10px] font-bold uppercase block text-red-600 line-through">Original Stop</span>
                <span className="font-bold">Jantar Mantar Stone Observatory</span>
                <span className="text-[11px] block mt-0.5">Outdoor • 65% Rain at 2:00 PM</span>
              </div>

              <div className="flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber text-[24px]">arrow_forward</span>
              </div>

              <div className="flex-1 p-3 rounded-lg bg-white border border-emerald-300 text-primary shadow-sm">
                <span className="text-[10px] font-bold uppercase block text-emerald-700">New Replacement</span>
                <span className="font-bold">Albert Hall Museum & Indo-Saracenic Gallery</span>
                <span className="text-[11px] text-[#414845] block mt-0.5">100% Indoor Sheltered • Same Entry Fee</span>
              </div>
            </div>

            <p className="text-xs text-[#414845] mt-1 bg-white/60 p-2.5 rounded-lg border border-amber/20">
              💡 <span className="font-semibold text-primary">Budget Optimization:</span> ₹500 budget saved on local transit was reallocated into your evening Johari Bazaar food tasting buffer.
            </p>
          </div>
        </div>

        {/* Multi-City Weather Radar Mini-Cards (Screen 09 Spec) */}
        <div>
          <h3 className="font-display font-bold text-sm text-primary mb-2.5">
            Multi-City Weather Radar (Next 7 Days)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#FFF8F0] border border-amber/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-primary block">Jaipur (Days 1–2)</span>
                <span className="text-[11px] text-amber font-semibold">Weather Shield Active</span>
              </div>
              <span className="material-symbols-outlined text-amber text-[20px]">shield</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#25332E]/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-primary block">Delhi (Days 3–4)</span>
                <span className="text-[11px] text-[#414845]">28°C • Clear Sky</span>
              </div>
              <span className="material-symbols-outlined text-secondary text-[20px]">wb_sunny</span>
            </div>

            <div className="p-3 rounded-xl bg-white border border-[#25332E]/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-primary block">Agra (Day 5)</span>
                <span className="text-[11px] text-[#414845]">26°C • Crisp Autumn</span>
              </div>
              <span className="material-symbols-outlined text-secondary text-[20px]">task_alt</span>
            </div>
          </div>
        </div>

        {/* Recalculated Flow Timeline (Screen 09 Spec) */}
        <div className="rounded-2xl bg-white border border-[#25332E]/10 p-5 shadow-card">
          <div className="flex items-center justify-between pb-3 border-b border-[#25332E]/10">
            <h3 className="font-display font-bold text-base text-primary">
              Today's Recalculated Flow (Day 02)
            </h3>
            <span className="text-xs font-semibold text-emerald-800">
              Live Sync Enabled
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            {diffItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className={`p-3.5 rounded-xl border transition ${
                  item.type === 'adjusted'
                    ? 'bg-[#FFF8F0] border-amber/50 shadow-sm'
                    : 'bg-[#F7F5EF] border-[#25332E]/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        item.type === 'adjusted'
                          ? 'bg-amber text-white'
                          : 'bg-primary text-white'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-primary">{item.title}</span>
                        {item.type === 'adjusted' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber text-white font-bold">
                            Swapped
                          </span>
                        )}
                        {item.type === 'retained' && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#EDFDF5] text-primary font-semibold">
                            Retained
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#414845] mt-0.5">{item.location}</p>
                      <p className="text-xs text-charcoal font-medium mt-1">{item.notes}</p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-primary shrink-0">{item.costDisplay}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Sticky Bottom Actions Bar (Screen 09 Spec) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#25332E]/10 p-4 shadow-overlay">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={handleDecline}
            className="flex-1 py-3 rounded-xl bg-[#EDFDF5] hover:bg-secondary-container text-primary font-bold text-xs sm:text-sm transition border border-[#D8E9DD]"
          >
            Keep Original Plan
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-primary hover:bg-[#204E43] text-white font-bold text-xs sm:text-sm transition shadow-sm flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px] text-amber">check_circle</span>
            <span>Confirm & Apply Changes</span>
          </button>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
};
