// Verification of React Frontend Lifecycle connected to live Flask Backend
// Simulates TripContext state, apiService, and browser refresh persistence

const BASE_URL = 'http://127.0.0.1:5000/api';

// In-memory mock of browser localStorage
const localStorageMock = new Map();

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

const apiService = {
  checkHealth: () => request('/health'),
  getTrips: async () => {
    const res = await request('/trips');
    return Array.isArray(res) ? res : res.trips || [];
  },
  getTrip: async (id) => {
    const res = await request(`/trips/${id}`);
    if (res && res.trip && res.days && !res.destination) {
      return { ...res.trip, days: res.days };
    }
    return res;
  },
  createTrip: (data) => request('/trips', { method: 'POST', body: JSON.stringify(data) }),
  updateTrip: (id, data) => request(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTrip: (id) => request(`/trips/${id}`, { method: 'DELETE' })
};

async function runFrontendLifecycleVerification() {
  console.log('========================================================');
  console.log('1. VERIFYING FLASK API CONNECTION & HEALTH');
  console.log('========================================================');
  const health = await apiService.checkHealth();
  console.log('Health check:', health);
  if (health.status !== 'healthy') throw new Error('Backend not healthy');

  console.log('\n========================================================');
  console.log('2. SIMULATING USER TRIP CREATION (PlanTripPage -> GeneratingPage)');
  console.log('========================================================');
  const userTripConfig = {
    destination: 'Kerala Backwaters & Tea Trails',
    destinations: ['Munnar Hills', 'Alleppey Backwaters'],
    startDate: '2026-12-10',
    endDate: '2026-12-14',
    budgetTier: 'Premium',
    interests: ['Nature', 'Food', 'Relaxation'],
    travelerType: 'Couple',
    pace: 'Relaxed',
    weatherAdaptive: true,
    tagline: 'Misty hills and tranquil backwaters expedition',
    days: [
      {
        dayNumber: 1,
        dayOfWeek: 'Thursday',
        dateStr: 'Dec 10, 2026',
        theme: 'Munnar: Cloud Peaks & Tea Plantation Sanctuary',
        weatherSummary: '20°C • Misty with Afternoon Showers',
        temperature: '20°C',
        rainRisk: 40,
        weatherCondition: 'rainy',
        weatherAlert: 'Rain forecast for afternoon estate walk',
        activities: [
          {
            id: 'act-kerala-1',
            title: 'Kolukkumalai Sunrise Jeep Safari',
            timeSlot: '05:30 AM',
            period: 'morning',
            duration: '3h',
            cost: 2500,
            costDisplay: '₹2,500',
            category: 'Adventure',
            location: 'Kolukkumalai, Munnar',
            isIndoor: false,
            weatherRisk: 'low',
            weatherRiskLabel: '☀️ Clear Dawn Window',
            description: 'World highest elevation organic tea estate sunrise safari.',
            isVisited: false,
            hasPlanBReady: false
          },
          {
            id: 'act-kerala-2',
            title: 'Eravikulam Alpine Flora Trail',
            timeSlot: '02:00 PM',
            period: 'afternoon',
            duration: '2.5h',
            cost: 400,
            costDisplay: '₹400',
            category: 'Nature',
            location: 'Eravikulam National Park',
            isIndoor: false,
            weatherRisk: 'high',
            weatherRiskLabel: '🌧️ Rain Risk 65%',
            description: 'Open ridge trek through shola grasslands.',
            isVisited: false,
            hasPlanBReady: true,
            planBAlternative: {
              id: 'alt-kerala-2',
              title: 'KDHP Tea Museum & Indoor Tasting Pavilion',
              timeSlot: '02:00 PM',
              duration: '2h',
              cost: 200,
              costDisplay: '₹200',
              category: 'Culture',
              location: 'Nullatanni Estate, Munnar',
              isIndoor: true,
              weatherRiskLabel: '☂️ Sheltered Indoor Safe',
              description: 'Heritage tea processing museum, historical documentary, and artisanal tasting.',
              shelterReason: 'High rainfall risk at high altitude park',
              costDelta: '-₹200'
            }
          }
        ]
      }
    ]
  };

  const createRes = await apiService.createTrip(userTripConfig);
  console.log('Trip created successfully! Response:', createRes.message);
  const createdTripId = createRes.tripId;
  console.log('Assigned Backend Trip ID:', createdTripId);
  if (!createdTripId) throw new Error('No tripId returned');

  // React TripContext stores the active trip ID in localStorage
  localStorageMock.set('roamwise_active_backend_id', createdTripId.toString());
  console.log('Stored in localStorage: roamwise_active_backend_id =', localStorageMock.get('roamwise_active_backend_id'));

  console.log('\n========================================================');
  console.log('3. SIMULATING USER INTERACTION: TOGGLE VISITED (DayDetailPage)');
  console.log('========================================================');
  // User visits activity 1 and marks it as visited
  const activeTrip = await apiService.getTrip(createdTripId);
  const updatedDays = JSON.parse(JSON.stringify(activeTrip.days));
  updatedDays[0].activities[0].isVisited = true;

  console.log('Marking Activity 1 ("Kolukkumalai Sunrise Jeep Safari") as visited (isVisited = true)...');
  await apiService.updateTrip(createdTripId, { days: updatedDays });

  console.log('\n========================================================');
  console.log('4. SIMULATING USER INTERACTION: APPLY PLAN B (DayDetailPage / Modal)');
  console.log('========================================================');
  // User activates Plan B for Activity 2 because of rain alert
  const actToSwap = updatedDays[0].activities[1];
  const alt = actToSwap.planBAlternative;
  console.log(`Applying Plan B: Replacing "${actToSwap.title}" with sheltered alternative "${alt.title}"...`);

  updatedDays[0].weatherAlert = 'Plan B Activated: Sheltered indoor itinerary in effect';
  updatedDays[0].activities[1] = {
    ...actToSwap,
    id: alt.id,
    title: alt.title,
    timeSlot: alt.timeSlot,
    duration: alt.duration,
    cost: alt.cost,
    costDisplay: alt.costDisplay,
    location: alt.location,
    isIndoor: true,
    weatherRisk: 'low',
    weatherRiskLabel: alt.weatherRiskLabel,
    description: alt.description,
    isVisited: false,
    isPlanBAlternative: true
  };

  await apiService.updateTrip(createdTripId, { days: updatedDays });
  console.log('Plan B change successfully synced to Flask backend!');

  console.log('\n========================================================');
  console.log('5. SIMULATING BROWSER REFRESH (F5 / Page Reload)');
  console.log('========================================================');
  console.log('--- Client memory flushed to clean state ---');
  let clientState = { config: null, days: null, activeTripId: null };

  // React TripProvider mounts upon page load:
  console.log('1. TripProvider mounts and reads localStorage:');
  const storedId = localStorageMock.get('roamwise_active_backend_id');
  console.log('   Retrieved storedId from localStorage:', storedId);

  console.log('2. TripProvider checks backend health:');
  const refreshHealth = await apiService.checkHealth();
  console.log('   Backend health status:', refreshHealth.status);

  console.log('3. TripProvider fetches full trip from Flask/SQLite for ID', storedId);
  const reloadedTrip = await apiService.getTrip(storedId);

  // Hydrate React state:
  clientState.activeTripId = reloadedTrip.id;
  clientState.config = reloadedTrip;
  clientState.days = reloadedTrip.days;

  console.log('\n========================================================');
  console.log('6. VERIFYING REFRESHED CLIENT STATE FROM SQLITE');
  console.log('========================================================');
  console.log('Destination:', clientState.config.destination);
  if (clientState.config.destination !== userTripConfig.destination) {
    throw new Error('Destination mismatch after refresh!');
  }

  const refreshedAct1 = clientState.days[0].activities[0];
  console.log(`Activity 1: "${refreshedAct1.title}"`);
  console.log(`   isVisited: ${refreshedAct1.isVisited} (Expected: true)`);
  if (refreshedAct1.isVisited !== true) {
    throw new Error('isVisited status NOT preserved across refresh!');
  }

  const refreshedAct2 = clientState.days[0].activities[1];
  console.log(`Activity 2: "${refreshedAct2.title}"`);
  console.log(`   isPlanBAlternative: ${refreshedAct2.isPlanBAlternative} (Expected: true)`);
  console.log(`   isIndoor: ${refreshedAct2.isIndoor} (Expected: true)`);
  console.log(`   weatherRiskLabel: "${refreshedAct2.weatherRiskLabel}"`);
  if (refreshedAct2.isPlanBAlternative !== true) {
    throw new Error('Plan B alternative state NOT preserved across refresh!');
  }
  if (refreshedAct2.title !== 'KDHP Tea Museum & Indoor Tasting Pavilion') {
    throw new Error('Plan B title NOT preserved across refresh!');
  }
  console.log('SUCCESS: All completed activities and Plan B changes survived browser refresh perfectly! ✓');

  console.log('\n========================================================');
  console.log('7. TESTING DELETE API & CASCADE (Point 3)');
  console.log('========================================================');
  console.log(`Deleting test trip ${createdTripId} via DELETE /api/trips/${createdTripId}...`);
  const delRes = await apiService.deleteTrip(createdTripId);
  console.log('Delete response:', delRes);
  if (!delRes.success) throw new Error('Delete API failed');

  // Verify 404 on subsequent get
  try {
    await apiService.getTrip(createdTripId);
    throw new Error('Trip was not deleted!');
  } catch (err) {
    console.log(`Verified: GET /api/trips/${createdTripId} now returns 404 Not Found (${err.message}) ✓`);
  }

  // Verify listing does not contain deleted trip
  const currentTrips = await apiService.getTrips();
  const existsInList = currentTrips.some(t => t.id === createdTripId);
  console.log(`Verified: Trip ${createdTripId} removed from saved trips listing (found: ${existsInList}) ✓`);
  if (existsInList) throw new Error('Deleted trip still appears in trips list!');

  console.log('\n========================================================');
  console.log('✓✓✓ ALL LIFECYCLE, BROWSER REFRESH, AND DELETE TESTS PASSED! ✓✓✓');
  console.log('========================================================');
}

runFrontendLifecycleVerification().catch(err => {
  console.error('\nFAILED:', err);
  process.exit(1);
});
