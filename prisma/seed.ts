import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Placeholder seed logic. Extend with demo data when ready.
  console.info('Seed script executed. Add seed data as needed.');
}

main()
  .catch((error) => {
    console.error('Seed script failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

