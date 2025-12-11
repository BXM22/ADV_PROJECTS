# Restart Instructions

## The Issue

Your dev server is currently listening on `localhost` (IPv6), but Spotify requires `127.0.0.1` (IPv4) for the redirect URI.

## Solution

I've updated `vite.config.ts` to bind to `127.0.0.1`. You need to restart your dev server.

## Steps

### 1. Stop the Current Server

If your dev server is running:
- Press `Ctrl+C` in the terminal where it's running
- Or close the terminal window

### 2. Verify Server is Stopped

```bash
lsof -i :5173
```

This should show nothing (or just your browser connection, which is fine).

### 3. Start the Server Again

```bash
npm run dev
```

You should now see:
```
➜  Local:   https://127.0.0.1:5173/
```

### 4. Access Your App

Visit: `https://127.0.0.1:5173`

### 5. Accept Certificate Warning

Your browser will show a security warning. Click:
- **Chrome/Edge**: "Advanced" → "Proceed to 127.0.0.1 (unsafe)"
- **Firefox**: "Advanced" → "Accept the Risk and Continue"
- **Safari**: "Show Details" → "visit this website"

### 6. Test Spotify Login

After accepting the certificate, try logging in with Spotify. It should work now!

## Why This Happened

- Vite by default binds to `localhost` (which can be IPv6)
- Spotify requires `127.0.0.1` (IPv4) for redirect URIs
- The config now explicitly binds to `127.0.0.1` to match

## Troubleshooting

If you still can't connect:

1. **Check if server is running:**
   ```bash
   lsof -i :5173
   ```

2. **Try accessing via localhost first:**
   - Visit `https://localhost:5173` to verify HTTPS works
   - Then switch to `https://127.0.0.1:5173`

3. **Check firewall:**
   - Make sure nothing is blocking port 5173

4. **Clear browser cache:**
   - Or use incognito/private mode

