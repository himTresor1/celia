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

export async function seedUsers(prisma: PrismaClient) {
  console.log('🌱 Seeding users...');

  const password = 'Password@123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Seed fixed dummy users
  for (const userData of DUMMY_USERS) {
    try {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          id: userData.id,
          email: userData.email,
          password: hashedPassword,
          fullName: userData.fullName,
          collegeName: userData.collegeName,
          major: userData.major,
          graduationYear: userData.graduationYear,
          bio: userData.bio,
          photoUrls: userData.photoUrls,
          interests: userData.interests,
          preferredLocations: userData.preferredLocations,
          profileCompleted: true,
        },
      });
      console.log(`✓ Seeded anchor user: ${userData.email}`);
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

    try {
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          password: hashedPassword,
          fullName,
          collegeName,
          major,
          graduationYear,
          bio,
          photoUrls,
          interests: userInterests,
          preferredLocations,
          profileCompleted: true,
          gender: sex,
          dateOfBirth: faker.date.birthdate({ min: 18, max: 25, mode: 'age' }),
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
