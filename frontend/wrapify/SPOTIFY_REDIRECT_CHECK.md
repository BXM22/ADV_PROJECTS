# Spotify Redirect URI Troubleshooting

## Current Configuration

Your app is configured to use:
```
https://localhost:5173/callback
```

## Step-by-Step Fix

### 1. Check Browser Console

When you click "Login with Spotify", check the browser console (F12). You should see:
```
🔗 Using redirect URI: https://localhost:5173/callback
```

**This is the EXACT string that must be in your Spotify Dashboard.**

### 2. Update Spotify Dashboard

1. Go to: https://developer.spotify.com/dashboard
2. Click on your app
3. Click **"Edit Settings"** button
4. Scroll to **"Redirect URIs"** section
5. **Remove ALL existing redirect URIs** (if any)
6. Click **"Add URI"**
7. Enter EXACTLY (copy-paste to avoid typos):
   ```
   https://localhost:5173/callback
   ```
8. Click **"Add"**
9. Click **"Save"** at the bottom

### 3. Common Mistakes to Avoid

❌ **Wrong:**
- `http://localhost:5173/callback` (missing 's' in https)
- `https://localhost:5173/callback/` (trailing slash)
- `https://localhost/callback` (missing port)
- `https://127.0.0.1:5173/callback` (wrong hostname)
- `HTTPS://LOCALHOST:5173/CALLBACK` (wrong case)

✅ **Correct:**
- `https://localhost:5173/callback` (exact match)

### 4. Verify Match

The redirect URI must match EXACTLY:
- ✅ Protocol: `https://` (not `http://`)
- ✅ Host: `localhost` (not `127.0.0.1`)
- ✅ Port: `:5173` (must include port)
- ✅ Path: `/callback` (no trailing slash)
- ✅ Case: all lowercase

### 5. Restart Dev Server

After updating Spotify Dashboard:
1. Stop your dev server (Ctrl+C)
2. Restart: `npm run dev`
3. Clear browser cache or use incognito mode
4. Try logging in again

### 6. Still Not Working?

1. **Double-check Spotify Dashboard:**
   - Log out and log back into Spotify Dashboard
   - Verify the redirect URI is saved (refresh the page)
   - Make sure there are no extra spaces or characters

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Click "Login with Spotify"
   - Copy the exact redirect URI shown
   - Verify it matches Spotify Dashboard exactly

3. **Try Incognito Mode:**
   - Open an incognito/private window
   - Visit `https://localhost:5173`
   - Accept the certificate warning
   - Try logging in

4. **Verify Certificate:**
   - Make sure you accepted the HTTPS certificate warning
   - The URL should show `https://` (not `http://`)
   - There should be a lock icon (even if it says "Not secure" for self-signed cert)

## Quick Verification Script

Run this to see what redirect URI your app is using:

```bash
# The redirect URI is logged in browser console when you click login
# Or check your .env file:
cat .env | grep VITE_SPOTIFY_REDIRECT_URI
```

The output should be:
```
VITE_SPOTIFY_REDIRECT_URI=https://localhost:5173/callback
```

