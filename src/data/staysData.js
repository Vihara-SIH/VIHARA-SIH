/**
 * VIHARA STAYS — Curated Heritage Hotels, Royal Havelis & Luxury Sanctuaries
 * 
 * Comprehensive luxury inventory for all major destinations in India
 * with rich multi-room configurations, amenities, coordinates, proximity to attractions,
 * and high-definition photography.
 */

export const HOTEL_CATEGORIES = [
  { id: 'all', label: 'All Curated Stays' },
  { id: 'heritage', label: 'Heritage Havelis' },
  { id: 'palace', label: 'Royal Palaces' },
  { id: 'coastal', label: 'Coastal Villas' },
  { id: 'nature', label: 'Plantation & Tea Estates' },
  { id: 'boutique', label: 'Boutique Sanctuaries' }
];

export const HOTELS_DATABASE = [
  // =========================================================================
  // GOA HOTELS (Exact from Stitch Project)
  // =========================================================================
  {
    id: 'heritage-goa-retreat',
    name: 'Heritage Goa Retreat & Villas',
    city: 'Goa',
    citySlug: 'goa',
    location: 'Bardez, North Goa (1.2 km from Baga Beach)',
    address: 'Survey No. 42/1, Arpora-Baga Road, Bardez, Goa 403516',
    coordinates: { lat: 15.5562, lng: 73.7656 },
    category: 'heritage',
    categoryLabel: 'Heritage Haveli',
    rating: 4.9,
    reviewCount: 328,
    badge: 'Top Itinerary Fit',
    pricePerNight: 4800,
    taxesAndFeesPercentage: 18,
    heritageCess: 1536,
    memberDiscount: 800,
    heroImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
    ],
    tagline: 'Aristocratic Portuguese Haveli Embraced by Palm Groves',
    description: 'A meticulously restored 18th-century Portuguese estate nestled amidst swaying palms and tranquil waterways in North Goa. Handcrafted oyster shell windows, terracotta balcãos, and lush private courtyard plunge pools blend colonial heritage with modern luxury hospitality.',
    heritageStory: 'Originally constructed in 1784 by a noble Portuguese trading family, this haveli preserves authentic Goan-Portuguese architecture featuring handcrafted wooden rafters, antique azulejos tiles, and private courtyards shaded by centenarian mango trees.',
    baseSmartMatchScore: 94,
    matchBreakdown: {
      locationFit: 95,
      budgetFit: 92,
      routeEfficiency: 96,
      heritageAuthenticity: 93
    },
    nearbyAttractions: [
      { name: 'Baga Beach', distance: '1.2 km', driveTime: '4 mins' },
      { name: 'Fort Aguada', distance: '8.5 km', driveTime: '15 mins' },
      { name: 'Panjim Latin Quarter (Fontainhas)', distance: '14 km', driveTime: '25 mins' },
      { name: 'Anjuna Flea Market', distance: '4.8 km', driveTime: '10 mins' }
    ],
    amenities: [
      { icon: 'pool', name: 'Private Plunge Pool & Lagoon' },
      { icon: 'restaurant', name: 'Royal Goan-Portuguese Dining' },
      { icon: 'spa', name: 'Ayurvedic & Aromatherapy Spa' },
      { icon: 'wifi', name: 'High-Speed Heritage WiFi' },
      { icon: 'local_bar', name: 'Sundowner Balcão Lounge' },
      { icon: 'ev_station', name: 'EV Charging Station' },
      { icon: 'directions_walk', name: 'Curated Heritage Walking Tour' },
      { icon: 'airport_shuttle', name: 'Goa Airport Chauffeur Transfer' }
    ],
    rooms: [
      {
        id: 'deluxe-portuguese-suite',
        name: 'Deluxe Portuguese Heritage Suite',
        tagline: 'King Bed • Garden & Courtyard View • Balcão Terrace',
        description: 'Spacious 550 sq.ft suite with antique teakwood four-poster bed, private balcão seating overlooking tranquil lotus ponds, and Italian marble rain shower.',
        pricePerNight: 4800,
        maxAdults: 2,
        maxChildren: 1,
        bedType: '1 Royal Teakwood King Bed',
        roomSize: '550 sq. ft (51 m²)',
        view: 'Tropical Courtyard & Lotus Pond',
        mealPlan: 'Artisanal Goan Breakfast Included',
        cancellationPolicy: 'Free cancellation until 24 hours before check-in. Instant full refund.',
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
        features: ['Teakwood King Bed', 'Private Balcão Terrace', 'Marble Rain Shower', 'Handcrafted Azulejos Decor', 'Espresso Bar', 'High-Speed WiFi']
      },
      {
        id: 'royal-balcao-villa',
        name: 'Royal Balcao Villa Pavilion',
        tagline: 'Private Plunge Pool • Palm Grove Sanctuary • Daybed',
        description: 'Ultra-luxurious 850 sq.ft standalone villa pavilion featuring private temperature-controlled plunge pool, open-air garden rain shower, and dedicated butler service.',
        pricePerNight: 7500,
        maxAdults: 3,
        maxChildren: 2,
        bedType: '1 King Bed + 1 Plush Daybed',
        roomSize: '850 sq. ft (79 m²)',
        view: 'Private Palm Sanctuary & Plunge Pool',
        mealPlan: 'Gourmet Breakfast & Sunset High Tea Included',
        cancellationPolicy: 'Free cancellation until 48 hours before check-in.',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        features: ['Private Plunge Pool', 'Open-air Rain Shower', 'Dedicated Butler Service', 'Sunset High Tea', 'Organic Herbal Toiletries', 'Complimentary Minibar']
      },
      {
        id: 'colonial-governors-suite',
        name: "Colonial Governor's Grand Suite",
        tagline: 'Master Suite + Living Salon • Arabian Sea Glimpse • Chauffeur',
        description: 'Palatial 1,200 sq.ft presidential residence with expansive living salon, dining room, wrap-around veranda, and complimentary luxury chauffeur airport transfers.',
        pricePerNight: 12000,
        maxAdults: 4,
        maxChildren: 2,
        bedType: '2 King Bedrooms',
        roomSize: '1,200 sq. ft (111 m²)',
        view: 'Panoramic Palm Grove & Distant Arabian Sea',
        mealPlan: 'All-inclusive Royal Dining & Fine Wines',
        cancellationPolicy: 'Free cancellation until 7 days before check-in.',
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
        features: ['Two Master Bedrooms', 'Private Dining Salon', 'Airport Chauffeur Included', 'Private Sunset Deck', 'Sommelier Wine Tasting', '24/7 Chef-on-Call']
      }
    ]
  },
  {
    id: 'casa-portuguesa-coastal',
    name: 'Casa Portuguesa Coastal Haven',
    city: 'Goa',
    citySlug: 'goa',
    location: 'Candolim Beach, North Goa (Direct Beach Access)',
    address: 'Near Candolim Chapel, Beach Road, Candolim, Goa 403515',
    coordinates: { lat: 15.5173, lng: 73.7663 },
    category: 'coastal',
    categoryLabel: 'Coastal Beachfront Villa',
    rating: 4.8,
    reviewCount: 245,
    badge: 'Direct Beach Access',
    pricePerNight: 6200,
    taxesAndFeesPercentage: 18,
    heritageCess: 1984,
    memberDiscount: 900,
    heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
    ],
    tagline: 'Sun-drenched Coastal Villa Steps from Golden Sands',
    description: 'Directly on Candolim shoreline, featuring terracotta roofs, private oceanfront cabanas, and fresh coastal seafood dining under swaying coconut canopies.',
    heritageStory: 'Originally a seaside merchant mansion from the 1890s, updated into a premier boutique coastal escape preserving classic Indo-Portuguese architecture.',
    baseSmartMatchScore: 89,
    matchBreakdown: {
      locationFit: 92,
      budgetFit: 86,
      routeEfficiency: 89,
      heritageAuthenticity: 90
    },
    nearbyAttractions: [
      { name: 'Candolim Beach', distance: '100 m', driveTime: '1 min walk' },
      { name: 'Fort Aguada', distance: '4.2 km', driveTime: '8 mins' },
      { name: 'Calangute Beach', distance: '3.5 km', driveTime: '7 mins' }
    ],
    amenities: [
      { icon: 'beach_access', name: 'Private Beach Access & Cabanas' },
      { icon: 'pool', name: 'Infinity Sea-facing Pool' },
      { icon: 'restaurant', name: 'Seafood Grill by the Waves' },
      { icon: 'wifi', name: 'High-Speed WiFi' },
      { icon: 'spa', name: 'Sea Salt Holistic Therapy' }
    ],
    rooms: [
      {
        id: 'coastal-deluxe-room',
        name: 'Oceanview Heritage Room',
        tagline: 'King Bed • Arabian Sea Breeze • Private Balcony',
        description: '450 sq.ft ocean-facing room with private breezy balcony and Portuguese hand-carved furniture.',
        pricePerNight: 6200,
        maxAdults: 2,
        maxChildren: 1,
        bedType: '1 King Bed',
        roomSize: '450 sq. ft',
        view: 'Arabian Sea & Sandy Dunes',
        mealPlan: 'Coastal Breakfast Included',
        cancellationPolicy: 'Free cancellation up to 48 hours prior to arrival.',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        features: ['Ocean Balcony', 'King Bed', 'Rain Shower', 'Espresso Machine']
      },
      {
        id: 'beachfront-villa-suite',
        name: 'Beachfront Private Villa Suite',
        tagline: 'Direct Sand Access • Private Jacuzzi • Sunset Deck',
        description: '780 sq.ft beachfront villa with direct sandy path to the waves and heated outdoor jacuzzi.',
        pricePerNight: 9800,
        maxAdults: 3,
        maxChildren: 2,
        bedType: '1 King Bed + 1 Rollaway',
        roomSize: '780 sq. ft',
        view: 'Direct Beachfront Panorama',
        mealPlan: 'Champagne Breakfast & Sunset Cocktails',
        cancellationPolicy: 'Free cancellation up to 72 hours prior.',
        image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
        features: ['Direct Beach Access', 'Private Jacuzzi', 'Sunset Deck', 'Complimentary Cocktails']
      }
    ]
  },
  {
    id: 'panjim-latin-quarter-house',
    name: 'Panjim Latin Quarter Heritage House',
    city: 'Goa',
    citySlug: 'goa',
    location: 'Fontainhas, Panjim (Historical Cultural District)',
    address: '31st January Road, Fontainhas, Panjim, Goa 403001',
    coordinates: { lat: 15.4989, lng: 73.8278 },
    category: 'boutique',
    categoryLabel: 'Fontainhas Heritage House',
    rating: 4.7,
    reviewCount: 198,
    badge: 'Fontainhas Walkable',
    pricePerNight: 3900,
    taxesAndFeesPercentage: 18,
    heritageCess: 1248,
    memberDiscount: 600,
    heroImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
    ],
    tagline: 'Vibrant Latin Quarter Charm in Historic Fontainhas',
    description: 'Immerse yourself in cobblestone alleys, pastel yellow walls, and authentic Goan bakeries located directly in the heart of UNESCO heritage zone Fontainhas.',
    heritageStory: 'A landmark colonial mansion built in 1860, meticulously restored with stained glass windows and antique Portuguese rosewood furnishings.',
    baseSmartMatchScore: 86,
    matchBreakdown: {
      locationFit: 88,
      budgetFit: 94,
      routeEfficiency: 85,
      heritageAuthenticity: 95
    },
    nearbyAttractions: [
      { name: 'Fontainhas Latin Quarter', distance: '0 m', driveTime: 'Step outside' },
      { name: 'Our Lady of the Immaculate Conception Church', distance: '650 m', driveTime: '8 mins walk' },
      { name: 'Mandovi River Cruise', distance: '1.1 km', driveTime: '4 mins' }
    ],
    amenities: [
      { icon: 'directions_walk', name: 'Complimentary Latin Quarter Walking Tour' },
      { icon: 'coffee', name: 'Artisan Portuguese Bakery & Café' },
      { icon: 'library_books', name: 'Heritage Library & Art Salon' },
      { icon: 'wifi', name: 'High-Speed WiFi' }
    ],
    rooms: [
      {
        id: 'fontainhas-classic-suite',
        name: 'Fontainhas Artisanal Suite',
        tagline: 'Pastel Street View • Antique Rosewood Bed • Artisan Breakfast',
        description: '380 sq.ft boutique room with view of cobblestone lanes and handcrafted wooden shutters.',
        pricePerNight: 3900,
        maxAdults: 2,
        maxChildren: 1,
        bedType: '1 Queen Bed',
        roomSize: '380 sq. ft',
        view: 'Historic Fontainhas Latin Quarter Alley',
        mealPlan: 'Fresh Portuguese Pão & Coffee Breakfast',
        cancellationPolicy: 'Free cancellation up to 24 hours prior to arrival.',
        image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
        features: ['Antique Rosewood Bed', 'Cobblestone Street View', 'Artisanal Breakfast', 'Free Walking Tour']
      }
    ]
  },
  {
    id: 'fort-aguada-royal-palms',
    name: 'Fort Aguada Royal Palms Resort',
    city: 'Goa',
    citySlug: 'goa',
    location: 'Sinquerim, Candolim (Overlooking Historic Portuguese Fort)',
    address: 'Sinquerim Beach, Candolim, Goa 403515',
    coordinates: { lat: 15.4925, lng: 73.7736 },
    category: 'palace',
    categoryLabel: 'Cliffside Heritage Resort',
    rating: 4.9,
    reviewCount: 412,
    badge: 'Historic Ramparts View',
    pricePerNight: 8500,
    taxesAndFeesPercentage: 18,
    heritageCess: 2720,
    memberDiscount: 1200,
    heroImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    tagline: 'Grand Coastal Ramparts Overlooking the Arabian Sea',
    description: 'Sprawled across 73 cliffside acres integrated with 16th-century Portuguese ramparts, offering breathtaking sunset panoramas and luxury royal pavilions.',
    heritageStory: 'Built alongside the historic 1612 Portuguese bastion that once defended maritime passage into Mandovi river.',
    baseSmartMatchScore: 92,
    matchBreakdown: {
      locationFit: 94,
      budgetFit: 84,
      routeEfficiency: 95,
      heritageAuthenticity: 96
    },
    nearbyAttractions: [
      { name: 'Fort Aguada Ramparts & Lighthouse', distance: '400 m', driveTime: '5 mins walk' },
      { name: 'Sinquerim Beach', distance: '200 m', driveTime: '2 mins walk' }
    ],
    amenities: [
      { icon: 'pool', name: 'Cliffside Infinity Pool' },
      { icon: 'spa', name: 'Jiva Royal Ayurvedic Spa' },
      { icon: 'restaurant', name: 'Il Vigneto & Coastal Fine Dining' },
      { icon: 'sports_tennis', name: 'Tennis & Squash Courts' },
      { icon: 'sailing', name: 'Private Sunset Catamaran Charter' }
    ],
    rooms: [
      {
        id: 'rampart-sea-view-room',
        name: 'Fort Rampart Sea-View Pavilion',
        tagline: 'King Bed • 180° Arabian Sea Panorama • Private Terrace',
        description: '520 sq.ft cliff pavilion with unobstructed 180-degree ocean horizon views.',
        pricePerNight: 8500,
        maxAdults: 2,
        maxChildren: 1,
        bedType: '1 King Bed',
        roomSize: '520 sq. ft',
        view: '180° Sea Panorama & Historic Fort',
        mealPlan: 'Grand Buffet Breakfast Included',
        cancellationPolicy: 'Free cancellation up to 48 hours prior to arrival.',
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
        features: ['Panoramic Sea Terrace', 'King Bed', 'Marble Bath with Tub', 'Private Butler Option']
      }
    ]
  },

  // =========================================================================
  // HYDERABAD HOTELS
  // =========================================================================
  {
    id: 'taj-falaknuma-palace',
    name: 'Taj Falaknuma Palace',
    city: 'Hyderabad',
    citySlug: 'hyderabad',
    location: 'Engine Bowli, Falaknuma, Hyderabad (2,000 ft above City)',
    address: 'Engine Bowli, Falaknuma, Hyderabad, Telangana 500053',
    coordinates: { lat: 17.3314, lng: 78.4678 },
    category: 'palace',
    categoryLabel: 'Royal Nizam Palace',
    rating: 5.0,
    reviewCount: 520,
    badge: 'Royal Nizam Experience',
    pricePerNight: 32000,
    taxesAndFeesPercentage: 18,
    heritageCess: 10240,
    memberDiscount: 3500,
    heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    tagline: 'Mirror of the Sky — The Former Palace of the Paigah Nizam',
    description: 'Perched 2,000 feet above the royal city of Hyderabad, arrive by horse-drawn carriage and experience pure grandeur with Italian marble staircases, Venetian chandeliers, and Nizami royal banquets.',
    heritageStory: 'Completed in 1893 by Nawab Sir Vikar-ul-Umra, this scorpion-shaped marble palace housed the world-renowned treasures of the 6th and 7th Nizams of Hyderabad.',
    baseSmartMatchScore: 96,
    matchBreakdown: {
      locationFit: 95,
      budgetFit: 90,
      routeEfficiency: 96,
      heritageAuthenticity: 99
    },
    nearbyAttractions: [
      { name: 'Charminar & Laad Bazaar', distance: '4.5 km', driveTime: '12 mins' },
      { name: 'Chowmahalla Palace', distance: '4.1 km', driveTime: '10 mins' },
      { name: 'Golconda Fort', distance: '13 km', driveTime: '28 mins' }
    ],
    amenities: [
      { icon: 'directions_transit', name: 'Horse-drawn Royal Carriage Entry' },
      { icon: 'restaurant', name: 'Adaa Authentic Nizami Royal Dining' },
      { icon: 'menu_book', name: 'Historic Nizam Library & Billiard Room' },
      { icon: 'spa', name: 'Jiva Royal Palace Spa' }
    ],
    rooms: [
      {
        id: 'palace-room-historical',
        name: 'Palace Historical Room',
        tagline: 'Courtyard View • Authentic Colonial Antiques • Heritage Butler',
        description: '500 sq.ft room with period furniture, high ceilings, and royal palace garden views.',
        pricePerNight: 32000,
        maxAdults: 2,
        maxChildren: 1,
        bedType: '1 Royal King Bed',
        roomSize: '500 sq. ft',
        view: 'Palace Courtyard & City Lights',
        mealPlan: 'Royal Nizami Breakfast & Palace Heritage Tour Included',
        cancellationPolicy: 'Free cancellation up to 7 days prior to arrival.',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        features: ['Carriage Entry', 'Palace Tour', 'Butler Service', 'Nizami Breakfast']
      }
    ]
  },

  // =========================================================================
  // JAIPUR HOTELS
  // =========================================================================
  {
    id: 'rambagh-palace-jaipur',
    name: 'Rambagh Palace Jaipur',
    city: 'Jaipur',
    citySlug: 'jaipur',
    location: 'Bhawani Singh Road, Jaipur (Jewel of Rajasthan)',
    address: 'Bhawani Singh Rd, Rambagh, Jaipur, Rajasthan 302005',
    coordinates: { lat: 26.8974, lng: 75.8078 },
    category: 'palace',
    categoryLabel: 'Royal Rajput Palace',
    rating: 4.9,
    reviewCount: 480,
    badge: 'Jewel of Jaipur',
    pricePerNight: 28000,
    taxesAndFeesPercentage: 18,
    heritageCess: 8960,
    memberDiscount: 3000,
    heroImage: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    tagline: 'Former Residence of the Maharaja of Jaipur',
    description: 'Known as the "Jewel of Jaipur", this 47-acre manicured royal garden palace showcases intricate marble jalis, sandstone corridors, and peacock-filled lawns.',
    heritageStory: 'Originally constructed in 1835 as the royal residence of Maharaja Sawai Man Singh II and Maharani Gayatri Devi.',
    baseSmartMatchScore: 93,
    matchBreakdown: {
      locationFit: 94,
      budgetFit: 88,
      routeEfficiency: 92,
      heritageAuthenticity: 98
    },
    nearbyAttractions: [
      { name: 'City Palace & Hawa Mahal', distance: '4.8 km', driveTime: '12 mins' },
      { name: 'Amer Fort', distance: '14 km', driveTime: '30 mins' },
      { name: 'Jantar Mantar', distance: '5 km', driveTime: '14 mins' }
    ],
    amenities: [
      { icon: 'park', name: '47 Acres of Mughal Royal Gardens' },
      { icon: 'restaurant', name: 'Suvarna Mahal Fine Dining' },
      { icon: 'pool', name: 'Indoor & Outdoor Royal Swimming Pools' },
      { icon: 'spa', name: 'Holistic Ayurvedic Spa' }
    ],
    rooms: [
      {
        id: 'palace-garden-room',
        name: 'Palace Garden View Room',
        tagline: 'King Bed • Mughal Garden View • Rajput Heritage Decor',
        description: '550 sq.ft room with intricate Rajasthani artwork and rich silk fabrics.',
        pricePerNight: 28000,
        maxAdults: 2,
        maxChildren: 1,
        bedType: '1 King Bed',
        roomSize: '550 sq. ft',
        view: 'Manicured Mughal Gardens & Peacocks',
        mealPlan: 'Royal Breakfast Buffet Included',
        cancellationPolicy: 'Free cancellation up to 5 days prior to arrival.',
        image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
        features: ['Mughal Garden View', 'Silk Upholstery', 'Marble Bath', 'Royal Breakfast']
      }
    ]
  },

  // =========================================================================
  // DELHI HOTELS
  // =========================================================================
  {
    id: 'the-imperial-new-delhi',
    name: 'The Imperial New Delhi',
    city: 'Delhi',
    citySlug: 'delhi',
    location: 'Janpath, Connaught Place, New Delhi',
    address: 'Janpath Lane, Connaught Place, New Delhi 110001',
    coordinates: { lat: 28.6226, lng: 77.2185 },
    category: 'heritage',
    categoryLabel: 'Colonial 5-Star Hotel',
    rating: 4.9,
    reviewCount: 390,
    badge: 'Art Deco Landmark',
    pricePerNight: 14500,
    taxesAndFeesPercentage: 18,
    heritageCess: 4640,
    memberDiscount: 1500,
    heroImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    tagline: 'Iconic Art Deco Grandeur in the Heart of the Capital',
    description: 'Surrounded by 8 acres of lush royal palm gardens, boasting an unparalleled museum collection of colonial and British-Indian artwork.',
    heritageStory: 'Inaugurated in 1936 by Lord Willingdon, The Imperial has hosted monarchs, heads of state, and historic independence talks.',
    baseSmartMatchScore: 91,
    matchBreakdown: {
      locationFit: 96,
      budgetFit: 90,
      routeEfficiency: 93,
      heritageAuthenticity: 94
    },
    nearbyAttractions: [
      { name: 'India Gate', distance: '2.1 km', driveTime: '6 mins' },
      { name: 'Red Fort & Chandni Chowk', distance: '5.2 km', driveTime: '15 mins' },
      { name: 'Qutub Minar', distance: '12 km', driveTime: '25 mins' }
    ],
    amenities: [
      { icon: 'museum', name: 'Private 5,000+ Piece Art Collection' },
      { icon: 'pool', name: 'Royal Palm Swimming Pool' },
      { icon: 'restaurant', name: 'Spice Route Southeast Asian Fine Dining' },
      { icon: 'spa', name: 'Imperial Spa & Wellness' }
    ],
    rooms: [
      {
        id: 'imperial-heritage-room',
        name: 'Imperial Heritage Room',
        tagline: 'King Bed • High Ceilings • Italian Marble Bath',
        description: '480 sq.ft room with teakwood writing desk, high ceilings, and French linen bedding.',
        pricePerNight: 14500,
        maxAdults: 2,
        maxChildren: 1,
        bedType: '1 King Bed',
        roomSize: '480 sq. ft',
        view: 'Royal Palm Gardens',
        mealPlan: 'Grand Breakfast at 1911 Restaurant',
        cancellationPolicy: 'Free cancellation up to 48 hours prior.',
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
        features: ['High Ceilings', 'Art Deco Furnishings', 'Italian Marble Bath', '1911 Breakfast']
      }
    ]
  },

  // =========================================================================
  // UDAIPUR HOTELS
  // =========================================================================
  {
    id: 'taj-lake-palace-udaipur',
    name: 'Taj Lake Palace Udaipur',
    city: 'Udaipur',
    citySlug: 'udaipur',
    location: 'Lake Pichola, Udaipur (Floating Island Palace)',
    address: 'Pichola, Udaipur, Rajasthan 313001',
    coordinates: { lat: 24.5754, lng: 73.6802 },
    category: 'palace',
    categoryLabel: 'Island Marble Palace',
    rating: 5.0,
    reviewCount: 610,
    badge: 'Floating Island Wonder',
    pricePerNight: 36000,
    taxesAndFeesPercentage: 18,
    heritageCess: 11520,
    memberDiscount: 4000,
    heroImage: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=1200&q=80'
    ],
    tagline: 'White Marble Island Sanctuary on Calm Waters of Lake Pichola',
    description: 'Accessible exclusively by private royal speedboats, this 275-year-old white marble palace appears to float magically upon Lake Pichola.',
    heritageStory: 'Built between 1743 and 1746 by Maharana Jagat Singh II as a royal pleasure palace (Jag Niwas).',
    baseSmartMatchScore: 95,
    matchBreakdown: {
      locationFit: 97,
      budgetFit: 88,
      routeEfficiency: 95,
      heritageAuthenticity: 99
    },
    nearbyAttractions: [
      { name: 'City Palace Udaipur', distance: '600 m (Boat Transfer)', driveTime: '5 mins boat' },
      { name: 'Jagdish Temple', distance: '1.2 km', driveTime: '10 mins' },
      { name: 'Saheliyon Ki Bari', distance: '4.5 km', driveTime: '15 mins' }
    ],
    amenities: [
      { icon: 'directions_boat', name: 'Private Royal Boat Transfers' },
      { icon: 'spa', name: 'Jiva Spa Boat on Lake Pichola' },
      { icon: 'restaurant', name: 'Bhairon Rooftop Fine Dining' },
      { icon: 'pool', name: 'Lily Pond Swimming Pool' }
    ],
    rooms: [
      {
        id: 'lake-view-palace-room',
        name: 'Palace Lake View Room',
        tagline: 'Direct Lake Pichola View • Intricate Frescoes • Butler',
        description: '450 sq.ft marble sanctuary overlooking City Palace and the surrounding Aravalli hills.',
        pricePerNight: 36000,
        maxAdults: 2,
        maxChildren: 1,
        bedType: '1 King Bed',
        roomSize: '450 sq. ft',
        view: 'Lake Pichola & City Palace Waterfront',
        mealPlan: 'Royal Breakfast on Mewar Terrace',
        cancellationPolicy: 'Free cancellation up to 7 days prior.',
        image: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
        features: ['Lake Pichola View', 'Boat Transfer Included', 'Frescoes & Carved Marble', 'Royal Butler']
      }
    ]
  }
];

export default HOTELS_DATABASE;
