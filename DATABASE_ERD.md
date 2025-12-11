# CELIA - Entity Relationship Diagram

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CELIA DATABASE SCHEMA                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐
│           USERS                  │
├──────────────────────────────────┤
│ PK id                            │
│ UK email                         │
│    password                      │
│    full_name                     │
│    date_of_birth                 │
│    age (computed)                │
│    gender                        │
│    college_name                  │
│ FK college_id                    │
│    major                         │
│    graduation_year               │
│    bio                           │
│    avatar_url                    │
│    photo_urls (jsonb)            │
│    interests (array)             │
│    college_verified              │
│    preferred_locations (array)   │
│    profile_completed             │
│    -- Gamification --            │
│    attractiveness_score          │
│    engagement_points             │
│    social_streak_days            │
│    last_active_date              │
│    app_opens_count               │
│    profile_completeness          │
│    created_at                    │
│    updated_at                    │
└──────────────────────────────────┘
       │                 │
       │                 │
       │ 1             * │
       │                 └──────────────────────┐
       │                                        │
       │ 1                                      │ *
       │                                        │
┌──────▼──────────────────────────┐   ┌────────▼───────────────────┐
│       FRIENDSHIPS                │   │     SAVED_USERS            │
├──────────────────────────────────┤   ├────────────────────────────┤
│ PK id                            │   │ PK id                      │
│ FK user1_id                      │   │ FK user_id                 │
│ FK user2_id                      │   │ FK saved_user_id           │
│    status                        │   │    saved_from_context      │
│    connection_method             │   │    notes                   │
│ FK initiated_by                  │   │    created_at              │
│    -- Energy Pulse --            │   └────────────────────────────┘
│    pulse_sent_by_user1           │
│    pulse_sent_by_user2           │
│    pulse_expires_at              │            1 │
│    -- QR Code --                 │              │
│    qr_code_token                 │              │ *
│    qr_generated_at               │   ┌──────────▼─────────────────┐
│    qr_scanned_at                 │   │     USER_INVITEES          │
│    -- Streak Handshake --        │   ├────────────────────────────┤
│    streak_day_required           │   │ PK id                      │
│    user1_streak_met              │   │ FK user_id                 │
│    user2_streak_met              │   │ FK invitee_id              │
│    created_at                    │   │    first_invited_at        │
│    completed_at                  │   │    last_invited_at         │
└──────────────────────────────────┘   │    total_invitations       │
                                       │    events_invited_to       │
       1 │                             └────────────────────────────┘
         │
         │ *                                       1 │
┌────────▼──────────────────────────┐               │
│         EVENTS                    │               │
├───────────────────────────────────┤               │
│ PK id                             │               │ *
│ FK host_id                        │   ┌───────────▼────────────────────────┐
│    name                           │   │      EVENT_INVITATIONS             │
│    description                    │   ├────────────────────────────────────┤
│ FK category_id                    │   │ PK id                              │
│    location_name                  │   │ FK event_id                        │
│    location_lat                   │   │ FK inviter_id                      │
│    location_lng                   │   │ FK invitee_id                      │
│    event_date                     │   │    status                          │
│    start_time                     │   │    personal_message                │
│    end_time                       │   │    decline_reason                  │
│    photo_urls (jsonb)             │   │    responded_at                    │
│    interest_tags (array)          │   │    created_at                      │
│    capacity_limit                 │   │    updated_at                      │
│    is_public                      │   │ UK (event_id, invitee_id)          │
│    status                         │   └────────────────────────────────────┘
│    cancellation_reason            │
│    -- External Link --            │
│    external_link                  │               1 │
│    external_link_type             │                 │
│    created_at                     │                 │ *
│    updated_at                     │   ┌─────────────▼──────────────────────┐
└───────────────────────────────────┘   │       EVENT_ATTENDEES              │
                                        ├────────────────────────────────────┤
       1 │                              │ PK id                              │
         │                              │ FK event_id                        │
         │ *                            │ FK user_id                         │
┌────────▼──────────────────────────┐   │    joined_at                       │
│      EVENT_CATEGORIES             │   │ UK (event_id, user_id)             │
├───────────────────────────────────┤   └────────────────────────────────────┘
│ PK id                             │
│ UK name                           │
│    icon                           │               1 │
│    created_at                     │                 │
└───────────────────────────────────┘                 │ *
                                        ┌─────────────▼──────────────────────┐
       1 │                              │       ENGAGEMENT_LOGS              │
         │                              ├────────────────────────────────────┤
         │ *                            │ PK id                              │
┌────────▼──────────────────────────┐   │ FK user_id                         │
│      COLLEGES                     │   │    action_type                     │
├───────────────────────────────────┤   │    points_earned                   │
│ PK id                             │   │    metadata (jsonb)                │
│ UK name                           │   │    created_at                      │
│    domain                         │   └────────────────────────────────────┘
│    location                       │
│    created_at                     │
└───────────────────────────────────┘


┌───────────────────────────────────┐
│    INTEREST_CATEGORIES            │
├───────────────────────────────────┤
│ PK id                             │
│ UK name                           │
│    created_at                     │
└───────────────────────────────────┘
```

---

## Relationship Descriptions

### 1. USERS ↔ EVENTS (One-to-Many)
- One user can host many events
- Each event has one host
- **Relationship**: `users.id → events.host_id`

### 2. USERS ↔ FRIENDSHIPS (Many-to-Many Self-Join)
- Users can have many friendships
- Friendship connects two users
- **Relationships**:
  - `users.id → friendships.user1_id`
  - `users.id → friendships.user2_id`
  - `users.id → friendships.initiated_by`

### 3. USERS ↔ SAVED_USERS (One-to-Many)
- One user can save many users
- Each saved record belongs to one user
- **Relationships**:
  - `users.id → saved_users.user_id` (who saved)
  - `users.id → saved_users.saved_user_id` (who was saved)

### 4. USERS ↔ USER_INVITEES (One-to-Many)
- One user can have many invitees
- Tracks all-time invitation history
- **Relationships**:
  - `users.id → user_invitees.user_id` (who invited)
  - `users.id → user_invitees.invitee_id` (who was invited)

### 5. USERS ↔ ENGAGEMENT_LOGS (One-to-Many)
- One user can have many engagement logs
- Tracks all user actions for scoring
- **Relationship**: `users.id → engagement_logs.user_id`

### 6. EVENTS ↔ EVENT_INVITATIONS (One-to-Many)
- One event can have many invitations
- Each invitation belongs to one event
- **Relationships**:
  - `events.id → event_invitations.event_id`
  - `users.id → event_invitations.inviter_id`
  - `users.id → event_invitations.invitee_id`

### 7. EVENTS ↔ EVENT_ATTENDEES (One-to-Many)
- One event can have many attendees
- Each attendance record belongs to one event
- **Relationships**:
  - `events.id → event_attendees.event_id`
  - `users.id → event_attendees.user_id`

### 8. EVENTS ↔ EVENT_CATEGORIES (Many-to-One)
- Many events can share one category
- Each event has one category (optional)
- **Relationship**: `event_categories.id → events.category_id`

### 9. USERS ↔ COLLEGES (Many-to-One)
- Many users can attend one college
- Each user has one college (optional)
- **Relationship**: `colleges.id → users.college_id`

---

## Constraints & Rules

### Unique Constraints
1. `users.email` - No duplicate emails
2. `friendships(user1_id, user2_id)` - No duplicate friendships
3. `saved_users(user_id, saved_user_id)` - Can't save same user twice
4. `user_invitees(user_id, invitee_id)` - One record per inviter-invitee pair
5. `event_invitations(event_id, invitee_id)` - Can't invite same person twice
6. `event_attendees(event_id, user_id)` - Can't attend same event twice

### Check Constraints
1. `friendships` - `user1_id < user2_id` (canonical ordering)
2. `users.age` - Must be >= 18
3. `events.status` - Must be in ('draft', 'active', 'cancelled', 'completed')
4. `event_invitations.status` - Must be in ('pending', 'going', 'declined')
5. `friendships.status` - Must be in ('pending', 'active', 'expired')

### Cascade Rules
- Delete user → Cascade delete all related records
- Delete event → Cascade delete invitations and attendees
- Delete friendship → No cascade (independent record)

---

## Indexing Strategy

### High-Priority Indexes
```sql
-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_college_id ON users(college_id);
CREATE INDEX idx_users_attractiveness_score ON users(attractiveness_score DESC);
CREATE INDEX idx_users_gender ON users(gender);
CREATE INDEX idx_users_age ON users(age);

-- Friendships
CREATE INDEX idx_friendships_user1 ON friendships(user1_id);
CREATE INDEX idx_friendships_user2 ON friendships(user2_id);
CREATE INDEX idx_friendships_status ON friendships(status);

-- Saved Users
CREATE INDEX idx_saved_users_user_id ON saved_users(user_id);
CREATE INDEX idx_saved_users_saved_user_id ON saved_users(saved_user_id);
CREATE INDEX idx_saved_users_created_at ON saved_users(created_at DESC);

-- Events
CREATE INDEX idx_events_host_id ON events(host_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_category_id ON events(category_id);
CREATE INDEX idx_events_is_public ON events(is_public);

-- Event Invitations
CREATE INDEX idx_invitations_invitee_id ON event_invitations(invitee_id);
CREATE INDEX idx_invitations_inviter_id ON event_invitations(inviter_id);
CREATE INDEX idx_invitations_event_id ON event_invitations(event_id);
CREATE INDEX idx_invitations_status ON event_invitations(status);

-- Engagement Logs
CREATE INDEX idx_engagement_user_id ON engagement_logs(user_id);
CREATE INDEX idx_engagement_action_type ON engagement_logs(action_type);
CREATE INDEX idx_engagement_created_at ON engagement_logs(created_at DESC);
```

---

## Data Integrity Rules

### Friendship Rules
1. `user1_id` must be less than `user2_id` (prevents duplicates)
2. User cannot be friends with themselves
3. Energy Pulse expires after 24 hours
4. Both users must send pulse within 24 hours

### Event Rules
1. Event date must be in the future
2. Host cannot leave their own event
3. Capacity limit enforced for attendees
4. Private events require invitation

### Invitation Rules
1. Cannot invite same person to same event twice
2. Invitee must respond to change status
3. Declined invitations can include reason
4. Invitation count tracked in user_invitees

### Scoring Rules
1. Score recalculated on profile updates
2. Engagement logs trigger score updates
3. Streak resets if app not opened daily
4. Score capped at 100 (displayed as 10)

---

This ERD provides the complete database structure for implementing all features. The schema is normalized, indexed for performance, and includes all necessary constraints for data integrity.
