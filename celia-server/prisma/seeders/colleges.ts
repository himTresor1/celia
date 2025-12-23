import { PrismaClient } from '@prisma/client';

export async function seedColleges(prisma: PrismaClient) {
  console.log('Seeding colleges...');
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

  for (const college of colleges) {
    await prisma.college.upsert({
      where: { name: college.name },
      update: {},
      create: college,
    });
  }
}
