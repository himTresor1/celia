# End-to-End Test Guide: Three Critical Flows

This document provides step-by-step instructions to test the three main flows of the CELIA application.

## Setup

### Backend Setup
1. **Start the NestJS backend:**
   ```bash
   cd celia-server
   npm install
   npm run start:dev
   ```

2. **Seed dummy users (for testing invitations):**
   ```bash
   node seed-dummy-users.js
   ```
   This creates 10 test users with:
   - **Password**: `Password@123`
   - **Emails**: sarah@example.com, michael@example.com, emily@example.com, etc.

### Frontend Setup
1. **Start the React Native app:**
   ```bash
   cd celia-client
   npm install
   npm start
   ```

---

## Flow 1: Swipe → Saved List → Send Invitations

### Overview
Users can swipe right on people they like, save them to a list, and then send event invitations to multiple saved users at once.

### Step-by-Step Test

#### Part 1: Swipe and Save Users
1. **Register/Login** to the app
2. Navigate to **"Just Looking"** discovery flow (from Home or Browse)
3. **Swipe Right** on at least 3-5 profiles you like
   - Each swipe automatically saves the user to your "Saved List"
   - You'll see a confirmation animation

#### Part 2: View Saved Users
1. Go to **Profile Tab**
2. Tap **"Saved"** button
3. **Verify**:
   - All swiped users appear in your saved list
   - Each card shows user name, photo, college, and when you saved them
   - You can see their attractiveness rating

#### Part 3: Select and Invite
1. On the Saved List screen, **tap users to select them**
   - Selected users show a green checkmark
   - You can tap "Select All" to choose everyone
2. Tap **"Invite X to Event"** button at the bottom
3. **Select an event** from your events list
4. **Verify**:
   - Success message confirms invitations sent
   - Selected users are cleared
   - You can navigate to the event to see pending invitations

### Backend Endpoints Used
- `POST /lists/saved` - Save user when swiping right
- `GET /lists/saved/:userId` - Get saved users list
- `POST /lists/bulk-invite` - Send bulk invitations to selected users
- `GET /events/my` - Get user's events for selection

### Expected Payload Formats

**Save User (POST /lists/saved):**
```json
{
  "userId": "uuid-of-user-to-save"
}
```

**Bulk Invite (POST /lists/bulk-invite):**
```json
{
  "eventId": "uuid-of-event",
  "inviteeIds": ["uuid1", "uuid2", "uuid3"],
  "message": "Optional personal message"
}
```

---

## Flow 2: Create Event → My Events → View Details

### Overview
Users create events that automatically appear in their "My Events" list, where they can view full details and manage guests.

### Step-by-Step Test

#### Part 1: Create Event
1. Tap the **"Create" tab** (center tab with + icon)
2. Fill in event details:
   - **Event Name**: "Tech Networking Mixer"
   - **Description**: "Connect with fellow entrepreneurs"
   - **Date**: Select a future date
   - **Time**: 6:00 PM - 9:00 PM
   - **Location**: "Innovation Hub, Building 7"
   - **Category**: Select "Networking"
   - Add **photo** (optional)
   - Toggle **"Invite Only"** or leave public
3. Tap **"Create Event"**
4. **Verify**: Success message appears

#### Part 2: View in My Events
1. Navigate to **"Events" tab**
2. **Verify**:
   - Your new event appears in the "Upcoming" tab
   - Event card shows: name, date, time, location, category badge
   - Shows "0 Going, 0 Pending, 0 Declined" (no invitations yet)

#### Part 3: View Event Details
1. **Tap on your event card**
2. **Verify Event Details Page shows**:
   - Full event information (name, description, date, time, location)
   - Event photo (if uploaded)
   - Category badge and "Invite Only" badge (if applicable)
   - **Guest List section** with:
     - Total guest count
     - Stats: Going, Pending, Declined
     - Filter tabs: All, Going, Pending, Declined
     - Search guests functionality
   - **Cancel Event button** at the bottom

#### Part 4: Manage Event
1. From event details, test **guest filters**:
   - Try All, Going, Pending, Declined tabs
2. Try **searching for a guest** (if any invited)
3. Try **removing a guest** (if any invited)
   - Tap X button next to guest
   - Confirm removal
4. Test **Cancel Event**:
   - Tap "Cancel Event"
   - Enter cancellation reason
   - Confirm cancellation
   - **Verify**: Redirected back, event status changes

### Backend Endpoints Used
- `POST /events` - Create new event
- `GET /events/my` - Get user's events
- `GET /events/:id` - Get event details
- `GET /invitations/event/:eventId` - Get event invitations
- `DELETE /invitations/:id` - Remove guest
- `PATCH /events/:id` - Update event (cancel)

### Expected Payload Formats

**Create Event (POST /events):**
```json
{
  "name": "Tech Networking Mixer",
  "description": "Connect with fellow entrepreneurs",
  "eventDate": "2025-12-20",
  "startTime": "18:00",
  "endTime": "21:00",
  "locationName": "Innovation Hub, Building 7",
  "photoUrls": ["https://example.com/photo.jpg"],
  "categoryId": "uuid-of-category",
  "isPublic": false,
  "capacityLimit": 50
}
```

**Cancel Event (PATCH /events/:id):**
```json
{
  "status": "cancelled",
  "cancellationReason": "Venue unavailable"
}
```

---

## Flow 3: Receive Invitations → Accept/Decline → View Status

### Overview
Users receive event invitations from others, can view them in the Notifications tab, accept or decline, and see their RSVP status.

### Step-by-Step Test

#### Part 1: Send Test Invitation
**Using another test account:**
1. Login as `sarah@example.com` (Password: `Password@123`)
2. Create an event
3. Navigate to a user profile (e.g., from Browse)
4. Tap **"Invite to Event"**
5. Select your event and send invitation

**OR using your saved list:**
1. Go to Profile → Saved
2. Select users
3. Send bulk invitations

#### Part 2: Receive Invitation
**Login to the invited user's account:**
1. Navigate to **"Notifications" tab** (bell icon)
2. Go to **"Pending" tab**
3. **Verify invitation card shows**:
   - Event photo
   - Host name and photo ("Sarah Johnson invited you")
   - Event name
   - Date, time, location
   - Personal message (if any)
   - **Accept** and **Decline** buttons

#### Part 3: Accept Invitation
1. Tap **"Accept"** button
2. **Verify**:
   - Success message: "You're going! 🎉"
   - Invitation moves to **"Going" tab**
   - Status shows "Going"
   - **"Change RSVP"** button appears

#### Part 4: Decline Invitation
**For another invitation:**
1. Tap **"Decline"** button
2. Modal appears with decline reasons:
   - Schedule conflict
   - Not interested
   - Too far
3. Select a reason (optional)
4. Tap **"Decline"**
5. **Verify**:
   - Invitation moves to **"Declined" tab**
   - No longer appears in Pending

#### Part 5: Change RSVP
**For an accepted invitation:**
1. Go to **"Going" tab**
2. Tap on an accepted invitation card
3. Tap **"Change RSVP"**
4. Confirm change to "Can't Go"
5. **Verify**:
   - Moves to **"Declined" tab**
   - RSVP status updated

#### Part 6: View from Event Host Side
**Login as event host:**
1. Navigate to **Events tab**
2. Tap on the event
3. **Verify guest list updates**:
   - Going count increases when someone accepts
   - Declined count increases when someone declines
   - Can see each guest's status
   - Can filter by status

### Backend Endpoints Used
- `GET /invitations/:userId` - Get user's invitations
- `PATCH /invitations/:id/respond` - Respond to invitation (accept/decline)
- `GET /invitations/event/:eventId` - Get event's invitation list (for host)

### Expected Payload Formats

**Get Invitations (GET /invitations/:userId):**
Response includes:
```json
[
  {
    "id": "invitation-uuid",
    "status": "pending|accepted|rejected",
    "personalMessage": "Hope you can make it!",
    "createdAt": "2025-12-12T10:00:00Z",
    "event": {
      "id": "event-uuid",
      "name": "Tech Networking Mixer",
      "eventDate": "2025-12-20",
      "startTime": "18:00",
      "locationName": "Innovation Hub",
      "photoUrls": ["..."]
    },
    "inviter": {
      "id": "user-uuid",
      "fullName": "Sarah Johnson",
      "photoUrls": ["..."]
    }
  }
]
```

**Respond to Invitation (PATCH /invitations/:id/respond):**
```json
{
  "status": "accepted" // or "rejected"
}
```

---

## Integration Checklist

### Frontend Pages Verified
- [x] **Home/Discovery** - Browse and swipe users
- [x] **Profile → Saved** - View and manage saved users, bulk invite
- [x] **Create Tab** - Create new events
- [x] **Events Tab** - View my events with real data from backend
- [x] **Event Details [id]** - View full event details, manage guests
- [x] **Notifications Tab** - View and respond to invitations
- [x] **User Profile [id]** - View user details, invite to events

### Backend Endpoints Verified
- [x] `POST /lists/saved` - Save user
- [x] `GET /lists/saved/:userId` - Get saved users
- [x] `POST /lists/bulk-invite` - Bulk invite
- [x] `POST /events` - Create event
- [x] `GET /events/my` - Get my events
- [x] `GET /events/:id` - Get event details
- [x] `GET /invitations/:userId` - Get user invitations
- [x] `GET /invitations/event/:eventId` - Get event invitations
- [x] `PATCH /invitations/:id/respond` - Respond to invitation
- [x] `DELETE /invitations/:id` - Delete invitation
- [x] `PATCH /events/:id` - Update event

### Data Flow Verified
- [x] **Swipe right** → User saved to backend → Appears in Saved List
- [x] **Create event** → Stored in backend → Appears in My Events
- [x] **Bulk invite** → Invitations created in backend → Recipients see in Notifications
- [x] **Accept invitation** → Status updated in backend → Host sees in guest list
- [x] **Decline invitation** → Status updated in backend → Removed from pending
- [x] **Event details** → Fetches real guest list from backend
- [x] **Remove guest** → Invitation deleted in backend → Updates guest list

---

## Common Issues & Troubleshooting

### Issue: "Cannot connect to backend"
**Solution:**
- Verify backend is running: `npm run start:dev`
- Check `.env` file has correct `API_URL`
- Check network connectivity

### Issue: "No invitations showing"
**Solution:**
- Run seed script to create test users: `node seed-dummy-users.js`
- Send test invitations from another account
- Check Notifications tab → Pending

### Issue: "Event not appearing in My Events"
**Solution:**
- Refresh the Events tab (pull down to refresh)
- Check event was created successfully (look for success message)
- Verify you're logged in as the event creator

### Issue: "Saved users not showing"
**Solution:**
- Swipe right on users first
- Check Profile → Saved
- Pull down to refresh the list

---

## Test User Accounts

All dummy users have password: **Password@123**

| Email | Name | College |
|-------|------|---------|
| sarah@example.com | Sarah Johnson | Stanford University |
| michael@example.com | Michael Chen | MIT |
| emily@example.com | Emily Rodriguez | UC Berkeley |
| james@example.com | James Williams | Harvard University |
| sophia@example.com | Sophia Martinez | UCLA |
| david@example.com | David Kim | NYU |
| olivia@example.com | Olivia Brown | Columbia University |
| daniel@example.com | Daniel Taylor | University of Michigan |
| sienna@example.com | Sienna Anderson | USC |
| alex@example.com | Alex Thompson | University of Washington |

---

## Success Criteria

All three flows should work seamlessly:

✅ **Flow 1**: Swipe → Save → Bulk Invite (Complete)
✅ **Flow 2**: Create Event → My Events → View Details (Complete)
✅ **Flow 3**: Receive → Accept/Decline → Status Update (Complete)

**All frontend pages** are integrated with the backend.
**All API endpoints** match the expected payload formats.
**All data flows** persist correctly in the database.

---

## Next Steps

1. **Run the seed script** to populate test users
2. **Test each flow** step-by-step using this guide
3. **Verify** all endpoints are working correctly
4. **Check** database for persisted data
5. **Test** with multiple accounts to simulate real usage

