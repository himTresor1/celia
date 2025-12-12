# Supabase to Backend API Migration

## Overview
This document tracks the migration from direct Supabase calls to backend API integration across the CELIA client application.

## Status Summary

### ✅ Completed
1. **create.tsx** - Event creation now uses `api.createEvent()`

### 🚧 In Progress
2. **notifications.tsx** - Multiple Supabase calls need replacement:
   - Fetch invitations (lines 151-184)
   - Accept invitation (lines 197-212)
   - Decline invitation (lines 219-239)
   - Change RSVP (lines 241-269)

### ⏳ Pending
3. **event/[id].tsx** - Event details page:
   - Fetch event details (lines 79-92)
   - Fetch invitations (lines 95-107)
   - Remove guest (lines 127-149)
   - Cancel event (lines 151-171)

4. **user/[id].tsx** - User profile page:
   - Fetch user profile (lines 69-79)
   - Fetch user stats (lines 82-98)
   - Fetch user events (lines 103-115)
   - Send invitation to event (lines 117-136)

5. **profile-setup.tsx** - Profile completion:
   - Currently only calls `completeProfile()` locally
   - Needs to call `api.updateUser()` with profile data

6. **events.tsx** - My events list:
   - Currently uses mock data
   - Needs to call `api.getEvents()` with filters

7. **invite-swipe.tsx** - Swipe to invite:
   - Currently works with dummy data
   - Needs to integrate save-to-list when swiping right

## Backend Changes Needed

### Make Photos Optional
All DTOs that have photo-related fields need to make them optional:
- `CreateEventDto` - photoUrls should be optional
- `UpdateUserDto` - photoUrls, avatarUrl should be optional
- Any other DTOs with photo fields

### API Endpoints to Verify
- ✅ POST /api/events - Create event
- ⏳ GET /api/invitations/user/:userId - Get user invitations
- ⏳ PATCH /api/invitations/:id - Respond to invitation (accept/decline)
- ⏳ GET /api/events/:id - Get event details
- ⏳ GET /api/invitations?eventId=:id - Get event invitations
- ⏳ DELETE /api/invitations/:id - Remove guest
- ⏳ PATCH /api/events/:id - Update event (cancel)
- ⏳ GET /api/users/:id - Get user profile
- ⏳ GET /api/users/:id/stats - Get user stats
- ⏳ GET /api/events?hostId=:id - Get user's hosted events
- ⏳ POST /api/invitations - Send invitation
- ⏳ PATCH /api/users/:id - Update user profile
- ⏳ GET /api/events?creatorId=:id - Get my events
- ⏳ POST /api/lists/saved - Add to saved list

## Implementation Plan

### Phase 1: Core Flows (Priority)
1. ✅ Event creation
2. Invitations flow (send, receive, respond)
3. Event details and management
4. Profile setup completion

### Phase 2: Secondary Features
5. Events list (my events)
6. User profiles and stats
7. Save to list functionality

### Phase 3: Verification
8. End-to-end testing
9. Error handling verification
10. Loading states check

## Testing Checklist

### Event Creation
- [x] Can create event with all fields
- [ ] Event appears in my events list
- [ ] Can navigate to event details
- [ ] Error handling works

### Invitations
- [ ] Can send invitations
- [ ] Receive invitations in notifications
- [ ] Can accept invitation
- [ ] Can decline invitation
- [ ] Can change RSVP
- [ ] Bulk invite works

### Event Management
- [ ] View event details
- [ ] See guest list with RSVP status
- [ ] Remove guest works
- [ ] Cancel event works
- [ ] Search and filter guests

### User Profiles
- [ ] View other user profiles
- [ ] See user stats
- [ ] Invite user to event from profile
- [ ] Friend request from profile
- [ ] Report profile

### Profile Setup
- [ ] Complete all 4 steps
- [ ] Data saves to backend
- [ ] Redirects to main app
- [ ] Profile appears complete

### Lists and Saved
- [ ] Access saved list
- [ ] Access friends list
- [ ] Access previous invitees
- [ ] Swipe yes adds to saved
- [ ] Can bulk invite from lists

## Notes
- All API calls should use the `api` client from `/lib/api.ts`
- Error handling should show user-friendly messages
- Loading states should be consistent
- Photos are now optional everywhere
- No Supabase imports should remain in any client file
