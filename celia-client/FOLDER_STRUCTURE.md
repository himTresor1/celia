# 📁 PROJECT FOLDER STRUCTURE

```
project/
│
├── 📱 app/                          # Expo Router - All routes & screens
│   ├── 🔐 (auth)/                   # Authentication routes (group)
│   │   ├── _layout.tsx              # Auth stack navigator
│   │   ├── login.tsx                # Login screen
│   │   ├── register.tsx             # Registration screen
│   │   └── forgot-password.tsx      # Password reset screen
│   │
│   ├── 🏠 (tabs)/                   # Main app tabs (group)
│   │   ├── _layout.tsx              # Tab bar configuration
│   │   ├── index.tsx                # Home/Discover tab (default)
│   │   ├── events.tsx               # My Events tab
│   │   ├── create.tsx               # Create Event tab
│   │   ├── notifications.tsx        # My Invitations tab
│   │   └── profile.tsx              # My Profile tab
│   │
│   ├── 📅 event/                    # Event-related routes
│   │   ├── [id].tsx                 # Event detail view (dynamic)
│   │   ├── select-guests.tsx        # Guest selection screen
│   │   └── send-invitations.tsx     # Send invitations screen
│   │
│   ├── 👤 user/                     # User-related routes
│   │   └── [id].tsx                 # User profile view (dynamic)
│   │
│   ├── _layout.tsx                  # Root layout (auth wrapper)
│   ├── profile-setup.tsx            # 4-step profile wizard
│   └── +not-found.tsx               # 404 error screen
│
├── 🧩 components/                   # Reusable UI components
│   └── InviteUsersModal.tsx         # Modal for inviting users
│
├── 🔄 contexts/                     # React Context providers
│   └── AuthContext.tsx              # Authentication state & functions
│
├── 🪝 hooks/                        # Custom React hooks
│   └── useFrameworkReady.ts         # Framework initialization hook
│
├── 📚 lib/                          # External service configs
│   └── supabase.ts                  # Supabase client configuration
│
├── 🗄️ supabase/                     # Database migrations
│   └── migrations/
│       ├── 20251111090020_create_initial_schema.sql
│       ├── 20251111092402_enhance_profile_schema.sql
│       ├── 20251111095905_update_events_schema_for_epic2.sql
│       ├── 20251111102558_add_profile_completion_flag.sql
│       └── 20251111102658_create_profile_on_signup_trigger.sql
│
├── 🖼️ assets/                       # Static assets
│   └── images/
│       ├── icon.png                 # App icon
│       └── favicon.png              # Web favicon
│
├── ⚙️ Configuration Files
│   ├── .env                         # Environment variables (Supabase keys)
│   ├── .gitignore                   # Git ignore rules
│   ├── .prettierrc                  # Prettier formatting config
│   ├── app.json                     # Expo app configuration
│   ├── expo-env.d.ts                # Expo TypeScript definitions
│   ├── tsconfig.json                # TypeScript configuration
│   ├── package.json                 # NPM dependencies & scripts
│   └── package-lock.json            # Locked dependency versions
│
└── 📄 Documentation
    ├── WORKING_FEATURES_REPORT.md   # Comprehensive feature report
    └── FOLDER_STRUCTURE.md          # This file
```

---

## 📂 DETAILED BREAKDOWN

### **`app/` - Application Routes (Expo Router)**

All screens and routes follow the Expo Router file-based routing convention:

#### **Authentication Flow (`(auth)/` group)**
- Wrapped in a stack navigator
- Not shown in tab bar
- Routes:
  - `/login` → Login screen
  - `/register` → Registration screen
  - `/forgot-password` → Password reset

#### **Main Application (`(tabs)/` group)**
- Wrapped in tab bar navigator
- Bottom navigation with 5 tabs
- Routes:
  - `/` (index.tsx) → Discover community members
  - `/events` → View my events (created & attending)
  - `/create` → Create new event
  - `/notifications` → My invitations (pending/going/declined)
  - `/profile` → My profile & settings

#### **Dynamic Routes**
- `/user/[id]` → View any user's profile
- `/event/[id]` → View event details
- `/event/select-guests` → Select people to invite
- `/event/send-invitations` → Send batch invitations

#### **Special Routes**
- `/profile-setup` → 4-step onboarding wizard (required after signup)
- `/+not-found` → Custom 404 error page

---

### **`components/` - Reusable Components**

Shared UI components used across multiple screens:
- `InviteUsersModal.tsx` - Modal for inviting users to events

**Future components to add:**
- EventCard
- UserCard
- FilterChip
- LoadingSpinner
- EmptyState

---

### **`contexts/` - Global State Management**

React Context providers for app-wide state:
- `AuthContext.tsx` - Manages:
  - User authentication state
  - Login/logout functions
  - User profile data
  - Loading states

---

### **`hooks/` - Custom React Hooks**

Reusable logic extracted into hooks:
- `useFrameworkReady.ts` - Ensures Expo is fully initialized before rendering

**Future hooks to consider:**
- useEvents
- useInvitations
- useDebounce (for search)
- useFilters

---

### **`lib/` - External Services**

Configuration and initialization of external services:
- `supabase.ts` - Supabase client setup with:
  - API URL and Anon Key from .env
  - URL polyfill for React Native
  - Exported `supabase` client instance

---

### **`supabase/migrations/` - Database Schema**

SQL migration files defining database structure:

1. **`create_initial_schema.sql`** (Nov 11, 09:00)
   - Created core tables: profiles, events, invitations, attendees
   - Set up RLS policies
   - Created initial relationships

2. **`enhance_profile_schema.sql`** (Nov 11, 09:24)
   - Added photo_urls array (JSONB)
   - Added interests array
   - Added preferred_locations array
   - Enhanced bio constraints

3. **`update_events_schema_for_epic2.sql`** (Nov 11, 09:59)
   - Added event_date, location fields
   - Added photo_urls for events
   - Added category_id and interest_tags
   - Added status and capacity fields

4. **`add_profile_completion_flag.sql`** (Nov 11, 10:25)
   - Added is_profile_completed boolean
   - Defaults to false for new profiles

5. **`create_profile_on_signup_trigger.sql`** (Nov 11, 10:26)
   - Trigger to auto-create profile on user signup
   - Links auth.users to public.profiles

---

### **`assets/` - Static Files**

Images and other static resources:
- `images/icon.png` - App icon (1024x1024)
- `images/favicon.png` - Web favicon

---

## 🗂️ FILE ORGANIZATION PATTERNS

### **Route Grouping with `()`**
Expo Router uses parentheses for route groups:
- `(auth)` - Authentication screens (no tab bar)
- `(tabs)` - Main app screens (with tab bar)

Groups don't affect the URL path, only organization.

### **Dynamic Routes with `[]`**
Square brackets create dynamic segments:
- `[id].tsx` matches `/user/123`, `/event/456`, etc.
- Access via `useLocalSearchParams()` hook

### **Layout Files `_layout.tsx`**
Special files that wrap child routes:
- Define navigation structure
- Set screen options
- Apply shared UI/behavior

### **Index Route `index.tsx`**
Default route for a directory:
- `/app/(tabs)/index.tsx` → renders at `/`

---

## 📊 FILE COUNT SUMMARY

| Category | Count | Files |
|----------|-------|-------|
| **Routes** | 15 | All screens & navigation |
| **Components** | 1 | Reusable UI elements |
| **Contexts** | 1 | Global state management |
| **Hooks** | 1 | Custom React hooks |
| **Lib** | 1 | Service configurations |
| **Migrations** | 5 | Database schema versions |
| **Config** | 7 | Project configuration |
| **Assets** | 2 | Images and static files |
| **Docs** | 2 | Documentation files |
| **TOTAL** | **35** | Source files |

---

## 🎯 ROUTING ARCHITECTURE

### **Authentication Flow**
```
Unauthenticated → /login or /register
↓
Sign up → Auto-create profile
↓
/profile-setup (4 steps)
↓
Complete → /(tabs)/ (Discover)
```

### **Main App Navigation**
```
Bottom Tabs:
├── / (Discover) ────────→ /user/[id] (View Profile)
├── /events ─────────────→ /event/[id] (View Event)
├── /create ─────────────→ /event/select-guests
├── /notifications ──────→ /invitation/[id]
└── /profile
```

---

## 🔐 PROTECTED ROUTES

All routes under `(tabs)/` are protected:
- Requires authentication
- Requires `is_profile_completed = true`
- Redirects to `/login` or `/profile-setup` if not met

---

## 📱 SCREEN RESPONSIBILITIES

| Screen | Purpose | CRUD Operations |
|--------|---------|----------------|
| **login** | Authenticate user | Read |
| **register** | Create account | Create |
| **profile-setup** | Complete profile | Create/Update |
| **index (Discover)** | Browse users | Read |
| **user/[id]** | View user profile | Read |
| **events** | View my events | Read |
| **create** | Create event | Create |
| **notifications** | Manage invitations | Read/Update |
| **profile** | View my profile | Read/Update |

---

## 🚀 SCALABILITY NOTES

### **Current Structure Supports:**
- ✅ File-based routing (Expo Router)
- ✅ Grouped routes for organization
- ✅ Dynamic routes for detail views
- ✅ Shared layouts for common UI
- ✅ Modular component architecture

### **Ready to Add:**
- Additional tabs (e.g., Chat, Explore)
- Nested navigation (stacks within tabs)
- More dynamic routes (e.g., `/event/[id]/attendees`)
- Feature-based component folders
- More context providers (EventsContext, NotificationsContext)

### **Recommended Next Structure Improvements:**
1. Create `components/` subfolders:
   - `components/cards/`
   - `components/modals/`
   - `components/forms/`

2. Add `utils/` folder:
   - Helper functions
   - Constants
   - Type definitions

3. Add `types/` folder:
   - Centralized TypeScript interfaces
   - Database types (auto-generated from Supabase)

---

## 🎨 NAMING CONVENTIONS

- **Routes**: kebab-case (e.g., `forgot-password.tsx`)
- **Components**: PascalCase (e.g., `InviteUsersModal.tsx`)
- **Hooks**: camelCase with "use" prefix (e.g., `useFrameworkReady.ts`)
- **Contexts**: PascalCase with "Context" suffix (e.g., `AuthContext.tsx`)
- **Migrations**: timestamp_snake_case (e.g., `20251111090020_create_initial_schema.sql`)

---

*Last Updated: November 11, 2025*
*Total Project Files: 35*
*Lines of Code: ~5,000+*
