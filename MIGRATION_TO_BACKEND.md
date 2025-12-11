# Migration to Backend API Architecture

## Overview
Successfully migrated from Supabase frontend client to NestJS backend API architecture.

## What Changed

### Frontend (celia-client)
1. **Removed Supabase**
   - Removed `@supabase/supabase-js` dependency
   - Deleted `lib/supabase.ts`
   - Deleted `lib/supabaseEnhanced.ts`
   - Removed `supabase/` directory with migrations

2. **Added API Client**
   - Created `lib/api.ts` - Axios-based API client with JWT authentication
   - Created `lib/apiHelpers.ts` - Helper functions matching old supabaseEnhanced interface
   - Added `axios` dependency

3. **Updated Authentication**
   - `contexts/AuthContext.tsx` now uses backend API for auth
   - Stores JWT token in AsyncStorage
   - Automatic token injection via Axios interceptors

4. **Environment Variables**
   - Old: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - New: `EXPO_PUBLIC_API_URL` (defaults to http://localhost:3000)

### Backend (celia-server)
1. **Updated Database Connection**
   - Now using Neon PostgreSQL: `postgresql://neondb_owner:npg_REalO3U8IrYP@ep-still-hall-ah16qyvs-pooler.c-3.us-east-1.aws.neon.tech/neondb`
   - Schema pushed successfully using Prisma

## Architecture Benefits

### Before (Redundant)
```
Frontend ─┬─> Supabase Direct (database queries)
          └─> NestJS Backend ─> Database
```

### After (Clean)
```
Frontend ─> NestJS Backend ─> Neon PostgreSQL
```

## Key Improvements

1. **Single Source of Truth**: All business logic in backend
2. **Better Security**: No database credentials in frontend
3. **Centralized Validation**: Backend validates all requests
4. **Easier Maintenance**: Changes only need to be made in one place
5. **Type Safety**: Backend DTOs ensure consistent data structures

## API Client Usage

### Authentication
```typescript
import { api } from '@/lib/api';

// Register
await api.register({ email, password, fullName });

// Login (automatically stores JWT)
await api.login(email, password);

// Logout
await api.logout();
```

### Data Operations
```typescript
import { apiHelpers } from '@/lib/apiHelpers';

// Get friends
const { data, error } = await apiHelpers.getFriends(userId);

// Send energy pulse
await apiHelpers.sendEnergyPulse(fromUserId, toUserId);

// Get user stats
const { data } = await apiHelpers.getUserStats(userId);
```

## Files Modified

### Created
- `celia-client/lib/api.ts`
- `celia-client/lib/apiHelpers.ts`
- `celia-client/.env`

### Updated
- `celia-client/contexts/AuthContext.tsx`
- `celia-client/app/(tabs)/profile.tsx`
- `celia-client/app/profile/friends.tsx`
- `celia-client/app/profile/invitees.tsx`
- `celia-client/app/profile/saved.tsx`
- `celia-client/app/profile/send-pulse/[userId].tsx`
- `celia-client/.env.example`
- `celia-client/package.json`
- `celia-server/.env`

### Deleted
- `celia-client/lib/supabase.ts`
- `celia-client/lib/supabaseEnhanced.ts`
- `celia-client/supabase/` directory

## Next Steps

1. **Update remaining components**: Some components may still reference old Supabase imports
2. **Test all flows**: Auth, events, friends, invitations, etc.
3. **Add error handling**: Improve error messages and user feedback
4. **Update backend endpoints**: Ensure all needed endpoints are implemented
5. **Add loading states**: Better UX with proper loading indicators

## Running the Application

### Backend
```bash
cd celia-server
npm install
npm run start:dev
```

### Frontend
```bash
cd celia-client
npm install
npm start
```

## Environment Setup

### Backend (.env)
```
DATABASE_URL="postgresql://neondb_owner:npg_REalO3U8IrYP@ep-still-hall-ah16qyvs-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="your-super-secure-random-jwt-secret-change-this-in-production-12345"
JWT_EXPIRATION="7d"
PORT=3000
```

### Frontend (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```

For device testing, replace with your machine's IP:
```
EXPO_PUBLIC_API_URL=http://192.168.1.X:3000
```
