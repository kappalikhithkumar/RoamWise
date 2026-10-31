import { TravelAlert } from '../types';

export const INITIAL_ALERTS: TravelAlert[] = [
  {
    id: 'alert-1',
    type: 'weather',
    category: 'URGENT WEATHER',
    title: 'Rain Alert for Tomorrow (Day 2)',
    message: '65% precipitation detected starting 2:00 PM in Jaipur Old City. Jantar Mantar open dials expected slippery.',
    timeAgo: '12 mins ago',
    unread: true,
    hasPlanB: true,
    dayNumber: 2,
    activityId: 'act-2-3',
    imageUrl: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'alert-2',
    type: 'plan',
    category: 'AI PLAN OPTIMIZATION',
    title: 'Sunset Timing Shift at Nahargarh',
    message: 'Twilight starts at 05:25 PM today. We advanced your Padao terrace arrival by 20 minutes for golden hour photography.',
    timeAgo: '45 mins ago',
    unread: true,
    hasPlanB: false,
    dayNumber: 1,
    imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f4439c05?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'alert-3',
    type: 'weather',
    category: 'ATMOSPHERIC SENSORS',
    title: 'Doppler Radar Tracking Calm Morning',
    message: 'Clear visibility across Amer and Aravalli hills for morning fort exploration. Mild UV index of 4.',
    timeAgo: '2 hours ago',
    unread: false,
    hasPlanB: false,
    dayNumber: 1,
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'alert-4',
    type: 'plan',
    category: 'LOCAL INSIGHT',
    title: 'Bapu Bazaar Evening Rush Advisory',
    message: 'Local handicraft festival starts at 06:00 PM on Day 4. Parking congestion expected along MI Road.',
    timeAgo: 'Yesterday',
    unread: false,
    hasPlanB: false,
    dayNumber: 4,
    imageUrl: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=400&q=80'
  }
];
