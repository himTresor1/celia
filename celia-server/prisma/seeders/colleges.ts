import { PrismaClient } from '@prisma/client';

export async function seedColleges(prisma: PrismaClient) {
  console.log('Seeding colleges...');
  const colleges = [
    {
      name: 'Stanford University',
      domain: 'stanford.edu',
      location: 'Stanford, CA',
      latitude: 37.4275,
      longitude: -122.1697,
    },
    {
      name: 'Harvard University',
      domain: 'harvard.edu',
      location: 'Cambridge, MA',
      latitude: 42.377,
      longitude: -71.1167,
    },
    {
      name: 'MIT',
      domain: 'mit.edu',
      location: 'Cambridge, MA',
      latitude: 42.3601,
      longitude: -71.0942,
    },
    {
      name: 'UC Berkeley',
      domain: 'berkeley.edu',
      location: 'Berkeley, CA',
      latitude: 37.8715,
      longitude: -122.2537,
    },
    {
      name: 'UCLA',
      domain: 'ucla.edu',
      location: 'Los Angeles, CA',
      latitude: 34.0689,
      longitude: -118.4452,
    },
    {
      name: 'Yale University',
      domain: 'yale.edu',
      location: 'New Haven, CT',
      latitude: 41.3163,
      longitude: -72.9223,
    },
    {
      name: 'Princeton University',
      domain: 'princeton.edu',
      location: 'Princeton, NJ',
      latitude: 40.3431,
      longitude: -74.6551,
    },
    {
      name: 'Columbia University',
      domain: 'columbia.edu',
      location: 'New York, NY',
      latitude: 40.8075,
      longitude: -73.9626,
    },
    {
      name: 'University of Chicago',
      domain: 'uchicago.edu',
      location: 'Chicago, IL',
      latitude: 41.7886,
      longitude: -87.5987,
    },
    {
      name: 'University of Pennsylvania',
      domain: 'upenn.edu',
      location: 'Philadelphia, PA',
      latitude: 39.9522,
      longitude: -75.1932,
    },
    {
      name: 'Duke University',
      domain: 'duke.edu',
      location: 'Durham, NC',
      latitude: 36.0014,
      longitude: -78.9382,
    },
    {
      name: 'Northwestern University',
      domain: 'northwestern.edu',
      location: 'Evanston, IL',
      latitude: 42.0565,
      longitude: -87.6753,
    },
    {
      name: 'Cornell University',
      domain: 'cornell.edu',
      location: 'Ithaca, NY',
      latitude: 42.4534,
      longitude: -76.4735,
    },
    {
      name: 'USC',
      domain: 'usc.edu',
      location: 'Los Angeles, CA',
      latitude: 34.0224,
      longitude: -118.2851,
    },
    {
      name: 'NYU',
      domain: 'nyu.edu',
      location: 'New York, NY',
      latitude: 40.7295,
      longitude: -73.9965,
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
