# Wrapify

## Overview
A music statistics visualization platform inspired by Spotify Wrapped, supporting multiple music platforms with customizable themes and shareable visualizations.

## Tech Stack
- React + TypeScript
- Vite (build tool)
- Music APIs (Spotify, Last.fm, Apple Music)
- Chart.js (for visualizations)

## Features
- Music listening statistics
- Year-end wrap-up (Spotify Wrapped style)
- Multiple platform support
- Shareable visualizations
- Historical data tracking
- Custom themes

## Key Components
- Music API integration (Spotify, Last.fm, Apple Music)
- Statistics calculator
- Visualization components
- Share functionality
- Theme system

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

4. Preview production build:
```bash
npm run preview
```

## Spotify API Setup

### 1. Create a Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click **"Create an App"**
4. Fill in the app details:
   - **App name**: Wrapify (or any name you prefer)
   - **App description**: Music statistics visualization platform
5. Click **"Save"**
6. Copy your **Client ID** (you'll need this)

### 2. Configure Redirect URI in Spotify Dashboard

**IMPORTANT**: The redirect URI must match exactly between your code and Spotify dashboard.

1. In your Spotify app settings, click **"Edit Settings"**
2. Under **"Redirect URIs"**, add:
   - For development: `https://localhost:5173/callback` (HTTPS required)
   - For production: `https://yourdomain.com/callback` (must use HTTPS)
3. Click **"Add"** and then **"Save"**

**⚠️ Important**: 
- Spotify requires HTTPS for redirect URIs
- Your dev server is configured to use HTTPS automatically
- On first visit, accept the self-signed certificate warning in your browser

**Common Issues:**
- ❌ **"Redirect URI is not secure"** - Make sure:
  - The URI in your code matches exactly what's in Spotify dashboard (including port number)
  - For local development, use `http://127.0.0.1:5173/callback` (NOT `localhost`)
  - For production, you MUST use HTTPS (not HTTP)
  - No trailing slashes or extra characters
  - The URI is added to your app's allowed redirect URIs list

### 3. Configure Environment Variables

1. Create a `.env` file in the project root:
   ```bash
   touch .env
   ```

2. Add your Spotify credentials:
   ```env
   # Your Spotify App Client ID (required)
   VITE_SPOTIFY_CLIENT_ID=your_actual_client_id_here
   
   # Redirect URI - MUST match exactly what you set in Spotify Dashboard
   # For local development with HTTPS:
   VITE_SPOTIFY_REDIRECT_URI=https://localhost:5173/callback
   
   # For production (must use HTTPS):
   # VITE_SPOTIFY_REDIRECT_URI=https://yourdomain.com/callback
   ```

3. **Verify the redirect URI matches exactly**:
   - Check your `.env` file
   - Check your Spotify Dashboard settings
   - They must be identical (including `http://` vs `https://`, port numbers, etc.)

### 4. Troubleshooting Redirect URI Issues

If you see **"redirect URI is not secure"** error:

1. **Check exact match**: The redirect URI in your `.env` file must match EXACTLY what's in Spotify Dashboard
   - ✅ Correct: `http://127.0.0.1:5173/callback` (loopback IP for local dev)
   - ❌ Wrong: `http://localhost:5173/callback` (localhost no longer allowed by Spotify)
   - ❌ Wrong: `http://127.0.0.1:5173/callback/` (trailing slash)
   - ❌ Wrong: `http://127.0.0.1/callback` (missing port)

2. **For local development**: Use `http://localhost:5173/callback` (or whatever port Vite uses)

3. **For production**: Must use HTTPS:
   - ✅ `https://yourdomain.com/callback`
   - ❌ `http://yourdomain.com/callback` (not secure)

4. **Multiple redirect URIs**: You can add multiple URIs in Spotify Dashboard (one for dev, one for prod)

5. **After changing redirect URI**: 
   - Save changes in Spotify Dashboard
   - Restart your dev server
   - Clear browser cache/localStorage if needed

### 4. How It Works

The integration uses **OAuth 2.0 with PKCE** (Proof Key for Code Exchange) for secure authentication:

- **No Client Secret Required**: PKCE flow is designed for public clients (like React apps)
- **Secure Token Exchange**: Uses code verifier/challenge for additional security
- **Automatic Token Refresh**: Tokens are automatically refreshed when they expire
- **Local Storage**: Access tokens are stored securely in browser localStorage

### 5. Available API Functions

The Spotify service provides:

- `getCurrentUser()` - Get user profile
- `getTopTracks(timeRange, limit)` - Get top tracks (short_term, medium_term, long_term)
- `getTopArtists(timeRange, limit)` - Get top artists
- `getRecentlyPlayed(limit)` - Get recently played tracks
- `search(query, type, limit)` - Search for tracks, artists, albums

### 6. Using the Hook

```typescript
import { useSpotify } from './hooks/useSpotify';

function MyComponent() {
  const { 
    isAuthenticated, 
    user, 
    login, 
    logout,
    fetchTopTracks,
    fetchTopArtists 
  } = useSpotify();

  // Use the hook methods...
}
```

## Implementation Steps
1. ✅ Setup React project
2. ✅ Integrate Spotify API
3. ⏳ Build statistics calculation
4. ⏳ Create visualization components
5. ⏳ Add share functionality
6. ⏳ Implement theme system
7. ⏳ Polish design and animations

**📖 See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for detailed step-by-step instructions.**

## Project Structure
```
wrapify/
├── src/
│   ├── components/
│   │   ├── Statistics/
│   │   ├── Visualizations/
│   │   ├── Share/
│   │   └── ThemeSelector/
│   ├── services/
│   │   ├── spotify/
│   │   ├── lastfm/
│   │   └── apple-music/
│   ├── hooks/
│   ├── utils/
│   │   └── statistics.ts
│   └── themes/
├── public/
└── README.md
```

