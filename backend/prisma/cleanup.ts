import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const stableIds = ['dest-bhubaneswar', 'dest-puri', 'dest-konark', 'dest-jaipur', 'dest-varanasi'];
  
  const dupes = await prisma.destination.findMany({
    where: { id: { notIn: stableIds } }
  });
  
  console.log(`Found ${dupes.length} old destinations to clean:`, dupes.map(d => `${d.name} (${d.id})`));
  
  for (const d of dupes) {
    // Get all attractions for this destination
    const attrs = await prisma.attraction.findMany({ where: { destinationId: d.id }, select: { id: true } });
    const attrIds = attrs.map(a => a.id);
    
    // Delete facts referencing these attractions first (FK: facts.entity_id → attractions.id)
    if (attrIds.length > 0) {
      const factsDel = await prisma.fact.deleteMany({ where: { entityId: { in: attrIds } } });
      const crowdDel = await prisma.crowdCapacityRecord.deleteMany({ where: { attractionId: { in: attrIds } } });
      console.log(`  Deleted ${factsDel.count} facts, ${crowdDel.count} crowd records for ${d.name}`);
    }
    
    const deleted = await prisma.attraction.deleteMany({ where: { destinationId: d.id } });
    console.log(`  Deleted ${deleted.count} attractions for ${d.name}`);
    await prisma.destination.delete({ where: { id: d.id } });
    console.log(`  Deleted destination: ${d.name}`);
  }
  
  const remaining = await prisma.destination.count();
  const attractionCount = await prisma.attraction.count();
  console.log(`\nCleanup done! ${remaining} destinations, ${attractionCount} attractions remain.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
