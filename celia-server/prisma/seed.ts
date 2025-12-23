import { PrismaClient } from '@prisma/client';
import { seedCategories } from './seeders/categories';
import { seedColleges } from './seeders/colleges';
import { seedCities } from './seeders/cities';
import { seedUsers } from './seeders/users';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  try {
    await seedCategories(prisma);
    await seedColleges(prisma);
    await seedCities(prisma);
    await seedUsers(prisma);

    console.log('Database seeded successfully!');
  } catch (e) {
    console.error('Error during seeding:', e);
    throw e;
  }
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
