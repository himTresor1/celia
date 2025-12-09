/**
 * Dummy users with valid UUIDs for testing and development
 * These UUIDs are fixed so they remain consistent across app restarts
 * Note: Using fixed UUIDs instead of generating them to avoid React Native crypto issues
 */

// Fixed UUIDs for dummy users (generated once, reused for consistency)
export const DUMMY_USER_UUIDS = {
  sarah: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
  michael: 'b2c3d4e5-f6a7-4890-b123-456789abcdef',
  emily: 'c3d4e5f6-a7b8-4901-c234-56789abcdef0',
  james: 'd4e5f6a7-b8c9-4012-d345-6789abcdef01',
  sophia: 'e5f6a7b8-c9d0-4123-e456-789abcdef012',
  david: 'f6a7b8c9-d0e1-4234-f567-89abcdef0123',
  olivia: 'a7b8c9d0-e1f2-4345-a678-9abcdef01234',
  daniel: 'b8c9d0e1-f2a3-4456-b789-abcdef012345',
  sienna: 'c9d0e1f2-a3b4-4567-c890-abcdef012345',
  alex: 'd0e1f2a3-b4c5-4678-d901-abcdef012345',
  maya: 'e1f2a3b4-c5d6-4789-e012-abcdef012345',
  jordan: 'f2a3b4c5-d6e7-4890-f123-abcdef012345',
  emma: 'a3b4c5d6-e7f8-4901-a234-abcdef012345',
};

export interface DummyUserProfile {
  id: string;
  full_name: string;
  email: string;
  bio?: string;
  photo_urls: string[];
  interests: string[];
  college_name: string;
  preferred_locations: string[];
  is_profile_completed?: boolean;
}

/**
 * Main dummy users list for the discover/select guests screens
 */
export const DUMMY_USERS: DummyUserProfile[] = [
  {
    id: DUMMY_USER_UUIDS.sarah,
    full_name: 'Sarah Johnson',
    email: 'sarah@harvard.edu',
    bio: 'CS major, love hiking',
    photo_urls: ['https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'],
    interests: ['Technology & Gaming', 'Outdoor Activities'],
    college_name: 'Harvard University',
    preferred_locations: ['Cambridge, MA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.michael,
    full_name: 'Michael Chen',
    email: 'michael@stanford.edu',
    bio: 'Business student, entrepreneur',
    photo_urls: ['https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'],
    interests: ['Business & Entrepreneurship', 'Technology & Gaming'],
    college_name: 'Stanford University',
    preferred_locations: ['Palo Alto, CA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.emily,
    full_name: 'Emily Davis',
    email: 'emily@mit.edu',
    bio: 'Engineer, love music',
    photo_urls: ['https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'],
    interests: ['Arts & Music', 'Science & Research'],
    college_name: 'MIT',
    preferred_locations: ['Cambridge, MA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.james,
    full_name: 'James Wilson',
    email: 'james@yale.edu',
    bio: 'History major, avid reader',
    photo_urls: ['https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'],
    interests: ['Reading & Writing', 'Movies & TV'],
    college_name: 'Yale University',
    preferred_locations: ['New Haven, CT'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.sophia,
    full_name: 'Sophia Martinez',
    email: 'sophia@columbia.edu',
    bio: 'Artist and designer',
    photo_urls: ['https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg'],
    interests: ['Photography & Design', 'Fashion & Beauty'],
    college_name: 'Columbia University',
    preferred_locations: ['New York, NY'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.david,
    full_name: 'David Lee',
    email: 'david@uchicago.edu',
    bio: 'Economics student',
    photo_urls: ['https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg'],
    interests: ['Business & Entrepreneurship', 'Sports & Fitness'],
    college_name: 'University of Chicago',
    preferred_locations: ['Chicago, IL'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.olivia,
    full_name: 'Olivia Brown',
    email: 'olivia@berkeley.edu',
    bio: 'Environmental science major',
    photo_urls: ['https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'],
    interests: ['Environmental Sustainability', 'Outdoor Activities'],
    college_name: 'UC Berkeley',
    preferred_locations: ['Berkeley, CA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.daniel,
    full_name: 'Daniel Kim',
    email: 'daniel@ucla.edu',
    bio: 'Film student',
    photo_urls: ['https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg'],
    interests: ['Movies & TV', 'Photography & Design'],
    college_name: 'UCLA',
    preferred_locations: ['Los Angeles, CA'],
    is_profile_completed: true,
  },
];

/**
 * Helper function to insert dummy users into the database
 * Call this once to populate the database with test users
 */
export async function insertDummyUsers(supabase: any) {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert(
        DUMMY_USERS.map((user) => ({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          college_name: user.college_name,
          photo_urls: user.photo_urls,
          interests: user.interests,
          preferred_locations: user.preferred_locations,
          is_profile_completed: user.is_profile_completed ?? true,
        })),
        { onConflict: 'id' }
      );

    if (error) {
      console.error('Error inserting dummy users:', error);
      return { error };
    }

    console.log(`Successfully inserted ${DUMMY_USERS.length} dummy users`);
    return { error: null };
  } catch (err) {
    console.error('Exception inserting dummy users:', err);
    return { error: err };
  }
}

