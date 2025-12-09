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
  // Additional users
  rachel: 'b4c5d6e7-f8a9-4902-b345-abcdef012345',
  noah: 'c5d6e7f8-a9b0-4903-c456-abcdef012345',
  isabella: 'd6e7f8a9-b0c1-4904-d567-abcdef012345',
  ethan: 'e7f8a9b0-c1d2-4905-e678-abcdef012345',
  mia: 'f8a9b0c1-d2e3-4906-f789-abcdef012345',
  lucas: 'a9b0c1d2-e3f4-4907-a890-abcdef012345',
  ava: 'b0c1d2e3-f4a5-4908-b901-abcdef012345',
  jackson: 'c1d2e3f4-a5b6-4909-c012-abcdef012345',
  luna: 'd2e3f4a5-b6c7-4910-d123-abcdef012345',
  aiden: 'e3f4a5b6-c7d8-4911-e234-abcdef012345',
  charlotte: 'f4a5b6c7-d8e9-4912-f345-abcdef012345',
  liam: 'a5b6c7d8-e9f0-4913-a456-abcdef012345',
  amelia: 'b6c7d8e9-f0a1-4914-b567-abcdef012345',
  henry: 'c7d8e9f0-a1b2-4915-c678-abcdef012345',
  harper: 'd8e9f0a1-b2c3-4916-d789-abcdef012345',
  alexander: 'e9f0a1b2-c3d4-4917-e890-abcdef012345',
  ella: 'f0a1b2c3-d4e5-4918-f901-abcdef012345',
  mason: 'a1b2c3d4-e5f6-4919-a012-abcdef012345',
  scarlett: 'b2c3d4e5-f6a7-4920-b123-abcdef012345',
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
    bio: 'CS major passionate about AI and machine learning. Love hiking on weekends and exploring new coffee shops ☕',
    photo_urls: ['https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg'],
    interests: ['Technology & Gaming', 'Outdoor Activities', 'Food & Cooking'],
    college_name: 'Harvard University',
    preferred_locations: ['Cambridge, MA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.michael,
    full_name: 'Michael Chen',
    email: 'michael@stanford.edu',
    bio: 'Business student and aspiring entrepreneur. Always looking for the next big idea! Let\'s build something together 🚀',
    photo_urls: ['https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'],
    interests: ['Business & Entrepreneurship', 'Technology & Gaming', 'Sports & Fitness'],
    college_name: 'Stanford University',
    preferred_locations: ['Palo Alto, CA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.emily,
    full_name: 'Emily Davis',
    email: 'emily@mit.edu',
    bio: 'Mechanical engineer who loves music festivals and live concerts. Always down for an adventure! 🎵',
    photo_urls: ['https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'],
    interests: ['Arts & Music', 'Science & Research', 'Travel & Adventure'],
    college_name: 'MIT',
    preferred_locations: ['Cambridge, MA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.james,
    full_name: 'James Wilson',
    email: 'james@yale.edu',
    bio: 'History major and bookworm. Love discussing philosophy, politics, and everything in between. Coffee enthusiast ☕',
    photo_urls: ['https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'],
    interests: ['Reading & Writing', 'Movies & TV', 'Food & Cooking'],
    college_name: 'Yale University',
    preferred_locations: ['New Haven, CT'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.sophia,
    full_name: 'Sophia Martinez',
    email: 'sophia@columbia.edu',
    bio: 'Graphic designer and visual artist. Passionate about sustainable fashion and creative expression 🎨',
    photo_urls: ['https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg'],
    interests: ['Photography & Design', 'Fashion & Beauty', 'Arts & Music'],
    college_name: 'Columbia University',
    preferred_locations: ['New York, NY'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.david,
    full_name: 'David Lee',
    email: 'david@uchicago.edu',
    bio: 'Economics student interested in behavioral finance. Love basketball and trying new restaurants 🏀',
    photo_urls: ['https://images.pexels.com/photos/1024311/pexels-photo-1024311.jpeg'],
    interests: ['Business & Entrepreneurship', 'Sports & Fitness', 'Food & Cooking'],
    college_name: 'University of Chicago',
    preferred_locations: ['Chicago, IL'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.olivia,
    full_name: 'Olivia Brown',
    email: 'olivia@berkeley.edu',
    bio: 'Environmental science major and climate activist. Love hiking, camping, and protecting our planet 🌍',
    photo_urls: ['https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'],
    interests: ['Environmental Sustainability', 'Outdoor Activities', 'Travel & Adventure'],
    college_name: 'UC Berkeley',
    preferred_locations: ['Berkeley, CA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.daniel,
    full_name: 'Daniel Kim',
    email: 'daniel@ucla.edu',
    bio: 'Film student and aspiring director. Love indie films, photography, and telling stories through visuals 🎬',
    photo_urls: ['https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg'],
    interests: ['Movies & TV', 'Photography & Design', 'Arts & Music'],
    college_name: 'UCLA',
    preferred_locations: ['Los Angeles, CA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.rachel,
    full_name: 'Rachel Thompson',
    email: 'rachel@princeton.edu',
    bio: 'Psychology major fascinated by human behavior. Love yoga, meditation, and deep conversations 🧘',
    photo_urls: ['https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg'],
    interests: ['Sports & Fitness', 'Reading & Writing', 'Arts & Music'],
    college_name: 'Princeton University',
    preferred_locations: ['Princeton, NJ'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.noah,
    full_name: 'Noah Anderson',
    email: 'noah@cornell.edu',
    bio: 'Architecture student with a passion for sustainable design. Love sketching and exploring cities 🏛️',
    photo_urls: ['https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg'],
    interests: ['Photography & Design', 'Travel & Adventure', 'Environmental Sustainability'],
    college_name: 'Cornell University',
    preferred_locations: ['Ithaca, NY'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.isabella,
    full_name: 'Isabella Garcia',
    email: 'isabella@nyu.edu',
    bio: 'Journalism major and podcast host. Always curious about people\'s stories and experiences 🎙️',
    photo_urls: ['https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'],
    interests: ['Reading & Writing', 'Movies & TV', 'Arts & Music'],
    college_name: 'NYU',
    preferred_locations: ['New York, NY'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.ethan,
    full_name: 'Ethan Rodriguez',
    email: 'ethan@usc.edu',
    bio: 'Computer science major and startup founder. Love coding, surfing, and building cool things 💻',
    photo_urls: ['https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg'],
    interests: ['Technology & Gaming', 'Sports & Fitness', 'Business & Entrepreneurship'],
    college_name: 'USC',
    preferred_locations: ['Los Angeles, CA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.mia,
    full_name: 'Mia Taylor',
    email: 'mia@brown.edu',
    bio: 'Neuroscience major and yoga instructor. Passionate about mental health and wellness 🧠',
    photo_urls: ['https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg'],
    interests: ['Sports & Fitness', 'Science & Research', 'Arts & Music'],
    college_name: 'Brown University',
    preferred_locations: ['Providence, RI'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.lucas,
    full_name: 'Lucas White',
    email: 'lucas@duke.edu',
    bio: 'Pre-med student and volunteer EMT. Love helping others and staying active 🏥',
    photo_urls: ['https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg'],
    interests: ['Sports & Fitness', 'Science & Research', 'Outdoor Activities'],
    college_name: 'Duke University',
    preferred_locations: ['Durham, NC'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.ava,
    full_name: 'Ava Moore',
    email: 'ava@northwestern.edu',
    bio: 'Theater major and improv comedian. Love making people laugh and performing on stage 🎭',
    photo_urls: ['https://images.pexels.com/photos/1181516/pexels-photo-1181516.jpeg'],
    interests: ['Arts & Music', 'Movies & TV', 'Reading & Writing'],
    college_name: 'Northwestern University',
    preferred_locations: ['Evanston, IL'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.jackson,
    full_name: 'Jackson Harris',
    email: 'jackson@vanderbilt.edu',
    bio: 'Finance major and stock market enthusiast. Love analyzing trends and playing tennis 📈',
    photo_urls: ['https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg'],
    interests: ['Business & Entrepreneurship', 'Sports & Fitness', 'Technology & Gaming'],
    college_name: 'Vanderbilt University',
    preferred_locations: ['Nashville, TN'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.luna,
    full_name: 'Luna Patel',
    email: 'luna@rice.edu',
    bio: 'Astrophysics major and stargazer. Love astronomy, photography, and late-night conversations about the universe ⭐',
    photo_urls: ['https://images.pexels.com/photos/1181687/pexels-photo-1181687.jpeg'],
    interests: ['Science & Research', 'Photography & Design', 'Outdoor Activities'],
    college_name: 'Rice University',
    preferred_locations: ['Houston, TX'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.aiden,
    full_name: 'Aiden Murphy',
    email: 'aiden@georgetown.edu',
    bio: 'Political science major and debate team captain. Passionate about policy and social justice 🗳️',
    photo_urls: ['https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg'],
    interests: ['Reading & Writing', 'Business & Entrepreneurship', 'Travel & Adventure'],
    college_name: 'Georgetown University',
    preferred_locations: ['Washington, DC'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.charlotte,
    full_name: 'Charlotte Lewis',
    email: 'charlotte@umich.edu',
    bio: 'Biomedical engineering student and research assistant. Love solving problems and helping others 🔬',
    photo_urls: ['https://images.pexels.com/photos/1181688/pexels-photo-1181688.jpeg'],
    interests: ['Science & Research', 'Technology & Gaming', 'Sports & Fitness'],
    college_name: 'University of Michigan',
    preferred_locations: ['Ann Arbor, MI'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.liam,
    full_name: 'Liam Walker',
    email: 'liam@utexas.edu',
    bio: 'Mechanical engineering major and car enthusiast. Love working on projects and going to car shows 🚗',
    photo_urls: ['https://images.pexels.com/photos/1043475/pexels-photo-1043475.jpeg'],
    interests: ['Technology & Gaming', 'Sports & Fitness', 'Outdoor Activities'],
    college_name: 'UT Austin',
    preferred_locations: ['Austin, TX'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.amelia,
    full_name: 'Amelia Foster',
    email: 'amelia@washington.edu',
    bio: 'Marine biology major and scuba diver. Passionate about ocean conservation and marine life 🐠',
    photo_urls: ['https://images.pexels.com/photos/1181689/pexels-photo-1181689.jpeg'],
    interests: ['Environmental Sustainability', 'Outdoor Activities', 'Science & Research'],
    college_name: 'University of Washington',
    preferred_locations: ['Seattle, WA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.henry,
    full_name: 'Henry Clark',
    email: 'henry@gatech.edu',
    bio: 'Aerospace engineering student and pilot. Love flying, engineering, and pushing boundaries ✈️',
    photo_urls: ['https://images.pexels.com/photos/1043476/pexels-photo-1043476.jpeg'],
    interests: ['Technology & Gaming', 'Science & Research', 'Travel & Adventure'],
    college_name: 'Georgia Tech',
    preferred_locations: ['Atlanta, GA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.harper,
    full_name: 'Harper Young',
    email: 'harper@bu.edu',
    bio: 'Public health major and community organizer. Love volunteering and making a difference in my community 💚',
    photo_urls: ['https://images.pexels.com/photos/1181691/pexels-photo-1181691.jpeg'],
    interests: ['Environmental Sustainability', 'Reading & Writing', 'Arts & Music'],
    college_name: 'Boston University',
    preferred_locations: ['Boston, MA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.alexander,
    full_name: 'Alexander King',
    email: 'alexander@cmu.edu',
    bio: 'Robotics engineering student and maker. Love building robots, 3D printing, and tinkering 🤖',
    photo_urls: ['https://images.pexels.com/photos/1043477/pexels-photo-1043477.jpeg'],
    interests: ['Technology & Gaming', 'Science & Research', 'Photography & Design'],
    college_name: 'Carnegie Mellon',
    preferred_locations: ['Pittsburgh, PA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.ella,
    full_name: 'Ella Wright',
    email: 'ella@tufts.edu',
    bio: 'International relations major and language enthusiast. Speak 4 languages and love traveling 🌍',
    photo_urls: ['https://images.pexels.com/photos/1181692/pexels-photo-1181692.jpeg'],
    interests: ['Travel & Adventure', 'Reading & Writing', 'Arts & Music'],
    college_name: 'Tufts University',
    preferred_locations: ['Medford, MA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.mason,
    full_name: 'Mason Green',
    email: 'mason@virginia.edu',
    bio: 'Economics and statistics double major. Love data analysis, sports analytics, and basketball 📊',
    photo_urls: ['https://images.pexels.com/photos/1043478/pexels-photo-1043478.jpeg'],
    interests: ['Business & Entrepreneurship', 'Sports & Fitness', 'Technology & Gaming'],
    college_name: 'University of Virginia',
    preferred_locations: ['Charlottesville, VA'],
    is_profile_completed: true,
  },
  {
    id: DUMMY_USER_UUIDS.scarlett,
    full_name: 'Scarlett Adams',
    email: 'scarlett@emory.edu',
    bio: 'Pre-med student and research volunteer. Passionate about medicine, helping others, and staying active 🏥',
    photo_urls: ['https://images.pexels.com/photos/1181693/pexels-photo-1181693.jpeg'],
    interests: ['Science & Research', 'Sports & Fitness', 'Reading & Writing'],
    college_name: 'Emory University',
    preferred_locations: ['Atlanta, GA'],
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

