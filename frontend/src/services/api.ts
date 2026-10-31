const API_BASE = '/api';

export const apiService = {
  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend health check failed');
    return res.json();
  },

  async getTrips() {
    const res = await fetch(`${API_BASE}/trips`);
    if (!res.ok) throw new Error('Failed to fetch trips');
    return res.json();
  },

  async createTrip(data: unknown) {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create trip');
    return res.json();
  },

  async getWeather(destination: string = 'Kyoto, Japan') {
    const res = await fetch(`${API_BASE}/weather/${encodeURIComponent(destination)}`);
    if (!res.ok) throw new Error('Failed to fetch weather');
    return res.json();
  },

  async getAlerts() {
    const res = await fetch(`${API_BASE}/alerts`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  }
};
