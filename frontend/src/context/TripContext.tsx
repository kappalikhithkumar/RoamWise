import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  TripConfig,
  DayItinerary,
  Activity,
  TravelAlert,
  ReplanProposal,
  UserProfile,
  ItineraryDiffItem
} from '../types';
import { INITIAL_TRIP_CONFIG, INITIAL_JAIPUR_DAYS } from '../mock/sampleTrip';
import { INITIAL_ALERTS } from '../mock/notificationsData';

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
}

type TripAction =
  | { type: 'UPDATE_CONFIG'; payload: TripConfig }
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
  | { type: 'TOGGLE_THEME' };

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

const initialState: TripState = {
  config: INITIAL_TRIP_CONFIG,
  days: INITIAL_JAIPUR_DAYS,
  activeDayNumber: 1,
  planBModal: {
    isOpen: false,
    activity: null,
    dayNumber: 2
  },
  pendingReplan: null,
  alerts: INITIAL_ALERTS,
  userProfile: INITIAL_PROFILE
};

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'UPDATE_CONFIG':
      return { ...state, config: action.payload };

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
      const updatedDays = state.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          weatherAlert: 'Plan B Activated: Sheltered indoor itinerary in effect',
          activities: day.activities.map((act) => {
            if (act.id !== originalActivityId || !act.planBAlternative) return act;
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
              isVisited: false,
              isLocked: false,
              isPlanBAlternative: true
            };
          })
        };
      });

      // Mark related weather alert as addressed
      const updatedAlerts = state.alerts.map((al) =>
        al.activityId === originalActivityId ? { ...al, unread: false, message: 'Plan B applied: Switched to Albert Hall Museum' } : al
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

      // Simulated intelligent replanning based on active day activities
      const diffItems: ItineraryDiffItem[] = [
        {
          id: 'diff-1',
          type: 'locked',
          activityId: activeDay.activities[0]?.id || 'act-1',
          title: activeDay.activities[0]?.title || 'Morning Stop',
          location: activeDay.activities[0]?.location || 'Heritage Area',
          originalTime: activeDay.activities[0]?.timeSlot || '08:30 AM',
          newTime: activeDay.activities[0]?.timeSlot || '08:30 AM',
          duration: activeDay.activities[0]?.duration || '1.5h',
          cost: activeDay.activities[0]?.cost || 200,
          costDisplay: activeDay.activities[0]?.costDisplay || '₹200',
          notes: 'Completed / Locked morning reservation preserved intact'
        },
        {
          id: 'diff-2',
          type: 'adjusted',
          activityId: activeDay.activities[1]?.id || 'act-2',
          title: activeDay.activities[1]?.title || 'Main Afternoon Highlight',
          location: activeDay.activities[1]?.location || 'Palace Grounds',
          originalTime: activeDay.activities[1]?.timeSlot || '10:30 AM',
          newTime: '11:15 AM',
          duration: '1.5h',
          cost: activeDay.activities[1]?.cost || 700,
          costDisplay: activeDay.activities[1]?.costDisplay || '₹700',
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
          activityId: activeDay.activities[activeDay.activities.length - 1]?.id || 'act-last',
          title: activeDay.activities[activeDay.activities.length - 1]?.title || 'Evening Dinner & Stroll',
          location: activeDay.activities[activeDay.activities.length - 1]?.location || 'Bazaar Arcade',
          originalTime: activeDay.activities[activeDay.activities.length - 1]?.timeSlot || '05:00 PM',
          newTime: '06:15 PM',
          duration: '2h',
          cost: activeDay.activities[activeDay.activities.length - 1]?.cost || 450,
          costDisplay: activeDay.activities[activeDay.activities.length - 1]?.costDisplay || '₹450',
          notes: 'Moved into twilight for vibrant night market ambiance'
        }
      ];

      // Formulate proposed activities
      const proposedActivities: Activity[] = [
        {
          ...activeDay.activities[0],
          isLocked: true
        },
        {
          ...activeDay.activities[1],
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
          ...activeDay.activities[activeDay.activities.length - 1],
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

      // Add a plan change notification
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
  updateConfig: (config: TripConfig) => void;
  setActiveDay: (dayNumber: number) => void;
  toggleVisited: (dayNumber: number, activityId: string) => void;
  openPlanB: (activity: Activity, dayNumber: number) => void;
  closePlanB: () => void;
  applyPlanB: (dayNumber: number, originalActivityId: string) => void;
  createReplanProposal: (scenarioText: string, delayMinutes?: number) => void;
  acceptReplan: () => void;
  rejectReplan: () => void;
  markAlertRead: (id: string) => void;
  clearReadAlerts: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  toggleTheme: () => void;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Sync dark class on HTML root element
  useEffect(() => {
    if (state.userProfile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.userProfile.theme]);

  const unreadAlertsCount = state.alerts.filter((al) => al.unread).length;

  const updateConfig = (config: TripConfig) => dispatch({ type: 'UPDATE_CONFIG', payload: config });
  const setActiveDay = (dayNumber: number) => dispatch({ type: 'SET_ACTIVE_DAY', payload: dayNumber });
  const toggleVisited = (dayNumber: number, activityId: string) =>
    dispatch({ type: 'TOGGLE_VISITED', payload: { dayNumber, activityId } });
  const openPlanB = (activity: Activity, dayNumber: number) =>
    dispatch({ type: 'OPEN_PLAN_B', payload: { activity, dayNumber } });
  const closePlanB = () => dispatch({ type: 'CLOSE_PLAN_B' });
  const applyPlanB = (dayNumber: number, originalActivityId: string) =>
    dispatch({ type: 'APPLY_PLAN_B', payload: { dayNumber, originalActivityId } });
  const createReplanProposal = (scenarioText: string, delayMinutes = 45) =>
    dispatch({ type: 'CREATE_REPLAN_PROPOSAL', payload: { scenarioText, delayMinutes } });
  const acceptReplan = () => dispatch({ type: 'ACCEPT_REPLAN' });
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
        updateConfig,
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
        toggleTheme
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
