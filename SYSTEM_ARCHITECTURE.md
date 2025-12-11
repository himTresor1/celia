# CELIA - Complete System Architecture

## Executive Summary

CELIA is a gamified social discovery and event invitation platform designed for college students. This document outlines the complete system architecture including database design, backend APIs, frontend flows, and gamification mechanics.

---

## 🏗️ Architecture Overview

### Technology Stack

**Backend (NestJS)**
- Framework: NestJS v10+
- Database: PostgreSQL via Prisma ORM
- Authentication: JWT + Passport
- Validation: class-validator
- API: RESTful

**Frontend (React Native + Expo)**
- Framework: Expo v50+
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth
- State Management: React Context
- Navigation: Expo Router
- UI: React Native + Lucide Icons

**Note**: The system uses a **dual database approach**:
- Backend (NestJS) → Prisma → PostgreSQL
- Frontend (React Native) → Supabase Client → PostgreSQL

For production, these should be unified to use Supabase for both, with the backend acting as an API layer.

---

## 📊 Enhanced Database Schema

### Core Entities

#### 1. **users** (Enhanced Profile)

```sql
id                    uuid PRIMARY KEY
email                 text UNIQUE NOT NULL
password              text NOT NULL (hashed)
full_name             text NOT NULL
date_of_birth         date
age                   integer (computed)
gender                text ('male', 'female', 'non-binary', 'prefer-not-to-say')
college_name          text
college_id            uuid FK -> colleges(id)
major                 text
graduation_year       integer
bio                   text
avatar_url            text
photo_urls            jsonb (array of URLs)
interests             text[] (array)
college_verified      boolean DEFAULT false
preferred_locations   text[]
profile_completed     boolean DEFAULT false

-- Gamification Fields
attractiveness_score  integer DEFAULT 0 (0-100 scale, displayed as 1-10)
engagement_points     integer DEFAULT 0
social_streak_days    integer DEFAULT 0
last_active_date      date
app_opens_count       integer DEFAULT 0
profile_completeness  integer DEFAULT 0 (percentage)

created_at            timestamptz DEFAULT now()
updated_at            timestamptz DEFAULT now()
```

**Indexes**: email, college_id, attractiveness_score, gender, age

---

#### 2. **friendships** (New - Friend Connection System)

```sql
id                    uuid PRIMARY KEY
user1_id              uuid FK -> users(id)
user2_id              uuid FK -> users(id)
status                text ('pending', 'active', 'expired')
connection_method     text ('energy_pulse', 'qr_code', 'streak_handshake')
initiated_by          uuid FK -> users(id)

-- Energy Pulse Fields
pulse_sent_by_user1   timestamptz
pulse_sent_by_user2   timestamptz
pulse_expires_at      timestamptz

-- QR Code Fields
qr_code_token         text UNIQUE
qr_generated_at       timestamptz
qr_scanned_at         timestamptz

-- Streak Handshake Fields
streak_day_required   integer
user1_streak_met      boolean DEFAULT false
user2_streak_met      boolean DEFAULT false

created_at            timestamptz DEFAULT now()
completed_at          timestamptz

UNIQUE(user1_id, user2_id) -- Ensure no duplicate friendships
CHECK (user1_id < user2_id) -- Enforce canonical ordering
```

**Indexes**: user1_id, user2_id, status

---

#### 3. **saved_users** (New - Saved List)

```sql
id                    uuid PRIMARY KEY
user_id               uuid FK -> users(id) -- Who saved
saved_user_id         uuid FK -> users(id) -- Who was saved
saved_from_context    text ('just_looking', 'event_browse', 'profile_view')
notes                 text
created_at            timestamptz DEFAULT now()

UNIQUE(user_id, saved_user_id)
```

**Indexes**: user_id, saved_user_id, created_at

---

#### 4. **user_invitees** (New - Invitees List)

```sql
id                    uuid PRIMARY KEY
user_id               uuid FK -> users(id) -- Who invited
invitee_id            uuid FK -> users(id) -- Who was invited
first_invited_at      timestamptz DEFAULT now()
last_invited_at       timestamptz DEFAULT now()
total_invitations     integer DEFAULT 1
events_invited_to     uuid[] -- Array of event IDs

UNIQUE(user_id, invitee_id)
```

**Indexes**: user_id, invitee_id

---

#### 5. **events** (Enhanced)

```sql
id                    uuid PRIMARY KEY
host_id               uuid FK -> users(id)
name                  text NOT NULL
description           text
category_id           uuid FK -> event_categories(id)
location_name         text
location_lat          float
location_lng          float
event_date            date
start_time            timestamptz
end_time              timestamptz
photo_urls            jsonb (array)
interest_tags         text[]
capacity_limit        integer
is_public             boolean DEFAULT true
status                text ('draft', 'active', 'cancelled', 'completed')
cancellation_reason   text

-- NEW: External Link
external_link         text -- Google Form, Eventbrite, WhatsApp, etc.
external_link_type    text ('google_form', 'eventbrite', 'whatsapp', 'website', 'other')

created_at            timestamptz DEFAULT now()
updated_at            timestamptz DEFAULT now()
```

**Indexes**: host_id, status, event_date, category_id, is_public

---

#### 6. **event_invitations** (Enhanced)

```sql
id                    uuid PRIMARY KEY
event_id              uuid FK -> events(id)
inviter_id            uuid FK -> users(id)
invitee_id            uuid FK -> users(id)
status                text ('pending', 'going', 'declined') -- Changed from 'accepted'
personal_message      text
decline_reason        text ('schedule_conflict', 'not_interested', 'too_far', 'other')
responded_at          timestamptz
created_at            timestamptz DEFAULT now()
updated_at            timestamptz DEFAULT now()

UNIQUE(event_id, invitee_id)
```

**Indexes**: invitee_id, inviter_id, event_id, status

---

#### 7. **engagement_logs** (New - For Scoring Algorithm)

```sql
id                    uuid PRIMARY KEY
user_id               uuid FK -> users(id)
action_type           text ('app_open', 'profile_update', 'event_create', 'invitation_send', 'invitation_accept', 'friend_add', 'swipe', 'search')
points_earned         integer
metadata              jsonb -- Additional context
created_at            timestamptz DEFAULT now()
```

**Indexes**: user_id, action_type, created_at

---

### Supporting Tables

#### 8. **event_categories**
```sql
id          uuid PRIMARY KEY
name        text UNIQUE NOT NULL
icon        text
created_at  timestamptz DEFAULT now()
```

#### 9. **interest_categories**
```sql
id          uuid PRIMARY KEY
name        text UNIQUE NOT NULL
created_at  timestamptz DEFAULT now()
```

#### 10. **colleges**
```sql
id          uuid PRIMARY KEY
name        text UNIQUE NOT NULL
domain      text
location    text
created_at  timestamptz DEFAULT now()
```

#### 11. **event_attendees**
```sql
id          uuid PRIMARY KEY
event_id    uuid FK -> events(id)
user_id     uuid FK -> users(id)
joined_at   timestamptz DEFAULT now()

UNIQUE(event_id, user_id)
```

---

## 🎮 Gamification System: Attractiveness Scoring

### Scoring Algorithm

**Attractiveness Score (0-100)** displayed as **Rating (1-10)**

```typescript
const WEIGHTS = {
  profileCompleteness: 25,    // Max 25 points
  friendsCount: 20,            // Max 20 points
  eventsAttended: 15,          // Max 15 points
  invitationRatio: 15,         // Max 15 points
  engagementPoints: 15,        // Max 15 points
  socialStreak: 10             // Max 10 points
};

function calculateAttractivenessScore(user) {
  let score = 0;

  // 1. Profile Completeness (0-25)
  const fields = ['full_name', 'bio', 'college_name', 'major', 'interests', 'photo_urls', 'preferred_locations'];
  const completedFields = fields.filter(f => user[f] && user[f].length > 0).length;
  score += (completedFields / fields.length) * 25;

  // 2. Friends Count (0-20) - Logarithmic scale
  const friendsCount = user.friendsCount || 0;
  score += Math.min(20, Math.log10(friendsCount + 1) * 6);

  // 3. Events Attended (0-15)
  const eventsAttended = user.eventsAttended || 0;
  score += Math.min(15, Math.log10(eventsAttended + 1) * 5);

  // 4. Invitation Acceptance Ratio (0-15)
  const received = user.invitationsReceived || 0;
  const accepted = user.invitationsAccepted || 0;
  if (received > 0) {
    score += (accepted / received) * 15;
  }

  // 5. Engagement Points (0-15)
  const engagement = user.engagementPoints || 0;
  score += Math.min(15, (engagement / 1000) * 15);

  // 6. Social Streak (0-10)
  const streak = user.socialStreakDays || 0;
  score += Math.min(10, (streak / 30) * 10);

  return Math.round(score);
}

function displayRating(score) {
  // Convert 0-100 to 1-10 scale with threshold
  if (score < 10) return 1;
  if (score < 20) return 2;
  if (score < 30) return 3;
  if (score < 40) return 4;
  if (score < 50) return 5;
  if (score < 60) return 6;
  if (score < 70) return 7;
  if (score < 80) return 8;
  if (score < 90) return 9;
  return 10; // Only achievable with near-perfect metrics
}
```

### Engagement Point System

| Action | Points |
|--------|--------|
| App open (once per day) | 5 |
| Profile update | 10 |
| Add profile photo | 15 |
| Complete bio | 20 |
| Send invitation | 3 |
| Accept invitation | 5 |
| Create event | 25 |
| Attend event | 30 |
| Add friend | 20 |
| Maintain 7-day streak | 50 |
| Maintain 30-day streak | 200 |

### Social Streak Rules

- Opens app at least once per day
- Resets to 0 if missed a day
- Displayed with fire icon 🔥
- Contributes to attractiveness score

---

## 🤝 Friend Connection Mechanism: "Energy Pulse"

### Concept

Two users must **both** send an "energy pulse" to each other **within 24 hours** to become friends.

### Flow

1. **User A** views **User B**'s profile
2. **User A** taps **"Send Energy Pulse"** button
3. System creates `friendship` record with status='pending'
4. **User B** receives notification
5. **User B** views **User A**'s profile
6. **User B** taps **"Send Energy Pulse Back"** button
7. If within 24 hours, `status` changes to 'active'
8. Both users are now friends

### Alternative Methods (Optional)

**QR Code Scan**: Both users scan each other's QR codes in person
**Streak Handshake**: Both users must have a 7+ day streak to unlock this method

---

## 📋 Three User Lists

### 1. Saved List
- Users saved from "Just Looking" mode
- Can bulk invite to events
- Can filter and search
- Can add notes

### 2. Friends List
- Users connected via Energy Pulse (or other methods)
- Priority in suggestions
- Can bulk invite
- Special badge on profile

### 3. Invitees List
- Everyone user has ever invited
- Shows invitation history
- Total invitations sent
- Events invited to
- Can re-invite quickly

All lists support:
- Single invite
- Bulk invite
- Search
- Filter by college/interests
- Sort by recent/alphabetical

---

## 🔍 Advanced Filters

### Available Filters

1. **Age Range** (18-30+)
2. **Gender** (Male, Female, Non-binary, All)
3. **College** (Multi-select)
4. **Attractiveness Rating** (1-10 slider)
5. **Interests** (Multi-select)
6. **Has Friends in Common** (Toggle)
7. **Active in Last 7 Days** (Toggle)

### Filter Application

Filters apply to:
- Discovery swipe mode
- List view
- Search results
- Smart suggestions

---

## 🎯 Smart Recommendation Engine

### Ranking Algorithm

```typescript
function calculateRecommendationScore(currentUser, targetUser) {
  let score = 0;

  // Same college: +30 points
  if (currentUser.college_id === targetUser.college_id) {
    score += 30;
  }

  // Mutual friends: +10 per mutual friend (max 40)
  const mutualFriends = getMutualFriends(currentUser, targetUser);
  score += Math.min(40, mutualFriends * 10);

  // Shared interests: +5 per interest (max 25)
  const sharedInterests = getSharedInterests(currentUser, targetUser);
  score += Math.min(25, sharedInterests.length * 5);

  // Similar attractiveness score: +15 if within 10 points
  const scoreDiff = Math.abs(currentUser.attractiveness_score - targetUser.attractiveness_score);
  if (scoreDiff <= 10) {
    score += 15;
  }

  // Recently active: +10 if active in last 24 hours
  if (isRecentlyActive(targetUser)) {
    score += 10;
  }

  // Gender preference match: +10
  if (matchesGenderFilter(currentUser.filters, targetUser)) {
    score += 10;
  }

  return score;
}
```

Suggestions sorted by score descending.

---

## 📱 Frontend Architecture

### Navigation Structure (Updated)

```
Root
├── Splash
├── Onboarding
├── Auth Group
│   ├── Login
│   ├── Register
│   └── Forgot Password
├── Profile Setup (4 steps)
├── Main App (Tabs)
│   ├── Home (Discovery + Swipe)
│   ├── Events (My Events)
│   ├── Create Event
│   ├── Notifications (Invitations)
│   └── Profile
│       ├── My Profile Info
│       ├── My Lists (NEW)
│       │   ├── Saved List
│       │   ├── Friends List
│       │   └── Invitees List
│       ├── Settings
│       └── Sign Out
├── Event Detail
├── User Profile
└── Friend Connection Screens
```

### Key Screens to Add/Update

**New Screens**:
- `/profile/lists` - Lists overview
- `/profile/saved` - Saved users list
- `/profile/friends` - Friends list
- `/profile/invitees` - Invitees list
- `/profile/send-pulse/[userId]` - Energy pulse sender
- `/profile/qr-code` - QR code generator/scanner

**Updated Screens**:
- `/(tabs)/index.tsx` - Add filters panel
- `/(tabs)/profile.tsx` - Add metrics, score, lists entry
- `/(tabs)/create.tsx` - Add external link field
- `/user/[id].tsx` - Add friend connection buttons

---

## 🔌 Backend API Endpoints

### Users

```
GET    /api/users                      - List users with filters
GET    /api/users/:id                  - Get user profile
PATCH  /api/users/:id                  - Update user profile
GET    /api/users/:id/stats            - Get user statistics
GET    /api/users/:id/score            - Get attractiveness score
POST   /api/users/:id/calculate-score  - Recalculate score
GET    /api/users/suggestions          - Get smart suggestions
```

### Friends

```
GET    /api/friends                    - Get user's friends
POST   /api/friends/pulse              - Send energy pulse
POST   /api/friends/:id/accept         - Accept friendship
DELETE /api/friends/:id                - Remove friend
GET    /api/friends/pending            - Get pending friend requests
GET    /api/friends/:userId/mutual     - Get mutual friends
```

### Lists

```
GET    /api/lists/saved                - Get saved users
POST   /api/lists/saved/:userId        - Add to saved
DELETE /api/lists/saved/:userId        - Remove from saved
GET    /api/lists/invitees             - Get invitees
GET    /api/lists/friends              - Get friends list
```

### Events

```
GET    /api/events                     - List events
POST   /api/events                     - Create event
GET    /api/events/:id                 - Get event details
PATCH  /api/events/:id                 - Update event
DELETE /api/events/:id                 - Delete event
POST   /api/events/:id/invite          - Send invitations (single/bulk)
GET    /api/events/:id/invitations     - Get event invitations
```

### Invitations

```
GET    /api/invitations                - Get my invitations
PATCH  /api/invitations/:id/accept     - Accept invitation
PATCH  /api/invitations/:id/decline    - Decline invitation
GET    /api/invitations/stats          - Get invitation statistics
```

### Engagement

```
POST   /api/engagement/log             - Log engagement action
GET    /api/engagement/streak          - Get current streak
```

---

## 🔒 Security Best Practices

### Authentication
- JWT tokens with 7-day expiry
- Refresh token rotation
- Password hashing with bcrypt (12 rounds)
- Email verification on signup

### Authorization
- RLS policies on all Supabase tables
- Backend guards for sensitive operations
- User can only update own profile
- Event host can only manage own events

### Data Validation
- DTOs with class-validator
- Sanitize all user inputs
- Rate limiting on API endpoints
- CORS configuration

### Privacy
- Hide email addresses in public profiles
- Friends-only visibility options
- Block/report functionality
- GDPR compliance (data export/deletion)

---

## 📈 Performance Optimizations

### Database
- Indexes on all foreign keys
- Compound indexes for common queries
- Pagination (limit 50 per page)
- Caching with Redis (optional)

### API
- Response compression
- CDN for static assets
- Image optimization and resizing
- API rate limiting (100 req/min per user)

### Frontend
- Image lazy loading
- Infinite scroll with react-query
- Optimistic UI updates
- Local caching with AsyncStorage

---

## 🚀 Deployment Strategy

### Backend (NestJS)
- Platform: Railway / Heroku / AWS ECS
- Database: Supabase PostgreSQL
- Environment: Production, Staging
- CI/CD: GitHub Actions

### Frontend (React Native)
- iOS: TestFlight → App Store
- Android: Internal Testing → Play Store
- OTA Updates: Expo EAS Update
- Build: EAS Build

### Environment Variables

**Backend**:
```
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
CORS_ORIGIN
```

**Frontend**:
```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_API_URL
```

---

## 📊 Monitoring & Analytics

### Backend Monitoring
- Sentry for error tracking
- CloudWatch / DataDog for metrics
- Database query performance

### Frontend Analytics
- PostHog / Mixpanel for user analytics
- Track: swipes, invitations, friend connections
- A/B testing for features

### Key Metrics
- DAU / MAU
- Invitation acceptance rate
- Friend connection rate
- Average attractiveness score
- Event creation rate
- Retention rate (7-day, 30-day)

---

## 🎨 UI/UX Design Principles

### Color System
- Primary: `#3AFF6E` (Neon Green)
- Secondary: `#2C3E50` (Dark Blue-Gray)
- Error: `#FF3B30` (Red)
- Success: `#34C759` (Green)
- Background: `#F5F7FA` (Light Gray)

### Typography
- Headings: 700 weight (Bold)
- Body: 400 weight (Regular)
- Accent: 600 weight (Semibold)
- Font: DM Sans

### Spacing System
- Base unit: 8px
- Small: 4px, 8px
- Medium: 12px, 16px, 24px
- Large: 32px, 48px

---

This architecture provides a solid foundation for implementing all requested features in a scalable, maintainable way. Next steps: implementation of migrations, services, and frontend components.
