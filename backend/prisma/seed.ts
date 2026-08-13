import { PrismaClient, VerificationStatus, SourceType, CrowdLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Sources
  const srcTourismBoard = await prisma.source.create({
    data: {
      name: 'Odisha Tourism Official',
      sourceType: SourceType.OFFICIAL_TOURISM,
      url: 'https://odishatourism.gov.in',
      reliabilityTier: 1,
    },
  });

  const srcASI = await prisma.source.create({
    data: {
      name: 'Archaeological Survey of India (ASI)',
      sourceType: SourceType.GOVERNMENT,
      url: 'https://asi.nic.in',
      reliabilityTier: 1,
    },
  });

  const srcCommunity = await prisma.source.create({
    data: {
      name: 'Travel Community Reports',
      sourceType: SourceType.COMMUNITY,
      reliabilityTier: 4,
    },
  });

  // 2. Create Destinations
  const bhubaneswar = await prisma.destination.create({
    data: {
      name: 'Bhubaneswar',
      region: 'Odisha',
      latitude: 20.2961,
      longitude: 85.8245,
    },
  });

  const puri = await prisma.destination.create({
    data: {
      name: 'Puri',
      region: 'Odisha',
      latitude: 19.8135,
      longitude: 85.8312,
    },
  });

  // 3. Create Attractions & Facts
  // 3.1 Lingaraj Temple
  const lingaraj = await prisma.attraction.create({
    data: {
      destinationId: bhubaneswar.id,
      name: 'Lingaraj Temple',
      categories: ['spiritual', 'history', 'culture'],
      latitude: 20.2381,
      longitude: 85.8336,
      address: 'Lingaraj Temple Rd, Lingaraj Nagar, Old Town, Bhubaneswar',
      description: 'An ancient temple dedicated to Harihara, showcasing Kalinga architecture.',
      indoorOutdoor: 'mixed',
      accessibilityWheelchair: false,
    },
  });

  await prisma.fact.createMany({
    data: [
      {
        entityType: 'attraction',
        entityId: lingaraj.id,
        factKey: 'opening_hours',
        factValue: { open: '06:00', close: '21:00' },
        sourceId: srcTourismBoard.id,
        verificationStatus: VerificationStatus.VERIFIED,
      },
      {
        entityType: 'attraction',
        entityId: lingaraj.id,
        factKey: 'ticket_price',
        factValue: { amount: 0, currency: 'INR', note: 'Free entry for Hindus' },
        sourceId: srcTourismBoard.id,
        verificationStatus: VerificationStatus.VERIFIED,
      },
      {
        entityType: 'attraction',
        entityId: lingaraj.id,
        factKey: 'entry_restrictions',
        factValue: { restrictedTo: 'Hindus only' },
        sourceId: srcASI.id,
        verificationStatus: VerificationStatus.VERIFIED,
      },
      {
        entityType: 'attraction',
        entityId: lingaraj.id,
        factKey: 'accessibility',
        factValue: { wheelchair_friendly: false, notes: 'Steps at entrance, uneven stone flooring.' },
        sourceId: srcCommunity.id,
        verificationStatus: VerificationStatus.COMMUNITY,
      }
    ]
  });

  // 3.2 Udayagiri and Khandagiri Caves
  const caves = await prisma.attraction.create({
    data: {
      destinationId: bhubaneswar.id,
      name: 'Udayagiri and Khandagiri Caves',
      categories: ['history', 'nature'],
      latitude: 20.2585,
      longitude: 85.7850,
      address: 'Khandagiri, Bhubaneswar',
      description: 'Partly natural and partly artificial caves of archaeological, historical and religious importance.',
      indoorOutdoor: 'outdoor',
      accessibilityWheelchair: false, // Too steep
    },
  });

  await prisma.fact.createMany({
    data: [
      {
        entityType: 'attraction',
        entityId: caves.id,
        factKey: 'opening_hours',
        factValue: { open: '09:00', close: '18:00' },
        sourceId: srcASI.id,
        verificationStatus: VerificationStatus.VERIFIED,
      },
      {
        entityType: 'attraction',
        entityId: caves.id,
        factKey: 'ticket_price',
        factValue: { amount: 25, currency: 'INR', nationality: 'Indian' },
        sourceId: srcASI.id,
        verificationStatus: VerificationStatus.VERIFIED,
      }
    ]
  });

  await prisma.crowdCapacityRecord.create({
    data: {
      attractionId: caves.id,
      currentCrowdLevel: CrowdLevel.MODERATE,
      sourceId: srcCommunity.id,
      verificationStatus: VerificationStatus.COMMUNITY,
    }
  });

  // 3.3 Jagannath Temple, Puri
  const jagannath = await prisma.attraction.create({
    data: {
      destinationId: puri.id,
      name: 'Jagannath Temple',
      categories: ['spiritual', 'culture'],
      latitude: 19.8049,
      longitude: 85.8179,
      address: 'Grand Road, Puri',
      description: 'An important Hindu temple dedicated to Jagannath, a form of Vishnu.',
      indoorOutdoor: 'mixed',
      accessibilityWheelchair: false,
    },
  });

  await prisma.fact.createMany({
    data: [
      {
        entityType: 'attraction',
        entityId: jagannath.id,
        factKey: 'opening_hours',
        factValue: { open: '05:00', close: '23:00' },
        sourceId: srcTourismBoard.id,
        verificationStatus: VerificationStatus.VERIFIED,
      },
      {
        entityType: 'attraction',
        entityId: jagannath.id,
        factKey: 'entry_restrictions',
        factValue: { restrictedTo: 'Hindus only', dress_code: 'Traditional attire recommended, no shorts.' },
        sourceId: srcTourismBoard.id,
        verificationStatus: VerificationStatus.VERIFIED,
      }
    ]
  });

  await prisma.crowdCapacityRecord.create({
    data: {
      attractionId: jagannath.id,
      currentCrowdLevel: CrowdLevel.HIGH,
      sourceId: srcCommunity.id,
      verificationStatus: VerificationStatus.COMMUNITY,
    }
  });
  
  // 3.4 Golden Beach, Puri
  const beach = await prisma.attraction.create({
    data: {
      destinationId: puri.id,
      name: 'Golden Beach',
      categories: ['nature', 'relaxation'],
      latitude: 19.7946,
      longitude: 85.8242,
      address: 'Marine Drive, Puri',
      description: 'A pristine beach known for its golden sand and the annual Puri Beach Festival. Blue Flag certified.',
      indoorOutdoor: 'outdoor',
      accessibilityWheelchair: true,
    },
  });

  await prisma.fact.createMany({
    data: [
      {
        entityType: 'attraction',
        entityId: beach.id,
        factKey: 'opening_hours',
        factValue: { open: '00:00', close: '23:59', notes: 'Open 24 hours, but swimming restricted after dark.' },
        sourceId: srcTourismBoard.id,
        verificationStatus: VerificationStatus.VERIFIED,
      },
      {
        entityType: 'attraction',
        entityId: beach.id,
        factKey: 'accessibility',
        factValue: { wheelchair_friendly: true, notes: 'Wheelchair access ramp available near Blue Flag zone.' },
        sourceId: srcTourismBoard.id,
        verificationStatus: VerificationStatus.VERIFIED,
      }
    ]
  });

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
