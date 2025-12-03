# Setup Guide

This guide will help you set up the Dead Tree Tracker PWA from scratch.

## Step 1: Supabase Setup

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - Project name: `dead-tree-tracker` (or your choice)
   - Database password: (save this securely)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

### Run Database Migrations

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Run the first migration:
   - Copy and paste the entire contents of `supabase/migrations/001_initial_schema.sql`
   - Click "Run" (or press Ctrl+Enter)
   - You should see "Success. No rows returned"
4. Run the second migration (fixes RLS policies):
   - Click "New Query" again
   - Copy and paste the entire contents of `supabase/migrations/002_fix_rls_policy.sql`
   - Click "Run"
   - You should see "Success. No rows returned"
5. Run the third migration (Storage policies):
   - Click "New Query" again
   - Copy and paste the entire contents of `supabase/migrations/003_storage_policies.sql`
   - Click "Run"
   - You should see "Success. No rows returned"

### Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click "New bucket"
3. Name: `tree-photos`
4. **Important**: Make it **Public** (toggle "Public bucket" to ON)
5. Click "Create bucket"

**Note**: The Storage RLS policies are created in migration `003_storage_policies.sql` which you should have already run. These policies allow:
- Public read access (anyone can view photos)
- Authenticated users can upload photos
- Users can manage (update/delete) their own photos

### Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:

   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Application type: "Web application"
   - Name: "Dead Tree Tracker"
   - Authorized redirect URIs: Add your Supabase callback URL:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
     (Replace `<your-project-ref>` with your actual Supabase project reference, found in your Supabase project settings)
   - Click "Create"
   - Copy the **Client ID** and **Client Secret**

5. Back in Supabase:
   - Go to **Authentication** > **Providers**
   - Find **Google** and click to expand
   - Toggle "Enable Google provider" to ON
   - Paste your **Client ID** and **Client Secret**
   - Click "Save"

## Step 2: Environment Variables

1. In your Supabase dashboard:

   - Click the **Settings** icon (gear icon) in the left sidebar
   - Under **PROJECT SETTINGS**, click on **API Keys**
   - If you don't see any keys, click **"+ New secret key"** to create one (you may need to create a secret key first)
   - You'll see two tabs: **"Publishable and secret API keys"** (new format) and **"Legacy anon, service_role API keys"** (old format)
   - You can use either format - both work with the Supabase client libraries

2. Copy the following values:

   **Option A: Using New Format (Recommended)**

   - **Project URL**: Go to **Settings** > **General** to find your Project URL (or check the URL in your browser - it's `https://<project-ref>.supabase.co`)
   - **Publishable key** (this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`) - from the "Publishable key" field
   - **Secret key** (this is `SUPABASE_SERVICE_ROLE_KEY`) - from the "Secret keys" table, click the eye icon to reveal it - **Keep this secret!**

   **Option B: Using Legacy Format**

   - Switch to the **"Legacy anon, service_role API keys"** tab
   - **Project URL** - found at the top
   - **anon public** key (this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **service_role** key (this is `SUPABASE_SERVICE_ROLE_KEY`) - **Keep this secret!**

3. Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_PASSWORD=your_database_password_here

# Google OAuth Credentials (for Supabase Auth configuration)
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
```

**Important**: Replace all placeholder values with your actual credentials. Store this in your `.env.local` file (which is gitignored and will NOT be committed to git).

- The Supabase client libraries use the API keys above, not the database password. The password is mainly needed for direct PostgreSQL connections.
- The Google OAuth credentials are used when configuring Supabase Auth in the dashboard. The actual authentication flow is handled by Supabase.

Replace the values with your actual Supabase credentials.

## Step 3: Generate PWA Icons (Optional but Recommended)

See `scripts/generate-icons.md` for detailed instructions. You can skip this step for now - the app will work, but PWA installation won't be optimal.

Quick option: Use [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) or [RealFaviconGenerator](https://realfavicongenerator.net/) with a 512x512 source image.

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 6: Test the App

1. You should be redirected to `/login`
2. Click "Sign in with Google"
3. Complete Google OAuth flow
4. You should be redirected to `/map`
5. Click "+ Add Entry" to test photo upload
6. Grant location permissions when prompted
7. Upload a test photo
8. Verify it appears on the map

## Troubleshooting

### "Failed to upload entry" error

- Check that the `tree-photos` bucket exists and is public
- Verify your Supabase credentials in `.env.local`

### Google OAuth not working

- Verify redirect URI matches exactly in both Google Cloud Console and Supabase
- Check that Google+ API is enabled
- Ensure Client ID and Secret are correct

### Location not working

- Grant location permissions in your browser
- Try a different browser
- Check browser console for errors

### Map not loading

- Check browser console for errors
- Verify Leaflet CSS is loading
- Try hard refresh (Ctrl+Shift+R)

## Next Steps

Once everything is working locally:

1. Push code to GitHub
2. Deploy to Vercel (see README.md for instructions)
3. Update Google OAuth redirect URI to include your Vercel domain
4. Add environment variables in Vercel project settings
