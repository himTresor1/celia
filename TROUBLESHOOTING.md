# CELIA - Troubleshooting Guide

## Issues Fixed

### 1. ✅ API Endpoint Mismatch
**Problem:** Frontend was calling `/auth/login` but backend expects `/api/auth/login`

**Solution:** Updated `celia-client/lib/api.ts` to use `/api` prefix
```typescript
const API_BASE = `${API_URL}/api`; // Backend uses /api prefix
```

### 2. ✅ Token Field Mismatch
**Problem:** Frontend looked for `response.data.access_token` but backend returns `token`

**Solution:** Fixed in `api.ts` login and register methods
```typescript
// Before: if (response.data.access_token)
// After:  if (response.data.token)
```

### 3. ✅ No Logging
**Problem:** Couldn't debug issues due to no logs

**Solution:** Added comprehensive logging to:
- Frontend: All API requests/responses with detailed errors
- Backend: Auth service with step-by-step flow
- Startup: Environment configuration check

---

## How to View Logs

### Frontend Logs (React Native)

**Expo Development:**
```bash
cd celia-client
npx expo start
```

Then in terminal, you'll see:
```
[API] Initializing API Client
[API] API_URL: http://localhost:3000
[API] API_BASE: http://localhost:3000/api
[API] Login request: { email: 'user@example.com', url: 'http://localhost:3000/api/auth/login' }
[API] Login response: { user: {...}, token: '...' }
[API] Token saved successfully
```

**Metro Bundler Logs:**
- Press `j` to open Chrome DevTools
- Look at Console tab for all `[API]` prefixed logs

**iOS Simulator:**
```bash
# Open simulator logs
xcrun simctl spawn booted log stream --predicate 'processImagePath contains "Expo"'
```

**Android:**
```bash
adb logcat | grep -E "ReactNativeJS|Expo"
```

### Backend Logs (NestJS)

**Start Server:**
```bash
cd celia-server
npm run start:dev
```

**Startup Logs:**
```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 CELIA API Server Started Successfully!          ║
║                                                       ║
║   🌐 Server:      http://localhost:3000              ║
║   📚 API Docs:    http://localhost:3000/api/docs     ║
║   📖 Swagger:     http://localhost:3000/api/docs     ║
║   🔧 Environment: development                        ║
║                                                       ║
║   ⚠️  API PREFIX: /api (all endpoints start with /api) ║
║   ✅ Database:   Connected                           ║
║   ✅ JWT Secret: Configured                          ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝

📝 Logging enabled for authentication and requests
💡 Frontend should connect to: http://localhost:3000
```

**Auth Logs:**
```
[AUTH] Register attempt: { email: 'user@example.com', fullName: 'John Doe' }
[AUTH] Password hashed successfully
[AUTH] User created successfully: { id: 'uuid', email: 'user@example.com' }
[AUTH] JWT token generated

[AUTH] Login attempt: { email: 'user@example.com' }
[AUTH] User found, verifying password
[AUTH] Login successful: { id: 'uuid', email: 'user@example.com' }
[AUTH] JWT token generated
```

---

## Common Issues & Solutions

### Issue 1: "Network Error" or "ERR_CONNECTION_REFUSED"

**Cause:** Backend server not running or wrong URL

**Check:**
1. Is backend running?
   ```bash
   cd celia-server
   npm run start:dev
   ```

2. Check frontend logs for API_URL:
   ```
   [API] API_URL: http://localhost:3000  ← Should match backend port
   [API] API_BASE: http://localhost:3000/api
   ```

3. For physical device or different network:
   - Update `celia-client/.env`:
     ```
     EXPO_PUBLIC_API_URL=http://YOUR_IP:3000
     ```
   - Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
   - Example: `http://192.168.1.100:3000`

4. Check backend CORS settings in `celia-server/.env`:
   ```
   CORS_ORIGIN="http://localhost:8081,exp://192.168.1.1:8081"
   ```
   Add your device IP if needed.

---

### Issue 2: "Invalid credentials" on Login

**Possible Causes:**
1. User doesn't exist (register first)
2. Wrong password
3. Database not seeded

**Debug Steps:**
1. Check backend logs for:
   ```
   [AUTH] Login attempt: { email: 'user@example.com' }
   [AUTH] Login failed - User not found: user@example.com  ← User doesn't exist
   ```
   Or:
   ```
   [AUTH] Login failed - Invalid password: user@example.com  ← Wrong password
   ```

2. Try registering a new user first
3. Check database:
   ```bash
   cd celia-server
   npx prisma studio  # Opens database viewer at http://localhost:5555
   ```

---

### Issue 3: "User with this email already exists" on Register

**Cause:** Email already registered

**Solutions:**
1. Use login instead
2. Use a different email
3. Delete user from database:
   ```bash
   cd celia-server
   npx prisma studio
   # Open User table, find user, delete
   ```

---

### Issue 4: Token not being saved

**Check Frontend Logs:**
```
[API] Register response: { user: {...}, token: '...' }
[API] Token saved successfully  ← Should see this
```

If you see:
```
[API] No token in response: { ... }  ← Token missing!
```

**Backend Issue:** Check backend logs for:
```
[AUTH] JWT token generated  ← Should see this
```

If missing, check `celia-server/.env`:
```
JWT_SECRET="change-this-to-a-secure-random-string"  ← Must be set
```

---

### Issue 5: "Unauthorized" on authenticated requests

**Cause:** Token not being sent or invalid

**Check Frontend Logs:**
```
[API] Request with token: { url: '/auth/me', method: 'get', hasToken: true }
```

If `hasToken: false`:
1. Token wasn't saved during login/register
2. Check AsyncStorage:
   ```typescript
   // In app code temporarily:
   AsyncStorage.getItem('authToken').then(token => console.log('Token:', token));
   ```

**Check Backend Logs:**
If token is sent but still unauthorized:
```
# You'll see in logs if JWT validation fails
```

Verify JWT_SECRET is same in backend .env

---

### Issue 6: Database connection failed

**Symptoms:**
- Backend won't start
- "Database connection error"

**Check:**
1. `celia-server/.env` has DATABASE_URL:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
   ```

2. Test connection:
   ```bash
   cd celia-server
   npx prisma db pull  # Should succeed
   ```

3. If using Neon.tech:
   - Login to console.neon.tech
   - Check project status (should be active)
   - Copy connection string (should have ?sslmode=require)

4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

---

## Testing Authentication Flow

### Step-by-Step Test

**1. Start Backend**
```bash
cd celia-server
npm run start:dev

# Wait for:
🚀 CELIA API Server Started Successfully!
✅ Database:   Connected
✅ JWT Secret: Configured
```

**2. Start Frontend**
```bash
cd celia-client
npx expo start

# Wait for:
[API] Initializing API Client
[API] API_BASE: http://localhost:3000/api
```

**3. Test Register**
- Open app
- Go to Register
- Fill form:
  - Email: test@example.com
  - Password: password123
  - Full Name: Test User
- Tap Register

**Expected Frontend Logs:**
```
[API] Register request: { email: 'test@example.com', fullName: 'Test User', url: '...' }
[API] Response success: { url: '/auth/register', status: 201 }
[API] Register response: { user: {...}, token: 'eyJ...' }
[API] Token saved successfully
```

**Expected Backend Logs:**
```
[AUTH] Register attempt: { email: 'test@example.com', fullName: 'Test User' }
[AUTH] Password hashed successfully
[AUTH] User created successfully: { id: '...', email: 'test@example.com' }
[AUTH] JWT token generated
```

**4. Test Login**
- Logout
- Go to Login
- Enter same credentials
- Tap Login

**Expected Frontend Logs:**
```
[API] Login request: { email: 'test@example.com', url: '...' }
[API] Response success: { url: '/auth/login', status: 200 }
[API] Login response: { user: {...}, token: 'eyJ...' }
[API] Token saved successfully
```

**Expected Backend Logs:**
```
[AUTH] Login attempt: { email: 'test@example.com' }
[AUTH] User found, verifying password
[AUTH] Login successful: { id: '...', email: 'test@example.com' }
[AUTH] JWT token generated
```

**5. Test Authenticated Request**
- After login, go to Profile tab

**Expected Frontend Logs:**
```
[API] Request with token: { url: '/auth/me', method: 'get', hasToken: true }
[API] Response success: { url: '/auth/me', status: 200 }
```

---

## Quick Diagnostics

### Check if everything is configured:

**Backend:**
```bash
cd celia-server
cat .env

# Should have:
# DATABASE_URL="postgresql://..."
# JWT_SECRET="..."
# PORT=3000
```

**Frontend:**
```bash
cd celia-client
cat .env

# Should have (optional, defaults work):
# EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Test backend directly with curl:

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl@test.com",
    "password": "password123",
    "fullName": "Curl Test"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl@test.com",
    "password": "password123"
  }'
```

If these work, the backend is fine. Issue is in frontend.

---

## Network Configuration for Physical Devices

### iOS Device (same WiFi):
1. Find Mac IP address:
   ```bash
   ipconfig getifaddr en0
   ```

2. Update `celia-client/.env`:
   ```
   EXPO_PUBLIC_API_URL=http://YOUR_MAC_IP:3000
   ```

3. Update `celia-server/.env`:
   ```
   CORS_ORIGIN="*"  # Or add your device IP
   ```

4. Restart both servers

### Android Device (same WiFi):
Same as iOS, but:
1. Make sure firewall allows port 3000
2. Use `adb reverse` if using emulator:
   ```bash
   adb reverse tcp:3000 tcp:3000
   ```

### Expo Go vs Development Build:
- **Expo Go:** Use device IP, can't use localhost
- **Development Build:** Can use localhost if on same machine

---

## Still Having Issues?

### Collect Debug Info:

1. **Frontend logs:**
   - Copy all `[API]` logs from Metro bundler

2. **Backend logs:**
   - Copy all `[AUTH]` logs from terminal

3. **Environment:**
   - What OS? (Mac, Windows, Linux)
   - Physical device or simulator?
   - Same network?

4. **Test backend directly:**
   ```bash
   curl http://localhost:3000/api/auth/login
   # Should return 400/401, not connection error
   ```

5. **Check database:**
   ```bash
   cd celia-server
   npx prisma studio
   # Should open browser to localhost:5555
   ```

With these logs, you can identify exactly where the issue is!
