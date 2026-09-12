// Centralized Cultural Events Data for VIHARA Events Nearby Discovery Ecosystem
// Matching Stitch Project 143032438011426103 Specifications

export const CULTURAL_GENRES = [
  { id: 'all', label: 'All Experiences', icon: 'auto_awesome' },
  { id: 'classical_sufi', label: 'Classical & Sufi', icon: 'music_note' },
  { id: 'culinary', label: 'Royal Culinary & Dawat', icon: 'restaurant' },
  { id: 'heritage_walks', label: 'Heritage Walks & Tales', icon: 'explore' },
  { id: 'artisan_crafts', label: 'Artisan Crafts & Weaves', icon: 'palette' },
  { id: 'folk_theatre', label: 'Folk & Dastangoi', icon: 'theater_comedy' },
  { id: 'spiritual', label: 'Spiritual Ceremonies', icon: 'temple_hindu' }
];

export const EVENT_FORMATS = [
  { id: 'seated_baithak', label: 'Seated Courtyard Baithak' },
  { id: 'walking_trail', label: 'Night Heritage Walking Tour' },
  { id: 'interactive_masterclass', label: 'Hands-on Artisan Masterclass' },
  { id: 'open_air_concert', label: 'Moonlit Open-Air Concert' },
  { id: 'spiritual_ceremony', label: 'Riverside Spiritual Ritual' }
];

export const EVENTS_CATALOG = [
  {
    id: 'evt_sufi_qawwali',
    title: 'Sacred Echoes: Live Sufi & Qawwali Night',
    subtitle: 'Chowmahalla Palace Courtyard Mehfil',
    city: 'Hyderabad',
    cityNormalized: 'hyderabad',
    genre: 'classical_sufi',
    genreLabel: 'Classical & Sufi',
    format: 'seated_baithak',
    venue: 'Chowmahalla Palace Inner Courtyard',
    address: 'Khilwat, Motigalli, Old City, Hyderabad, Telangana 500002',
    coordinates: { lat: 17.3581, lng: 78.4716 },
    distanceKm: 0.8,
    timeDuration: '8 mins from your location',
    date: 'Saturday, 14 Sep',
    dateIso: '2026-09-14',
    timeSlot: '6:30 PM – 10:00 PM',
    durationHours: 3.5,
    priceStarting: 1200,
    rating: 4.95,
    reviewsCount: 142,
    badge: '98% Itinerary Match',
    badgeType: 'secondary', // Emerald curation
    itinerarySlotFit: 'Fits Day 2 evening window (6:30 PM - 10:00 PM)',
    hotelProximityNote: '1.2 km from Taj Falaknuma / Charminar corridor',
    heroImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
    ],
    about: 'An exclusive candlelit Sufi gathering in the marble-lined courtyard of Chowmahalla Palace. Under ancient Belgian crystal chandeliers and starlit skies, the Nizami Sufi Ensemble performs legendary kalaams of Amir Khusrau, Baba Bulleh Shah, and Rumi, accompanied by harmonium, tabla, and traditional dholak.',
    culturalSignificance: 'Chowmahalla Palace was the seat of the Asaf Jahi dynasty. The Mehfil preserves the royal court tradition where music, poetry, and hospitality converged as a spiritual and civic art.',
    dressCode: 'Smart Ethnic / Traditional Indian attire recommended (Kurta-Pyjama, Saree, Indo-Western). Shoes removed at the carpet threshold.',
    schedule: [
      { time: '6:30 PM', title: 'Arrival & Welcome Sharbat Ceremony', desc: 'Gulab Sharbat & Attar greeting in the Khilwat Mubarak colonnade' },
      { time: '7:00 PM', title: 'Introductory Raga Recital', desc: 'Sitar & Tanpura invocation as twilight settles over the palace fountains' },
      { time: '8:00 PM', title: 'Grand Qawwali & Kalaam Crescendo', desc: 'Live multi-vocal sufi performance with audience participation in the baithak' },
      { time: '9:45 PM', title: 'Shahi Dastarkhan Herbal Tea & Confection', desc: 'Paan and Irani chai served with traditional Osmania biscuits' }
    ],
    inclusions: [
      'Reserved bolster seating (Gaddi & Masnad) in selected tier',
      'Traditional rose petal & pure sandalwood attar welcome',
      'Artisanal Nizami refreshment box & beverage service',
      'Exclusive post-concert courtyard photo access'
    ],
    protocols: [
      'Traditional carpeted seating; cushioned backrests provided',
      'Footwear repository with secure token at palace gateway',
      'Flash photography prohibited during vocal renditions'
    ],
    curator: {
      name: 'Ustad Tariq Warsi & Nizami Brothers',
      title: '7th Generation Dargah Qawwals of Deccan',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Direct descendants of the court musicians to the 6th Nizam of Hyderabad, recognized internationally for preserving archaic Deccani Sufi compositions.'
    },
    tiers: [
      {
        id: 'tier_baithak',
        name: 'Dastarkhan Baithak Pass',
        price: 1200,
        desc: 'Traditional seated floor cushions on Persian rugs with full acoustic clarity and welcome sharbat.',
        badge: 'Popular',
        availableSeats: 24
      },
      {
        id: 'tier_diwan',
        name: 'Royal Diwan Front Row',
        price: 2400,
        desc: 'Front row plush velvet diwans with dedicated attendant, attar box, and royal sweet tasting.',
        badge: 'Best View',
        availableSeats: 8
      },
      {
        id: 'tier_vip_walk',
        name: 'Baithak & Curator Palace Walk',
        price: 3600,
        desc: 'Includes 45-min private historical tour of private palace chambers with historian before the mehfil.',
        badge: 'All-Inclusive VIP',
        availableSeats: 4
      }
    ],
    reviews: [
      { author: 'Meera Deshmukh', rating: 5, date: '2 weeks ago', comment: 'Transcendental evening. The acoustics of the open courtyard combined with the chandeliers made it unforgettable.' },
      { author: 'Arjun Sen', rating: 5, date: 'Last month', comment: 'Seamless fit into our Hyderabad trip after visiting Charminar. The VIP walk gave so much context.' }
    ]
  },
  {
    id: 'evt_dastangoi_walk',
    title: 'Deccani Dastangoi & Midnight Food Trail',
    subtitle: 'Old City Heritage Gate & Charminar',
    city: 'Hyderabad',
    cityNormalized: 'hyderabad',
    genre: 'folk_theatre',
    genreLabel: 'Folk & Dastangoi',
    format: 'walking_trail',
    venue: 'Madina Junction & Charminar Precinct',
    address: 'Char Kaman, Ghansi Bazaar, Hyderabad, Telangana 500002',
    coordinates: { lat: 17.3616, lng: 78.4747 },
    distanceKm: 1.2,
    timeDuration: '10 mins away',
    date: 'Saturday, 14 Sep',
    dateIso: '2026-09-14',
    timeSlot: '9:30 PM – 12:30 AM',
    durationHours: 3.0,
    priceStarting: 1450,
    rating: 4.9,
    reviewsCount: 98,
    badge: 'Night Experience',
    badgeType: 'tertiary',
    itinerarySlotFit: 'Complements post-dinner cultural exploration',
    hotelProximityNote: 'Walking distance from historic Old City quarters',
    heroImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
    ],
    about: 'Step into the 16th-century oral storytelling art of Dastangoi beneath the illuminated arches of Char Kaman, followed by a curated tasting journey through century-old Haleem, Dum Biryani, and handmade Khubani ka Meetha stalls.',
    culturalSignificance: 'Dastangoi was the ancient Persian and Urdu art form of oral epic storytelling, revived now in the very bazaars where Qutb Shahi courtiers once walked.',
    dressCode: 'Comfortable walking shoes and modest street-smart attire.',
    schedule: [
      { time: '9:30 PM', title: 'Gathering at Kali Kaman Gate', desc: 'Introduction to Deccani folklore and historical topography' },
      { time: '10:15 PM', title: 'Live Dastangoi Tale Recital', desc: '35-minute dramatic storytelling of the Legend of Bhagmati' },
      { time: '11:00 PM', title: 'Culinary Trail & Heritage Kitchens', desc: 'Tasting authentic wood-fired kebabs, marag, and dum biryani' },
      { time: '12:15 AM', title: 'Midnight Irani Chai & Osmania Biscuit Finale', desc: 'Reflection under the midnight glow of illuminated Charminar' }
    ],
    inclusions: [
      'Guided walking trail with certified heritage historian',
      'Live Dastangoi theatrical storytelling performance',
      'All culinary tastings (4 iconic street heritage stops + tea/dessert)',
      'Hygiene-verified bottled water and sanitisers'
    ],
    protocols: [
      'Group pace maintained; moderate walking over historic cobblestones',
      'Vegetarian and non-vegetarian tasting portions clearly segregated'
    ],
    curator: {
      name: 'Syed Mohammed & The Old City Guild',
      title: 'Heritage Chronicler & Food Historian',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Author of Heritage of Hyderabad and veteran culinary archivist with over 15 years leading night heritage explorations.'
    },
    tiers: [
      {
        id: 'tier_standard_trail',
        name: 'Storytelling & Food Trail Pass',
        price: 1450,
        desc: 'Complete guided trail including live Dastangoi performance and all 4 culinary tastings.',
        badge: 'Recommended',
        availableSeats: 16
      },
      {
        id: 'tier_vip_trail',
        name: 'Private Heritage Group Pass (Up to 4 Guests)',
        price: 5200,
        desc: 'Dedicated storyteller and customized dietary tastings for your private party.',
        badge: 'Private Group',
        availableSeats: 2
      }
    ],
    reviews: [
      { author: 'Vikram Seth', rating: 5, date: '1 week ago', comment: 'The combination of high literature and nocturnal street food was pure magic. Unbeatable vibes.' }
    ]
  },
  {
    id: 'evt_baithak_indie',
    title: 'Acoustic Baithak & Indie Sufi Fusion',
    subtitle: 'Taramati Baradari Moonlit Concert',
    city: 'Hyderabad',
    cityNormalized: 'hyderabad',
    genre: 'classical_sufi',
    genreLabel: 'Classical & Sufi',
    format: 'open_air_concert',
    venue: 'Taramati Baradari Open Pavilion',
    address: 'Near Golconda Fort, Ibrahim Bagh, Hyderabad, Telangana 500031',
    coordinates: { lat: 17.3789, lng: 78.3752 },
    distanceKm: 6.5,
    timeDuration: '20 mins away',
    date: 'Sunday, 15 Sep',
    dateIso: '2026-09-15',
    timeSlot: '7:00 PM – 10:30 PM',
    durationHours: 3.5,
    priceStarting: 999,
    rating: 4.88,
    reviewsCount: 76,
    badge: 'Open-Air Heritage',
    badgeType: 'secondary',
    itinerarySlotFit: 'Perfect finale for Day 3 after Golconda sunset',
    hotelProximityNote: 'Scenic hillside drive from Hitec City / Jubilee Hills',
    heroImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
    ],
    about: 'Experience sunset acoustics at the legendary pavilion built for courtesan Taramati. Featuring acoustic guitars, cello, sarod, and soaring Sufi vocals echoing through the 12-door arched stone monument.',
    culturalSignificance: 'Built by Ibrahim Qutb Shah, the Baradari is celebrated for its natural acoustic design which carried whispers across kilometers to Golconda Fort.',
    dressCode: 'Casual Smart / Evening warmth layers.',
    schedule: [
      { time: '7:00 PM', title: 'Moonrise Gathering & Seating', desc: 'Twilight drinks and live acoustic warm-up' },
      { time: '7:45 PM', title: 'Sarod & Acoustic Guitar Duet', desc: 'Blending classical raags with Mediterranean melodies' },
      { time: '9:00 PM', title: 'Main Indie Sufi Ensemble', desc: 'Contemporary renditions of timeless devotional poetry' }
    ],
    inclusions: [
      'Tiered amphitheater / floor cushion seating',
      'Heritage welcome mocktail',
      'Access to sunset photo-deck over Golconda'
    ],
    protocols: [
      'Seating first-come within designated tier zone',
      'Open-air natural acoustics'
    ],
    curator: {
      name: 'Deccan Soundscapes Collective',
      title: 'Cross-Genre Music Curators',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
      bio: 'Leading musical pioneers bridging traditional Indian instruments with contemporary ambient arrangements.'
    },
    tiers: [
      {
        id: 'tier_general',
        name: 'Pavilion Cushion Pass',
        price: 999,
        desc: 'Cushioned amphitheater seating with full 360-degree acoustic immersion.',
        badge: 'Great Value',
        availableSeats: 35
      },
      {
        id: 'tier_front_terrace',
        name: 'Front Balcony Starlight Seat',
        price: 1850,
        desc: 'Elevated front row seat overlooking the stage and moonlit Golconda skyline.',
        badge: 'Panoramic',
        availableSeats: 12
      }
    ],
    reviews: [
      { author: 'Ananya Roy', rating: 5, date: '3 weeks ago', comment: 'The natural echo of Taramati Baradari with live cello and sarod was ethereal.' }
    ]
  },
  {
    id: 'evt_royal_dawat',
    title: 'The Royal Nizami Dawat & Masterclass',
    subtitle: 'Falaknuma Culinary Terrace',
    city: 'Hyderabad',
    cityNormalized: 'hyderabad',
    genre: 'culinary',
    genreLabel: 'Royal Culinary & Dawat',
    format: 'interactive_masterclass',
    venue: 'Taj Falaknuma Palace Culinary Terrace',
    address: 'Engine Bowli, Fatima Nagar, Falaknuma, Hyderabad, Telangana 500053',
    coordinates: { lat: 17.3314, lng: 78.4678 },
    distanceKm: 3.8,
    timeDuration: '15 mins away',
    date: 'Sunday, 15 Sep',
    dateIso: '2026-09-15',
    timeSlot: '12:30 PM – 4:00 PM',
    durationHours: 3.5,
    priceStarting: 3200,
    rating: 4.97,
    reviewsCount: 114,
    badge: 'Exclusive Culinary',
    badgeType: 'tertiary',
    itinerarySlotFit: 'Ideal gourmet lunch highlight during your stay',
    hotelProximityNote: 'Hosted at the iconic scorpion-shaped palace in clouds',
    heroImage: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
    ],
    about: 'Learn the secret spices of royal Asaf Jahi banquets from master Khansamas. Enjoy a 7-course curated silver-service Dawat featuring slow-cooked Kacchi Dum Biryani, Mirchi ka Salan, and Shahi Tukda under shaded palace canopies.',
    culturalSignificance: 'Nizami cuisine represents one of India’s most sophisticated royal food traditions, fusing Mughlai, Turkish, and Arabic influences with regional Telugu spice profiles.',
    dressCode: 'Formal / Royal Elegant attire required.',
    schedule: [
      { time: '12:30 PM', title: 'Horse Carriage Arrival & Welcome Sharbat', desc: 'Ascend the palace driveway in heritage carriage' },
      { time: '1:15 PM', title: 'Spice Alchemy & Dum Cooking Masterclass', desc: 'Interactive live demonstration of pot sealing with dough' },
      { time: '2:15 PM', title: '7-Course Silver Dastarkhan Feast', desc: 'Authentic royal lunch served on monogrammed china' }
    ],
    inclusions: [
      'Royal horse-drawn buggy transfer from palace gate',
      'Full 7-course Nizami silver dining service',
      'Take-home handcrafted pot of secret royal Potli Masala'
    ],
    protocols: [
      'Prior reservation mandatory; strict table etiquette applies'
    ],
    curator: {
      name: 'Chef Ustad Moinuddin & Falaknuma Khansamas',
      title: 'Keeper of Asaf Jahi Royal Recipes',
      avatar: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=300&q=80',
      bio: 'Master chef with 30 years preserving the private kitchen archives of the Hyderabad Nizams.'
    },
    tiers: [
      {
        id: 'tier_dawat_standard',
        name: 'Royal Dawat Dining Pass',
        price: 3200,
        desc: 'Includes 7-course silver service feast and horse carriage arrival.',
        badge: 'Signature',
        availableSeats: 10
      },
      {
        id: 'tier_dawat_masterclass',
        name: 'Masterclass + Feast + Spice Kit',
        price: 4800,
        desc: 'Hands-on kitchen access with Master Chef, private silver service, and recipe journal.',
        badge: 'Master Chef VIP',
        availableSeats: 4
      }
    ],
    reviews: [
      { author: 'Rohit Kulkarni', rating: 5, date: '1 month ago', comment: 'Worth every rupee. The horse carriage ride and the Dum Biryani aroma were celestial.' }
    ]
  },
  {
    id: 'evt_ikat_indigo',
    title: 'Telangana Ikat Weaves & Natural Indigo Workshop',
    subtitle: 'Kalakriti Art Gallery & Studio',
    city: 'Hyderabad',
    cityNormalized: 'hyderabad',
    genre: 'artisan_crafts',
    genreLabel: 'Artisan Crafts & Weaves',
    format: 'interactive_masterclass',
    venue: 'Kalakriti Contemporary Gallery',
    address: 'Road No 10, Banjara Hills, Hyderabad, Telangana 500034',
    coordinates: { lat: 17.4326, lng: 78.4419 },
    distanceKm: 2.4,
    timeDuration: '12 mins away',
    date: 'Saturday, 14 Sep',
    dateIso: '2026-09-14',
    timeSlot: '3:00 PM – 5:30 PM',
    durationHours: 2.5,
    priceStarting: 750,
    rating: 4.85,
    reviewsCount: 52,
    badge: 'Artisan Craft',
    badgeType: 'secondary',
    itinerarySlotFit: 'Great afternoon creative retreat before evening mehfil',
    hotelProximityNote: 'Located in the heart of Banjara Hills culture hub',
    heroImage: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
    ],
    about: 'Learn the ancient resist-dyeing precision of Pochampally double Ikat. Under master handloom weavers, dip natural organic cotton stoles into fermented indigo vats and take home your self-crafted textile.',
    culturalSignificance: 'Pochampally Ikat was the first Indian handloom craft to receive Geographical Indication (GI) status in 2005.',
    dressCode: 'Casual clothing; apron provided for dyeing.',
    schedule: [
      { time: '3:00 PM', title: 'Gallery Walk & Loom Demonstration', desc: 'Understanding the mathematics of warp and weft alignment' },
      { time: '3:45 PM', title: 'Tying, Folding & Natural Indigo Dipping', desc: 'Hands-on dip dyeing in 3-year organic indigo vats' },
      { time: '5:00 PM', title: 'Drying, Unraveling & Chai Circle', desc: 'Displaying finished pieces and artisan dialogue' }
    ],
    inclusions: [
      'Premium mulberry silk/cotton stole for dyeing',
      'All organic natural dyes, materials, and protective gear',
      'Artisan certification certificate'
    ],
    protocols: [
      'Natural vegetable dyes used; skin safe'
    ],
    curator: {
      name: 'Sridhar & Padmavathi Pochampally',
      title: 'National Award Winning Master Weavers',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      bio: 'Pioneers of revival double-ikat textiles with works displayed in Victoria and Albert Museum.'
    },
    tiers: [
      {
        id: 'tier_workshop_standard',
        name: 'Artisan Workshop & Silk Stole',
        price: 750,
        desc: 'Complete 2.5-hour workshop including all materials and finished wearable stole.',
        badge: 'Popular',
        availableSeats: 18
      }
    ],
    reviews: [
      { author: 'Kavita Menon', rating: 5, date: 'Last week', comment: 'Insightful, therapeutic, and deeply educational. The master weavers are legends.' }
    ]
  },
  {
    id: 'evt_charminar_photo',
    title: 'Charminar Night Heritage Photo-Walk',
    subtitle: 'Laad Bazaar & Charkaman Golden Hour',
    city: 'Hyderabad',
    cityNormalized: 'hyderabad',
    genre: 'heritage_walks',
    genreLabel: 'Heritage Walks & Tales',
    format: 'walking_trail',
    venue: 'Charminar East Gate Fountain',
    address: 'Charminar, Hyderabad, Telangana 500002',
    coordinates: { lat: 17.3616, lng: 78.4747 },
    distanceKm: 1.0,
    timeDuration: '8 mins away',
    date: 'Sunday, 15 Sep',
    dateIso: '2026-09-15',
    timeSlot: '5:30 PM – 8:00 PM',
    durationHours: 2.5,
    priceStarting: 650,
    rating: 4.89,
    reviewsCount: 88,
    badge: 'Photo Trail',
    badgeType: 'secondary',
    itinerarySlotFit: 'Sunset twilight lighting over monument arches',
    hotelProximityNote: 'Old City landmark district',
    heroImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80'
    ],
    about: 'Capture the golden light washing over 430-year-old stucco minarets. Learn camera angles for low-light bustling bazaar street portraits from a published National Geographic contributor.',
    culturalSignificance: 'Built in 1591 by Muhammad Quli Qutb Shah to commemorate the cessation of plague and mark the founding of Hyderabad.',
    dressCode: 'Comfortable footwear; DSLR or flagship smartphone camera.',
    schedule: [
      { time: '5:30 PM', title: 'Briefing on Low-Light Heritage Framing', desc: 'Aperture, framing lines, and monument symmetry' },
      { time: '6:15 PM', title: 'Golden Hour Silhouette Shoots', desc: 'Capturing flight of pigeons over minaret domes' },
      { time: '7:15 PM', title: 'Bangle Market Light Streaks & Portraits', desc: 'Long-exposure night portraits in Laad Bazaar' }
    ],
    inclusions: [
      'Expert guidance by documentary photographer',
      'Photo critique session over Irani Chai at Nimrah Cafe',
      'Curated list of secret rooftop shooting locations'
    ],
    protocols: [
      'Tripods allowed at designated vantage perimeters'
    ],
    curator: {
      name: 'Feroz Khan',
      title: 'Documentary Architectural Photographer',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80',
      bio: 'Editorial photographer with works featured in Architectural Digest and Lonely Planet.'
    },
    tiers: [
      {
        id: 'tier_photo_pass',
        name: 'Photo-Walk Delegate Pass',
        price: 650,
        desc: 'Includes guided tour, rooftop access permissions, and tea tasting.',
        badge: 'Best for Creatives',
        availableSeats: 12
      }
    ],
    reviews: [
      { author: 'Tanmay Joshi', rating: 5, date: '2 weeks ago', comment: 'Got shots of Charminar I never thought possible. Secret rooftop spots alone are worth it!' }
    ]
  },
  {
    id: 'evt_ganga_aarti',
    title: 'Maha Ganga Aarti & Vedic Chanting VIP Experience',
    subtitle: 'Dashashwamedh Ghat Riverfront Bajra',
    city: 'Varanasi',
    cityNormalized: 'varanasi',
    genre: 'spiritual',
    genreLabel: 'Spiritual Ceremonies',
    format: 'spiritual_ceremony',
    venue: 'Dashashwamedh Ghat Riverfront',
    address: 'Dashashwamedh Ghat, Varanasi, Uttar Pradesh 221001',
    coordinates: { lat: 25.3076, lng: 83.0107 },
    distanceKm: 0.5,
    timeDuration: '5 mins from river hotel',
    date: 'Daily at Sunset',
    dateIso: '2026-09-14',
    timeSlot: '5:45 PM – 8:15 PM',
    durationHours: 2.5,
    priceStarting: 500,
    rating: 4.98,
    reviewsCount: 312,
    badge: 'Spiritual Masterpiece',
    badgeType: 'secondary',
    itinerarySlotFit: 'Essential evening pinnacle of any Varanasi journey',
    hotelProximityNote: 'Private boat boarding from Assi or Dashashwamedh ghats',
    heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80'
    ],
    about: 'Witness the iconic evening ritual where young priests raise multi-tiered brass lamps to the sacred river Ganga. Seated on a private cushioned wooden Bajra boat right before the altar platforms, experience synchronous Vedic conch blowing and devotional chants.',
    culturalSignificance: 'One of the oldest continuously performed water worship ceremonies in living human civilization.',
    dressCode: 'Modest respectful attire.',
    schedule: [
      { time: '5:45 PM', title: 'Boarding Private Handcrafted Bajra', desc: 'River cruise past 84 ghats bathed in sunset amber' },
      { time: '6:30 PM', title: 'Floating Diya Offering Ceremony', desc: 'Release marigold brass lamps into the sacred waters' },
      { time: '7:00 PM', title: 'Prime Front-Row View of Grand Aarti', desc: 'Unobstructed view of the 7 priests and flaming lamps' }
    ],
    inclusions: [
      'Reserved VIP cushioned boat seat with life jackets',
      'Handmade marigold & ghee floating diya for river ritual',
      'Vedic scholar providing live historical narration'
    ],
    protocols: [
      'Silence requested during the Maha Mrityunjaya mantra chanting'
    ],
    curator: {
      name: 'Pandit Vidyadhar Shastri',
      title: 'Senior Vedic Scholar of Kashi',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
      bio: '40 years teaching Vedic hymns at Sampurnanand Sanskrit Vishwavidyalaya.'
    },
    tiers: [
      {
        id: 'tier_aarti_boat',
        name: 'VIP Boat Seated Pass',
        price: 500,
        desc: 'Cushioned wooden boat seat with unobstructed front view and flower offerings.',
        badge: 'Most Popular',
        availableSeats: 30
      },
      {
        id: 'tier_aarti_platform',
        name: 'Ghat Platform Front Row Reserved Chair',
        price: 950,
        desc: 'Direct platform seat right beside the performing priests with sacred prasad box.',
        badge: 'Sanctum View',
        availableSeats: 6
      }
    ],
    reviews: [
      { author: 'David Miller', rating: 5, date: '4 days ago', comment: 'Life-changing experience. Viewing from the boat avoids the crushing crowds completely.' }
    ]
  },
  {
    id: 'evt_jaipur_lit',
    title: 'Jaipur Literature & Royal Heritage Gathering',
    subtitle: 'Diggi Palace Pavilion Discussions',
    city: 'Jaipur',
    cityNormalized: 'jaipur',
    genre: 'folk_theatre',
    genreLabel: 'Folk & Dastangoi',
    format: 'seated_baithak',
    venue: 'Historic Diggi Palace Grounds',
    address: 'Shivaji Marg, C-Scheme, Sangram Colony, Jaipur, Rajasthan 302004',
    coordinates: { lat: 26.9088, lng: 75.8115 },
    distanceKm: 1.8,
    timeDuration: '10 mins away',
    date: 'Saturday, 14 Sep',
    dateIso: '2026-09-14',
    timeSlot: '10:00 AM – 6:00 PM',
    durationHours: 8.0,
    priceStarting: 350,
    rating: 4.92,
    reviewsCount: 180,
    badge: 'World Heritage Fest',
    badgeType: 'secondary',
    itinerarySlotFit: 'Day-long celebration of storytelling and Rajasthani arts',
    hotelProximityNote: 'Centrally situated in Jaipur royal quarters',
    heroImage: 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80'
    ],
    about: 'Join renowned historians, Booker prize authors, and folk minstrels at Diggi Palace. Features interactive panel debates, book signings, and evening Rajasthani folk fusion concerts in royal mango orchards.',
    culturalSignificance: 'Regarded as the greatest literary show on Earth, celebrating global ideas amidst Rajput architecture.',
    dressCode: 'Boho Ethnic / Smart Casual.',
    schedule: [
      { time: '10:00 AM', title: 'Morning Music & Inaugural Address', desc: 'Live Manganiyar folk musicians opening the festival' },
      { time: '12:00 PM', title: 'Architecture of Rajput Fortresses Panel', desc: 'Historians discuss UNESCO World Heritage forts' },
      { time: '4:30 PM', title: 'Evening Poetry & Sitar Recital', desc: 'Front lawn acoustic mehfil with local chai stalls' }
    ],
    inclusions: [
      'Delegate day pass with access to all 5 palace stages',
      'Author lounge book signing priority access',
      'Complimentary royal masala chai throughout the day'
    ],
    protocols: [
      'Seating on lawn chairs and traditional charpai cots'
    ],
    curator: {
      name: 'Jaipur Heritage & Arts Trust',
      title: 'Festival Directors & Curators',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
      bio: 'Stewards of Rajasthan’s contemporary cultural dialogues and architectural preservation projects.'
    },
    tiers: [
      {
        id: 'tier_jlf_delegate',
        name: 'Delegate Day Access Pass',
        price: 350,
        desc: 'Complete all-stage access, festival badge, and complimentary tea.',
        badge: 'Standard',
        availableSeats: 50
      },
      {
        id: 'tier_jlf_royal_vip',
        name: 'Royal Heritage Friend of Fest',
        price: 1500,
        desc: 'Includes access to reserved front rows, private speakers lounge, and dinner invitation.',
        badge: 'VIP Patron',
        availableSeats: 10
      }
    ],
    reviews: [
      { author: 'Priyanka Sen', rating: 5, date: '3 weeks ago', comment: 'Diggi Palace in the daytime with brilliant minds discussing history is absolute bliss.' }
    ]
  }
];

export const FEATURED_SPOTLIGHT = EVENTS_CATALOG[0]; // Sacred Echoes
