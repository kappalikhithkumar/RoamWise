import { CuratedCircuit } from '../types';

export const CURATED_CIRCUITS: CuratedCircuit[] = [
  {
    id: 'circuit-1',
    title: 'Golden Triangle & Royal Rajasthan',
    route: 'Delhi ➔ Agra ➔ Jaipur',
    duration: '7 Days, 6 Nights',
    bestSeason: 'Oct – Mar',
    highlights: ['Amer Fort', 'Taj Mahal', 'Qutub Minar', 'Boutique Haveli Stays'],
    imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
    rating: 4.9
  },
  {
    id: 'circuit-2',
    title: 'Western Ghats Monsoon Trail',
    route: 'Munnar ➔ Wayanad ➔ Coorg',
    duration: '6 Days, 5 Nights',
    bestSeason: 'Jul – Nov',
    highlights: ['Tea Sanctuaries', 'Spice Trails', 'Rainforest Treehouses', 'Mist Trekking'],
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    rating: 4.8
  },
  {
    id: 'circuit-3',
    title: 'Eastern Himalayan Tea & Monasteries',
    route: 'Darjeeling ➔ Gangtok ➔ Pelling',
    duration: '8 Days, 7 Nights',
    bestSeason: 'Oct – May',
    highlights: ['Kanchenjunga Dawn', 'Rumtek Monastery', 'Heritage Toy Train', 'High Altitude Passes'],
    imageUrl: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
    rating: 4.95
  }
];
