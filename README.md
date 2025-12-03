# Dead Tree Tracker PWA

A Progressive Web App for tracking and mapping dead trees. Users can register/login using Google OAuth, upload photos of dead trees with GPS location, and view all entries on an interactive map.

## Features

- 🔐 Google OAuth authentication via Supabase
- 📸 Photo upload with automatic compression
- 📍 GPS location capture
- 🗺️ Interactive map with Leaflet/OpenStreetMap
- 📱 Progressive Web App (PWA) with offline support
- ✏️ Edit/delete your own entries
- 📊 View all entries in a list or on a map

## Tech Stack

- **Frontend/Backend**: Next.js 14 (App Router) with TypeScript
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Maps**: Leaflet with OpenStreetMap
- **PWA**: next-pwa
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)
- A Google Cloud project with OAuth credentials (for Google login)

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database migrations:

   - Go to **SQL Editor** in your Supabase dashboard
   - Run `supabase/migrations/001_initial_schema.sql` (creates entries table and RLS policies)
   - Run `supabase/migrations/002_fix_rls_policy.sql` (fixes RLS policies for entries)
   - Run `supabase/migrations/003_storage_policies.sql` (creates Storage RLS policies)
   - Run `supabase/migrations/004_add_username_support.sql` (adds username support functions)

3. Set up Storage:

   - Go to **Storage** in your Supabase dashboard
   - Create a new bucket named `tree-photos`
   - Set it to **Public** (toggle "Public bucket" to ON)
   - **Note**: The Storage RLS policies are created in migration `003_storage_policies.sql` which allows public read access and authenticated uploads

4. Configure Google OAuth:

   - Go to **Authentication** > **Providers** > **Google**
   - Enable Google provider
   - Add your Google OAuth credentials:
     - Create a project in [Google Cloud Console](https://console.cloud.google.com)
     - Enable Google+ API
     - Create OAuth 2.0 credentials
     - Add authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
     - Copy Client ID and Client Secret to Supabase

5. Configure URL Configuration (Important for OAuth redirects):
   - Go to **Authentication** > **URL Configuration** (under CONFIGURATION section)
   - For local development, set **Site URL** to: `http://localhost:3000`
   - Add **Redirect URLs**:
     - `http://localhost:3000/**`
     - `http://localhost:3000/auth/callback`
   - **For production**: After deploying to Vercel, update:
     - **Site URL** to your Vercel domain (e.g., `https://your-app.vercel.app`)
     - Add production **Redirect URLs**:
       - `https://your-app.vercel.app/**`
       - `https://your-app.vercel.app/auth/callback`
     - Keep localhost URLs for local development

### 3. Environment Variables

1. In your Supabase dashboard:

   - Click the **Settings** icon (gear icon) in the left sidebar
   - Under **PROJECT SETTINGS**, click on **API Keys**
   - If you don't see any keys, click **"+ New secret key"** to create one
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
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_DB_PASSWORD=your_database_password

# Google OAuth Credentials (for Supabase Auth configuration)
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
```

**Important**: Replace all placeholder values with your actual credentials. Store this in your `.env.local` file (which is gitignored and will NOT be committed to git).

- The Supabase client libraries use the API keys above, not the database password. The password is mainly needed for direct PostgreSQL connections.
- The Google OAuth credentials are used when configuring Supabase Auth in the dashboard. The actual authentication flow is handled by Supabase.

### 4. Install Dependencies

```bash
npm install
```

### 5. Generate PWA Icons (Optional but Recommended)

The app requires PWA icons. You can:

1. Use an online PWA icon generator (e.g., [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator))
2. Create icons manually in the following sizes and place them in `public/icons/`:
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

For now, you can use placeholder icons or skip this step (the app will work, but PWA installation may not be optimal).

See `scripts/generate-icons.md` for detailed instructions.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

The app will be available at `https://your-project.vercel.app`

### Environment Variables for Production

Make sure to add the same environment variables in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase publishable key (or anon key if using legacy format)
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase secret key (or service_role key if using legacy format)
- `SUPABASE_DB_PASSWORD` - Your database password (optional, mainly for direct PostgreSQL connections)
- `GOOGLE_OAUTH_CLIENT_ID` - Your Google OAuth Client ID
- `GOOGLE_OAUTH_CLIENT_SECRET` - Your Google OAuth Client Secret

**Note**: The variable names are the same regardless of whether you use the new format (publishable/secret keys) or legacy format (anon/service_role keys) from Supabase. The publishable key maps to `NEXT_PUBLIC_SUPABASE_ANON_KEY` and the secret key maps to `SUPABASE_SERVICE_ROLE_KEY`.

### Important: Update Supabase URL Configuration for Production

After deploying to Vercel, you **must** update the Supabase URL Configuration:

1. Go to your Supabase dashboard → **Authentication** → **URL Configuration**
2. Update **Site URL** to your Vercel domain (e.g., `https://your-app.vercel.app`)
3. Add your Vercel domain to **Redirect URLs**:
   - `https://your-app.vercel.app/**`
   - `https://your-app.vercel.app/auth/callback`
4. Keep `http://localhost:3000/**` for local development
5. Click **Save**

**Without this step, OAuth will redirect to localhost instead of your production domain!**

You may also need to update the Google OAuth redirect URI in Google Cloud Console to include your Vercel domain.

## Project Structure

```
├── app/
│   ├── (auth)/          # Authentication routes
│   │   ├── login/       # Login page
│   │   └── auth/        # OAuth callback
│   ├── (main)/          # Main app routes (protected)
│   │   ├── map/         # Map view
│   │   ├── upload/      # Upload entry
│   │   └── entries/     # Entries list
│   └── api/             # API routes
├── components/          # React components
├── lib/                # Utilities and Supabase clients
├── public/             # Static assets
└── supabase/           # Database migrations
```

## Usage

1. **Sign In**: Click "Sign in with Google" to authenticate
2. **Add Entry**: Click "+ Add Entry" to upload a photo of a dead tree
   - The app will request location permissions
   - Take or select a photo
   - Add optional notes
   - Submit
3. **View Map**: See all entries plotted on an interactive map
4. **View List**: See all entries in a grid view
5. **Manage**: Delete your own entries from the list view

## Free Tier Limits

- **Vercel**: 100GB bandwidth/month, unlimited requests
- **Supabase**: 500MB database, 1GB storage, 50K monthly active users
- **Leaflet/OSM**: Unlimited (free and open source)

## Troubleshooting

### Location not working

- Ensure you've granted location permissions in your browser
- Try refreshing the page and allowing permissions again

### Images not uploading

- Check that the `tree-photos` bucket exists in Supabase Storage
- Verify the bucket is set to **Public** (toggle "Public bucket" to ON)
- Ensure you've run the Storage RLS policies migration (`003_storage_policies.sql`)
- Check browser console for specific error messages

### Authentication issues

- Verify Google OAuth credentials are correctly configured
- Check that redirect URIs match in both Google Cloud Console and Supabase
- **OAuth redirects to localhost in production**: Update Supabase **Authentication** > **URL Configuration**:
  - Set **Site URL** to your production domain
  - Add your production domain to **Redirect URLs**
  - See "Important: Update Supabase URL Configuration for Production" section above

## License

MIT
