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
  bangalore: {
    city: 'Bangalore',
    region: 'Karnataka',
    themeDescriptors: [
      'Botanical Canopies & Colonial Heritage',
      'Royal Palaces & Aviation Heritage',
      'Art Sanctuaries & Innovation Enclaves',
      'Historic Bazaars & Sacred Shrines'
    ],
    stops: [
      {
        title: 'Lalbagh Botanical Garden',
        duration: '2.5h',
        period: 'morning',
        cost: 50,
        category: 'Nature',
        location: 'Mavalli, Bengaluru',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🌿 Shaded Garden Walk',
        description: '240-acre historic botanical garden commissioned by Hyder Ali, featuring centuries-old trees and the iconic 19th-century Glass House.',
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Cubbon Park & Bamboo Groves',
        duration: '2h',
        period: 'afternoon',
        cost: 0,
        category: 'Nature',
        location: 'Kasturba Road, Bengaluru',
        isIndoor: false,
        weatherRisk: 'high',
        weatherRiskLabel: '⚠️ Convective Rain Risk',
        description: '300-acre lush lung space in the city heart, housing the State Central Library and colonial red-brick monuments.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
        hasPlanBReady: true,
        planBAlternative: {
          id: 'planb-visvesvaraya-museum',
          title: 'Visvesvaraya Industrial & Technological Museum',
          timeSlot: '02:30 PM',
          duration: '2h',
          cost: 85,
          costDisplay: '₹85',
          category: 'Culture',
          location: 'Kasturba Road (opp. Cubbon Park), Bengaluru',
          isIndoor: true,
          weatherRiskLabel: '🛡️ 100% Indoor Sheltered',
          description: 'Interactive science museum with working engines, space exhibits, and a life-size animated Spinosaurus safe from afternoon showers.',
          imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
          shelterReason: 'Afternoon rain squalls. Swapped to indoor interactive science museum directly across Kasturba Road.',
          costDelta: '+₹85'
        }
      },
      {
        title: 'Vidhana Soudha & Attara Kacheri Vista',
        duration: '1.5h',
        period: 'evening',
        cost: 0,
        category: 'Culture',
        location: 'Dr. Ambedkar Veedhi, Bengaluru',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🏛️ Architectural Vista',
        description: 'Monumental Neo-Dravidian granite seat of state legislature, magnificently illuminated during evening golden hours.',
        imageUrl: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Bangalore Palace & Royal Durbar Hall',
        duration: '2.5h',
        period: 'morning',
        cost: 480,
        category: 'History',
        location: 'Vasanth Nagar, Bengaluru',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '🏰 Covered Royal Palace',
        description: 'Tudor-style royal residence built by Chamaraja Wadiyar with turreted ramparts, woodcarvings, and Raja Ravi Varma paintings.',
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'National Gallery of Modern Art (NGMA)',
        duration: '2h',
        period: 'afternoon',
        cost: 50,
        category: 'Culture',
        location: 'Palace Road, Bengaluru',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '🖼️ Air-Conditioned Gallery',
        description: 'Heritage Manikyavelu Mansion surrounded by ancient trees, housing modern Indian masterpieces from Amrita Sher-Gil to Jamini Roy.',
        imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Commercial Street Heritage Shopping Trail',
        duration: '2h',
        period: 'evening',
        cost: 300,
        category: 'Shopping',
        location: 'Tasker Town, Bengaluru',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🛍️ Evening Bazaars',
        description: 'Historic colonial shopping arcade lined with silk saree merchants, silver artisans, and legendary Mysore Pak sweet shops.',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Tipu Sultan\'s Summer Palace',
        duration: '2h',
        period: 'morning',
        cost: 25,
        category: 'History',
        location: 'Albert Victor Road, Chamrajpet, Bengaluru',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '🏛️ Teakwood Palace',
        description: 'Two-story 1791 Indo-Islamic palace crafted entirely of teakwood pillars, arches, and balconies, known as the Abode of Happiness.',
        imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Dodda Basavanna (Bull Temple)',
        duration: '1.5h',
        period: 'afternoon',
        cost: 0,
        category: 'Spiritual',
        location: 'Bugle Rock Park, Basavanagudi, Bengaluru',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🪔 Sacred Shrine',
        description: '16th-century monolithic Nandi bull carved from single granite boulder at Bugle Rock, the origin of Bengaluru\'s annual groundnut fair.',
        imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Mavalli Tiffin Room (MTR) & Filter Coffee',
        duration: '1.5h',
        period: 'evening',
        cost: 250,
        category: 'Food',
        location: 'Lalbagh Road, Bengaluru',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '☕ Culinary Landmark',
        description: 'Centenary vegetarian culinary institution famous for inventing Rava Idli during WWII and authentic brass-tumbler degree coffee.',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'HAL Aerospace Museum & Heritage Centre',
        duration: '2h',
        period: 'morning',
        cost: 50,
        category: 'History',
        location: 'HAL Airport Road, Bengaluru',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '✈️ Aviation Gallery',
        description: 'India\'s first aerospace museum showcasing indigenous Marut, Kiran, and Tejas aircraft along with flight simulators.',
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'ISKCON Temple Bangalore',
        duration: '2h',
        period: 'afternoon',
        cost: 0,
        category: 'Spiritual',
        location: 'Hare Krishna Hill, Rajajinagar, Bengaluru',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '🏛️ Modern Hill Temple',
        description: 'One of the largest ISKCON temple complexes globally, featuring gold-plated flagstaff, Vedic museum, and panoramic hill views.',
        imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Ulsoor Lake Promenade & Sunset',
        duration: '1.5h',
        period: 'evening',
        cost: 0,
        category: 'Relaxation',
        location: 'Ulsoor, Bengaluru',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🌅 Lakefront Sunset',
        description: 'Historic 120-acre Kempe Gowda II reservoir dotted with green islets, scenic pathways, and evening breeze.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
  visakhapatnam: {
    city: 'Visakhapatnam',
    region: 'Andhra Pradesh',
    themeDescriptors: [
      'Beach Road & Naval Heritage Circuit',
      'Scenic Heights, Panoramic Hills & Coastal Sands',
      'Sacred Temples & Historic Dolphin\'s Nose Vistas',
      'Monastic Antiquities & Dutch Maritime Trails'
    ],
    stops: [
      {
        title: 'INS Kursura Submarine Museum',
        duration: '2h',
        period: 'morning',
        cost: 70,
        category: 'History',
        location: 'Beach Road, Visakhapatnam',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '🏛️ Indoor Submarine Museum',
        description: 'Authentic Soviet-built submarine decommissioned and preserved as South Asia\'s first submarine museum along the coastal sands.',
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'TU 142 Aircraft Museum',
        duration: '1.5h',
        period: 'afternoon',
        cost: 50,
        category: 'History',
        location: 'Opposite Kursura, Beach Road, Visakhapatnam',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '✈️ Covered Aviation Gallery',
        description: 'Decommissioned Tupolev maritime anti-submarine reconnaissance aircraft transformed into an interactive naval aviation museum.',
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Ramakrishna Beach Promenade & Sunset Walk',
        duration: '2h',
        period: 'evening',
        cost: 0,
        category: 'Relaxation',
        location: 'Beach Road, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🌊 Coastal Sunset',
        description: 'Iconic seafront promenade known for the Kali Temple vista, maritime monuments, and refreshing Bay of Bengal evening breeze.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Kailasagiri Hilltop Park & Coastal Ropeway',
        duration: '2.5h',
        period: 'morning',
        cost: 120,
        category: 'Nature',
        location: 'Hill Crest, Kailasagiri, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '☀️ Panoramic Heights',
        description: 'Scenic 360-foot hilltop park featuring colossal Shiva-Parvati statues, floral clock, and aerial cable car views of the coastline.',
        imageUrl: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Tenneti Seafront Coastal Park',
        duration: '1.5h',
        period: 'afternoon',
        cost: 20,
        category: 'Nature',
        location: 'Jodugullapalem, Beach Road, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'high',
        weatherRiskLabel: '⚠️ Convective Rain Risk',
        description: 'Cliffside coastal park overlooking rocky Bay of Bengal shores and the grounded cargo vessel MV Maa.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
        hasPlanBReady: true,
        planBAlternative: {
          id: 'planb-vizag-museum',
          title: 'Visakha Museum Heritage Galleries',
          timeSlot: '02:00 PM',
          duration: '2h',
          cost: 40,
          costDisplay: '₹40',
          category: 'Culture',
          location: 'Dutch Bungalow, Beach Road, Visakhapatnam',
          isIndoor: true,
          weatherRiskLabel: '🛡️ 100% Indoor Sheltered',
          description: 'Air-cooled Dutch colonial bungalow housing naval antiquities, 1971 war relics, and royal portraits safe from rain.',
          imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
          shelterReason: 'Coastal rain squalls detected. Swapped to indoor naval antiquities museum.',
          costDelta: '₹0'
        }
      },
      {
        title: 'Rushikonda Beach & Coastal Sands',
        duration: '2.5h',
        period: 'evening',
        cost: 0,
        category: 'Adventure',
        location: 'Rushikonda, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🏖️ Golden Hour',
        description: 'Blue Flag-certified golden sand cove known for crystal waters, surfing, and scenic rocky headlands.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Simhachalam Temple (Varaha Lakshmi Narasimha)',
        duration: '2.5h',
        period: 'morning',
        cost: 100,
        category: 'Spiritual',
        location: 'Simhachalam Hill Range, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🪔 Sacred Morning',
        description: 'Ancient 11th-century hill shrine celebrated for its ornate Chola-Ganga stone carving and 96-pillar Kalyana Mandapam.',
        imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Dolphin\'s Nose Promontory & Hilltop Lighthouse',
        duration: '2h',
        period: 'afternoon',
        cost: 30,
        category: 'History',
        location: 'Southern Port Ridge, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '⚓ Maritime Vista',
        description: 'Natural dolphin head-shaped basalt rock projecting into the sea, featuring a 358-meter lighthouse overlooking the harbor.',
        imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f4439c05?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Yarada Beach Coastal Cove',
        duration: '2h',
        period: 'evening',
        cost: 30,
        category: 'Relaxation',
        location: 'Yarada Village, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🌅 Sunset Overlook',
        description: 'Pristine secluded beach embraced by lush green hills on three sides and the azure Bay of Bengal on the fourth.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Thotlakonda Buddhist Complex',
        duration: '2h',
        period: 'morning',
        cost: 25,
        category: 'History',
        location: 'Mangamaripeta Hill, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🪷 Monastic Heritage',
        description: '2,000-year-old Hinayana Buddhist monastery ruins perched on a hill above the sea with stupas and stone viharas.',
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Bheemili Beach & Dutch Outpost Ruins',
        duration: '2h',
        period: 'afternoon',
        cost: 0,
        category: 'History',
        location: 'Bheemunipatnam, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🏛️ Dutch Maritime Ruins',
        description: 'Historic 17th-century Dutch maritime settlement at the mouth of the Gosthani River with colonial cemetery ruins.',
        imageUrl: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Jagadamba Center & Waltair Seafood Trail',
        duration: '2h',
        period: 'evening',
        cost: 350,
        category: 'Food',
        location: 'Jagadamba Junction, Visakhapatnam',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '🍽️ Regional Andhra Cuisine',
        description: 'Curated culinary tasting of authentic coastal Andhra delicacies, Royyala Iguru, and Madugula halwa.',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
  vizag: {
    city: 'Visakhapatnam',
    region: 'Andhra Pradesh',
    themeDescriptors: [
      'Beach Road & Naval Heritage Circuit',
      'Scenic Heights, Panoramic Hills & Coastal Sands',
      'Sacred Temples & Historic Dolphin\'s Nose Vistas',
      'Monastic Antiquities & Dutch Maritime Trails'
    ],
    stops: [
      {
        title: 'INS Kursura Submarine Museum',
        duration: '2h',
        period: 'morning',
        cost: 70,
        category: 'History',
        location: 'Beach Road, Visakhapatnam',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '🏛️ Indoor Submarine Museum',
        description: 'Authentic Soviet-built submarine decommissioned and preserved as South Asia\'s first submarine museum along the coastal sands.',
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'TU 142 Aircraft Museum',
        duration: '1.5h',
        period: 'afternoon',
        cost: 50,
        category: 'History',
        location: 'Opposite Kursura, Beach Road, Visakhapatnam',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '✈️ Covered Aviation Gallery',
        description: 'Decommissioned Tupolev maritime anti-submarine reconnaissance aircraft transformed into an interactive naval aviation museum.',
        imageUrl: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Ramakrishna Beach Promenade & Sunset Walk',
        duration: '2h',
        period: 'evening',
        cost: 0,
        category: 'Relaxation',
        location: 'Beach Road, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🌊 Coastal Sunset',
        description: 'Iconic seafront promenade known for the Kali Temple vista, maritime monuments, and refreshing Bay of Bengal evening breeze.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Kailasagiri Hilltop Park & Coastal Ropeway',
        duration: '2.5h',
        period: 'morning',
        cost: 120,
        category: 'Nature',
        location: 'Hill Crest, Kailasagiri, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '☀️ Panoramic Heights',
        description: 'Scenic 360-foot hilltop park featuring colossal Shiva-Parvati statues, floral clock, and aerial cable car views of the coastline.',
        imageUrl: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Tenneti Seafront Coastal Park',
        duration: '1.5h',
        period: 'afternoon',
        cost: 20,
        category: 'Nature',
        location: 'Jodugullapalem, Beach Road, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'high',
        weatherRiskLabel: '⚠️ Convective Rain Risk',
        description: 'Cliffside coastal park overlooking rocky Bay of Bengal shores and the grounded cargo vessel MV Maa.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
        hasPlanBReady: true,
        planBAlternative: {
          id: 'planb-vizag-museum',
          title: 'Visakha Museum Heritage Galleries',
          timeSlot: '02:00 PM',
          duration: '2h',
          cost: 40,
          costDisplay: '₹40',
          category: 'Culture',
          location: 'Dutch Bungalow, Beach Road, Visakhapatnam',
          isIndoor: true,
          weatherRiskLabel: '🛡️ 100% Indoor Sheltered',
          description: 'Air-cooled Dutch colonial bungalow housing naval antiquities, 1971 war relics, and royal portraits safe from rain.',
          imageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
          shelterReason: 'Coastal rain squalls detected. Swapped to indoor naval antiquities museum.',
          costDelta: '₹0'
        }
      },
      {
        title: 'Rushikonda Beach & Coastal Sands',
        duration: '2.5h',
        period: 'evening',
        cost: 0,
        category: 'Adventure',
        location: 'Rushikonda, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🏖️ Golden Hour',
        description: 'Blue Flag-certified golden sand cove known for crystal waters, surfing, and scenic rocky headlands.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Simhachalam Temple (Varaha Lakshmi Narasimha)',
        duration: '2.5h',
        period: 'morning',
        cost: 100,
        category: 'Spiritual',
        location: 'Simhachalam Hill Range, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🪔 Sacred Morning',
        description: 'Ancient 11th-century hill shrine celebrated for its ornate Chola-Ganga stone carving and 96-pillar Kalyana Mandapam.',
        imageUrl: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Dolphin\'s Nose Promontory & Hilltop Lighthouse',
        duration: '2h',
        period: 'afternoon',
        cost: 30,
        category: 'History',
        location: 'Southern Port Ridge, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '⚓ Maritime Vista',
        description: 'Natural dolphin head-shaped basalt rock projecting into the sea, featuring a 358-meter lighthouse overlooking the harbor.',
        imageUrl: 'https://images.unsplash.com/photo-1600100397608-f010f4439c05?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Yarada Beach Coastal Cove',
        duration: '2h',
        period: 'evening',
        cost: 30,
        category: 'Relaxation',
        location: 'Yarada Village, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🌅 Sunset Overlook',
        description: 'Pristine secluded beach embraced by lush green hills on three sides and the azure Bay of Bengal on the fourth.',
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Thotlakonda Buddhist Complex',
        duration: '2h',
        period: 'morning',
        cost: 25,
        category: 'History',
        location: 'Mangamaripeta Hill, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🪷 Monastic Heritage',
        description: '2,000-year-old Hinayana Buddhist monastery ruins perched on a hill above the sea with stupas and stone viharas.',
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Bheemili Beach & Dutch Outpost Ruins',
        duration: '2h',
        period: 'afternoon',
        cost: 0,
        category: 'History',
        location: 'Bheemunipatnam, Visakhapatnam',
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '🏛️ Dutch Maritime Ruins',
        description: 'Historic 17th-century Dutch maritime settlement at the mouth of the Gosthani River with colonial cemetery ruins.',
        imageUrl: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80'
      },
      {
        title: 'Jagadamba Center & Waltair Seafood Trail',
        duration: '2h',
        period: 'evening',
        cost: 350,
        category: 'Food',
        location: 'Jagadamba Junction, Visakhapatnam',
        isIndoor: true,
        weatherRisk: 'low',
        weatherRiskLabel: '🍽️ Regional Andhra Cuisine',
        description: 'Curated culinary tasting of authentic coastal Andhra delicacies, Royyala Iguru, and Madugula halwa.',
        imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80'
      }
    ]
  },
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

// Aliases for common destination variations and spellings
CITY_DATABASE['bengaluru'] = CITY_DATABASE['bangalore'];
CITY_DATABASE['banglore'] = CITY_DATABASE['bangalore'];
CITY_DATABASE['vizag'] = CITY_DATABASE['visakhapatnam'];

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
  const usedStopTitles = new Set<string>();

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
          weatherRiskLabel: '☀️ Clear Skies',
          description: `Iconic heritage architecture and centuries-old stonework in the heart of ${destName.split(',')[0]}.`,
          imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: `${destName.split(',')[0]} Local Artisan Workshop & Bazaar`,
          duration: '2h',
          period: 'morning' as const,
          cost: 250,
          category: 'Culture',
          location: `Old Market, ${destName.split(',')[0]}`,
          isIndoor: true,
          weatherRisk: 'low' as const,
          weatherRiskLabel: '🏛️ Indoor Sheltered',
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
          weatherRiskLabel: '🍽️ Covered Dining',
          description: `Authentic multi-course dinner celebrating regional delicacies tailored for ${config.travelerType.toLowerCase()} explorers.`,
          imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: `${destName.split(',')[0]} Botanical Gardens & Fern Sanctuary`,
          duration: '2h',
          period: 'morning' as const,
          cost: 100,
          category: 'Nature',
          location: `Outer Circle, ${destName.split(',')[0]}`,
          isIndoor: false,
          weatherRisk: 'low' as const,
          weatherRiskLabel: '☀️ Clear Skies',
          description: `Lush shaded botanical reserve featuring regional flora, shaded pavilions, and calm walking paths.`,
          imageUrl: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: `${destName.split(',')[0]} Historic Citadel & Echo Bastion`,
          duration: '2.5h',
          period: 'afternoon' as const,
          cost: 150,
          category: 'History',
          location: `Hilltop, ${destName.split(',')[0]}`,
          isIndoor: false,
          weatherRisk: 'low' as const,
          weatherRiskLabel: '☀️ Clear Skies',
          description: `Centuries-old stone citadel ramparts with commanding views across the surrounding countryside.`,
          imageUrl: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: `${destName.split(',')[0]} Twilight Waterfront Promenade`,
          duration: '1.5h',
          period: 'evening' as const,
          cost: 0,
          category: 'Relaxation',
          location: `Waterfront, ${destName.split(',')[0]}`,
          isIndoor: false,
          weatherRisk: 'low' as const,
          weatherRiskLabel: '🌊 Evening Breeze',
          description: `Relaxing twilight promenade stroll along the waterside enjoying cooling breezes and city lights.`,
          imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80'
        },
        {
          title: `${destName.split(',')[0]} Traditional Spice Guild & Herb Bazaar`,
          duration: '1.5h',
          period: 'morning' as const,
          cost: 120,
          category: 'Food',
          location: `Old Market, ${destName.split(',')[0]}`,
          isIndoor: false,
          weatherRisk: 'low' as const,
          weatherRiskLabel: '☀️ Clear Skies',
          description: `Aromatic spice market exploring regional seasonings, teas, and hand-rolled confections.`,
          imageUrl: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=600&q=80'
        }
      ]
    };

    const theme =
      knowledge.themeDescriptors[i % knowledge.themeDescriptors.length] ||
      `${knowledge.city} Curated Discovery & Cultural Highlights`;

    // Filter candidate stops: pick stops not yet used in previous days
    const unusedCandidateStops = knowledge.stops.filter((s) => !usedStopTitles.has(s.title));

    // Prioritize user's interests if any match
    if (config.interests && config.interests.length > 0) {
      unusedCandidateStops.sort((a, b) => {
        const aMatch = config.interests.includes(a.category as any) ? 1 : 0;
        const bMatch = config.interests.includes(b.category as any) ? 1 : 0;
        return bMatch - aMatch;
      });
    }

    const dayStops = unusedCandidateStops.slice(0, activitiesCount);

    // If dayStops run out of unused stops, generate unique distinct extension stops
    while (dayStops.length < activitiesCount) {
      const extIdx = dayStops.length + 1;
      const extTitle = `${knowledge.city} Day ${dayNumber} Curated Exploration ${extIdx}`;
      dayStops.push({
        title: extTitle,
        duration: '2h',
        period: extIdx === 1 ? 'morning' : extIdx === 2 ? 'afternoon' : 'evening',
        cost: 200,
        category: 'Culture',
        location: `${knowledge.city} Historic Quarter`,
        isIndoor: false,
        weatherRisk: 'low',
        weatherRiskLabel: '☀️ Clear Skies',
        description: `Scenic excursion and local exploration through ${knowledge.city}.`,
        imageUrl: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80'
      });
    }

    // Mark these stops as used across subsequent days
    dayStops.forEach((s) => usedStopTitles.add(s.title));

    // Provide standard time slots based on count
    const timeSlots =
      activitiesCount === 2
        ? ['09:30 AM', '04:30 PM']
        : activitiesCount === 4
        ? ['08:00 AM', '11:30 AM', '03:00 PM', '06:30 PM']
        : ['09:00 AM', '01:30 PM', '05:30 PM'];

    const isRainDay = dayNumber === 2;

    // Pick index of outdoor activity on rain day to have Plan B
    let weatherSensitiveIdx = -1;
    if (isRainDay) {
      // Find first outdoor activity (or second activity if possible)
      weatherSensitiveIdx = dayStops.findIndex((s, idx) => !s.isIndoor && idx > 0);
      if (weatherSensitiveIdx === -1) {
        weatherSensitiveIdx = dayStops.findIndex((s) => !s.isIndoor);
      }
    }

    const activities: Activity[] = dayStops.map((stop, sIdx) => {
      const actId = `act-${dayNumber}-${sIdx + 1}`;
      const scaledCost = Math.round(stop.cost * budgetFactor);
      const costDisplay = scaledCost === 0 ? 'Free' : `₹${scaledCost.toLocaleString('en-IN')}`;

      const isThisStopWeatherThreatened = sIdx === weatherSensitiveIdx;
      const hasPlanB = isThisStopWeatherThreatened;

      let planBAlt: PlanBAlternative | undefined = undefined;
      if (isThisStopWeatherThreatened) {
        planBAlt = stop.planBAlternative || {
          id: `planb-day2-${knowledge.city.toLowerCase()}`,
          title: `${knowledge.city} Heritage State Museum & Indoor Arts Studio`,
          timeSlot: timeSlots[sIdx] || '02:00 PM',
          duration: '2h',
          cost: Math.round(200 * budgetFactor),
          costDisplay: `₹${Math.round(200 * budgetFactor)}`,
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

      // Strictly consistent weather risk
      const finalWeatherRisk = isThisStopWeatherThreatened ? ('high' as const) : ('low' as const);
      const finalWeatherRiskLabel = isThisStopWeatherThreatened
        ? '⚠️ 65% Rain Risk'
        : stop.isIndoor
        ? '🏛️ Indoor Sheltered'
        : '☀️ Clear Skies';

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
        weatherRisk: finalWeatherRisk,
        weatherRiskLabel: finalWeatherRiskLabel,
        description: stop.description,
        imageUrl: stop.imageUrl,
        isVisited: false,
        isLocked: false,
        hasPlanBReady: hasPlanB,
        planBAlternative: planBAlt
      };
    });

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
