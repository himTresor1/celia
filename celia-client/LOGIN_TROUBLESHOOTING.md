# Login Troubleshooting Guide

## Quick Diagnostic Steps

### 1. Check if Backend is Running

**Open a new terminal and run:**

```bash
cd celia-server
npm run start:dev
```

You should see:

```
🚀 CELIA API Server Started Successfully!
Application is running on: http://localhost:3000
```

**If backend is not running:**

- Login will fail with "Cannot connect to server" or "Network Error"
- Fix: Start the backend server first

### 2. Check Browser Console (F12)

**Open DevTools → Console tab and look for:**

✅ **Good signs:**

```
[API] Initializing API Client
[API] API_URL: http://localhost:3000
[API] API_BASE: http://localhost:3000/api
[API] Login request: { email: "...", url: "..." }
```

❌ **Error signs:**

- `ECONNREFUSED` → Backend not running
- `401 Unauthorized` → Wrong email/password or user doesn't exist
- `CORS error` → Backend CORS not configured
- `Network Error` → Backend not reachable

### 3. Check Network Tab

1. Open DevTools → Network tab
2. Try logging in
3. Find the `/api/auth/login` request
4. Check:
   - **Status**: Should be `200` (green)
   - **Request URL**: Should be `http://localhost:3000/api/auth/login`
   - **Response**: Should contain `{ user: {...}, token: "..." }`

**Common Status Codes:**

- `200` ✅ Success
- `401` ❌ Invalid credentials
- `404` ❌ Endpoint not found (check backend routes)
- `500` ❌ Server error (check backend logs)
- `(failed)` ❌ Backend not running or CORS issue

### 4. Verify User Exists

**Option A: Register First**

1. Go to "Create Account" on login screen
2. Register with a new email
3. Then try logging in

**Option B: Check Database**

```bash
cd celia-server
npx prisma studio
```

Opens database viewer at http://localhost:5555

- Check `User` table for existing users

### 5. Check Environment Variables

**Create `.env` file in `celia-client/` directory:**

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

**Verify it's loaded:**

1. Open browser console (F12)
2. Type: `console.log(process.env.EXPO_PUBLIC_API_URL)`
3. Should show: `http://localhost:3000`

**If undefined:**

- Restart Expo dev server: `npm run dev`
- Clear browser cache
- Check file is named exactly `.env` (not `.env.local`)

### 6. Test Backend Directly

**Using curl or Postman:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Expected response:**

```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**If this fails:**

- Backend has an issue (check backend logs)
- Database might not be set up
- User might not exist

## Common Error Messages & Solutions

### "Login failed"

**Possible causes:**

1. Backend not running → Start backend server
2. Wrong credentials → Use correct email/password
3. User doesn't exist → Register first
4. Network issue → Check internet connection

**Debug:**

- Check browser console for `[API] Login error:` logs
- Check Network tab for failed request
- Check backend terminal for error logs

### "Cannot connect to server"

**Solution:**

1. Verify backend is running: `cd celia-server && npm run start:dev`
2. Check backend is on port 3000
3. Verify `.env` has correct URL: `EXPO_PUBLIC_API_URL=http://localhost:3000`
4. Restart Expo dev server

### "Invalid credentials"

**Solution:**

1. Verify email/password are correct
2. Check if user exists in database
3. Try registering a new account
4. Check backend logs for specific error

### "Network Error" or CORS Error

**Solution:**

1. Check backend CORS configuration in `celia-server/src/main.ts`
2. Verify `CORS_ORIGIN` includes `http://localhost:8081`
3. Restart backend server after CORS changes

## Step-by-Step Debugging

1. **Start Backend:**

   ```bash
   cd celia-server
   npm run start:dev
   ```

2. **Start Frontend:**

   ```bash
   cd celia-client
   npm run dev
   ```

3. **Open Browser DevTools (F12)**

4. **Go to Console tab** - Look for initialization logs

5. **Try logging in** - Watch for error messages

6. **Go to Network tab** - Check the login request

7. **Check Response:**
   - If 200: Check response body for token
   - If 401: Wrong credentials or user doesn't exist
   - If 500: Check backend terminal for error

## Still Not Working?

1. **Clear browser storage:**

   - DevTools → Application tab → Clear Storage → Clear site data

2. **Restart everything:**

   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Start backend again
   - Start frontend again

3. **Check backend logs:**

   - Look for `[AUTH] Login attempt:` logs
   - Look for `[AUTH] Login failed:` or `[AUTH] Login successful:` messages

4. **Verify database:**

   ```bash
   cd celia-server
   npx prisma migrate dev
   ```

5. **Create a test user:**
   - Use the register screen
   - Then try logging in with that user
