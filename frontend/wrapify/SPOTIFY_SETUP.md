# Spotify API Quick Setup Guide

## Step-by-Step Setup

### 1. Create Spotify App
1. Visit https://developer.spotify.com/dashboard
2. Log in and click "Create an App"
3. Fill in app details and save
4. Copy your **Client ID**

### 2. Configure Redirect URI in Spotify Dashboard

**CRITICAL**: This must be done BEFORE testing!

1. In your app, click **"Edit Settings"**
2. Scroll to **"Redirect URIs"**
3. Click **"Add URI"**
4. Enter: `http://localhost:5173/callback`
5. Click **"Add"** then **"Save"**

### 3. Create .env File

Create a `.env` file in the project root with:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

### 4. Verify Match
The redirect URI in your `.env` file MUST match EXACTLY what's in Spotify Dashboard:
- ✅ `http://localhost:5173/callback` 
- ❌ `http://localhost:5173/callback/` (trailing slash)
- ❌ `http://localhost/callback` (missing port)

### 5. Test
1. Run `npm run dev`
2. Click "Login with Spotify"
3. Check browser console for the redirect URI being used
4. If you see "redirect URI is not secure":
   - Verify exact match in Spotify Dashboard
   - Check your `.env` file
   - Restart dev server

## Common Errors

### "redirect URI is not secure"
- **Cause**: URI mismatch or using HTTP in production
- **Fix**: Ensure exact match between `.env` and Spotify Dashboard

### "Invalid client"
- **Cause**: Wrong Client ID
- **Fix**: Check your `.env` file has the correct Client ID

### "Invalid grant"
- **Cause**: Code expired or already used
- **Fix**: Try logging in again

