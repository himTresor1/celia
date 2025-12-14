# Web Debugging Guide for CELIA

## Opening Browser Developer Tools

### Chrome/Edge (Windows/Linux)

- Press `F12` or `Ctrl + Shift + I`
- Or right-click → "Inspect"

### Chrome/Edge (Mac)

- Press `Cmd + Option + I`
- Or right-click → "Inspect"

### Firefox (Windows/Linux)

- Press `F12` or `Ctrl + Shift + I`

### Firefox (Mac)

- Press `Cmd + Option + I`

### Safari (Mac)

- First enable Developer menu: Safari → Preferences → Advanced → "Show Develop menu"
- Then press `Cmd + Option + I`

## Using Developer Tools

### 1. Console Tab

- **Purpose**: View logs, errors, and run JavaScript commands
- **What to look for**:
  - `[API]` prefixed logs (API requests/responses)
  - `[AuthContext]` prefixed logs (authentication flow)
  - Red error messages
  - Network request failures

### 2. Network Tab

- **Purpose**: Monitor all HTTP requests
- **What to check**:
  - Login request to `/api/auth/login`
  - Response status (200 = success, 401 = unauthorized, 500 = server error)
  - Response body (check if token is returned)
  - Request headers (check if Authorization header is sent)

### 3. Application Tab (Chrome) / Storage Tab (Firefox)

- **Purpose**: View stored data
- **What to check**:
  - Local Storage → Check for `authToken` and `user` entries
  - Session Storage → Check for any session data

## Common Issues & Solutions

### Issue: "Login failed" Error

**Debug Steps:**

1. Open Console tab (F12)
2. Try logging in
3. Look for error messages:
   - `[API] Login error:` - Shows the actual error
   - Check `error.response?.data?.message` for backend error message

**Common Causes:**

- Backend server not running (check terminal)
- Wrong API URL (check `.env` file)
- User doesn't exist (register first)
- Wrong password
- CORS issues (check backend logs)

**Check Network Tab:**

1. Go to Network tab
2. Try logging in
3. Find the `/api/auth/login` request
4. Check:
   - Status code (should be 200)
   - Response tab → Should contain `{ user: {...}, token: "..." }`
   - If 401: Invalid credentials
   - If 500: Server error (check backend logs)
   - If request fails: Backend not reachable

### Issue: Can't See Console Logs

**Solution:**

1. Make sure Console tab is selected in DevTools
2. Check filter settings (should show all log levels)
3. Clear console and try again
4. Check if logs are being filtered out

### Issue: API Requests Failing

**Check:**

1. Network tab → Find failed request
2. Check error message
3. Verify backend is running: `cd celia-server && npm run start:dev`
4. Check API URL in console: Look for `[API] API_URL:` log
5. Verify `.env` file has correct `EXPO_PUBLIC_API_URL`

## Quick Debug Commands

In the Console tab, you can run:

```javascript
// Check stored auth token
localStorage.getItem('authToken');

// Check stored user
localStorage.getItem('user');

// Clear all storage (for testing)
localStorage.clear();
sessionStorage.clear();

// Check API URL
console.log(process.env.EXPO_PUBLIC_API_URL);
```

## React Native DevTools (Not Available on Web)

**Note**: React Native DevTools (the specialized debugging tools) are **not available** when running on web. This is expected behavior. Use your browser's built-in developer tools instead.

## Tips

1. **Keep Console Open**: Leave DevTools open while developing to catch errors immediately
2. **Filter Logs**: Use the filter box in Console to search for specific logs (e.g., type `[API]`)
3. **Preserve Log**: Enable "Preserve log" checkbox to keep logs after page refresh
4. **Network Preserve**: Enable "Preserve log" in Network tab to see requests after navigation

## Still Having Issues?

1. Check backend terminal for server errors
2. Verify `.env` file configuration
3. Check browser console for CORS errors
4. Verify backend is running on correct port (default: 3000)
5. Check network connectivity
