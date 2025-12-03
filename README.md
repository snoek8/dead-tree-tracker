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
2. Go to **SQL Editor** and run the migration file:
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste and execute in the SQL Editor

3. Set up Storage:
   - Go to **Storage** in your Supabase dashboard
   - Create a new bucket named `tree-photos`
   - Set it to **Public** (or configure RLS policies as needed)

4. Configure Google OAuth:
   - Go to **Authentication** > **Providers** > **Google**
   - Enable Google provider
   - Add your Google OAuth credentials:
     - Create a project in [Google Cloud Console](https://console.cloud.google.com)
     - Enable Google+ API
     - Create OAuth 2.0 credentials
     - Add authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`
     - Copy Client ID and Client Secret to Supabase

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_DB_PASSWORD=your_database_password

# Google OAuth Credentials (for Supabase Auth configuration)
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_client_secret
```

**Note**: All sensitive values should be stored in your `.env.local` file (which is gitignored). The database password is mainly needed for direct PostgreSQL connections. The Google OAuth credentials are used when configuring Supabase Auth, but the actual authentication is handled by Supabase.

You can find these values in your Supabase project settings under **API**.

### 4. Generate PWA Icons

The app requires PWA icons. You can:

1. Use an online PWA icon generator (e.g., [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator))
2. Create icons manually in the following sizes and place them in `public/icons/`:
   - 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

For now, you can use placeholder icons or skip this step (the app will work, but PWA installation may not be optimal).

### 5. Run the Development Server

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
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Also update the Google OAuth redirect URI in Google Cloud Console to include your Vercel domain.

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
- Verify the bucket is set to public or has proper RLS policies

### Authentication issues
- Verify Google OAuth credentials are correctly configured
- Check that redirect URIs match in both Google Cloud Console and Supabase

## License

MIT
