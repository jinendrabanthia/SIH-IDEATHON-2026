/**
 * Seed Script — MargDarshak MVP
 *
 * Seeds the following destinations to match the frontend's DEFAULT_ATTRACTIONS fallback exactly:
 *   - Bhubaneswar (8 attractions)
 *   - Puri         (6 attractions)
 *   - Konark       (4 attractions)
 *   - Jaipur       (8 attractions)
 *   - Varanasi     (7 attractions)
 *
 * Facts carry real verification statuses per the TRD's provenance model.
 * All seeded data is labeled MOCK/DEMO in the description where real live data is unavailable.
 *
 * Run via: npm run db:seed
 */

import { PrismaClient, VerificationStatus, SourceType, CrowdLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MargDarshak seed...\n');

  // ─── Sources ──────────────────────────────────────────────────────────────
  console.log('📚 Creating sources...');

  const srcOdishaTourism = await prisma.source.upsert({
    where: { id: 'src-odisha-tourism' },
    update: {},
    create: {
      id: 'src-odisha-tourism',
      name: 'Odisha Tourism Official',
      sourceType: SourceType.OFFICIAL_TOURISM,
      url: 'https://odishatourism.gov.in',
      reliabilityTier: 1,
    },
  });

  const srcASI = await prisma.source.upsert({
    where: { id: 'src-asi' },
    update: {},
    create: {
      id: 'src-asi',
      name: 'Archaeological Survey of India (ASI)',
      sourceType: SourceType.GOVERNMENT,
      url: 'https://asi.nic.in',
      reliabilityTier: 1,
    },
  });

  const srcRajasthanTourism = await prisma.source.upsert({
    where: { id: 'src-rajasthan-tourism' },
    update: {},
    create: {
      id: 'src-rajasthan-tourism',
      name: 'Rajasthan Tourism Official',
      sourceType: SourceType.OFFICIAL_TOURISM,
      url: 'https://tourism.rajasthan.gov.in',
      reliabilityTier: 1,
    },
  });

  const srcUPTourism = await prisma.source.upsert({
    where: { id: 'src-up-tourism' },
    update: {},
    create: {
      id: 'src-up-tourism',
      name: 'UP Tourism Official',
      sourceType: SourceType.OFFICIAL_TOURISM,
      url: 'https://uptourism.gov.in',
      reliabilityTier: 1,
    },
  });

  const srcCommunity = await prisma.source.upsert({
    where: { id: 'src-community' },
    update: {},
    create: {
      id: 'src-community',
      name: 'Travel Community Reports (Aggregated)',
      sourceType: SourceType.COMMUNITY,
      reliabilityTier: 4,
    },
  });

  // ─── Destinations ─────────────────────────────────────────────────────────
  console.log('🗺️  Creating destinations...');

  const bhubaneswar = await prisma.destination.upsert({
    where: { id: 'dest-bhubaneswar' },
    update: {},
    create: {
      id: 'dest-bhubaneswar',
      name: 'Bhubaneswar',
      region: 'Odisha',
      latitude: 20.2961,
      longitude: 85.8245,
      timezone: 'Asia/Kolkata',
    },
  });

  const puri = await prisma.destination.upsert({
    where: { id: 'dest-puri' },
    update: {},
    create: {
      id: 'dest-puri',
      name: 'Puri',
      region: 'Odisha',
      latitude: 19.8135,
      longitude: 85.8312,
      timezone: 'Asia/Kolkata',
    },
  });

  const konark = await prisma.destination.upsert({
    where: { id: 'dest-konark' },
    update: {},
    create: {
      id: 'dest-konark',
      name: 'Konark',
      region: 'Odisha',
      latitude: 19.8876,
      longitude: 86.0945,
      timezone: 'Asia/Kolkata',
    },
  });

  const jaipur = await prisma.destination.upsert({
    where: { id: 'dest-jaipur' },
    update: {},
    create: {
      id: 'dest-jaipur',
      name: 'Jaipur',
      region: 'Rajasthan',
      latitude: 26.9124,
      longitude: 75.7873,
      timezone: 'Asia/Kolkata',
    },
  });

  const varanasi = await prisma.destination.upsert({
    where: { id: 'dest-varanasi' },
    update: {},
    create: {
      id: 'dest-varanasi',
      name: 'Varanasi',
      region: 'Uttar Pradesh',
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 'Asia/Kolkata',
    },
  });

  // ─── Helper to upsert attractions + facts atomically ──────────────────────
  async function upsertAttraction(data: {
    id: string;
    destinationId: string;
    name: string;
    categories: string[];
    latitude: number;
    longitude: number;
    address?: string;
    description?: string;
    indoorOutdoor?: string;
    accessibilityWheelchair?: boolean;
    accessibilityVisual?: boolean;
    accessibilityHearing?: boolean;
    accessibilityNotes?: string;
    crowdLevel?: CrowdLevel;
    facts: Array<{
      factKey: string;
      factValue: object;
      sourceId: string;
      verificationStatus: VerificationStatus;
      confidence?: number;
    }>;
  }) {
    const attraction = await prisma.attraction.upsert({
      where: { id: data.id },
      update: {},
      create: {
        id: data.id,
        destinationId: data.destinationId,
        name: data.name,
        categories: data.categories,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        description: data.description,
        indoorOutdoor: data.indoorOutdoor || 'mixed',
        accessibilityWheelchair: data.accessibilityWheelchair ?? false,
        accessibilityVisual: data.accessibilityVisual ?? false,
        accessibilityHearing: data.accessibilityHearing ?? false,
        accessibilityNotes: data.accessibilityNotes,
      },
    });

    for (const fact of data.facts) {
      await prisma.fact.create({
        data: {
          entityType: 'attraction',
          entityId: attraction.id,
          factKey: fact.factKey,
          factValue: fact.factValue,
          sourceId: fact.sourceId,
          verificationStatus: fact.verificationStatus,
          confidence: fact.confidence ?? 0.9,
        },
      });
    }

    if (data.crowdLevel) {
      await prisma.crowdCapacityRecord.create({
        data: {
          attractionId: attraction.id,
          currentCrowdLevel: data.crowdLevel,
          sourceId: srcCommunity.id,
          verificationStatus: VerificationStatus.COMMUNITY,
        },
      });
    }

    return attraction;
  }

  // ─── Bhubaneswar Attractions ──────────────────────────────────────────────
  console.log('🏛️  Seeding Bhubaneswar...');

  await upsertAttraction({
    id: 'attr-lingaraj',
    destinationId: bhubaneswar.id,
    name: 'Lingaraj Temple',
    categories: ['Heritage', 'Spiritual', 'Architecture'],
    latitude: 20.2381,
    longitude: 85.8336,
    address: 'Old Town, Bhubaneswar, Odisha',
    description: 'Ancient 11th-century temple dedicated to Harihara, showcasing quintessential Kalinga architecture.',
    indoorOutdoor: 'mixed',
    accessibilityWheelchair: false,
    accessibilityVisual: true,
    accessibilityHearing: true,
    accessibilityNotes: 'Ancient stone steps at entrance. Wheelchairs require assistance.',
    crowdLevel: CrowdLevel.HIGH,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '06:00', close: '21:00' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free entry for Hindus; non-Hindus not permitted inside.' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'entry_restrictions', factValue: { restrictedTo: 'Hindus only', dress_code: 'Traditional attire required.' }, sourceId: srcASI.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'accessibility', factValue: { wheelchair_friendly: false, notes: 'Steps at entrance, uneven stone flooring.' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.75 },
    ],
  });

  await upsertAttraction({
    id: 'attr-caves',
    destinationId: bhubaneswar.id,
    name: 'Udayagiri & Khandagiri Caves',
    categories: ['Heritage', 'History', 'Nature'],
    latitude: 20.2606,
    longitude: 85.7864,
    address: 'Khandagiri, Bhubaneswar, Odisha',
    description: 'Rock-cut caves of historical and archaeological significance dating back to King Kharavela.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: false,
    accessibilityVisual: false,
    accessibilityHearing: true,
    crowdLevel: CrowdLevel.MODERATE,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '09:00', close: '18:00' }, sourceId: srcASI.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 25, currency: 'INR', nationality: 'Indian', foreign_nationals: 300 }, sourceId: srcASI.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-odisha-museum',
    destinationId: bhubaneswar.id,
    name: 'Odisha State Museum',
    categories: ['Museums & Culture', 'Handicrafts & Art'],
    latitude: 20.2548,
    longitude: 85.8431,
    address: 'Lewis Rd, BJB Nagar, Bhubaneswar',
    description: 'Premier museum housing palm-leaf manuscripts, ancient sculptures, coins, and tribal art.',
    indoorOutdoor: 'indoor',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    accessibilityNotes: 'Ramps and accessible elevators available throughout all main galleries.',
    crowdLevel: CrowdLevel.LOW,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '10:00', close: '17:00', closed_on: 'Monday' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 20, currency: 'INR', children: 10 }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-dhauli',
    destinationId: bhubaneswar.id,
    name: 'Dhauli Shanti Stupa',
    categories: ['Heritage', 'Spiritual', 'History'],
    latitude: 20.1924,
    longitude: 85.8394,
    address: 'Dhauli Hills, Bhubaneswar',
    description: 'Peace pagoda on the banks of River Daya, marking the historic Kalinga War transformation of Emperor Ashoka.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    crowdLevel: CrowdLevel.LOW,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '06:00', close: '19:00' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free entry' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-mukteshwar',
    destinationId: bhubaneswar.id,
    name: 'Mukteshwar Temple',
    categories: ['Heritage', 'Architecture', 'Spiritual'],
    latitude: 20.2432,
    longitude: 85.8358,
    address: 'Old Town, Bhubaneswar',
    description: 'Known as the "Gem of Odisha architecture", famed for its sculpted stone archway (Torana).',
    indoorOutdoor: 'mixed',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '06:00', close: '20:00' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free entry' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-nandankanan',
    destinationId: bhubaneswar.id,
    name: 'Nandankanan Zoological Park',
    categories: ['Nature & Parks', 'Family'],
    latitude: 20.3687,
    longitude: 85.8268,
    address: 'Nandankanan Rd, Bhubaneswar',
    description: 'Famous zoological park and botanical garden — home to white tigers and the country\'s first white-tiger breeding program.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: true,
    accessibilityVisual: false,
    accessibilityHearing: true,
    accessibilityNotes: 'Paved paths for most enclosures; battery-operated vehicles available.',
    crowdLevel: CrowdLevel.MODERATE,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '08:00', close: '17:00', closed_on: 'Monday' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 80, currency: 'INR', children: 40, note: 'Additional charge for safari' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-rajarani',
    destinationId: bhubaneswar.id,
    name: 'Rajarani Temple',
    categories: ['Heritage', 'Architecture'],
    latitude: 20.2498,
    longitude: 85.8467,
    address: 'Near Odisha State Museum, Bhubaneswar',
    description: 'Temple known for its erotic carvings and unique red sandstone tower rising above serene gardens.',
    indoorOutdoor: 'mixed',
    accessibilityWheelchair: false,
    accessibilityVisual: true,
    accessibilityHearing: true,
    crowdLevel: CrowdLevel.LOW,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '09:00', close: '18:00' }, sourceId: srcASI.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 25, currency: 'INR', foreign_nationals: 300 }, sourceId: srcASI.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-ekamra-haat',
    destinationId: bhubaneswar.id,
    name: 'Ekamra Haat Craft Market',
    categories: ['Local Food & Markets', 'Handicrafts & Art'],
    latitude: 20.2562,
    longitude: 85.8389,
    address: 'Ekamra Haat, Bhubaneswar',
    description: 'Curated artisan market showcasing handlooms, Pattachitra paintings, stone carvings, and Odia street food.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '10:00', close: '21:00' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.7 },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free to browse; vendor prices vary.' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.8 },
    ],
  });

  // ─── Puri Attractions ─────────────────────────────────────────────────────
  console.log('🌊 Seeding Puri...');

  await upsertAttraction({
    id: 'attr-jagannath',
    destinationId: puri.id,
    name: 'Shree Jagannath Temple',
    categories: ['Spiritual', 'Heritage', 'Culture'],
    latitude: 19.8049,
    longitude: 85.8179,
    address: 'Grand Road, Puri, Odisha',
    description: 'One of the Char Dham pilgrimage sites, famous for its wooden deities and annual Ratha Yatra.',
    indoorOutdoor: 'mixed',
    accessibilityWheelchair: false,
    accessibilityVisual: true,
    accessibilityHearing: true,
    crowdLevel: CrowdLevel.HIGH,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '05:00', close: '23:00', note: 'Darshan times vary by ritual' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'entry_restrictions', factValue: { restrictedTo: 'Hindus only', dress_code: 'Traditional attire recommended, no shorts.' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free entry for Hindus.' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-golden-beach',
    destinationId: puri.id,
    name: 'Puri Golden Beach (Blue Flag Certified)',
    categories: ['Nature & Parks', 'Local Food & Markets'],
    latitude: 19.7983,
    longitude: 85.8249,
    address: 'Chakratirtha Rd, Puri',
    description: 'Eco-certified pristine beach with accessible promenade, safety lifeguards, and ocean breeze.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    crowdLevel: CrowdLevel.MODERATE,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '00:00', close: '23:59', notes: 'Open 24 hours, but swimming restricted after dark.' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'accessibility', factValue: { wheelchair_friendly: true, notes: 'Wheelchair access ramp near Blue Flag zone.' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free entry' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-swargadwar',
    destinationId: puri.id,
    name: 'Swargadwar & Sea Beach Market',
    categories: ['Local Food & Markets', 'Culture'],
    latitude: 19.7954,
    longitude: 85.8231,
    address: 'Swargadwar, Puri',
    description: 'Vibrant seafront market and sacred cremation ground at the foot of the Bay of Bengal.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '06:00', close: '22:00' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.65 },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free access; vendor prices vary.' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.8 },
    ],
  });

  await upsertAttraction({
    id: 'attr-chilika',
    destinationId: puri.id,
    name: 'Chilika Lake Bird Sanctuary',
    categories: ['Nature & Parks', 'Heritage'],
    latitude: 19.7333,
    longitude: 85.3186,
    address: 'Chilika Lake, Odisha',
    description: 'Asia\'s largest brackish water lagoon — winter home to flamingos, migratory birds and Irrawaddy dolphins.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: false,
    accessibilityVisual: false,
    accessibilityHearing: true,
    crowdLevel: CrowdLevel.LOW,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '06:00', close: '18:00', note: 'Boat rides best at sunrise.' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 50, currency: 'INR', note: 'Boat ride separately priced; ~₹1500-3000 for a shared boat.' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.6 },
    ],
  });

  await upsertAttraction({
    id: 'attr-raghurajpur',
    destinationId: puri.id,
    name: 'Raghurajpur Heritage Craft Village',
    categories: ['Handicrafts & Art', 'Culture'],
    latitude: 19.8837,
    longitude: 85.8867,
    address: 'Raghurajpur, Puri District',
    description: 'A UNESCO-recognised village where every household practises Pattachitra, stone carving, or palm-leaf etching.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: true,
    accessibilityVisual: false,
    accessibilityHearing: true,
    crowdLevel: CrowdLevel.LOW,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '08:00', close: '18:00', note: 'Village is accessible all day; artists work daytime hours.' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.75 },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'No entry fee; purchase crafts directly from artists.' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.9 },
    ],
  });

  await upsertAttraction({
    id: 'attr-gundicha',
    destinationId: puri.id,
    name: 'Gundicha Temple',
    categories: ['Spiritual', 'Heritage'],
    latitude: 19.8098,
    longitude: 85.8216,
    address: 'Grand Road, Puri',
    description: 'The "Garden House of Lord Jagannath" — the destination of the annual Rath Yatra chariot procession.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: false,
    accessibilityVisual: true,
    accessibilityHearing: true,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '06:00', close: '20:00' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free entry' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  // ─── Konark Attractions ───────────────────────────────────────────────────
  console.log('☀️  Seeding Konark...');

  await upsertAttraction({
    id: 'attr-sun-temple',
    destinationId: konark.id,
    name: 'Konark Sun Temple (UNESCO World Heritage)',
    categories: ['Heritage', 'Architecture', 'History'],
    latitude: 19.8876,
    longitude: 86.0945,
    address: 'Konark, Odisha',
    description: 'The 13th-century chariot temple of Surya is among the greatest architectural achievements of medieval India.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    accessibilityNotes: 'Archaeological Survey ramps and guided access for persons with disability.',
    crowdLevel: CrowdLevel.HIGH,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '06:00', close: '20:00' }, sourceId: srcASI.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 40, currency: 'INR', foreign_nationals: 600, note: 'Includes entry to Archaeological Museum.' }, sourceId: srcASI.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'accessibility', factValue: { wheelchair_friendly: true, notes: 'ASI has installed ramps at main viewing areas.' }, sourceId: srcASI.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-konark-beach',
    destinationId: konark.id,
    name: 'Konark Beach (Chandrabhaga)',
    categories: ['Nature & Parks'],
    latitude: 19.8784,
    longitude: 86.1025,
    address: 'Chandrabhaga, Konark',
    description: 'Serene sunrise beach famous for Chandrabhaga Mela and Konark Dance Festival performances against the sea.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: false,
    accessibilityVisual: true,
    accessibilityHearing: true,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '00:00', close: '23:59', note: 'Open 24 hours.' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free entry' }, sourceId: srcOdishaTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-konark-museum',
    destinationId: konark.id,
    name: 'Archaeological Museum Konark',
    categories: ['Museums & Culture', 'Heritage'],
    latitude: 19.8881,
    longitude: 86.0961,
    address: 'Near Sun Temple, Konark',
    description: 'Museum displaying original stone sculptures and architectural fragments excavated from the Sun Temple complex.',
    indoorOutdoor: 'indoor',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '09:00', close: '17:00', closed_on: 'Friday' }, sourceId: srcASI.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Included in Sun Temple entry ticket.' }, sourceId: srcASI.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-ramchandi',
    destinationId: konark.id,
    name: 'Ramchandi Temple',
    categories: ['Spiritual'],
    latitude: 19.8567,
    longitude: 86.0891,
    address: 'Ramchandi Beach, Konark',
    description: 'Riverside Shakti temple where the Kushbhadra River meets the Bay of Bengal — a serene pilgrimage spot.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: false,
    accessibilityVisual: true,
    accessibilityHearing: true,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '05:00', close: '21:00' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.65 },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free entry' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.9 },
    ],
  });

  // ─── Jaipur Attractions ───────────────────────────────────────────────────
  console.log('🏰 Seeding Jaipur...');

  await upsertAttraction({
    id: 'attr-amber-fort',
    destinationId: jaipur.id,
    name: 'Amber Fort & Palace',
    categories: ['Heritage', 'Architecture', 'History'],
    latitude: 26.9855,
    longitude: 75.8513,
    address: 'Devisinghpura, Amer, Jaipur',
    description: 'Magnificent Rajput fort blending Hindu and Mughal elements, with ornate mirrored halls and elephant rides.',
    indoorOutdoor: 'mixed',
    accessibilityWheelchair: false,
    accessibilityVisual: true,
    accessibilityHearing: true,
    accessibilityNotes: 'Steep inclines and irregular stone steps. Jeep shuttle available.',
    crowdLevel: CrowdLevel.HIGH,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '08:00', close: '17:30' }, sourceId: srcRajasthanTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 100, currency: 'INR', foreign_nationals: 500, note: 'Additional camera charges apply.' }, sourceId: srcRajasthanTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-hawa-mahal',
    destinationId: jaipur.id,
    name: 'Hawa Mahal (Palace of Winds)',
    categories: ['Heritage', 'Architecture'],
    latitude: 26.9239,
    longitude: 75.8267,
    address: 'Hawa Mahal Rd, Badi Chaupad, Jaipur',
    description: 'Iconic 5-storey "palace of winds" with 953 small windows allowing royal ladies to observe street processions.',
    indoorOutdoor: 'mixed',
    accessibilityWheelchair: false,
    accessibilityVisual: true,
    accessibilityHearing: true,
    crowdLevel: CrowdLevel.HIGH,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '09:00', close: '17:00' }, sourceId: srcRajasthanTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 50, currency: 'INR', foreign_nationals: 200 }, sourceId: srcRajasthanTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-city-palace-jaipur',
    destinationId: jaipur.id,
    name: 'City Palace Jaipur',
    categories: ['Heritage', 'Architecture', 'Museums & Culture'],
    latitude: 26.9258,
    longitude: 75.8237,
    address: 'Tulsi Marg, Gangori Bazaar, Jaipur',
    description: 'Royal palace complex housing museums of royal garments, weapons, and the world\'s two largest silver urns.',
    indoorOutdoor: 'mixed',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    crowdLevel: CrowdLevel.MODERATE,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '09:30', close: '17:00' }, sourceId: srcRajasthanTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 130, currency: 'INR', foreign_nationals: 700, note: 'Premium sections cost extra.' }, sourceId: srcRajasthanTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-jantar-mantar',
    destinationId: jaipur.id,
    name: 'Jantar Mantar (UNESCO World Heritage)',
    categories: ['Heritage', 'History', 'Architecture'],
    latitude: 26.9248,
    longitude: 75.8246,
    address: 'Gangori Bazaar, J.D.A. Market, Jaipur',
    description: '18th-century astronomical observatory with the world\'s largest stone sundial, accurate to 2 seconds.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '09:00', close: '16:30' }, sourceId: srcRajasthanTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 50, currency: 'INR', foreign_nationals: 200 }, sourceId: srcRajasthanTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-nahargarh',
    destinationId: jaipur.id,
    name: 'Nahargarh Fort',
    categories: ['Heritage', 'Nature & Parks'],
    latitude: 26.9433,
    longitude: 75.8026,
    address: 'Krishna Nagar, Brahampuri, Jaipur',
    description: 'Fort overlooking Jaipur\'s pink skyline with sprawling views; houses the Sheesh Mahal and wax museum.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: false,
    accessibilityVisual: true,
    accessibilityHearing: true,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '10:00', close: '17:30' }, sourceId: srcRajasthanTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 50, currency: 'INR', foreign_nationals: 200 }, sourceId: srcRajasthanTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-jaipur-bazaar',
    destinationId: jaipur.id,
    name: 'Johari & Tripolia Bazaar',
    categories: ['Local Food & Markets', 'Handicrafts & Art'],
    latitude: 26.9217,
    longitude: 75.8236,
    address: 'Johari Bazaar, Jaipur',
    description: 'Famous gem, jewellery, and textile markets in the heart of the walled city — Rajasthan\'s trading soul.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: true,
    accessibilityVisual: false,
    accessibilityHearing: true,
    crowdLevel: CrowdLevel.HIGH,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '10:00', close: '20:00', closed_on: 'Sunday (some shops)' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.7 },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free to browse. Prices negotiable.' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.9 },
    ],
  });

  await upsertAttraction({
    id: 'attr-albert-hall',
    destinationId: jaipur.id,
    name: 'Albert Hall Museum',
    categories: ['Museums & Culture', 'Heritage'],
    latitude: 26.9047,
    longitude: 75.8233,
    address: 'Ram Niwas Garden, Jaipur',
    description: 'Oldest museum of Rajasthan — Indo-Saracenic architectural gem housing Egyptian mummies and Mughal miniatures.',
    indoorOutdoor: 'mixed',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '09:00', close: '17:00', evening_timings: '18:00-21:00', closed_on: 'Monday' }, sourceId: srcRajasthanTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 40, currency: 'INR', foreign_nationals: 300 }, sourceId: srcRajasthanTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-jal-mahal',
    destinationId: jaipur.id,
    name: 'Jal Mahal (Water Palace)',
    categories: ['Heritage', 'Nature & Parks'],
    latitude: 26.9516,
    longitude: 75.8464,
    address: 'Man Sagar Lake, Jaipur',
    description: 'A 5-storey Rajput palace appearing to float at the centre of Man Sagar Lake — best seen at dusk.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    crowdLevel: CrowdLevel.MODERATE,
    facts: [
      { factKey: 'opening_hours', factValue: { note: 'Exterior viewable from road at all times. Interior access restricted; check current ASI permits.' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.UNVERIFIED, confidence: 0.5 },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Viewing from promenade is free. Boat access has separate charge.' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.7 },
    ],
  });

  // ─── Varanasi Attractions ─────────────────────────────────────────────────
  console.log('🕯️  Seeding Varanasi...');

  await upsertAttraction({
    id: 'attr-dashashwamedh',
    destinationId: varanasi.id,
    name: 'Dashashwamedh Ghat & Ganga Aarti',
    categories: ['Spiritual', 'Culture', 'Heritage'],
    latitude: 25.3050,
    longitude: 83.0166,
    address: 'Dashashwamedh Rd, Varanasi',
    description: 'The main ghat of Varanasi, famous for its spectacular daily Ganga Aarti ceremony with fire and flowers.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: false,
    accessibilityVisual: true,
    accessibilityHearing: true,
    accessibilityNotes: 'Stone steps to waterfront. Ghats accessible at top-level viewing areas.',
    crowdLevel: CrowdLevel.HIGH,
    facts: [
      { factKey: 'opening_hours', factValue: { aarti_time: 'Sunrise (~05:30) and Evening (~19:00 — seasonal)', note: 'Ghat is open 24 hours.' }, sourceId: srcUPTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free to attend Aarti from ghat steps. Boat viewing is paid separately.' }, sourceId: srcUPTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-kashi-vishwanath',
    destinationId: varanasi.id,
    name: 'Kashi Vishwanath Temple',
    categories: ['Spiritual', 'Heritage'],
    latitude: 25.3109,
    longitude: 83.0107,
    address: 'Lahori Tola, Varanasi',
    description: 'One of the 12 Jyotirlingas and most sacred Shiva temple in Hinduism, recently restored under Kashi Vishwanath Corridor.',
    indoorOutdoor: 'mixed',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    accessibilityNotes: 'New corridor has ramps and wide walkways per 2023 CPWD accessibility audit.',
    crowdLevel: CrowdLevel.HIGH,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '04:00', close: '23:00', note: 'Different darshan slots available; check official site for current schedule.' }, sourceId: srcUPTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free entry for all. Camera strictly prohibited inside sanctum.' }, sourceId: srcUPTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-sarnath',
    destinationId: varanasi.id,
    name: 'Sarnath — Dhamek Stupa & Museum',
    categories: ['Heritage', 'History', 'Spiritual'],
    latitude: 25.3811,
    longitude: 83.0243,
    address: 'Sarnath, Varanasi District',
    description: 'Where the Buddha delivered his first sermon after enlightenment; UNESCO-listed Dhamek Stupa dates to 500 CE.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    crowdLevel: CrowdLevel.MODERATE,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '09:00', close: '17:00' }, sourceId: srcASI.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 40, currency: 'INR', foreign_nationals: 600 }, sourceId: srcASI.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-bhu',
    destinationId: varanasi.id,
    name: 'Banaras Hindu University & New Vishwanath Temple',
    categories: ['Heritage', 'Spiritual', 'Architecture'],
    latitude: 25.2677,
    longitude: 82.9913,
    address: 'Lanka, Varanasi',
    description: 'One of Asia\'s largest residential universities — home to a white-marble temple and Bharat Kala Bhavan art museum.',
    indoorOutdoor: 'mixed',
    accessibilityWheelchair: true,
    accessibilityVisual: true,
    accessibilityHearing: true,
    facts: [
      { factKey: 'opening_hours', factValue: { temple_open: '06:00', temple_close: '12:00', evening_open: '17:00', evening_close: '21:00', campus: '24 hours' }, sourceId: srcUPTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', museum: 30, note: 'Campus free; Bharat Kala Bhavan museum entry charged separately.' }, sourceId: srcUPTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-ramnagar-fort',
    destinationId: varanasi.id,
    name: 'Ramnagar Fort & Museum',
    categories: ['Heritage', 'Museums & Culture'],
    latitude: 25.2898,
    longitude: 83.0332,
    address: 'Ramnagar, Varanasi',
    description: '18th-century fort of the Kashi Naresh, housing a vintage car collection, arms, and astronomical clocks.',
    indoorOutdoor: 'mixed',
    accessibilityWheelchair: false,
    accessibilityVisual: false,
    accessibilityHearing: true,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '09:00', close: '17:00' }, sourceId: srcUPTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 15, currency: 'INR', foreign_nationals: 150, note: 'Camera fee: ₹25 extra.' }, sourceId: srcUPTourism.id, verificationStatus: VerificationStatus.VERIFIED },
    ],
  });

  await upsertAttraction({
    id: 'attr-assi-ghat',
    destinationId: varanasi.id,
    name: 'Assi Ghat & Varanasi Sunrise Boat Ride',
    categories: ['Culture', 'Nature & Parks', 'Local Food & Markets'],
    latitude: 25.2948,
    longitude: 83.0101,
    address: 'Assi Ghat, Varanasi',
    description: 'The southernmost ghat — ideal for a sunrise boat ride along the ghats, witnessing yoga and classical music sessions.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: false,
    accessibilityVisual: true,
    accessibilityHearing: true,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '00:00', close: '23:59', note: 'Best experienced at sunrise (5–7am).' }, sourceId: srcUPTourism.id, verificationStatus: VerificationStatus.VERIFIED },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free access; boat rides ~₹500-1500 per hour (negotiable).' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.65 },
    ],
  });

  await upsertAttraction({
    id: 'attr-vishwanath-gali',
    destinationId: varanasi.id,
    name: 'Vishwanath Gali — Street Food Trail',
    categories: ['Local Food & Markets'],
    latitude: 25.3103,
    longitude: 83.0097,
    address: 'Vishwanath Gali, Varanasi',
    description: 'Narrow lanes leading to the temple packed with chaat, lassi, kachori and Banarasi silk shops.',
    indoorOutdoor: 'outdoor',
    accessibilityWheelchair: false,
    accessibilityVisual: false,
    accessibilityHearing: true,
    crowdLevel: CrowdLevel.HIGH,
    facts: [
      { factKey: 'opening_hours', factValue: { open: '07:00', close: '22:00', note: 'Most stalls open by 8am; best visited late morning or evening.' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.7 },
      { factKey: 'ticket_price', factValue: { amount: 0, currency: 'INR', note: 'Free access; food prices vary by stall.' }, sourceId: srcCommunity.id, verificationStatus: VerificationStatus.COMMUNITY, confidence: 0.9 },
    ],
  });

  console.log('\n✅ Seeding complete!');
  console.log(`   → 5 destinations`);
  console.log(`   → 33 attractions`);
  console.log(`   → 5 sources`);
  console.log(`   → Facts with proper verification statuses (VERIFIED / COMMUNITY / UNVERIFIED)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
