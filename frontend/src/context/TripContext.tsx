import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import {
  TripConfig,
  DayItinerary,
  Activity,
  TravelAlert,
  ReplanProposal,
  UserProfile,
  ItineraryDiffItem,
  TripSummary
} from '../types';
import { generateDeterministicItinerary } from '../mock/itineraryGenerator';
import { apiService, BackendTrip } from '../services/api';

interface PlanBModalState {
  isOpen: boolean;
  activity: Activity | null;
  dayNumber: number;
}

interface TripState {
  config: TripConfig;
  days: DayItinerary[];
  activeDayNumber: number;
  planBModal: PlanBModalState;
  pendingReplan: ReplanProposal | null;
  alerts: TravelAlert[];
  userProfile: UserProfile;
  savedTrips: TripSummary[];
  hasActiveTrip: boolean;
  backendTripId: number | null;
  isBackendOnline: boolean;
  isSyncing: boolean;
  isGenerating: boolean;
  generationError: string | null;
  destinationError: string | null;
  generationSource: string | null;
  fallbackReason: string | null;
  poiSource: string | null;
  verification: string | null;
}

type TripAction =
  | { type: 'UPDATE_CONFIG'; payload: { config: TripConfig; generatedDays: DayItinerary[] } }
  | { type: 'SET_ACTIVE_DAY'; payload: number }
  | { type: 'TOGGLE_VISITED'; payload: { dayNumber: number; activityId: string } }
  | { type: 'OPEN_PLAN_B'; payload: { activity: Activity; dayNumber: number } }
  | { type: 'CLOSE_PLAN_B' }
  | { type: 'APPLY_PLAN_B'; payload: { dayNumber: number; originalActivityId: string } }
  | { type: 'CREATE_REPLAN_PROPOSAL'; payload: { scenarioText: string; delayMinutes: number } }
  | { type: 'ACCEPT_REPLAN' }
  | { type: 'REJECT_REPLAN' }
  | { type: 'MARK_ALERT_READ'; payload: string }
  | { type: 'CLEAR_READ_ALERTS' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<UserProfile> }
  | { type: 'TOGGLE_THEME' }
  | { type: 'TOGGLE_ACTIVE_TRIP' }
  | { type: 'SET_SAVED_TRIPS'; payload: TripSummary[] }
  | { type: 'SET_BACKEND_STATUS'; payload: boolean }
  | { type: 'SET_BACKEND_TRIP_ID'; payload: number | null }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'SET_GENERATION_ERROR'; payload: string | null }
  | { type: 'SET_DESTINATION_ERROR'; payload: string | null }
  | { type: 'CLEAR_DESTINATION_ERROR' }
  | { type: 'SET_CONFIG_ONLY'; payload: TripConfig }
  | {
      type: 'SET_GENERATION_SUCCESS';
      payload: {
        config: TripConfig;
        days: DayItinerary[];
        generationSource: string;
        fallbackReason?: string | null;
        poiSource?: string | null;
        verification?: string | null;
      };
    }
  | { type: 'SET_PENDING_REPLAN'; payload: ReplanProposal }
  | { type: 'HYDRATE_ACTIVE_TRIP'; payload: { backendTripId: number; config: TripConfig; days: DayItinerary[] } }
  | { type: 'RESET_TO_DISCOVERY' };

const INITIAL_PROFILE: UserProfile = {
  name: 'Aarav Sharma',
  email: 'aarav.sharma@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  persona: 'Curious Explorer & Heritage Enthusiast',
  homeCity: 'Bengaluru, India',
  preferredCurrency: 'INR (₹)',
  temperatureUnit: 'C',
  theme: 'light'
};

export const DEFAULT_EMPTY_CONFIG: TripConfig = {
  destination: '',
  destinations: [],
  startDate: '',
  endDate: '',
  budgetTier: 'Moderate',
  interests: [],
  travelerType: 'Solo',
  pace: 'Balanced',
  weatherAdaptive: true,
  tagline: ''
};

const initialState: TripState = {
  config: DEFAULT_EMPTY_CONFIG,
  days: [],
  activeDayNumber: 1,
  planBModal: {
    isOpen: false,
    activity: null,
    dayNumber: 1
  },
  pendingReplan: null,
  alerts: [],
  userProfile: INITIAL_PROFILE,
  savedTrips: [],
  hasActiveTrip: false,
  backendTripId: null,
  isBackendOnline: false,
  isSyncing: false,
  isGenerating: false,
  generationError: null,
  destinationError: null,
  generationSource: null,
  fallbackReason: null,
  poiSource: null,
  verification: null
};

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'SET_BACKEND_STATUS':
      return { ...state, isBackendOnline: action.payload };

    case 'SET_BACKEND_TRIP_ID':
      return { ...state, backendTripId: action.payload };

    case 'SET_SYNCING':
      return { ...state, isSyncing: action.payload };

    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };

    case 'SET_GENERATION_ERROR':
      return { ...state, generationError: action.payload };

    case 'SET_DESTINATION_ERROR':
      return { ...state, destinationError: action.payload };

    case 'CLEAR_DESTINATION_ERROR':
      return { ...state, destinationError: null };

    case 'SET_CONFIG_ONLY':
      return {
        ...state,
        config: action.payload,
        hasActiveTrip: false,
        generationError: null
      };

    case 'SET_GENERATION_SUCCESS':
      return {
        ...state,
        config: action.payload.config,
        days: action.payload.days,
        hasActiveTrip: true,
        activeDayNumber: 1,
        generationSource: action.payload.generationSource,
        fallbackReason: action.payload.fallbackReason || null,
        poiSource: action.payload.poiSource ?? (action.payload.config.poiSource || null),
        verification: action.payload.verification ?? (action.payload.config.verification || null),
        isGenerating: false,
        generationError: null,
        destinationError: null
      };

    case 'RESET_TO_DISCOVERY':
      return {
        ...state,
        hasActiveTrip: false,
        backendTripId: null,
        config: DEFAULT_EMPTY_CONFIG,
        days: [],
        savedTrips: [],
        alerts: [],
        activeDayNumber: 1,
        isGenerating: false,
        generationError: null,
        destinationError: null,
        generationSource: null,
        fallbackReason: null,
        poiSource: null,
        verification: null
      };

    case 'HYDRATE_ACTIVE_TRIP':
      return {
        ...state,
        backendTripId: action.payload.backendTripId,
        config: action.payload.config,
        days: action.payload.days,
        hasActiveTrip: true,
        activeDayNumber: 1,
        generationSource: 'saved',
        fallbackReason: null,
        poiSource: action.payload.config.poiSource || null,
        verification: action.payload.config.verification || null,
        isGenerating: false,
        generationError: null,
        destinationError: null
      };

    case 'SET_PENDING_REPLAN':
      return {
        ...state,
        pendingReplan: action.payload
      };

    case 'TOGGLE_ACTIVE_TRIP':
      return { ...state, hasActiveTrip: !state.hasActiveTrip };

    case 'SET_SAVED_TRIPS':
      return { ...state, savedTrips: action.payload };

    case 'UPDATE_CONFIG': {
      return {
        ...state,
        config: action.payload.config,
        days: action.payload.generatedDays,
        activeDayNumber: 1,
        hasActiveTrip: true
      };
    }

    case 'SET_ACTIVE_DAY':
      return { ...state, activeDayNumber: action.payload };

    case 'TOGGLE_VISITED': {
      const { dayNumber, activityId } = action.payload;
      const updatedDays = state.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          activities: day.activities.map((act) => {
            if (act.id !== activityId) return act;
            return { ...act, isVisited: !act.isVisited };
          })
        };
      });
      return { ...state, days: updatedDays };
    }

    case 'OPEN_PLAN_B':
      return {
        ...state,
        planBModal: {
          isOpen: true,
          activity: action.payload.activity,
          dayNumber: action.payload.dayNumber
        }
      };

    case 'CLOSE_PLAN_B':
      return {
        ...state,
        planBModal: {
          isOpen: false,
          activity: null,
          dayNumber: state.planBModal.dayNumber
        }
      };

    case 'APPLY_PLAN_B': {
      const { dayNumber, originalActivityId } = action.payload;
      const targetDay = state.days.find((d) => d.dayNumber === dayNumber);
      const targetActId =
        targetDay?.activities.find((a) => a.id === originalActivityId)?.id ||
        targetDay?.activities.find((a) => a.hasPlanBReady && a.planBAlternative)?.id ||
        originalActivityId;

      const updatedDays = state.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          weatherAlert: 'Plan B Activated: Sheltered indoor itinerary in effect',
          activities: day.activities.map((act) => {
            if (act.id !== targetActId || !act.planBAlternative) return act;
            const alt = act.planBAlternative;
            return {
              id: alt.id,
              title: alt.title,
              timeSlot: alt.timeSlot,
              period: act.period,
              duration: alt.duration,
              cost: alt.cost,
              costDisplay: alt.costDisplay,
              category: alt.category,
              location: alt.location,
              coordinates: act.coordinates,
              isIndoor: true,
              weatherRisk: 'low' as const,
              weatherRiskLabel: alt.weatherRiskLabel,
              description: alt.description,
              imageUrl: alt.imageUrl || act.imageUrl,
              isVisited: act.isVisited || false,
              isLocked: false,
              isPlanBAlternative: true
            };
          })
        };
      });

      // Mark related weather alert as addressed
      const updatedAlerts = state.alerts.map((al) =>
        al.activityId === targetActId ? { ...al, unread: false, message: 'Plan B applied: Sheltered indoor itinerary in effect' } : al
      );

      return {
        ...state,
        days: updatedDays,
        alerts: updatedAlerts,
        planBModal: { isOpen: false, activity: null, dayNumber }
      };
    }

    case 'CREATE_REPLAN_PROPOSAL': {
      const { scenarioText, delayMinutes } = action.payload;
      const activeDay = state.days.find((d) => d.dayNumber === state.activeDayNumber) || state.days[0];
      const act0 = activeDay?.activities?.[0];
      const act1 = activeDay?.activities?.[1];
      const actLast = activeDay?.activities?.[activeDay.activities.length - 1];

      const diffItems: ItineraryDiffItem[] = [
        {
          id: 'diff-1',
          type: 'locked',
          activityId: act0?.id || 'act-1',
          title: act0?.title || 'Morning Stop',
          location: act0?.location || 'Heritage Area',
          originalTime: act0?.timeSlot || '08:30 AM',
          newTime: act0?.timeSlot || '08:30 AM',
          duration: act0?.duration || '1.5h',
          cost: act0?.cost || 200,
          costDisplay: act0?.costDisplay || '₹200',
          notes: 'Completed / Locked morning reservation preserved intact'
        },
        {
          id: 'diff-2',
          type: 'adjusted',
          activityId: act1?.id || 'act-2',
          title: act1?.title || 'Main Afternoon Highlight',
          location: act1?.location || 'Palace Grounds',
          originalTime: act1?.timeSlot || '10:30 AM',
          newTime: '11:15 AM',
          duration: '1.5h',
          cost: act1?.cost || 700,
          costDisplay: act1?.costDisplay || '₹700',
          notes: `Shifted +${delayMinutes}m to accommodate delay; tour duration compressed by 30 mins`
        },
        {
          id: 'diff-3',
          type: 'added',
          activityId: 'replan-added-1',
          title: 'Nahargarh Biological Park & Evening Cafe',
          location: 'Aravalli Ridge, Jaipur',
          newTime: '04:30 PM',
          duration: '1.5h',
          cost: 350,
          costDisplay: '₹350',
          notes: 'Newly inserted scenic rest stop to bridge sunset window gracefully'
        },
        {
          id: 'diff-4',
          type: 'adjusted',
          activityId: actLast?.id || 'act-last',
          title: actLast?.title || 'Evening Dinner & Stroll',
          location: actLast?.location || 'Bazaar Arcade',
          originalTime: actLast?.timeSlot || '05:00 PM',
          newTime: '06:15 PM',
          duration: '2h',
          cost: actLast?.cost || 450,
          costDisplay: actLast?.costDisplay || '₹450',
          notes: 'Moved into twilight for vibrant night market ambiance'
        }
      ];

      const proposedActivities: Activity[] = [
        {
          ...act0,
          isLocked: true
        },
        {
          ...act1,
          timeSlot: '11:15 AM',
          duration: '1.5h'
        },
        {
          id: 'replan-added-1',
          title: 'Nahargarh Foothills Shaded Teahouse',
          timeSlot: '04:30 PM',
          period: 'afternoon',
          duration: '1.5h',
          cost: 350,
          costDisplay: '₹350',
          category: 'Relaxation',
          location: 'Nahargarh Rd, Jaipur',
          coordinates: { x: 230, y: 220 },
          isIndoor: true,
          weatherRisk: 'low',
          weatherRiskLabel: '🍵 Sheltered Rest',
          description: 'Spontaneous tranquil stop with masala chai and panoramic ridge view to soak in the evening.',
          imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
          isVisited: false
        },
        {
          ...actLast,
          timeSlot: '06:15 PM'
        }
      ];

      const proposal: ReplanProposal = {
        scenarioTitle: `Adaptive Re-sequence (${delayMinutes}m delay absorbed)`,
        triggerReason: scenarioText,
        delayMinutes,
        reservationsKept: 1,
        swappedStopsCount: 1,
        matchScore: 98,
        diffItems,
        proposedActivities
      };

      return {
        ...state,
        pendingReplan: proposal
      };
    }

    case 'ACCEPT_REPLAN': {
      if (!state.pendingReplan) return state;
      const updatedDays = state.days.map((day) => {
        if (day.dayNumber !== state.activeDayNumber) return day;
        return {
          ...day,
          theme: `${day.theme} (AI Re-sequenced)`,
          activities: state.pendingReplan!.proposedActivities
        };
      });

      const newAlert: TravelAlert = {
        id: `alert-replan-${Date.now()}`,
        type: 'plan',
        category: 'SCHEDULE REVISED',
        title: `Day ${state.activeDayNumber} Schedule Updated`,
        message: `Absorbed ${state.pendingReplan.delayMinutes}m delay. All reservations kept intact with optimized evening pacing.`,
        timeAgo: 'Just now',
        unread: true,
        hasPlanB: false,
        dayNumber: state.activeDayNumber
      };

      return {
        ...state,
        days: updatedDays,
        pendingReplan: null,
        alerts: [newAlert, ...state.alerts]
      };
    }

    case 'REJECT_REPLAN':
      return {
        ...state,
        pendingReplan: null
      };

    case 'MARK_ALERT_READ': {
      return {
        ...state,
        alerts: state.alerts.map((al) => (al.id === action.payload ? { ...al, unread: false } : al))
      };
    }

    case 'CLEAR_READ_ALERTS': {
      return {
        ...state,
        alerts: state.alerts.filter((al) => al.unread)
      };
    }

    case 'UPDATE_PROFILE': {
      return {
        ...state,
        userProfile: { ...state.userProfile, ...action.payload }
      };
    }

    case 'TOGGLE_THEME': {
      const nextTheme = state.userProfile.theme === 'light' ? 'dark' : 'light';
      return {
        ...state,
        userProfile: { ...state.userProfile, theme: nextTheme }
      };
    }

    default:
      return state;
  }
}

interface TripContextValue {
  state: TripState;
  unreadAlertsCount: number;
  hasActiveTrip: boolean;
  savedTrips: TripSummary[];
  backendTripId: number | null;
  isBackendOnline: boolean;
  isSyncing: boolean;
  isGenerating: boolean;
  generationError: string | null;
  destinationError: string | null;
  generationSource: string | null;
  fallbackReason: string | null;
  poiSource: string | null;
  verification: string | null;
  toggleActiveTrip: () => void;
  updateConfig: (config: TripConfig) => Promise<{ success: boolean; error?: string; status?: number }>;
  clearDestinationError: () => void;
  retryGeneration: () => Promise<{ success: boolean; error?: string; status?: number }>;
  setActiveDay: (dayNumber: number) => void;
  toggleVisited: (dayNumber: number, activityId: string) => Promise<void>;
  openPlanB: (activity: Activity, dayNumber: number) => void;
  closePlanB: () => void;
  applyPlanB: (dayNumber: number, originalActivityId: string) => Promise<void>;
  createReplanProposal: (scenarioText: string, delayMinutes?: number) => void;
  acceptReplan: () => Promise<void>;
  rejectReplan: () => void;
  markAlertRead: (id: string) => void;
  clearReadAlerts: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  toggleTheme: () => void;
  selectTrip: (tripId: number | string) => Promise<void>;
  deleteTrip: (tripId: number | string) => Promise<boolean>;
  refreshBackendTrips: () => Promise<void>;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Sync dark class on HTML root element
  useEffect(() => {
    if (state.userProfile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.userProfile.theme]);

  // Convert backend trips array to UI TripSummary array
  const formatBackendTrips = (backendTrips: BackendTrip[]): TripSummary[] => {
    return backendTrips.map((bt) => {
      const destArray = Array.isArray(bt.destinations) && bt.destinations.length > 0
        ? bt.destinations
        : [bt.destination];
      return {
        id: `trip-${bt.id}`,
        title: bt.destination,
        subtitle: bt.tagline || `${bt.dayCount || 1}-Day ${bt.travelerType || 'Custom'} Expedition`,
        status: (bt.status as 'ongoing' | 'upcoming' | 'completed' | 'draft') || 'upcoming',
        dates: `${bt.startDate} - ${bt.endDate}`,
        duration: `${bt.dayCount || 1} Days`,
        destinations: destArray,
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
        progressPercent: 35,
        currentDay: 1,
        totalDays: bt.dayCount || 1,
        weatherSummary: 'Sunny & Pleasant'
      };
    });
  };

  // Refresh trips list from backend
  const refreshBackendTrips = useCallback(async () => {
    try {
      const trips = await apiService.getTrips();
      if (Array.isArray(trips)) {
        dispatch({ type: 'SET_SAVED_TRIPS', payload: formatBackendTrips(trips) });
      }
    } catch (err) {
      console.warn('Could not refresh backend trips:', err);
    }
  }, []);

  // Select a specific trip and hydrate active state
  const selectTrip = useCallback(async (tripId: number | string) => {
    const numericId = typeof tripId === 'string' ? parseInt(tripId.replace('trip-', ''), 10) : tripId;
    if (!numericId || isNaN(numericId)) return;

    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      const fullTrip = await apiService.getTrip(numericId);
      if (fullTrip) {
        const loadedConfig: TripConfig = {
          destination: fullTrip.destination,
          destinations: fullTrip.destinations,
          startDate: fullTrip.startDate,
          endDate: fullTrip.endDate,
          budgetTier: fullTrip.budgetTier,
          interests: fullTrip.interests || [],
          travelerType: fullTrip.travelerType,
          pace: fullTrip.pace,
          weatherAdaptive: fullTrip.weatherAdaptive,
          tagline: fullTrip.tagline,
          transitBetween: fullTrip.transitBetween
        };
        const loadedDays = fullTrip.days && fullTrip.days.length > 0
          ? fullTrip.days
          : generateDeterministicItinerary(loadedConfig);

        dispatch({
          type: 'HYDRATE_ACTIVE_TRIP',
          payload: {
            backendTripId: fullTrip.id,
            config: loadedConfig,
            days: loadedDays
          }
        });
        localStorage.setItem('roamwise_active_backend_id', fullTrip.id.toString());
      }
    } catch (err) {
      console.warn(`Failed to load trip ${numericId} from backend:`, err);
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  }, []);

  // Delete a trip from backend & update active state
  const deleteTrip = useCallback(async (tripId: number | string): Promise<boolean> => {
    const numericId = typeof tripId === 'string' ? parseInt(tripId.replace('trip-', ''), 10) : tripId;
    if (!numericId || isNaN(numericId)) return false;

    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      const res = await apiService.deleteTrip(numericId);
      if (res && res.success) {
        const currentActive = stateRef.current.backendTripId;
        await refreshBackendTrips();
        if (currentActive === numericId) {
          const remainingTrips = await apiService.getTrips();
          if (Array.isArray(remainingTrips) && remainingTrips.length > 0) {
            await selectTrip(remainingTrips[0].id);
          } else {
            localStorage.removeItem('roamwise_active_backend_id');
            dispatch({ type: 'SET_BACKEND_TRIP_ID', payload: null });
            dispatch({ type: 'RESET_TO_DISCOVERY' });
          }
        }
        return true;
      }
      return false;
    } catch (err) {
      console.warn(`Failed to delete trip ${numericId}:`, err);
      return false;
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  }, [refreshBackendTrips, selectTrip]);

  // Initial mount: connect to Flask backend and sync trips
  useEffect(() => {
    let isMounted = true;

    const initBackendSync = async () => {
      try {
        const health = await apiService.checkHealth();
        if (!isMounted) return;

        if (health && health.status === 'healthy') {
          dispatch({ type: 'SET_BACKEND_STATUS', payload: true });

          const trips = await apiService.getTrips();
          if (!isMounted) return;

          if (Array.isArray(trips) && trips.length > 0) {
            dispatch({ type: 'SET_SAVED_TRIPS', payload: formatBackendTrips(trips) });

            const storedTripId = localStorage.getItem('roamwise_active_backend_id');
            const targetId = storedTripId ? parseInt(storedTripId, 10) : trips[0].id;
            const matchedTrip = trips.find((t) => t.id === targetId) || trips[0];

            if (matchedTrip) {
              const fullTrip = await apiService.getTrip(matchedTrip.id);
              if (!isMounted) return;

              if (fullTrip && fullTrip.days && fullTrip.days.length > 0) {
                const loadedConfig: TripConfig = {
                  destination: fullTrip.destination,
                  destinations: fullTrip.destinations,
                  startDate: fullTrip.startDate,
                  endDate: fullTrip.endDate,
                  budgetTier: fullTrip.budgetTier,
                  interests: fullTrip.interests || [],
                  travelerType: fullTrip.travelerType,
                  pace: fullTrip.pace,
                  weatherAdaptive: fullTrip.weatherAdaptive,
                  tagline: fullTrip.tagline,
                  transitBetween: fullTrip.transitBetween
                };
                dispatch({
                  type: 'HYDRATE_ACTIVE_TRIP',
                  payload: {
                    backendTripId: fullTrip.id,
                    config: loadedConfig,
                    days: fullTrip.days
                  }
                });
                localStorage.setItem('roamwise_active_backend_id', fullTrip.id.toString());
              }
            }
          } else {
            // New user / empty database: show Discovery Dashboard
            // DO NOT automatically insert sample trips into the production/presentation database!
            localStorage.removeItem('roamwise_active_backend_id');
            dispatch({ type: 'RESET_TO_DISCOVERY' });
          }
        } else {
          localStorage.removeItem('roamwise_active_backend_id');
          dispatch({ type: 'RESET_TO_DISCOVERY' });
        }
      } catch (err) {
        console.info('RoamWise API offline or unreachable, continuing with local state:', err);
        if (isMounted) {
          dispatch({ type: 'SET_BACKEND_STATUS', payload: false });
          const storedTripId = localStorage.getItem('roamwise_active_backend_id');
          if (!storedTripId) {
            dispatch({ type: 'RESET_TO_DISCOVERY' });
          }
        }
      }
    };

    initBackendSync();

    return () => {
      isMounted = false;
    };
  }, []);


  const unreadAlertsCount = state.alerts.filter((al) => al.unread).length;
  const hasActiveTrip = state.hasActiveTrip;
  const savedTrips = state.savedTrips;
  const backendTripId = state.backendTripId;
  const isBackendOnline = state.isBackendOnline;
  const isSyncing = state.isSyncing;

  const toggleActiveTrip = () => dispatch({ type: 'TOGGLE_ACTIVE_TRIP' });

  const clearDestinationError = useCallback(() => {
    dispatch({ type: 'CLEAR_DESTINATION_ERROR' });
  }, []);

  // Update trip configuration & persist to backend (with Gemini AI support)
  const updateConfig = async (config: TripConfig): Promise<{ success: boolean; error?: string; status?: number }> => {
    dispatch({ type: 'SET_GENERATING', payload: true });
    dispatch({ type: 'SET_GENERATION_ERROR', payload: null });
    dispatch({ type: 'SET_DESTINATION_ERROR', payload: null });
    dispatch({ type: 'SET_CONFIG_ONLY', payload: config });
    dispatch({ type: 'SET_SYNCING', payload: true });

    try {
      let finalDays: DayItinerary[] = [];
      let finalTagline = config.tagline;
      let genSource = 'ai';
      let fbReason: string | undefined = undefined;
      let finalConfig: TripConfig = { ...config };

      // Try AI itinerary generation if online
      if (stateRef.current.isBackendOnline) {
        const genRes = await apiService.generateItinerary(config);
        if (genRes && genRes.days && genRes.days.length > 0) {
          finalDays = genRes.days;
          if (genRes.tagline) finalTagline = genRes.tagline;
          genSource = genRes.generationSource || 'ai';
          fbReason = genRes.fallbackReason;

          finalConfig = {
            ...config,
            tagline: finalTagline,
            destination: genRes.destination || config.destination,
            destinations: genRes.destinations || config.destinations,
            transitBetween: genRes.transitBetween || config.transitBetween,
            poiSource: genRes.poiSource || config.poiSource,
            verification: genRes.verification || config.verification
          };
        } else {
          throw new Error('Itinerary generation returned no scheduled activities.');
        }

        // Persist to backend database
        try {
          const res = await apiService.createTrip({ ...finalConfig, days: finalDays });
          if (res && res.tripId) {
            dispatch({ type: 'SET_BACKEND_TRIP_ID', payload: res.tripId });
            localStorage.setItem('roamwise_active_backend_id', res.tripId.toString());
            await refreshBackendTrips();
          }
        } catch (dbErr) {
          console.warn('Backend trip persistence failed:', dbErr);
        }
      } else {
        // RoamWise server is offline: fallback to deterministic engine
        finalDays = generateDeterministicItinerary(config);
        genSource = 'deterministic-fallback';
        fbReason = 'RoamWise server offline. Generated standard fallback itinerary.';
        finalConfig = { ...config, tagline: finalTagline };
      }

      dispatch({
        type: 'SET_GENERATION_SUCCESS',
        payload: {
          config: finalConfig,
          days: finalDays,
          generationSource: genSource,
          fallbackReason: fbReason,
          poiSource: finalConfig.poiSource,
          verification: finalConfig.verification
        }
      });

      return { success: true };
    } catch (err: any) {
      const status = err?.status || 0;
      const message = err?.message || 'Failed to generate itinerary. Please try again.';

      if (
        status === 422 ||
        status === 503 ||
        message.toLowerCase().includes('india') ||
        message.toLowerCase().includes('destination') ||
        message.toLowerCase().includes('geocoding') ||
        message.toLowerCase().includes('not found')
      ) {
        dispatch({ type: 'SET_DESTINATION_ERROR', payload: message });
      }

      dispatch({ type: 'SET_GENERATION_ERROR', payload: message });
      return { success: false, error: message, status };
    } finally {
      dispatch({ type: 'SET_GENERATING', payload: false });
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  };

  const retryGeneration = useCallback(async () => {
    return updateConfig(stateRef.current.config);
  }, []);

  const setActiveDay = (dayNumber: number) => dispatch({ type: 'SET_ACTIVE_DAY', payload: dayNumber });

  // Toggle visited status & sync to backend
  const toggleVisited = async (dayNumber: number, activityId: string) => {
    dispatch({ type: 'TOGGLE_VISITED', payload: { dayNumber, activityId } });

    const currentDays = stateRef.current.days;
    const updatedDays = currentDays.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      return {
        ...day,
        activities: day.activities.map((act) => {
          if (act.id !== activityId) return act;
          return { ...act, isVisited: !act.isVisited };
        })
      };
    });

    const activeId = stateRef.current.backendTripId;
    if (activeId && stateRef.current.isBackendOnline) {
      try {
        await apiService.updateTrip(activeId, { days: updatedDays });
      } catch (err) {
        console.warn('Backend sync failed for toggleVisited:', err);
      }
    }
  };

  const openPlanB = (activity: Activity, dayNumber: number) =>
    dispatch({ type: 'OPEN_PLAN_B', payload: { activity, dayNumber } });

  const closePlanB = () => dispatch({ type: 'CLOSE_PLAN_B' });

  // Apply Plan B alternative & sync to backend
  const applyPlanB = async (dayNumber: number, originalActivityId: string) => {
    const currentDays = stateRef.current.days;
    const targetDay = currentDays.find((d) => d.dayNumber === dayNumber);
    const targetActId =
      targetDay?.activities.find((a) => a.id === originalActivityId)?.id ||
      targetDay?.activities.find((a) => a.hasPlanBReady && a.planBAlternative)?.id ||
      originalActivityId;

    const updatedDays = currentDays.map((day) => {
      if (day.dayNumber !== dayNumber) return day;
      return {
        ...day,
        weatherAlert: 'Plan B Activated: Sheltered indoor itinerary in effect',
        activities: day.activities.map((act) => {
          if (act.id !== targetActId || !act.planBAlternative) return act;
          const alt = act.planBAlternative;
          return {
            id: alt.id,
            title: alt.title,
            timeSlot: alt.timeSlot,
            period: act.period,
            duration: alt.duration,
            cost: alt.cost,
            costDisplay: alt.costDisplay,
            category: alt.category,
            location: alt.location,
            coordinates: act.coordinates,
            isIndoor: true,
            weatherRisk: 'low' as const,
            weatherRiskLabel: alt.weatherRiskLabel,
            description: alt.description,
            imageUrl: alt.imageUrl || act.imageUrl,
            isVisited: act.isVisited || false,
            isLocked: false,
            isPlanBAlternative: true
          };
        })
      };
    });

    dispatch({ type: 'APPLY_PLAN_B', payload: { dayNumber, originalActivityId } });

    const activeId = stateRef.current.backendTripId;
    if (activeId && stateRef.current.isBackendOnline) {
      try {
        await apiService.updateTrip(activeId, { days: updatedDays });
      } catch (err) {
        console.warn('Backend sync failed for applyPlanB:', err);
      }
    }
  };

  const createReplanProposal = async (scenarioText: string, delayMinutes = 45) => {
    // 1. Immediate optimistic proposal
    dispatch({ type: 'CREATE_REPLAN_PROPOSAL', payload: { scenarioText, delayMinutes } });

    // 2. Query Gemini AI via Flask backend if online
    if (stateRef.current.isBackendOnline) {
      try {
        dispatch({ type: 'SET_SYNCING', payload: true });
        const res = await apiService.replanTrip({
          trip: {
            destination: stateRef.current.config.destination,
            days: stateRef.current.days
          },
          scenarioText,
          delayMinutes,
          activeDayNumber: stateRef.current.activeDayNumber
        });
        if (res && res.proposal && res.proposal.proposedActivities) {
          dispatch({
            type: 'SET_PENDING_REPLAN',
            payload: res.proposal
          });
        }
      } catch (err) {
        console.warn('Backend AI replan call failed, preserving local proposal:', err);
      } finally {
        dispatch({ type: 'SET_SYNCING', payload: false });
      }
    }
  };

  // Accept replan proposal & sync to backend
  const acceptReplan = async () => {
    const replan = stateRef.current.pendingReplan;
    if (!replan) return;

    const currentDays = stateRef.current.days;
    const updatedDays = currentDays.map((day) => {
      if (day.dayNumber !== stateRef.current.activeDayNumber) return day;
      return {
        ...day,
        theme: `${day.theme} (AI Re-sequenced)`,
        activities: replan.proposedActivities
      };
    });

    dispatch({ type: 'ACCEPT_REPLAN' });

    const activeId = stateRef.current.backendTripId;
    if (activeId && stateRef.current.isBackendOnline) {
      try {
        await apiService.updateTrip(activeId, { days: updatedDays });
      } catch (err) {
        console.warn('Backend sync failed for acceptReplan:', err);
      }
    }
  };

  const rejectReplan = () => dispatch({ type: 'REJECT_REPLAN' });
  const markAlertRead = (id: string) => dispatch({ type: 'MARK_ALERT_READ', payload: id });
  const clearReadAlerts = () => dispatch({ type: 'CLEAR_READ_ALERTS' });
  const updateProfile = (profile: Partial<UserProfile>) => dispatch({ type: 'UPDATE_PROFILE', payload: profile });
  const toggleTheme = () => dispatch({ type: 'TOGGLE_THEME' });

  return (
    <TripContext.Provider
      value={{
        state,
        unreadAlertsCount,
        hasActiveTrip,
        savedTrips,
        backendTripId,
        isBackendOnline,
        isSyncing,
        isGenerating: state.isGenerating,
        generationError: state.generationError,
        destinationError: state.destinationError,
        generationSource: state.generationSource,
        fallbackReason: state.fallbackReason,
        poiSource: state.poiSource,
        verification: state.verification,
        toggleActiveTrip,
        updateConfig,
        clearDestinationError,
        retryGeneration,
        setActiveDay,
        toggleVisited,
        openPlanB,
        closePlanB,
        applyPlanB,
        createReplanProposal,
        acceptReplan,
        rejectReplan,
        markAlertRead,
        clearReadAlerts,
        updateProfile,
        toggleTheme,
        selectTrip,
        deleteTrip,
        refreshBackendTrips
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = (): TripContextValue => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
