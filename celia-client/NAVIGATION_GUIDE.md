# Navigation Guide - Saved Page & My Lists

## 📍 File Locations

### Saved Page (Main Saved List with Invite Functionality)

**File Path:** `celia-client/app/profile/saved.tsx`  
**Route:** `/profile/saved`

### My Lists Page

**File Path:** `celia-client/app/profile/lists.tsx`  
**Route:** `/profile/lists`

### Saved Collection (Alternative Saved View)

**File Path:** `celia-client/app/saved/collection.tsx`  
**Route:** `/saved/collection`

---

## 🗺️ How to Navigate to These Pages

### Path 1: From Home Screen → Saved Page

1. **Start at Home Screen** (`app/(tabs)/index.tsx`)

   - Look for the green link at the bottom: **"View saved list (X)"**
   - This link navigates to: `/saved/collection`

2. **OR from Profile Tab:**
   - Tap the **Profile icon** (person icon) in the bottom navigation bar
   - This takes you to: `app/(tabs)/profile.tsx`
   - Scroll down and tap the **"My Lists"** button
   - This takes you to: `app/profile/lists.tsx` (My Lists page)
   - Tap the **"Saved List"** card (first card with heart icon)
   - This takes you to: `app/profile/saved.tsx` (Saved Page with invite functionality)

### Path 2: Direct Navigation to My Lists

1. **From Profile Tab:**

   - Tap **Profile icon** (bottom navigation, rightmost icon)
   - Scroll to find **"My Lists"** button (green border, Users icon)
   - Tap it → Goes to `app/profile/lists.tsx`

2. **From My Lists Page, you can access:**
   - **Saved List** → `app/profile/saved.tsx` (tap first card)
   - **Friends** → `app/profile/friends.tsx` (tap second card)
   - **Invitees** → `app/profile/invitees.tsx` (tap third card)

---

## 🧪 Testing Instructions

### To Test the Saved Page (`app/profile/saved.tsx`):

1. **Navigate there:**

   ```
   Profile Tab → My Lists → Saved List card
   ```

2. **What to test:**

   - ✅ View saved users list
   - ✅ Select users (checkbox appears)
   - ✅ Select All / Deselect All button
   - ✅ "Invite X to Event" button appears when users selected
   - ✅ Modal opens to select event
   - ✅ Send bulk invitations
   - ✅ Remove users from saved list

3. **Quick test route:**
   - In your browser/app, go to: `http://localhost:8081/profile/saved`

### To Test My Lists Page (`app/profile/lists.tsx`):

1. **Navigate there:**

   ```
   Profile Tab → My Lists button
   ```

2. **What to test:**

   - ✅ See counts for Saved, Friends, Invitees
   - ✅ Tap "Saved List" → Goes to saved page
   - ✅ Tap "Friends" → Goes to friends page
   - ✅ Tap "Invitees" → Goes to invitees page

3. **Quick test route:**
   - In your browser/app, go to: `http://localhost:8081/profile/lists`

---

## 📂 Complete File Structure

```
celia-client/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          ← Home/Discover screen (has "View saved list" link)
│   │   ├── profile.tsx        ← Profile tab (has "My Lists" button)
│   │   └── notifications.tsx  ← Invitations page
│   │
│   ├── profile/
│   │   ├── lists.tsx          ← My Lists page (3 cards: Saved, Friends, Invitees)
│   │   ├── saved.tsx          ← Saved List page (with invite functionality) ⭐
│   │   ├── friends.tsx        ← Friends list page
│   │   └── invitees.tsx       ← Previous invitees page
│   │
│   └── saved/
│       ├── collection.tsx     ← Alternative saved collection view
│       └── passed.tsx         ← Passed users view
```

---

## 🎯 Key Navigation Points

### From Home Screen:

- **"View saved list (X)" link** → `/saved/collection` → `app/saved/collection.tsx`

### From Profile Tab:

- **"My Lists" button** → `/profile/lists` → `app/profile/lists.tsx`
  - Then tap **"Saved List"** card → `/profile/saved` → `app/profile/saved.tsx` ⭐

### The Saved Page You Want (`app/profile/saved.tsx`):

- **Location:** `celia-client/app/profile/saved.tsx`
- **Route:** `/profile/saved`
- **Features:**
  - View all saved users
  - Select multiple users
  - Send bulk invitations to events
  - Remove users from saved list

---

## 🚀 Quick Access URLs (for Web Testing)

If running on web (`npm run dev`), you can directly navigate to:

- **My Lists:** `http://localhost:8081/profile/lists`
- **Saved Page:** `http://localhost:8081/profile/saved`
- **Profile Tab:** `http://localhost:8081/(tabs)/profile`
- **Home Screen:** `http://localhost:8081/(tabs)`

---

## 📝 Summary

**To reach the Saved Page with invite functionality:**

1. Open app → Tap Profile icon (bottom nav)
2. Scroll down → Tap "My Lists" button
3. Tap "Saved List" card (first card with heart icon)
4. You're now at `app/profile/saved.tsx` ✅

**To reach My Lists page:**

1. Open app → Tap Profile icon (bottom nav)
2. Scroll down → Tap "My Lists" button
3. You're now at `app/profile/lists.tsx` ✅
