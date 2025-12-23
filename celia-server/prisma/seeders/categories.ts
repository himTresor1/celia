import { PrismaClient } from '@prisma/client';

export async function seedCategories(prisma: PrismaClient) {
  console.log('Seeding event categories...');
  const categories = [
    { name: 'Study Session', icon: 'book' },
    { name: 'Party', icon: 'music' },
    { name: 'Sports & Fitness', icon: 'dumbbell' },
    { name: 'Food & Dining', icon: 'utensils' },
    { name: 'Outdoor Activity', icon: 'tree' },
    { name: 'Gaming', icon: 'gamepad' },
    { name: 'Movie Night', icon: 'film' },
    { name: 'Concert', icon: 'music' },
    { name: 'Networking', icon: 'users' },
    { name: 'Workshop', icon: 'briefcase' },
    { name: 'Volunteer', icon: 'heart' },
    { name: 'Social Gathering', icon: 'coffee' },
  ];

  for (const category of categories) {
    await prisma.eventCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

  console.log('Seeding interest categories...');
  const interests = [
    'Sports & Fitness',
    'Arts & Music',
    'Technology & Gaming',
    'Food & Cooking',
    'Travel & Adventure',
    'Reading & Writing',
    'Movies & TV',
    'Business & Entrepreneurship',
    'Science & Research',
    'Social Justice & Activism',
    'Photography & Design',
    'Dance & Theater',
    'Outdoor Activities',
    'Volunteering',
    'Fashion & Beauty',
  ];

  for (const interest of interests) {
    await prisma.interestCategory.upsert({
      where: { name: interest },
      update: {},
      create: { name: interest },
    });
  }
}
