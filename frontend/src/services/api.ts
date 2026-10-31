import { TripConfig, DayItinerary, TravelAlert } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  database: string;
}

export interface BackendTrip extends TripConfig {
  id: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  dayCount: number;
  days?: DayItinerary[];
}

export interface CreateTripPayload extends TripConfig {
  days?: DayItinerary[];
}

export interface UpdateTripPayload {
  destination?: string;
  destinations?: string[];
  startDate?: string;
  endDate?: string;
  budgetTier?: string;
  interests?: string[];
  travelerType?: string;
  pace?: string;
  weatherAdaptive?: boolean;
  status?: string;
  tagline?: string;
  days?: DayItinerary[];
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      let errorMessage = `HTTP Error ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // Fallback to HTTP status text
        if (res.statusText) {
          errorMessage = `HTTP ${res.status}: ${res.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }
    return await res.json();
  } catch (err: unknown) {
    if (err instanceof TypeError && (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed to fetch'))) {
      throw new Error(`Unable to connect to RoamWise API at ${API_BASE}. Server may be offline.`);
    }
    throw err;
  }
}

export const apiService = {
  /**
   * Health check endpoint
   */
  async checkHealth(): Promise<HealthResponse> {
    return request<HealthResponse>('/health');
  },

  /**
   * Fetch all saved trips
   */
  async getTrips(): Promise<BackendTrip[]> {
    const res = await request<any>('/trips');
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.trips)) return res.trips;
    return [];
  },

  /**
   * Fetch a single trip by ID with all days & activities
   */
  async getTrip(id: number | string): Promise<BackendTrip> {
    const res = await request<any>(`/trips/${id}`);
    if (res && res.trip && res.days && !res.destination) {
      return { ...res.trip, days: res.days };
    }
    return res;
  },

  /**
   * Create a new trip with days and activities
   */
  async createTrip(payload: CreateTripPayload): Promise<{ success: boolean; tripId: number; message: string; trip: BackendTrip }> {
    return request<{ success: boolean; tripId: number; message: string; trip: BackendTrip }>('/trips', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Update an existing trip (metadata, days, visited flags, Plan B substitutions)
   */
  async updateTrip(id: number | string, payload: UpdateTripPayload): Promise<{ success: boolean; tripId: number; message: string; trip: BackendTrip }> {
    return request<{ success: boolean; tripId: number; message: string; trip: BackendTrip }>(`/trips/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Delete a trip by ID
   */
  async deleteTrip(id: number | string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/trips/${id}`, {
      method: 'DELETE'
    });
  },

  /**
   * AI Itinerary Generation via Gemini
   */
  async generateItinerary(config: TripConfig): Promise<{ success: boolean; itinerary: any; tagline: string; days: DayItinerary[]; generationSource: string }> {
    return request<{ success: boolean; itinerary: any; tagline: string; days: DayItinerary[]; generationSource: string }>('/trips/generate', {
      method: 'POST',
      body: JSON.stringify(config)
    });
  },

  /**
   * AI Adaptive Re-planning via Gemini
   */
  async replanTrip(payload: { trip: any; scenarioText: string; delayMinutes?: number; activeDayNumber?: number }): Promise<{ success: boolean; proposal: any; generationSource: string }> {
    return request<{ success: boolean; proposal: any; generationSource: string }>('/trips/replan', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  /**
   * Fetch weather forecast for a destination
   */
  async getWeather(destination: string = 'Jaipur, Rajasthan') {
    return request(`/weather/${encodeURIComponent(destination)}`);
  },

  /**
   * Fetch active travel alerts
   */
  async getAlerts(): Promise<TravelAlert[]> {
    return request<TravelAlert[]>('/alerts');
  }
};
