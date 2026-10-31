import type { TripConfig, DayItinerary, Activity, PlanBAlternative } from '../types';

interface CityKnowledge {
  city: string;
  region: string;
  themeDescriptors: string[];
  stops: {
    title: string;
    duration: string;
    period: 'morning' | 'afternoon' | 'evening';
    cost: number;
    category: string;
    location: string;
    isIndoor: boolean;
    weatherRisk: 'low' | 'medium' | 'high';
    weatherRiskLabel: string;
    description: string;
    imageUrl: string;
    hasPlanBReady?: boolean;
    planBAlternative?: PlanBAlternative;
  }[];
}

const CITY_DATABASE: Record<string, CityKnowledge> = {
  jaipur: {
    city: 'Jaipur',
    region: 'Rajasthan',
    themeDescriptors: [
      'Crown Fortresses & Amber Royalty',
      'Pink City Heritage & Afternoon Storm Shield',
      'Crafts, Block Printing & Cannon Foundries',
      'Stepwells, Sacred Groves & Serene Gardens',
      'Bazaars, Gemstones & Nahargarh Golden Sunset'
    ],
    stops: [
      {
        title: 'Amer Fort & Sheesh Mahal',
        duration: '2.5h',
        period: 'morning',
        cost: 500,
        category: 'History',
        location: 'Devisinghpura, Amer, Jaipur',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '☀️ Low Risk',
        description: 'Iconic 16th-century red sandstone fortress overlooking Maota Lake, famous for intricate mirror mosaics.',
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Panna Meena Ka Kund Stepwell',
        duration: '1h',
        period: 'morning',
        cost: 0,
        category: 'Culture',
        location: 'Near Amer Fort, Jaipur',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '☀️ Low Risk',
        description: 'Centuries-old symmetrical geometric stepwell with golden stone steps and shaded verandahs.',
        imageUrl: 'https://images.unsplash.com/photo-1609137144822-482a5c2ec0f5?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Jal Mahal Promenade & Chai Stop',
        duration: '1.5h',
        period: 'afternoon',
        cost: 150,
        category: 'Food',
        location: 'Man Sagar Lake, Jaipur',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '☀️ Clear Skies',
        description: 'Scenic photo stroll along the lakeside promenade viewing the sunken water palace with warm spiced Kulhad chai.',
        imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Nahargarh Fort Outdoor Sunset Viewpoint',
        duration: '2.5h',
        period: 'evening',
        cost: 650,
        category: 'Relaxation',
        location: 'Aravalli Hills, Jaipur',
        isIndoor: false,
        weatherRisk: 'high',
        weatherRiskLabel: '⚠️ 65% Rain Risk',
        description: 'Perched on the Aravalli ridge offering panoramic evening vistas of the entire illuminated Pink City skyline.',
        imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f4439c05?auto=format&fit=crop&w=600&q=80',
        hasPlanBReady: true,
        planBAlternative: {
          id: 'planb-jaipur-nahargarh',
          title: 'Albert Hall Museum & Indoor Blue Pottery Workshop',
          timeSlot: '05:00 PM',
          duration: '2h',
          cost: 350,
          costDisplay: '₹350',
          category: 'Culture',
          location: 'Ram Niwas Garden, Jaipur',
          isIndoor: true,
          weatherRiskLabel: '🛡️ 100% Indoor Sheltered',
          description: 'Rajasthan oldest museum showcasing royal miniature paintings, Persian carpets, and covered pottery workshops away from rain.',
          imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
          shelterReason: 'High wind and convective showers detected on Aravalli ridge. Swapped to indoor museum and pottery studio.',
          costDelta: '-₹300 (Saved)'
        }
      },
      {
        title: 'Hawa Mahal Dawn Facade & Wind View Walk',
        duration: '1.5h',
        period: 'morning',
        cost: 200,
        category: 'History',
        location: 'Badi Choupad, Jaipur',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '☀️ Low Risk',
        description: 'Admire the 953 honeycombed sandstone jharokhas in the soft morning light from Wind View terrace.',
        imageUrl: 'https://images.unsplash.com/photo-1603262110263-fb010d6e75dc?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'City Palace Royal Quarters & Chandra Mahal',
        duration: '2h',
        period: 'afternoon',
        cost: 700,
        category: 'Culture',
        location: 'Tulsi Marg, Gangori Bazaar, Jaipur',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '☂️ Indoor Sheltered',
        description: 'Vast ceremonial courtyards, Peacock Gate, royal costume armory, and preserved maharaja suites.',
        imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
  delhi: {
    city: 'Delhi',
    region: 'NCR',
    themeDescriptors: [
      'Imperial Mughal Monuments & Old Delhi Aromas',
      'Colonial Grandeur & Lodhi Heritage Walk',
      'Modern Capital Arts & Sufi Evening Melodies',
      'Qutub Minar & Historic Southern Ridges'
    ],
    stops: [
      {
        title: 'Humayun’s Tomb & Mughal Garden Pavilions',
        duration: '2.5h',
        period: 'morning',
        cost: 500,
        category: 'History',
        location: 'Mathura Rd, Nizamuddin East, New Delhi',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '☀️ Clear Morning',
        description: 'Pristine red sandstone UNESCO mausoleum featuring Persian charbagh water gardens and symmetry.',
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Chandni Chowk Heritage Culinary Trail',
        duration: '2h',
        period: 'afternoon',
        cost: 300,
        category: 'Food',
        location: 'Old Delhi, Delhi',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '☀️ Shaded Bazaars',
        description: 'Sample world-famous parathas, jalebis, and aromatic spices along centuries-old bustling alleys.',
        imageUrl: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Qutub Minar & Mehrauli Archaeological Park',
        duration: '2.5h',
        period: 'afternoon',
        cost: 600,
        category: 'History',
        location: 'Mehrauli, New Delhi',
        isIndoor: false,
        weatherRisk: 'medium',
        weatherRiskLabel: '⚠️ Heat/Rain Guard',
        description: 'Soaring 73-meter fluted minaret with intricate Arabic carvings dating back to the 12th century.',
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
        hasPlanBReady: true,
        planBAlternative: {
          id: 'planb-delhi-qutub',
          title: 'National Crafts Museum & Shaded Cafe Lota',
          timeSlot: '03:00 PM',
          duration: '2h',
          cost: 300,
          costDisplay: '₹300',
          category: 'Culture',
          location: 'Bhairon Marg, Pragati Maidan, New Delhi',
          isIndoor: true,
          weatherRiskLabel: '🛡️ Indoor Craft Ateliers',
          description: 'Sprawling air-cooled tribal art pavilions and artisan textile displays with sheltered courtyards.',
          imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80',
          shelterReason: 'Midday heat and sudden thunderstorms avoided in favor of sheltered craft galleries.',
          costDelta: '-₹300 (Saved)'
        }
      },
      {
        title: 'India Gate & Kartavya Path Golden Hour Stroll',
        duration: '1.5h',
        period: 'evening',
        cost: 0,
        category: 'Relaxation',
        location: 'Central Vista, New Delhi',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🌅 Golden Hour',
        description: 'Mindful evening walk beneath lit triumphal archway with ambient water fountains and gentle autumn breeze.',
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
  agra: {
    city: 'Agra',
    region: 'Uttar Pradesh',
    themeDescriptors: [
      'Taj Mahal Sunrise Reflections & Mughal Opulence',
      'Agra Fort Ramparts & Yamuna River Vistas',
      'Fatehpur Sikri Imperial Desert Capital',
      'Artisan Marble Inlay & Evening Rooftop Flavours'
    ],
    stops: [
      {
        title: 'Sunrise Taj Mahal Reflection Tour',
        duration: '3h',
        period: 'morning',
        cost: 1100,
        category: 'History',
        location: 'Dharmapuri, Forest Colony, Tajganj, Agra',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '☀️ 100% Prime Light',
        description: 'First rays of amber sunlight warming pure Makrana white marble, reflecting across quiet garden waterways.',
        imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Agra Fort & Jahangiri Mahal Palaces',
        duration: '2.5h',
        period: 'morning',
        cost: 650,
        category: 'History',
        location: 'Agra Fort, Rakabganj, Agra',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '☂️ Covered Palaces',
        description: 'Vast red sandstone fortress holding royal audience halls, marble mosques, and river balconies.',
        imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Mehtab Bagh Sunset Overlook',
        duration: '2h',
        period: 'afternoon',
        cost: 300,
        category: 'Relaxation',
        location: 'Nagla Devjit, Agra',
        isIndoor: false,
        weatherRisk: 'medium',
        weatherRiskLabel: '⚠️ River Fog Watch',
        description: 'Moonlit botanical gardens on the opposite bank of the Yamuna River with uninterrupted Taj panoramas.',
        imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
        hasPlanBReady: true,
        planBAlternative: {
          id: 'planb-agra-mehtab',
          title: 'Pietra Dura Marble Atelier & Covered Tasting Room',
          timeSlot: '04:30 PM',
          duration: '2h',
          cost: 200,
          costDisplay: '₹200',
          category: 'Culture',
          location: 'Tajganj Artisan Quarter, Agra',
          isIndoor: true,
          weatherRiskLabel: '🛡️ 100% Indoor Sheltered',
          description: 'Master craftsmen demonstrating ancient semiprecious lapidary inlay work followed by saffron chai.',
          imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
          shelterReason: 'Riverbank rain squalls avoided. Transferred to indoor heritage lapidary studio.',
          costDelta: '-₹100 (Saved)'
        }
      },
      {
        title: 'Sheroes Hangout & Mughlai Tasting',
        duration: '2h',
        period: 'evening',
        cost: 450,
        category: 'Food',
        location: 'Fatehabad Rd, Tajganj, Agra',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '🍽️ Covered Cafe',
        description: 'Inspiring community cafe run by acid attack survivors, serving delicious home-style thalis and chai.',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
  udaipur: {
    city: 'Udaipur',
    region: 'Rajasthan',
    themeDescriptors: [
      'Lake Pichola Palaces & Royal Courtyards',
      'Artisan Haveli Galleries & Sunset Ghats',
      'Monsoon Palace Ridges & Aravalli Lakes',
      'Jag Mandir Water Gardens & Royal Cuisine'
    ],
    stops: [
      {
        title: 'City Palace & Crystal Gallery',
        duration: '3h',
        period: 'morning',
        cost: 600,
        category: 'History',
        location: 'Old City, Udaipur',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '☀️ Sheltered Halls',
        description: 'Rajasthan largest palace complex overlooking Lake Pichola with mirrored rooms and royal balconies.',
        imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Lake Pichola Solar Boat Cruise',
        duration: '1.5h',
        period: 'afternoon',
        cost: 550,
        category: 'Relaxation',
        location: 'Rameshwar Ghat, Udaipur',
        isIndoor: false,
        weatherRisk: 'medium',
        weatherRiskLabel: '⚠️ Lake Winds Watch',
        description: 'Glide past the iconic white Lake Palace and Jag Mandir island with mountain reflections.',
        imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
        hasPlanBReady: true,
        planBAlternative: {
          id: 'planb-udaipur-boat',
          title: 'Bagore Ki Haveli Museum & Puppet Gallery',
          timeSlot: '02:30 PM',
          duration: '2h',
          cost: 200,
          costDisplay: '₹200',
          category: 'Culture',
          location: 'Gangaur Ghat, Udaipur',
          isIndoor: true,
          weatherRiskLabel: '🛡️ Indoor Haveli Courtyard',
          description: 'Sprawling 18th-century waterfront mansion housing vintage costumes, folk musical instruments, and shaded courtyards.',
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
          shelterReason: 'High afternoon lake winds. Swapped to sheltered Bagore Ki Haveli museum galleries.',
          costDelta: '-₹350 (Saved)'
        }
      },
      {
        title: 'Ambrai Ghat Golden Hour Sunset Dinner',
        duration: '2.5h',
        period: 'evening',
        cost: 1400,
        category: 'Food',
        location: 'Outside Chandpole, Udaipur',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '🌅 Lake Sunset',
        description: 'Waterfront candlelit dining with breathtaking front-row panoramas of the illuminated City Palace.',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
  varanasi: {
    city: 'Varanasi',
    region: 'Uttar Pradesh',
    themeDescriptors: [
      'Subah-e-Banaras Morning Ghats & Sacred Chants',
      'Ancient Kashi Alleys, Silk Weavers & Chaat',
      'Sarnath Deer Park & Buddhist Antiquities',
      'Grand Evening Ganga Aarti at Dashashwamedh'
    ],
    stops: [
      {
        title: 'Subah-e-Banaras Dawn Wooden Boat Stroll',
        duration: '2.5h',
        period: 'morning',
        cost: 400,
        category: 'Spiritual',
        location: 'Assi to Dashashwamedh Ghats, Varanasi',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🌅 Sacred Dawn',
        description: 'Witness morning prayer rituals and bathing ceremonies along the ancient holy steps under golden mist.',
        imageUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Kashi Vishwanath Corridor & Old Alleys',
        duration: '2.5h',
        period: 'afternoon',
        cost: 100,
        category: 'History',
        location: 'Lahori Tola, Varanasi',
        isIndoor: false,
        weatherRisk: 'medium',
        weatherRiskLabel: '⚠️ Crowd & Rain Alert',
        description: 'Golden spires of the sacred Shiva shrine connected through recently revitalized heritage avenues.',
        imageUrl: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80',
        hasPlanBReady: true,
        planBAlternative: {
          id: 'planb-varanasi-silk',
          title: 'Banarasi Brocade Silk Handloom Atelier',
          timeSlot: '02:00 PM',
          duration: '2h',
          cost: 0,
          costDisplay: 'Free',
          category: 'Culture',
          location: 'Madanpura, Varanasi',
          isIndoor: true,
          weatherRiskLabel: '🛡️ Covered Handloom Workshop',
          description: 'Sheltered workshop watching master weavers weave real zari silver and gold silk brocades.',
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
          shelterReason: 'Heavy afternoon showers on crowded stone ghats. Swapped to indoor silk atelier.',
          costDelta: '₹0 (Free)'
        }
      },
      {
        title: 'Dashashwamedh Ghat Grand Maha Aarti',
        duration: '2h',
        period: 'evening',
        cost: 250,
        category: 'Culture',
        location: 'Dashashwamedh Ghat, Varanasi',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🔥 Resplendent Lamps',
        description: 'Mesmerizing synchronized brass lamp ritual by saffron-robed priests accompanied by conch shells.',
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
      }
    ]
  }
};

/**
 * Generate a deterministic demo itinerary based on the user's submitted configuration.
 * Adapts to:
 * - Destination names & number of destinations
 * - Start & end dates and duration
 * - Budget tier (cost scaling)
 * - Interests (activity category match)
 * - Traveler type (descriptions & theme context)
 * - Travel pace (activities per day)
 */
export function generateDeterministicItinerary(config: TripConfig): DayItinerary[] {
  // 1. Calculate duration in days
  const start = new Date(config.startDate || '2025-10-18');
  const end = new Date(config.endDate || '2025-10-24');
  let totalDays = 7;
  if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
    totalDays = Math.max(1, Math.min(14, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1));
  }

  // 2. Parse destinations
  let destList: string[] = [];
  if (config.destinations && config.destinations.length > 0) {
    destList = config.destinations.map((d) => d.trim());
  } else if (config.destination) {
    destList = config.destination
      .split(/➔|,|to/)
      .map((d) => d.trim())
      .filter(Boolean);
  }
  if (destList.length === 0) destList = ['Jaipur, Rajasthan', 'Delhi, NCR', 'Agra, Uttar Pradesh'];

  // 3. Determine activities per day based on pace
  const activitiesCount = config.pace === 'Relaxed' ? 2 : config.pace === 'Packed' ? 4 : 3;

  // 4. Budget factor for cost display
  const budgetFactor = config.budgetTier === 'Budget-friendly' ? 0.5 : config.budgetTier === 'Premium' ? 2.5 : 1.0;

  const days: DayItinerary[] = [];

  for (let i = 0; i < totalDays; i++) {
    const dayNumber = i + 1;
    const dayDate = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = dayDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Determine which destination this day belongs to
    const destIndex = Math.min(destList.length - 1, Math.floor((i / totalDays) * destList.length));
    const destName = destList[destIndex];
    const cityKey = destName.toLowerCase().split(/[\s,]+/)[0];

    // Lookup city knowledge or create a bespoke fallback for any custom city
    const knowledge = CITY_DATABASE[cityKey] || {
      city: destName.split(',')[0],
      region: destName.split(',')[1] || 'Region',
      themeDescriptors: [
        `${destName.split(',')[0]} Historic Landmarks & Old Quarter`,
        `${destName.split(',')[0]} Artisan Culture & Covered Galleries`,
        `${destName.split(',')[0]} Panoramic Ridge & Scenic Overlook`,
        `${destName.split(',')[0]} Riverside Promenade & Evening Aromas`
      ],
      stops: [
        {
          title: `${destName.split(',')[0]} Heritage Monument & Royal Palace`,
          duration: '2.5h',
          period: 'morning' as const,
          cost: 400,
          category: 'History',
          location: `Central ${destName.split(',')[0]}`,
          isIndoor: false,
          weatherRisk: 'low' as const,
          weatherRiskLabel: '☀️ Clear Morning',
          description: `Iconic heritage architecture and centuries-old stonework in the heart of ${destName.split(',')[0]}.`,
          imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: `${destName.split(',')[0]} Local Artisan Workshop & Bazaar`,
          duration: '2h',
          period: 'afternoon' as const,
          cost: 250,
          category: 'Culture',
          location: `Old Market, ${destName.split(',')[0]}`,
          isIndoor: true,
          weatherRisk: 'low' as const,
          weatherRiskLabel: '☂️ Covered Studio',
          description: `Discover time-honored local craftsmanship, textiles, and authentic regional goods.`,
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: `${destName.split(',')[0]} Panoramic Sunset Viewpoint`,
          duration: '2h',
          period: 'afternoon' as const,
          cost: 300,
          category: 'Relaxation',
          location: `Ridge View, ${destName.split(',')[0]}`,
          isIndoor: false,
          weatherRisk: 'high' as const,
          weatherRiskLabel: '⚠️ 65% Rain Risk',
          description: `Perched viewpoint offering sweeping golden hour horizons across ${destName.split(',')[0]}.`,
          imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f4439c05?auto=format&fit=crop&w=600&q=80',
          hasPlanBReady: true,
          planBAlternative: {
            id: `planb-custom-${dayNumber}`,
            title: `${destName.split(',')[0]} State Museum & Indoor Arts Atelier`,
            timeSlot: '04:00 PM',
            duration: '2h',
            cost: 250,
            costDisplay: '₹250',
            category: 'Culture',
            location: `Heritage Enclave, ${destName.split(',')[0]}`,
            isIndoor: true,
            weatherRiskLabel: '🛡️ 100% Indoor Sheltered',
            description: `Air-cooled gallery showcasing curated royal antiques and regional miniature art safe from weather.`,
            imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
            shelterReason: 'High wind and convective shower forecast. Swapped to indoor sheltered museum and gallery.',
            costDelta: '-₹100 (Saved)'
          }
        },
        {
          title: `${destName.split(',')[0]} Candlelit Courtyard Tasting`,
          duration: '2h',
          period: 'evening' as const,
          cost: 800,
          category: 'Food',
          location: `Heritage Quarter, ${destName.split(',')[0]}`,
          isIndoor: true,
          weatherRisk: 'low' as const,
          weatherRiskLabel: '🍽️ Covered Haveli',
          description: `Authentic multi-course dinner celebrating regional delicacies tailored for ${config.travelerType.toLowerCase()} explorers.`,
          imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
        }
      ]
    };

    const theme =
      knowledge.themeDescriptors[i % knowledge.themeDescriptors.length] ||
      `${knowledge.city} Curated Discovery & Cultural Highlights`;

    // Pick stops according to pace
    const candidateStops = [...knowledge.stops];

    // Prioritize user's interests if any match
    if (config.interests && config.interests.length > 0) {
      candidateStops.sort((a, b) => {
        const aMatch = config.interests.includes(a.category as any) ? 1 : 0;
        const bMatch = config.interests.includes(b.category as any) ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    const dayStops = candidateStops.slice(0, activitiesCount);

    // Provide standard time slots based on count
    const timeSlots =
      activitiesCount === 2
        ? ['09:30 AM', '04:30 PM']
        : activitiesCount === 4
        ? ['08:00 AM', '11:30 AM', '03:00 PM', '06:30 PM']
        : ['09:00 AM', '01:30 PM', '05:30 PM'];

    const activities: Activity[] = dayStops.map((stop, sIdx) => {
      const actId = `act-${dayNumber}-${sIdx + 1}`;
      const scaledCost = Math.round(stop.cost * budgetFactor);
      const costDisplay = scaledCost === 0 ? 'Free' : `₹${scaledCost.toLocaleString('en-IN')}`;

      // Guarantee Plan B is available on Day 2 for testing weather & adaptive contingencies
      const isWeatherSensitiveDay2 = dayNumber === 2 && sIdx === 1;
      const hasPlanB = stop.hasPlanBReady || isWeatherSensitiveDay2;

      let planBAlt = stop.planBAlternative;
      if (isWeatherSensitiveDay2 && !planBAlt) {
        planBAlt = {
          id: `planb-day2-${knowledge.city.toLowerCase()}`,
          title: `${knowledge.city} Heritage State Museum & Indoor Arts Studio`,
          timeSlot: timeSlots[sIdx],
          duration: '2h',
          cost: Math.round(250 * budgetFactor),
          costDisplay: `₹${Math.round(250 * budgetFactor)}`,
          category: 'Culture',
          location: `${knowledge.city} Museum Grounds`,
          isIndoor: true,
          weatherRiskLabel: '🛡️ 100% Indoor Sheltered',
          description: `Curated indoor exhibition and artisan masterclass sheltered away from convective rain.`,
          imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
          shelterReason: 'IMD convective thunderstorm alert detected. Swapped to indoor museum studio.',
          costDelta: '-₹150 (Saved)'
        };
      }

      return {
        id: actId,
        title: stop.title,
        timeSlot: timeSlots[sIdx] || '10:00 AM',
        period: stop.period,
        duration: stop.duration,
        cost: scaledCost,
        costDisplay,
        category: stop.category,
        location: stop.location,
        coordinates: { x: 80 + sIdx * 60, y: 70 + sIdx * 50 },
        isIndoor: stop.isIndoor,
        weatherRisk: isWeatherSensitiveDay2 ? 'high' : stop.weatherRisk,
        weatherRiskLabel: isWeatherSensitiveDay2 ? '⚠️ 65% Rain Risk' : stop.weatherRiskLabel,
        description: stop.description,
        imageUrl: stop.imageUrl,
        isVisited: dayNumber === 1 && sIdx === 0, // Mark first stop visited as demo baseline
        isLocked: sIdx === 0,
        hasPlanBReady: hasPlanB,
        planBAlternative: planBAlt
      };
    });

    const isRainDay = dayNumber === 2;
    const weatherSummary = isRainDay
      ? 'Showers 25°C • 65% Rain at 2 PM'
      : `${24 + (i % 5)}°C • Clear & Golden`;

    days.push({
      dayNumber,
      dayOfWeek,
      dateStr,
      theme: `${knowledge.city}: ${theme}`,
      weatherSummary,
      temperature: `${25 + (i % 4)}°C`,
      rainRisk: isRainDay ? 65 : 10,
      weatherCondition: isRainDay ? 'thunderstorm' : 'sunny',
      weatherAlert: isRainDay ? 'Rain Alert: 65% Rain at 2 PM (Plan B ready)' : undefined,
      activities
    });
  }

  return days;
}
