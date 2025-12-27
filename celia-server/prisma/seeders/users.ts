import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';

const DUMMY_USERS = [
  {
    id: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
    email: 'sarah@example.com',
    fullName: 'Sarah Johnson',
    collegeName: 'Stanford University',
    major: 'Computer Science',
    graduationYear: 2025,
    bio: 'Tech enthusiast, coffee lover, and weekend hiker. Always looking for new adventures!',
    photoUrls: [
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    ],
    interests: ['Technology', 'Hiking', 'Coffee'],
    preferredLocations: ['Palo Alto', 'San Francisco'],
  },
  {
    id: 'b2c3d4e5-f6a7-4890-b123-456789abcdef',
    email: 'michael@example.com',
    fullName: 'Michael Chen',
    collegeName: 'MIT',
    major: 'Engineering',
    graduationYear: 2024,
    bio: 'Engineer by day, musician by night. Love building things and making music.',
    photoUrls: [
      'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    ],
    interests: ['Engineering', 'Music', 'Building'],
    preferredLocations: ['Boston', 'Cambridge'],
  },
  {
    id: 'c3d4e5f6-a7b8-4901-c234-56789abcdef0',
    email: 'emily@example.com',
    fullName: 'Emily Rodriguez',
    collegeName: 'UC Berkeley',
    major: 'Business',
    graduationYear: 2025,
    bio: 'Aspiring entrepreneur passionate about social impact and sustainability.',
    photoUrls: [
      'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    ],
    interests: ['Business', 'Sustainability', 'Entrepreneurship'],
    preferredLocations: ['Berkeley', 'Oakland'],
  },
  {
    id: 'd4e5f6a7-b8c9-4012-d345-6789abcdef01',
    email: 'james@example.com',
    fullName: 'James Williams',
    collegeName: 'Harvard University',
    major: 'Economics',
    graduationYear: 2024,
    bio: 'Economics major with a passion for finance and global markets.',
    photoUrls: [
      'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
    ],
    interests: ['Economics', 'Finance', 'Travel'],
    preferredLocations: ['Cambridge', 'Boston'],
  },
  {
    id: 'e5f6a7b8-c9d0-4123-e456-789abcdef012',
    email: 'sophia@example.com',
    fullName: 'Sophia Martinez',
    collegeName: 'UCLA',
    major: 'Psychology',
    graduationYear: 2025,
    bio: 'Psychology student interested in mental health and human behavior.',
    photoUrls: [
      'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg',
    ],
    interests: ['Psychology', 'Mental Health', 'Yoga'],
    preferredLocations: ['Los Angeles', 'Santa Monica'],
  },
  {
    id: 'f6a7b8c9-d0e1-4234-f567-89abcdef0123',
    email: 'david@example.com',
    fullName: 'David Kim',
    collegeName: 'NYU',
    major: 'Finance',
    graduationYear: 2024,
    bio: 'Finance major, Wall Street dreamer, and basketball enthusiast.',
    photoUrls: [
      'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg',
    ],
    interests: ['Finance', 'Basketball', 'Investing'],
    preferredLocations: ['New York', 'Manhattan'],
  },
  {
    id: 'a7b8c9d0-e1f2-4345-a678-9abcdef01234',
    email: 'olivia@example.com',
    fullName: 'Olivia Brown',
    collegeName: 'Columbia University',
    major: 'Journalism',
    graduationYear: 2025,
    bio: 'Aspiring journalist covering tech and culture. Always chasing the next big story.',
    photoUrls: [
      'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
    ],
    interests: ['Journalism', 'Writing', 'Technology'],
    preferredLocations: ['New York', 'Brooklyn'],
  },
  {
    id: 'b8c9d0e1-f2a3-4456-b789-abcdef012345',
    email: 'daniel@example.com',
    fullName: 'Daniel Taylor',
    collegeName: 'University of Michigan',
    major: 'Engineering',
    graduationYear: 2024,
    bio: 'Mechanical engineer who loves cars, robots, and anything that moves.',
    photoUrls: [
      'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    ],
    interests: ['Engineering', 'Cars', 'Robotics'],
    preferredLocations: ['Ann Arbor', 'Detroit'],
  },
  {
    id: 'c9d0e1f2-a3b4-4567-c890-abcdef012345',
    email: 'sienna@example.com',
    fullName: 'Sienna Anderson',
    collegeName: 'USC',
    major: 'Film',
    graduationYear: 2025,
    bio: 'Film student and aspiring director. Love storytelling through visual media.',
    photoUrls: [
      'https://images.pexels.com/photos/1468379/pexels-photo-1468379.jpeg',
    ],
    interests: ['Film', 'Photography', 'Art'],
    preferredLocations: ['Los Angeles', 'Hollywood'],
  },
  {
    id: 'd0e1f2a3-b4c5-4678-d901-abcdef012345',
    email: 'alex@example.com',
    fullName: 'Alex Thompson',
    collegeName: 'University of Washington',
    major: 'Computer Science',
    graduationYear: 2024,
    bio: 'CS student passionate about AI and machine learning. Coffee addict.',
    photoUrls: [
      'https://images.pexels.com/photos/1484794/pexels-photo-1484794.jpeg',
    ],
    interests: ['AI', 'Machine Learning', 'Coffee'],
    preferredLocations: ['Seattle', 'Bellevue'],
  },
];

// Data pools for overlaps
const COLLEGES = [
  'Stanford University',
  'MIT',
  'Harvard University',
  'UC Berkeley',
  'UCLA',
  'NYU',
  'Columbia University',
  'University of Michigan',
  'USC',
  'University of Washington',
];

const MAJORS = [
  'Computer Science',
  'Engineering',
  'Business',
  'Economics',
  'Psychology',
  'Finance',
  'Journalism',
  'Film',
  'Biology',
  'Mathematics',
];

const INTERESTS = [
  'Technology',
  'Hiking',
  'Coffee',
  'Engineering',
  'Music',
  'Building',
  'Business',
  'Sustainability',
  'Entrepreneurship',
  'Economics',
  'Finance',
  'Travel',
  'Psychology',
  'Mental Health',
  'Yoga',
  'Basketball',
  'Investing',
  'Journalism',
  'Writing',
  'Cars',
  'Robotics',
  'Film',
  'Photography',
  'Art',
  'AI',
  'Machine Learning',
];

const LOCATIONS = [
  'San Francisco',
  'Palo Alto',
  'San Jose',
  'Boston',
  'Cambridge',
  'New York',
  'Brooklyn',
  'Manhattan',
  'Los Angeles',
  'Santa Monica',
  'Hollywood',
  'Seattle',
  'Bellevue',
  'Chicago',
  'Austin',
  'Miami',
];

const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'New York': { lat: 40.7128, lng: -74.006 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  Chicago: { lat: 41.8818, lng: -87.6232 },
  'San Francisco': { lat: 37.7749, lng: -122.4194 },
  Seattle: { lat: 47.6062, lng: -122.3321 },
  Austin: { lat: 30.2672, lng: -97.7431 },
  Boston: { lat: 42.3601, lng: -71.0589 },
  Miami: { lat: 25.7617, lng: -80.1918 },
  'Palo Alto': { lat: 37.4419, lng: -122.143 },
  'San Jose': { lat: 37.3382, lng: -121.8863 },
  Cambridge: { lat: 42.3736, lng: -71.1097 },
  Brooklyn: { lat: 40.6782, lng: -73.9442 },
  Manhattan: { lat: 40.7831, lng: -73.9712 },
  'Santa Monica': { lat: 34.0195, lng: -118.4912 },
  Hollywood: { lat: 34.0928, lng: -118.3287 },
  Bellevue: { lat: 47.6101, lng: -122.2015 },
  'New Haven': { lat: 41.3083, lng: -72.9279 },
  Princeton: { lat: 40.3573, lng: -74.6672 },
  Philadelphia: { lat: 39.9526, lng: -75.1652 },
  Durham: { lat: 35.994, lng: -78.8986 },
  Evanston: { lat: 42.0451, lng: -87.6877 },
  Ithaca: { lat: 42.444, lng: -76.5019 },
};

export async function seedUsers(prisma: PrismaClient) {
  console.log('🌱 Seeding users...');

  // 0. Fetch all colleges to assign correct IDs
  const allColleges = await prisma.college.findMany();
  const collegeMap = new Map(allColleges.map((c) => [c.name, c.id]));
  console.log(`Loaded ${collegeMap.size} colleges for linking`);

  // CLEAR EXISTING USERS
  console.log('Cleaning up existing users...');
  await prisma.user.deleteMany({});

  const password = 'Password@123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Seed fixed dummy users
  for (const userData of DUMMY_USERS) {
    try {
      const primaryLocation = userData.preferredLocations[0] || 'San Francisco';
      const cityCoords =
        CITY_COORDINATES[primaryLocation] || CITY_COORDINATES['San Francisco'];

      const latJitter = (Math.random() - 0.5) * 0.1;
      const lngJitter = (Math.random() - 0.5) * 0.1;

      const collegeId = userData.collegeName
        ? collegeMap.get(userData.collegeName)
        : undefined;

      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          id: userData.id,
          email: userData.email,
          password: hashedPassword,
          fullName: userData.fullName,
          collegeName: userData.collegeName,
          collegeId: collegeId, // Link to College model
          major: userData.major,
          graduationYear: userData.graduationYear,
          bio: userData.bio,
          photoUrls: userData.photoUrls,
          interests: userData.interests,
          preferredLocations: userData.preferredLocations,
          profileCompleted: true,
          lastLatitude: cityCoords.lat + latJitter,
          lastLongitude: cityCoords.lng + lngJitter,
          lastLocationAt: new Date(),
        },
      });
      console.log(
        `✓ Seeded anchor user: ${userData.email} (${userData.collegeName})`,
      );
    } catch (error: any) {
      console.error(
        `✗ Error seeding anchor user ${userData.email}:`,
        error.message,
      );
    }
  }

  // 2. Generate 100 random users with overlaps
  console.log('🎲 Generating 100 random users with overlaps...');

  for (let i = 0; i < 100; i++) {
    const sex = faker.person.sexType();
    const firstName = faker.person.firstName(sex);
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    // Pick random attributes with overlap
    const collegeName = faker.helpers.arrayElement(COLLEGES);
    const collegeId = collegeMap.get(collegeName);
    const major = faker.helpers.arrayElement(MAJORS);
    const graduationYear = faker.number.int({ min: 2023, max: 2026 });

    // Pick 3-5 interests
    const userInterests = faker.helpers.arrayElements(INTERESTS, {
      min: 3,
      max: 5,
    });

    // Pick 1-2 locations
    const preferredLocations = faker.helpers.arrayElements(LOCATIONS, {
      min: 1,
      max: 2,
    });

    // Generate bio
    const bio = faker.person.bio() + ' ' + faker.lorem.sentence();

    // Generate photo (using UI avatars or placeholder for now as real URLs are hard to generate reliably without API)
    const photoUrls = [faker.image.avatar()];

    // Generate location from preferred location (pick first one)
    const primaryLocation = preferredLocations[0] || 'San Francisco';
    const cityCoords =
      CITY_COORDINATES[primaryLocation] || CITY_COORDINATES['San Francisco'];

    // Add random jitter (approx 5km radius) to avoid stacking users exactly on top of each other
    // 1 degree lat is ~111km, so 0.05 is ~5.5km
    const latJitter = (Math.random() - 0.5) * 0.1;
    const lngJitter = (Math.random() - 0.5) * 0.1;

    try {
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          password: hashedPassword,
          fullName,
          collegeName,
          collegeId: collegeMap.get(collegeName),
          major,
          graduationYear,
          bio,
          photoUrls,
          interests: userInterests,
          preferredLocations,
          profileCompleted: true,
          gender: sex,
          dateOfBirth: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }),
          lastLatitude: cityCoords.lat + latJitter,
          lastLongitude: cityCoords.lng + lngJitter,
          lastLocationAt: new Date(),
        },
      });
      // console.log(`✓ Generated user: ${email}`); // Commented out to reduce noise
    } catch (error: any) {
      // Ignore unique constraint errors (duplicate emails)
      if (!error.message.includes('Unique constraint')) {
        console.error(`✗ Error generating user ${email}:`, error.message);
      }
    }
  }

  console.log('✅ Users seeded successfully!');
  console.log('📝 All users have password: Password@123');
}
