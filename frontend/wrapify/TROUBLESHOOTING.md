# Troubleshooting Guide

## INVALID_CLIENT Error

If you're seeing "INVALID_CLIENT: Invalid client", check the following:

### 1. Verify Client ID in Spotify Dashboard

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click on your app
3. Copy the **Client ID** (should be 32 characters)
4. Make sure you're copying the **Client ID**, not the Client Secret

### 2. Check Your .env File

Your `.env` file should look like this (no quotes, no spaces around =):

```env
VITE_SPOTIFY_CLIENT_ID=your_32_character_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

**Common mistakes:**
- ❌ `VITE_SPOTIFY_CLIENT_ID = "abc123"` (spaces and quotes)
- ❌ `VITE_SPOTIFY_CLIENT_ID="abc123"` (quotes)
- ✅ `VITE_SPOTIFY_CLIENT_ID=abc123` (correct)

### 3. Verify No Hidden Characters

Run the validation script:
```bash
node validate-env.js
```

### 4. Restart Dev Server

After changing `.env`, you MUST restart your dev server:
```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### 5. Clear Browser Cache

Sometimes cached values can cause issues:
- Clear browser localStorage
- Or use incognito/private browsing mode

### 6. Check Browser Console

Open browser DevTools (F12) and check:
- Are there any errors in the console?
- What Client ID is being logged? (Check the console when clicking login)

### 7. Verify App Status

In Spotify Dashboard:
- Make sure your app is **active** (not in development mode restrictions)
- Check if there are any warnings or errors on the app page

## Still Not Working?

1. **Double-check Client ID**: Copy it fresh from Spotify Dashboard
2. **Verify redirect URI matches**: Must be exact match in both `.env` and Spotify Dashboard
3. **Try creating a new app**: Sometimes starting fresh helps
4. **Check network tab**: See what's actually being sent to Spotify API

