import { db } from './firebase.js';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';

import {
  CATEGORY_DEFINITIONS,
  resolveRequiredPillars,
  classifyGooglePlace,
  getMainCategoryForSubcategory
} from './vihara/placeClassifier.js';

export {
  CATEGORY_DEFINITIONS,
  resolveRequiredPillars,
  classifyGooglePlace,
  getMainCategoryForSubcategory
};


/**
 * Rich Knowledge Catalog for expanded Indian destinations with 6+ iconic attractions each.
 */
export const DESTINATION_CATALOG = {
  hyderabad: {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    tagline: 'City of Pearls & Nizami Splendor',
    coordinates: { lat: 17.3850, lng: 78.4867 },
    subcategories: [
      'temples', 'pilgrimage-sites', 'spiritual-towns',
      'forts', 'palaces', 'historical-monuments', 'unesco-sites', 'heritage-walks',
      'lakes', 'national-parks'
    ],
    places: [
      {
        id: 'charminar',
        name: 'Charminar & Laad Bazaar',
        category: 'Heritage',
        subcategories: ['historical-monuments', 'heritage-walks'],
        description: 'Magnificent 16th-century four-minaret monument and mosque that is the iconic global symbol of Hyderabad.',
        image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 17.3616, lng: 78.4747 },
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        visitingHours: { open: '09:30 AM', close: '05:30 PM' },
        entryInfo: '₹25 (Indian), ₹300 (Foreigner)',
        estimatedVisitDuration: '1.5 hours',
        bestTimeToVisit: 'Early morning or illuminated evening view',
        travelTips: 'Explore the bustling Laad Bazaar for lacquer bangles and authentic Irani chai at Nimrah Cafe.',
        nearbyPlaces: ['Mecca Masjid', 'Chowmahalla Palace'],
        culinarySpecialty: 'Hyderabadi Dum Biryani, Osmania Biscuits, Irani Chai'
      },
      {
        id: 'golconda-fort',
        name: 'Golconda Fort',
        category: 'Heritage',
        subcategories: ['forts', 'historical-monuments'],
        description: 'Massive fortress complex renowned for its acoustic engineering, diamond vaults (Koh-i-Noor provenance), and royal palaces.',
        image: 'https://images.unsplash.com/photo-1616190419596-e2839e7380d7?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 17.3833, lng: 78.4011 },
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        visitingHours: { open: '09:00 AM', close: '05:30 PM' },
        entryInfo: '₹25 (Indian), ₹300 (Foreigner)',
        estimatedVisitDuration: '2.5 hours',
        bestTimeToVisit: 'Late Afternoon to climb the Bala Hissar pavilion and attend the sound & light show',
        travelTips: 'Clap at the entrance Fateh Darwaza to test the acoustic signal transmission to the hilltop pavilion.',
        nearbyPlaces: ['Qutb Shahi Tombs', 'Taramati Baradari'],
        culinarySpecialty: 'Pathar Ka Gosht, Mirchi Ka Salan'
      },
      {
        id: 'chowmahalla-palace',
        name: 'Chowmahalla Palace',
        category: 'Heritage',
        subcategories: ['palaces', 'historical-monuments'],
        description: 'Exquisite palace belonging to the Nizams of Hyderabad, featuring neo-classical courtyards, grand chandelier durbar halls, and vintage cars.',
        image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 17.3578, lng: 78.4717 },
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        visitingHours: { open: '10:00 AM', close: '05:00 PM (Closed Fridays)' },
        entryInfo: '₹100 (Indian), ₹400 (Foreigner)',
        estimatedVisitDuration: '2 hours',
        bestTimeToVisit: 'Midday / Afternoon',
        travelTips: 'Do not miss the 1912 Rolls-Royce Silver Ghost in the royal garage courtyard.',
        nearbyPlaces: ['Charminar', 'Salar Jung Museum'],
        culinarySpecialty: 'Double Ka Meetha, Qubani Ka Meetha'
      },
      {
        id: 'salar-jung-museum',
        name: 'Salar Jung Museum',
        category: 'Heritage',
        subcategories: ['historical-monuments', 'unesco-sites'],
        description: 'One of the world’s largest one-man antique collections, famous for the veiled Rebecca marble statue and the 19th-century musical clock.',
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 17.3713, lng: 78.4804 },
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        visitingHours: { open: '10:00 AM', close: '05:00 PM (Closed Fridays)' },
        entryInfo: '₹50 (Indian), ₹500 (Foreigner)',
        estimatedVisitDuration: '2.5 hours',
        bestTimeToVisit: 'Morning 11:45 AM to watch the mechanical clock chime at 12:00 PM',
        travelTips: 'Visit the European and jade galleries on the upper floor.',
        nearbyPlaces: ['Charminar', 'High Court'],
        culinarySpecialty: 'Baghare Baingan, Haleem'
      },
      {
        id: 'hussain-sagar',
        name: 'Hussain Sagar Lake & Buddha Statue',
        category: 'Nature',
        subcategories: ['lakes', 'heritage-walks'],
        description: 'Heart-shaped lake built in 1563, featuring a monolithic 18-meter high Buddha statue erected on the Rock of Gibraltar in the center.',
        image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 17.4239, lng: 78.4738 },
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        visitingHours: { open: '08:00 AM', close: '10:00 PM' },
        entryInfo: '₹100 (Speedboat/Ferry to statue)',
        estimatedVisitDuration: '1.5 hours',
        bestTimeToVisit: 'Sunset for illuminated views of Necklace Road and Buddha statue',
        travelTips: 'Take the scenic boat ride from Lumbini Park; enjoy street food along Tank Bund.',
        nearbyPlaces: ['Lumbini Park', 'NTR Gardens', 'Birla Mandir'],
        culinarySpecialty: 'Masala Dosa, Punugulu, Filter Coffee'
      },
      {
        id: 'qutb-shahi-tombs',
        name: 'Qutb Shahi Tombs & Garden Pavilion',
        category: 'Heritage',
        subcategories: ['unesco-sites', 'historical-monuments', 'palaces'],
        description: 'Majestic domed funerary complex of the seven founding rulers of the Golconda Sultanate, set amidst tranquil Persian gardens.',
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 17.3941, lng: 78.3973 },
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        visitingHours: { open: '09:30 AM', close: '05:30 PM' },
        entryInfo: '₹30 (Indian), ₹200 (Foreigner)',
        estimatedVisitDuration: '2 hours',
        bestTimeToVisit: 'Morning for peaceful garden exploration and photography',
        travelTips: 'Admire the intricate turquoise tile-work remnants and serene stepwells.',
        nearbyPlaces: ['Golconda Fort', 'Golkonda Resort'],
        culinarySpecialty: 'Hyderabadi Marag, Sheermal'
      }
    ]
  },
  goa: {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    tagline: 'Sun, Coastal Heritage & Portuguese Romance',
    coordinates: { lat: 15.2993, lng: 74.1240 },
    subcategories: [
      'temples', 'pilgrimage-sites', 'yoga-meditation', 'ashrams',
      'trekking', 'camping', 'river-rafting', 'paragliding', 'wildlife-safari',
      'forts', 'historical-monuments', 'unesco-sites', 'heritage-walks',
      'beaches', 'waterfalls', 'national-parks', 'lakes'
    ],
    places: [
      {
        id: 'basilica-bom-jesus',
        name: 'Basilica of Bom Jesus & Se Cathedral',
        category: 'Heritage',
        subcategories: ['unesco-sites', 'historical-monuments', 'pilgrimage-sites'],
        description: 'World-famous 16th-century UNESCO World Heritage church containing the sacred mortal remains of St. Francis Xavier, adorned with baroque carvings.',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 15.5009, lng: 73.9116 },
        city: 'Old Goa',
        state: 'Goa',
        country: 'India',
        visitingHours: { open: '09:00 AM', close: '06:30 PM' },
        entryInfo: 'Free Entry',
        estimatedVisitDuration: '1.5 hours',
        bestTimeToVisit: 'Morning hours for quiet prayer and exploration',
        travelTips: 'Dress modestly with shoulders and knees covered. Se Cathedral is right across the road.',
        nearbyPlaces: ['Se Cathedral', 'Church of St. Francis of Assisi'],
        culinarySpecialty: 'Goan Fish Curry Thali, Bebinca, Prawn Balchão'
      },
      {
        id: 'fort-aguada',
        name: 'Fort Aguada & Sinquerim Lighthouse',
        category: 'Heritage',
        subcategories: ['forts', 'historical-monuments'],
        description: 'Well-preserved 17th-century Portuguese fortress standing proudly on Sinquerim Beach, overlooking the Arabian Sea.',
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 15.4920, lng: 73.7736 },
        city: 'Candolim',
        state: 'Goa',
        country: 'India',
        visitingHours: { open: '09:30 AM', close: '06:00 PM' },
        entryInfo: '₹25 (Indian), ₹300 (Foreigner)',
        estimatedVisitDuration: '1.5 hours',
        bestTimeToVisit: 'Late Afternoon to catch dramatic ocean sunsets',
        travelTips: 'Carry drinking water and a sun hat; explore both upper and lower fort ramparts.',
        nearbyPlaces: ['Sinquerim Beach', 'Candolim Beach'],
        culinarySpecialty: 'Pork Vindaloo, Feni, Kokum Sol Kadi'
      },
      {
        id: 'fontainhas',
        name: 'Fontainhas Latin Quarter',
        category: 'Heritage',
        subcategories: ['heritage-walks', 'historical-monuments'],
        description: 'Charming Portuguese heritage precinct in Panaji with brightly colored terracotta villas, azulejo tile plaques, and artisanal bakeries.',
        image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 15.4989, lng: 73.8278 },
        city: 'Panaji',
        state: 'Goa',
        country: 'India',
        visitingHours: { open: 'Open 24 Hours (Bakeries 08:00 AM - 08:00 PM)' },
        entryInfo: 'Free Walking Area',
        estimatedVisitDuration: '2 hours',
        bestTimeToVisit: 'Early morning or late afternoon for vibrant street photography',
        travelTips: 'Stop by Confeitaria 31 De Janeiro for authentic traditional Goan bebinca and pastéis de nata.',
        nearbyPlaces: ['Our Lady of the Immaculate Conception Church', 'Mandovi River Promenade'],
        culinarySpecialty: 'Poee Bread, Goan Chorizo Pao, Bebinca'
      },
      {
        id: 'chapora-fort',
        name: 'Chapora Fort & Vagator Coast',
        category: 'Heritage',
        subcategories: ['forts', 'historical-monuments'],
        description: 'Iconic red laterite hilltop bastion made famous in popular cinema, offering spectacular 360-degree ocean views over Vagator and Morjim.',
        image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 15.6059, lng: 73.7389 },
        city: 'Vagator',
        state: 'Goa',
        country: 'India',
        visitingHours: { open: '06:00 AM', close: '06:30 PM' },
        entryInfo: 'Free Entry',
        estimatedVisitDuration: '1.5 hours',
        bestTimeToVisit: 'Sunset',
        travelTips: 'Wear comfortable walking shoes for the 10-minute stone pathway ascent.',
        nearbyPlaces: ['Vagator Beach', 'Anjuna Flea Market'],
        culinarySpecialty: 'Crab Xec Xec, Butter Garlic Calamari'
      },
      {
        id: 'dudhsagar-falls',
        name: 'Dudhsagar Waterfalls & Spice Plantation',
        category: 'Nature',
        subcategories: ['waterfalls', 'national-parks', 'trekking'],
        description: 'Four-tiered white cascade standing 310 meters high amidst the Bhagwan Mahaveer Sanctuary, resembling a torrent of milk.',
        image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 15.3144, lng: 74.3143 },
        city: 'Mollem',
        state: 'Goa',
        country: 'India',
        visitingHours: { open: '08:30 AM', close: '04:00 PM' },
        entryInfo: '₹500 (Forest Safari Jeep permit)',
        estimatedVisitDuration: '4 hours',
        bestTimeToVisit: 'Morning jeep safari into the jungle',
        travelTips: 'Life jackets are mandatory for swimming at the natural base pool.',
        nearbyPlaces: ['Sahakari Spice Farm', 'Mollem National Park'],
        culinarySpecialty: 'Traditional Banana Leaf Buffet, Feni Cocktails'
      },
      {
        id: 'calangute-anjuna',
        name: 'Calangute & Anjuna Coastal Promenade',
        category: 'Nature',
        subcategories: ['beaches'],
        description: 'Vibrant golden sand shoreline lined with beach shacks, water sports, flea markets, and coastal sunset cafes.',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 15.5439, lng: 73.7553 },
        city: 'North Goa',
        state: 'Goa',
        country: 'India',
        visitingHours: { open: '24 Hours Open' },
        entryInfo: 'Free Public Access',
        estimatedVisitDuration: '3 hours',
        bestTimeToVisit: 'Sunset & Evening',
        travelTips: 'Try parasailing and jet-skiing before settling in a seaside beach shack.',
        nearbyPlaces: ['Baga Beach', 'Tito’s Lane'],
        culinarySpecialty: 'Grilled Kingfish, Kokum Cooler'
      }
    ]
  },
  delhi: {
    id: 'delhi',
    name: 'Delhi',
    state: 'Delhi NCR',
    tagline: 'Heart of India & Mughal Architecture',
    coordinates: { lat: 28.6139, lng: 77.2090 },
    subcategories: [
      'temples', 'pilgrimage-sites', 'spiritual-towns', 'yoga-meditation',
      'forts', 'historical-monuments', 'unesco-sites', 'heritage-walks',
      'national-parks', 'lakes'
    ],
    places: [
      {
        id: 'red-fort',
        name: 'Red Fort (Lal Qila)',
        category: 'Heritage',
        subcategories: ['forts', 'historical-monuments', 'unesco-sites'],
        description: 'Iconic 17th-century Mughal fortress crafted from red sandstone, the epic center of Indian independence celebrations.',
        image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 28.6562, lng: 77.2410 },
        city: 'Old Delhi',
        state: 'Delhi',
        country: 'India',
        visitingHours: { open: '09:30 AM', close: '04:30 PM (Closed Mondays)' },
        entryInfo: '₹50 (Indian), ₹550 (Foreigner)',
        estimatedVisitDuration: '2 hours',
        bestTimeToVisit: 'Morning hours (10:00 AM - 12:00 PM)',
        travelTips: 'Book ASI tickets online in advance to bypass long queues. Sound and light show is hosted every evening.',
        nearbyPlaces: ['Jama Masjid', 'Chandni Chowk Market', 'Raj Ghat'],
        culinarySpecialty: 'Old Delhi Paranthe Wali Gali, Dahi Bhalla at Natraj'
      },
      {
        id: 'qutub-minar',
        name: 'Qutub Minar Complex',
        category: 'Heritage',
        subcategories: ['historical-monuments', 'unesco-sites'],
        description: 'A 73-meter fluted red sandstone minaret built in 1193, surrounded by ancient carved Islamic and Hindu ruins.',
        image: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 28.5245, lng: 77.1855 },
        city: 'Mehrauli',
        state: 'Delhi',
        country: 'India',
        visitingHours: { open: '07:00 AM', close: '05:00 PM' },
        entryInfo: '₹40 (Indian), ₹600 (Foreigner)',
        estimatedVisitDuration: '1.5 hours',
        bestTimeToVisit: 'Late Afternoon for golden hour light',
        travelTips: 'Observe the 4th-century rust-resistant Iron Pillar in the courtyard.',
        nearbyPlaces: ['Mehrauli Archaeological Park', 'Garden of Five Senses'],
        culinarySpecialty: 'Mughlai Kebabs, Butter Chicken at Pandara Road'
      },
      {
        id: 'india-gate',
        name: 'India Gate & Kartavya Path',
        category: 'Heritage',
        subcategories: ['historical-monuments', 'heritage-walks'],
        description: 'Triumphal arch war memorial standing 42 meters high, dedicated to 84,000 soldiers with the eternal flame Amar Jawan Jyoti.',
        image: 'https://images.unsplash.com/photo-1597040663342-45b6af3d91a5?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 28.6129, lng: 77.2295 },
        city: 'New Delhi',
        state: 'Delhi',
        country: 'India',
        visitingHours: { open: '24 Hours Open', close: 'Illuminated 07:00 PM - 11:00 PM' },
        entryInfo: 'Free Entry',
        estimatedVisitDuration: '1 hour',
        bestTimeToVisit: 'Sunset / Evening for twilight illumination',
        travelTips: 'Stroll along Kartavya Path to the National War Memorial; enjoy street snacks and boat rides nearby.',
        nearbyPlaces: ['National War Memorial', 'Rashtrapati Bhavan'],
        culinarySpecialty: 'Chhole Bhature, Kulfi Falooda'
      }
    ]
  },
  jaipur: {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    tagline: 'The Royal Pink City',
    coordinates: { lat: 26.9124, lng: 75.7873 },
    subcategories: [
      'temples', 'pilgrimage-sites', 'spiritual-towns', 'ashrams',
      'trekking', 'camping',
      'forts', 'palaces', 'historical-monuments', 'unesco-sites', 'heritage-walks',
      'hills-valleys', 'lakes'
    ],
    places: [
      {
        id: 'amber-fort',
        name: 'Amber Fort & Palace',
        category: 'Heritage',
        subcategories: ['forts', 'palaces', 'unesco-sites'],
        description: 'Imposing hilltop fort built of yellow and pink sandstone, featuring the glittering Sheesh Mahal mirror palace.',
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 26.9855, lng: 75.8513 },
        city: 'Amer, Jaipur',
        state: 'Rajasthan',
        country: 'India',
        visitingHours: { open: '08:00 AM', close: '05:30 PM' },
        entryInfo: '₹100 (Indian), ₹500 (Foreigner)',
        estimatedVisitDuration: '2.5 hours',
        bestTimeToVisit: 'Morning for elephant pathway or evening for night illumination',
        travelTips: 'Do not miss the Sheesh Mahal (Mirror Palace) where a single candle flame illuminates the entire ceiling.',
        nearbyPlaces: ['Jaigarh Fort', 'Nahargarh Fort', 'Panna Meena Ka Kund'],
        culinarySpecialty: 'Dal Baati Churma, Ker Sangri, Pyaaz Kachori at Rawat'
      },
      {
        id: 'hawa-mahal',
        name: 'Hawa Mahal (Palace of Winds)',
        category: 'Heritage',
        subcategories: ['palaces', 'historical-monuments'],
        description: 'Five-story red and pink sandstone facade with 953 intricately carved jharokhas (windows) designed for royal women.',
        image: 'https://images.unsplash.com/photo-1603258849062-8178a9c04d02?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 26.9239, lng: 75.8267 },
        city: 'Old City, Jaipur',
        state: 'Rajasthan',
        country: 'India',
        visitingHours: { open: '09:00 AM', close: '05:00 PM' },
        entryInfo: '₹50 (Indian), ₹200 (Foreigner)',
        estimatedVisitDuration: '1 hour',
        bestTimeToVisit: 'Early morning sunrise light when the facade glows golden-pink',
        travelTips: 'Cross the street to Wind View Cafe for the perfect rooftop photography angle.',
        nearbyPlaces: ['City Palace', 'Jantar Mantar', 'Johari Bazaar'],
        culinarySpecialty: 'Ghewar, Lassi at Lassiwala MI Road'
      }
    ]
  },
  varanasi: {
    id: 'varanasi',
    name: 'Varanasi (Kashi)',
    state: 'Uttar Pradesh',
    tagline: 'World’s Oldest Living Spiritual City',
    coordinates: { lat: 25.3176, lng: 82.9739 },
    subcategories: [
      'temples', 'pilgrimage-sites', 'spiritual-towns', 'yoga-meditation', 'ashrams',
      'historical-monuments', 'heritage-walks', 'lakes'
    ],
    places: [
      {
        id: 'kashi-vishwanath',
        name: 'Kashi Vishwanath Temple & Corridor',
        category: 'Spiritual',
        subcategories: ['temples', 'pilgrimage-sites', 'spiritual-towns'],
        description: 'One of the twelve revered Jyotirlingas of Lord Shiva situated on the sacred western bank of the Ganges.',
        image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 25.3109, lng: 83.0107 },
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        country: 'India',
        visitingHours: { open: '04:00 AM', close: '11:00 PM' },
        entryInfo: 'Free Entry (Sugam Darshan VIP ₹300)',
        estimatedVisitDuration: '2 hours',
        bestTimeToVisit: 'Early Morning Mangala Aarti or Sunset Ganga Aarti',
        travelTips: 'Phones, leather belts, and bags must be deposited in digital lockers at the corridor gate.',
        nearbyPlaces: ['Dashashwamedh Ghat', 'Manikarnika Ghat', 'Annapurna Temple'],
        culinarySpecialty: 'Banarasi Paan, Malaiyo, Tamatar Chaat at Kashi Chaat Bhandar'
      },
      {
        id: 'dashashwamedh-ghat',
        name: 'Dashashwamedh Ghat & Maha Aarti',
        category: 'Spiritual',
        subcategories: ['pilgrimage-sites', 'heritage-walks'],
        description: 'The most spectacular ghat in Varanasi, world-famous for the grand evening Ganga Aarti performed with brass lamps.',
        image: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 25.3069, lng: 83.0105 },
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        country: 'India',
        visitingHours: { open: '24 Hours Open', close: 'Aarti at 06:45 PM Daily' },
        entryInfo: 'Free Entry (Boat seating ₹150 - ₹500)',
        estimatedVisitDuration: '2 hours',
        bestTimeToVisit: '06:00 PM to reserve a prime boat spot',
        travelTips: 'Hire a rowboat at sunset to view the synchronized lamps from the river.',
        nearbyPlaces: ['Assi Ghat', 'Godowlia Market'],
        culinarySpecialty: 'Blue Lassi Shop Rabri, Kachori Gali Breakfast'
      }
    ]
  },
  agra: {
    id: 'agra',
    name: 'Agra',
    state: 'Uttar Pradesh',
    tagline: 'Land of the Eternal Taj Mahal',
    coordinates: { lat: 27.1767, lng: 78.0081 },
    subcategories: ['forts', 'palaces', 'historical-monuments', 'unesco-sites', 'heritage-walks'],
    places: [
      {
        id: 'taj-mahal',
        name: 'Taj Mahal',
        category: 'Heritage',
        subcategories: ['historical-monuments', 'unesco-sites'],
        description: 'Universal masterpiece of white marble Mughal architecture built by Emperor Shah Jahan in memory of Mumtaz Mahal.',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 27.1751, lng: 78.0421 },
        city: 'Agra',
        state: 'Uttar Pradesh',
        country: 'India',
        visitingHours: { open: 'Sunrise to Sunset (Closed Fridays)' },
        entryInfo: '₹50 (Indian), ₹1,100 (Foreigner) + ₹200 for Mausoleum',
        estimatedVisitDuration: '3 hours',
        bestTimeToVisit: 'Sunrise to witness the white marble turn rosy-gold',
        travelTips: 'Enter through the East Gate for shorter queues; shoe covers and water bottle provided with ticket.',
        nearbyPlaces: ['Mehtab Bagh', 'Agra Fort', 'Itmad-ud-Daulah'],
        culinarySpecialty: 'Agra Petha at Panchhi Petha, Bedmi Puri with Aloo'
      }
    ]
  },
  amritsar: {
    id: 'amritsar',
    name: 'Amritsar',
    state: 'Punjab',
    tagline: 'Sacred Sanctum of the Golden Temple',
    coordinates: { lat: 31.6340, lng: 74.8723 },
    subcategories: ['temples', 'pilgrimage-sites', 'spiritual-towns', 'historical-monuments', 'heritage-walks'],
    places: [
      {
        id: 'golden-temple',
        name: 'Harmandir Sahib (Golden Temple)',
        category: 'Spiritual',
        subcategories: ['temples', 'pilgrimage-sites'],
        description: 'The holiest gurdwara of Sikhism, plated in real gold leaf and surrounded by the serene Amrit Sarovar (Pool of Nectar).',
        image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 31.6200, lng: 74.8765 },
        city: 'Amritsar',
        state: 'Punjab',
        country: 'India',
        visitingHours: { open: '24 Hours Open' },
        entryInfo: 'Free Entry (Free Langar for all visitors)',
        estimatedVisitDuration: '3 hours',
        bestTimeToVisit: 'Evening Palki Sahib ceremony (10:00 PM) with golden illumination',
        travelTips: 'Cover head at all times and remove footwear at the parikrama entrance; partake in the community Langar hall.',
        nearbyPlaces: ['Jallianwala Bagh', 'Wagah Border', 'Partition Museum'],
        culinarySpecialty: 'Amritsari Kulcha with Chole, Kesar Da Dhaba Dal Makhani, Makhan Fish'
      }
    ]
  },
  munnar: {
    id: 'munnar',
    name: 'Munnar',
    state: 'Kerala',
    tagline: 'Emerald Tea Hills & Cloud Forests',
    coordinates: { lat: 10.0889, lng: 77.0595 },
    subcategories: ['hills-valleys', 'waterfalls', 'national-parks', 'trekking', 'camping', 'wildlife-safari'],
    places: [
      {
        id: 'eravikulam-national-park',
        name: 'Eravikulam National Park (Rajamalai)',
        category: 'Nature',
        subcategories: ['national-parks', 'hills-valleys', 'wildlife-safari'],
        description: 'Home to the endangered Nilgiri Tahr and the highest peak in South India (Anamudi 2,695m) blanketed in rolling mist.',
        image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 10.1518, lng: 77.0600 },
        city: 'Munnar',
        state: 'Kerala',
        country: 'India',
        visitingHours: { open: '07:30 AM', close: '04:00 PM' },
        entryInfo: '₹200 (Indian), ₹500 (Foreigner)',
        estimatedVisitDuration: '3 hours',
        bestTimeToVisit: 'Morning safari bus tour',
        travelTips: 'Book forest department shuttle buses online to avoid holiday rush.',
        nearbyPlaces: ['Tea Museum', 'Mattupetty Dam', 'Top Station'],
        culinarySpecialty: 'Kerala Appam with Stew, Spiced Masala Tea, Kerala Parotta'
      }
    ]
  },
  udaipur: {
    id: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    tagline: 'The City of Lakes & Romance',
    coordinates: { lat: 24.5854, lng: 73.7125 },
    subcategories: ['palaces', 'forts', 'historical-monuments', 'lakes', 'heritage-walks'],
    places: [
      {
        id: 'city-palace-udaipur',
        name: 'Udaipur City Palace',
        category: 'Heritage',
        subcategories: ['palaces', 'historical-monuments'],
        description: 'Grand lakeside palace complex built over 400 years by the Mewar dynasty overlooking Lake Pichola.',
        image: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 24.5764, lng: 73.6835 },
        city: 'Udaipur',
        state: 'Rajasthan',
        country: 'India',
        visitingHours: { open: '09:30 AM', close: '05:30 PM' },
        entryInfo: '₹300 (Indian), ₹300 (Foreigner)',
        estimatedVisitDuration: '2.5 hours',
        bestTimeToVisit: 'Late Afternoon followed by Lake Pichola sunset boat ride',
        travelTips: 'Hire an authorized audio guide or official Mewar historian at the entry gate.',
        nearbyPlaces: ['Lake Pichola', 'Jag Mandir', 'Saheliyon-ki-Bari'],
        culinarySpecialty: 'Laal Maas, Mewari Thali, Gatte Ki Sabzi'
      }
    ]
  },
  rishikesh: {
    id: 'rishikesh',
    name: 'Rishikesh',
    state: 'Uttarakhand',
    tagline: 'Yoga Capital of the World & Himalayan Gateway',
    coordinates: { lat: 30.0869, lng: 78.2676 },
    subcategories: ['ashrams', 'yoga-meditation', 'temples', 'river-rafting', 'camping', 'trekking', 'hills-valleys'],
    places: [
      {
        id: 'triveni-ghat-rishikesh',
        name: 'Triveni Ghat & Ganga Aarti',
        category: 'Spiritual',
        subcategories: ['pilgrimage-sites', 'spiritual-towns'],
        description: 'Confluence of holy rivers where evening Maha Aarti is celebrated with brass lamps, bells, and Vedic mantras.',
        image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        coordinates: { lat: 30.1033, lng: 78.2936 },
        city: 'Rishikesh',
        state: 'Uttarakhand',
        country: 'India',
        visitingHours: { open: '24 Hours Open', close: 'Aarti at 06:00 PM' },
        entryInfo: 'Free Entry',
        estimatedVisitDuration: '2 hours',
        bestTimeToVisit: 'Sunset',
        travelTips: 'Float a leaf diya on the river Ganges during prayer ceremonies.',
        nearbyPlaces: ['Ram Jhula', 'Laxman Jhula', 'Beatles Ashram'],
        culinarySpecialty: 'Ayurvedic Sattvic Thali, Garhwali Kafuli, Herbal Chai'
      }
    ]
  }
};

/**
 * Returns list of all available destinations for search/dropdown
 */
export const getAllAvailableDestinations = () => {
  return Object.values(DESTINATION_CATALOG).map(d => ({
    id: d.id,
    name: d.name,
    state: d.state,
    tagline: d.tagline,
    coordinates: d.coordinates
  }));
};

/**
 * Fetch destination data from Firestore or fallback to destination catalog
 */
export const getDestinationData = async (destinationInput) => {
  let normId = '';
  let customObj = null;

  if (typeof destinationInput === 'object' && destinationInput !== null) {
    customObj = destinationInput;
    normId = (destinationInput.name || destinationInput.id || destinationInput.destinationName || '').toLowerCase().trim();
  } else {
    normId = (destinationInput || '').toLowerCase().trim();
  }

  // Remove common suffixes like ", telangana, india" if present for catalog lookup
  const simpleName = normId.split(',')[0].trim();

  try {
    const docRef = doc(db, 'destinations', simpleName);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const fallback = DESTINATION_CATALOG[simpleName] || {};
      return {
        id: simpleName,
        name: data.name || fallback.name || customObj?.name || simpleName,
        subcategories: data.subcategories || fallback.subcategories || [],
        places: (data.places && data.places.length > 0) ? data.places : (fallback.places || []),
        coordinates: customObj?.latitude ? { lat: customObj.latitude, lng: customObj.longitude } : (data.coordinates || fallback.coordinates || { lat: 20.5937, lng: 78.9629 }),
        state: data.state || fallback.state || customObj?.state || '',
        tagline: data.tagline || fallback.tagline || customObj?.formattedAddress || ''
      };
    }
  } catch (error) {
    console.warn(`Firestore read failed for destination '${simpleName}', using knowledge catalog:`, error);
  }

  // Catalog match
  if (DESTINATION_CATALOG[simpleName]) {
    const cat = DESTINATION_CATALOG[simpleName];
    return {
      ...cat,
      coordinates: customObj?.latitude ? { lat: customObj.latitude, lng: customObj.longitude } : cat.coordinates,
      state: customObj?.state || cat.state,
      tagline: cat.tagline || customObj?.formattedAddress || ''
    };
  }

  // Dynamic Google Places Destination
  const displayName = customObj?.name || (simpleName ? simpleName.charAt(0).toUpperCase() + simpleName.slice(1) : 'Destination');
  const lat = customObj?.latitude !== undefined ? Number(customObj.latitude) : 20.5937;
  const lng = customObj?.longitude !== undefined ? Number(customObj.longitude) : 78.9629;
  const state = customObj?.state || '';
  const formattedAddress = customObj?.formattedAddress || displayName;

  return {
    id: simpleName || customObj?.placeId || 'dest',
    name: displayName,
    formattedAddress,
    state,
    tagline: formattedAddress || 'Cultural Heritage Destination',
    coordinates: { lat, lng },
    subcategories: customObj?.subcategories || [],
    places: customObj?.places || []
  };
};

// Client-side cache for category discovery (15-minute TTL per session)
const clientCategoryCache = new Map();

/**
 * Real-Time Category Discovery for a destination via /api/destination-categories
 * Fetches verified Google Places Nearby results and maps them deterministically to VIHARA categories.
 */
export const fetchDestinationCategoryDiscovery = async (destinationInput) => {
  let name = '';
  let lat = null;
  let lng = null;
  let placeId = '';

  if (typeof destinationInput === 'object' && destinationInput !== null) {
    name = destinationInput.name || destinationInput.destinationName || destinationInput.formattedAddress || '';
    lat = destinationInput.latitude !== undefined ? Number(destinationInput.latitude) : (destinationInput.lat !== undefined ? Number(destinationInput.lat) : null);
    lng = destinationInput.longitude !== undefined ? Number(destinationInput.longitude) : (destinationInput.lng !== undefined ? Number(destinationInput.lng) : null);
    placeId = destinationInput.placeId || destinationInput.id || '';
  } else if (typeof destinationInput === 'string') {
    name = destinationInput.trim();
    const simpleKey = name.toLowerCase().split(',')[0].trim();
    if (DESTINATION_CATALOG[simpleKey]) {
      const cat = DESTINATION_CATALOG[simpleKey];
      name = cat.name || name;
      lat = cat.coordinates?.lat ?? null;
      lng = cat.coordinates?.lng ?? null;
      placeId = cat.id || simpleKey;
    }
  }

  const cacheKey = `${lat !== null ? lat.toFixed(3) : 'x'}_${lng !== null ? lng.toFixed(3) : 'x'}_${name.toLowerCase()}`;
  if (clientCategoryCache.has(cacheKey)) {
    return clientCategoryCache.get(cacheKey);
  }

  // 1. Primary: Query the secure /api/destination-categories backend endpoint
  if (lat !== null && lng !== null && Number.isFinite(lat) && Number.isFinite(lng)) {
    try {
      const searchRadius = (typeof destinationInput === 'object' && destinationInput.radius)
        ? Math.min(50000, Math.max(3000, destinationInput.radius))
        : 45000;

      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lng),
        destination: name,
        placeId: placeId || '',
        radius: String(searchRadius)
      });
      const baseUrl = typeof window !== 'undefined' ? '' : (process.env.TEST_BASE_URL || 'http://localhost:5173');
      const res = await fetch(`${baseUrl}/api/destination-categories?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const result = {
            destinationName: name || data.destination?.name || 'Destination',
            latitude: lat,
            longitude: lng,
            placeId: placeId || data.destination?.placeId || null,
            availableCategories: data.availableCategories || [],
            unavailableCategories: data.unavailableCategories || [],
            categoryStatus: data.categoryStatus || {},
            subcategories: data.subcategories || [],
            categoryEvidence: data.categoryEvidence || {},
            source: data.source || (data.provider === 'google-places-new' ? 'google-places-new' : 'google-places-nearby'),
            fallback: !!data.fallback,
            provider: data.provider || 'google-places-new'
          };
          clientCategoryCache.set(cacheKey, result);
          return result;
        }
      }
    } catch (err) {
      console.warn(`[destinationService] Category discovery API call failed for "${name}":`, err.message);
    }
  }

  // 2. Fallback: Check knowledge catalog ONLY when Google Places API is unavailable
  const simpleKey = name.toLowerCase().split(',')[0].trim();
  const catalog = DESTINATION_CATALOG[simpleKey];
  if (catalog && Array.isArray(catalog.subcategories)) {
    const avail = ['spiritual', 'heritage', 'nature', 'adventure'].filter(c => {
      const def = CATEGORY_DEFINITIONS[c];
      return def?.subcategories.some(s => catalog.subcategories.includes(s.id));
    });
    const statusMap = {};
    for (const c of ['spiritual', 'heritage', 'nature', 'adventure']) {
      statusMap[c] = avail.includes(c) ? 'CONFIRMED_AVAILABLE' : 'TEMPORARILY_UNAVAILABLE';
    }

    const fallbackResult = {
      destinationName: catalog.name || name,
      latitude: lat || catalog.coordinates?.lat,
      longitude: lng || catalog.coordinates?.lng,
      placeId: placeId || catalog.id,
      availableCategories: avail,
      unavailableCategories: ['spiritual', 'heritage', 'nature', 'adventure'].filter(c => !avail.includes(c)),
      categoryStatus: statusMap,
      subcategories: catalog.subcategories,
      categoryEvidence: {},
      source: 'catalog-fallback',
      fallback: true,
      provider: 'catalog-fallback'
    };
    clientCategoryCache.set(cacheKey, fallbackResult);
    return fallbackResult;
  }

  // 3. Dynamic destination with zero Google API access and no catalog entry:
  // Must NOT invent hardcoded categories! Return honestly empty with fallback flag.
  const emptyStatus = {
    spiritual: 'TEMPORARILY_UNAVAILABLE',
    heritage: 'TEMPORARILY_UNAVAILABLE',
    nature: 'TEMPORARILY_UNAVAILABLE',
    adventure: 'TEMPORARILY_UNAVAILABLE'
  };
  const emptyFallback = {
    destinationName: name || 'Destination',
    latitude: lat,
    longitude: lng,
    placeId,
    availableCategories: [],
    unavailableCategories: ['spiritual', 'heritage', 'nature', 'adventure'],
    categoryStatus: emptyStatus,
    subcategories: [],
    categoryEvidence: {},
    source: 'fallback-empty',
    fallback: true,
    provider: 'none'
  };
  clientCategoryCache.set(cacheKey, emptyFallback);
  return emptyFallback;
};

/**
 * Evaluates dynamic category and subcategory availability for multiple selected destinations
 * based on verified real-time Google Places data.
 */
export const analyzeCategoriesForDestinations = async (selectedDestinationIds = []) => {
  if (!selectedDestinationIds || selectedDestinationIds.length === 0) {
    const matrix = {};
    for (const [key, cat] of Object.entries(CATEGORY_DEFINITIONS)) {
      matrix[cat.id] = {
        id: cat.id,
        name: cat.name,
        enabled: false,
        status: 'NOT_CONFIRMED',
        subcategories: cat.subcategories.map(sub => ({
          id: sub.id,
          name: sub.name,
          available: false,
          availableIn: [],
          statusText: 'Select a destination first'
        }))
      };
    }
    return matrix;
  }

  // Independently discover real-time categories for each selected destination
  const destCategoryResults = await Promise.all(
    selectedDestinationIds.map(destInput => fetchDestinationCategoryDiscovery(destInput))
  );

  const matrix = {};

  for (const [key, cat] of Object.entries(CATEGORY_DEFINITIONS)) {
    const subcategoryAnalysis = cat.subcategories.map(sub => {
      const availableIn = destCategoryResults
        .filter(dest => dest.subcategories && dest.subcategories.includes(sub.id))
        .map(dest => dest.destinationName);

      const isAvailable = availableIn.length > 0;

      return {
        id: sub.id,
        name: sub.name,
        available: isAvailable,
        availableIn: availableIn,
        statusText: isAvailable
          ? `Available in: ${availableIn.join(', ')}`
          : 'Not available in your selected destinations.'
      };
    });

    const isMainCategoryEnabled = subcategoryAnalysis.some(sub => sub.available);

    // Aggregate real place evidence across all selected destinations
    const aggregatedEvidence = [];
    destCategoryResults.forEach(d => {
      const ev = d.categoryEvidence?.[cat.id] || [];
      aggregatedEvidence.push(...ev);
    });

    const hasLiveSource = destCategoryResults.some(d => !d.fallback && (d.source === 'google-places-nearby' || d.source === 'google-places-new' || d.provider === 'google-places-new'));

    // Determine aggregate category status
    let categoryStatus = 'NOT_CONFIRMED';
    if (isMainCategoryEnabled) {
      categoryStatus = 'CONFIRMED_AVAILABLE';
    } else if (destCategoryResults.every(d => d.categoryStatus?.[cat.id] === 'TEMPORARILY_UNAVAILABLE' || d.fallback)) {
      categoryStatus = 'TEMPORARILY_UNAVAILABLE';
    }

    matrix[cat.id] = {
      id: cat.id,
      name: cat.name,
      enabled: isMainCategoryEnabled,
      status: categoryStatus,
      subcategories: subcategoryAnalysis,
      evidence: aggregatedEvidence,
      source: hasLiveSource ? 'google-places-new' : 'catalog-fallback',
      isRealTime: hasLiveSource
    };
  }

  return matrix;
};
