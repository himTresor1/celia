# Environment Variables Setup

## Supabase Configuration

The app requires Supabase environment variables to function. You need to set up a `.env` file in the `celia-client` directory.

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Project Settings** > **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the `anon` key under API keys)

### Step 2: Create `.env` File

Create a `.env` file in the `celia-client` directory with the following content:

```env
EXPO_PUBLIC_SUPABASE_URL=your-project-url-here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Example:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.example
```

### Step 3: Restart the Development Server

After creating the `.env` file, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm start
# or
npm run ios
# or
npm run android
```

### Alternative: Add to app.json (Not Recommended)

You can also add the values directly to `app.json` under the `extra` section:

```json
"extra": {
  "supabaseUrl": "your-project-url-here",
  "supabaseAnonKey": "your-anon-key-here"
}
```

However, using `.env` file is recommended as it keeps sensitive data out of version control.

### Security Note

⚠️ **Important:** The `.env` file is already in `.gitignore`, so it won't be committed to git. Never commit your Supabase keys to version control!

### Troubleshooting

If you still see the error after setting up the `.env` file:

1. Make sure the file is named exactly `.env` (not `.env.local` or `.env.example`)
2. Make sure the file is in the `celia-client` directory (same level as `package.json`)
3. Make sure the variable names start with `EXPO_PUBLIC_` prefix
4. Restart the Metro bundler completely (stop and start again)
5. Clear the cache: `npx expo start --clear`

