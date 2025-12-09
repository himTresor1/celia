import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

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

  console.log('Seeding event categories...');
  for (const category of categories) {
    await prisma.eventCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    });
  }

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

  console.log('Seeding interest categories...');
  for (const interest of interests) {
    await prisma.interestCategory.upsert({
      where: { name: interest },
      update: {},
      create: { name: interest },
    });
  }

  const colleges = [
    {
      name: 'Stanford University',
      domain: 'stanford.edu',
      location: 'Stanford, CA',
    },
    {
      name: 'Harvard University',
      domain: 'harvard.edu',
      location: 'Cambridge, MA',
    },
    { name: 'MIT', domain: 'mit.edu', location: 'Cambridge, MA' },
    {
      name: 'UC Berkeley',
      domain: 'berkeley.edu',
      location: 'Berkeley, CA',
    },
    { name: 'UCLA', domain: 'ucla.edu', location: 'Los Angeles, CA' },
    {
      name: 'Yale University',
      domain: 'yale.edu',
      location: 'New Haven, CT',
    },
    {
      name: 'Princeton University',
      domain: 'princeton.edu',
      location: 'Princeton, NJ',
    },
    {
      name: 'Columbia University',
      domain: 'columbia.edu',
      location: 'New York, NY',
    },
    {
      name: 'University of Chicago',
      domain: 'uchicago.edu',
      location: 'Chicago, IL',
    },
    {
      name: 'University of Pennsylvania',
      domain: 'upenn.edu',
      location: 'Philadelphia, PA',
    },
    {
      name: 'Duke University',
      domain: 'duke.edu',
      location: 'Durham, NC',
    },
    {
      name: 'Northwestern University',
      domain: 'northwestern.edu',
      location: 'Evanston, IL',
    },
    {
      name: 'Cornell University',
      domain: 'cornell.edu',
      location: 'Ithaca, NY',
    },
    {
      name: 'USC',
      domain: 'usc.edu',
      location: 'Los Angeles, CA',
    },
    {
      name: 'NYU',
      domain: 'nyu.edu',
      location: 'New York, NY',
    },
  ];

  console.log('Seeding colleges...');
  for (const college of colleges) {
    await prisma.college.upsert({
      where: { name: college.name },
      update: {},
      create: college,
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
