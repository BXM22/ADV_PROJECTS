# HTTPS Local Development Setup

## ✅ Setup Complete

Your project is now configured with HTTPS using self-signed certificates.

## Quick Start

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Visit your app:**
   ```
   https://localhost:5173
   ```

3. **Accept the security warning:**
   - Your browser will show a warning because the certificate is self-signed
   - This is normal for local development
   - Click "Advanced" → "Proceed to localhost (unsafe)" (or similar)

## Certificate Files

The following files were generated:
- `key.pem` - Private key
- `cert.pem` - Certificate

These are already in `.gitignore` and should not be committed.

## Update Spotify Dashboard

Make sure your Spotify app has this redirect URI:
```
https://localhost:5173/callback
```

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click your app → "Edit Settings"
3. Under "Redirect URIs", add: `https://localhost:5173/callback`
4. Click "Save"

## Troubleshooting

### ERR_SSL_VERSION_OR_CIPHER_MISMATCH

If you see this error:
1. **Clear browser cache** and try again
2. **Restart the dev server**: Stop (Ctrl+C) and run `npm run dev` again
3. **Check certificate files exist**: Run `ls *.pem` in the project root
4. **Try a different browser** or incognito mode

### Certificate Expired

Certificates are valid for 365 days. To regenerate:
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"
```

### Port Already in Use

If port 5173 is busy, Vite will use the next available port. Update:
- Your `.env` file: `VITE_SPOTIFY_REDIRECT_URI=https://localhost:NEW_PORT/callback`
- Spotify Dashboard redirect URI

## Using Trusted Certificates (Optional)

For a better experience without security warnings, use `mkcert`:

### macOS:
```bash
# Install mkcert
brew install mkcert

# Install the local CA
mkcert -install

# Generate trusted certificate
mkcert localhost

# Update vite.config.ts to use localhost.pem and localhost-key.pem
```

### Benefits:
- ✅ No browser security warnings
- ✅ Trusted by your system
- ✅ Better development experience
