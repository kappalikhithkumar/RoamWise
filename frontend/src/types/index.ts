export type TabType = 'home' | 'trips' | 'trip' | 'weather' | 'map' | 'alerts' | 'profile';

export interface TripSummary {
  id: string;
  title: string;
  subtitle: string;
  status: 'ongoing' | 'upcoming' | 'completed' | 'draft';
  dates: string;
  duration: string;
  destinations: string[];
  imageUrl: string;
  progressPercent?: number;
  currentDay?: number;
  totalDays?: number;
  weatherSummary?: string;
  alertCount?: number;
  hasPlanBAlert?: boolean;
}

export interface CuratedCircuit {
  id: string;
  title: string;
  route: string;
  duration: string;
  bestSeason: string;
  highlights: string[];
  imageUrl: string;
  rating: number;
}

export type BudgetTier = 'Budget-friendly' | 'Moderate' | 'Premium';
export type TravelPace = 'Relaxed' | 'Balanced' | 'Packed';
export type TravelerType = 'Solo' | 'Family' | 'Friends' | 'Couple' | 'Group';
export type InterestType =
  | 'Adventure'
  | 'Nature'
  | 'Food'
  | 'History'
  | 'Culture'
  | 'Spiritual'
  | 'Shopping'
  | 'Relaxation';

export interface TripConfig {
  destination: string;
  destinations?: string[];
  isDomestic?: boolean;
  startDate: string; // e.g. "2026-11-14"
  endDate: string;   // e.g. "2026-11-18"
  budgetTier: BudgetTier;
  interests: InterestType[];
  travelerType: TravelerType;
  pace: TravelPace;
  weatherAdaptive: boolean;
  tagline?: string;
}

export interface Activity {
  id: string;
  title: string;
  timeSlot: string; // e.g. "09:00 AM"
  period: 'morning' | 'afternoon' | 'evening';
  duration: string; // e.g. "2h"
  cost: number;     // in INR (₹)
  costDisplay: string; // e.g. "₹500" or "Free"
  category: string;
  location: string;
  coordinates?: { x: number; y: number; lat?: number; lng?: number };
  isIndoor: boolean;
  weatherRisk: 'low' | 'medium' | 'high';
  weatherRiskLabel: string; // e.g. "☀️ Low Risk", "☂️ Indoor Safe", "⛅ Medium Risk"
  description: string;
  imageUrl?: string;
  isVisited?: boolean;
  isLocked?: boolean;
  isPlanBAlternative?: boolean;
  hasPlanBReady?: boolean;
  planBAlternative?: PlanBAlternative;
}

export interface PlanBAlternative {
  id: string;
  title: string;
  timeSlot: string;
  duration: string;
  cost: number;
  costDisplay: string;
  category: string;
  location: string;
  isIndoor: boolean;
  weatherRiskLabel: string;
  description: string;
  imageUrl?: string;
  shelterReason: string;
  costDelta: string;
}

export interface DayItinerary {
  dayNumber: number;
  dayOfWeek: string; // e.g. "Saturday"
  dateStr: string;   // e.g. "Nov 14, 2026"
  theme: string;
  weatherSummary: string;
  temperature: string;
  rainRisk: number; // percentage
  weatherCondition: 'sunny' | 'partly_cloudy' | 'rainy' | 'thunderstorm';
  weatherAlert?: string;
  activities: Activity[];
}

export interface WeatherSensor {
  temperature: number;
  condition: string;
  highTemp: number;
  lowTemp: number;
  uvIndex: number;
  uvLevel: string;
  humidity: number;
  wind: string;
  daylight: string;
  sunrise: string;
  sunset: string;
  rainRisk: number;
  isIllustrative: boolean;
}

export interface HourlyForecastItem {
  time: string;
  temp: number;
  condition: string;
  icon: string;
  pop: number; // probability of precipitation
  isCurrent?: boolean;
  isAlert?: boolean;
}

export interface DailyForecastItem {
  day: string;
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  icon: string;
  rainRisk: number;
  hasAlert?: boolean;
}

export interface TravelAlert {
  id: string;
  type: 'weather' | 'plan';
  category: string;
  title: string;
  message: string;
  timeAgo: string;
  unread: boolean;
  hasPlanB: boolean;
  dayNumber?: number;
  activityId?: string;
  imageUrl?: string;
}

export interface ItineraryDiffItem {
  id: string;
  type: 'adjusted' | 'added' | 'removed' | 'locked' | 'retained';
  activityId: string;
  title: string;
  location: string;
  originalTime?: string;
  newTime?: string;
  duration: string;
  cost: number;
  costDisplay: string;
  notes: string;
}

export interface ReplanProposal {
  scenarioTitle: string;
  triggerReason: string;
  delayMinutes: number;
  reservationsKept: number;
  swappedStopsCount: number;
  matchScore: number;
  diffItems: ItineraryDiffItem[];
  proposedActivities: Activity[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  persona: string;
  homeCity: string;
  preferredCurrency: string;
  temperatureUnit: 'C' | 'F';
  theme: 'light' | 'dark';
}
