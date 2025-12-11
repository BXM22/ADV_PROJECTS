// Spotify OAuth Authentication Service

const SPOTIFY_AUTH_BASE_URL = 'https://accounts.spotify.com';

// Get environment variables
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';

// Get redirect URI from env or use default based on environment
// For development: https://127.0.0.1:5173/callback (Spotify requires 127.0.0.1, not localhost)
// For production: must be HTTPS (e.g., https://yourdomain.com/callback)
const getRedirectUri = (): string => {
  if (import.meta.env.VITE_SPOTIFY_REDIRECT_URI) {
    return import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  }
  
  // Default to HTTPS 127.0.0.1 for development - Spotify requires loopback IP, not localhost
  const port = import.meta.env.DEV ? ':5173' : '';
  const protocol = 'https'; // Always use HTTPS
  const host = import.meta.env.DEV ? '127.0.0.1' : window.location.hostname;
  
  return `${protocol}://${host}${port}/callback`;
};

const REDIRECT_URI = getRedirectUri();

// Scopes required for the app
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'user-read-playback-state',
  'user-library-read',
].join(' ');

/**
 * Generate a random string for PKCE code verifier
 */
function generateRandomString(length: number): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

/**
 * Generate code challenge from verifier (for PKCE)
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Initiate Spotify OAuth flow
 */
export async function initiateAuth(): Promise<void> {
  // Trim whitespace from Client ID
  const clientId = CLIENT_ID.trim();
  
  if (!clientId || clientId.length === 0) {
    throw new Error('Spotify Client ID is not configured. Please set VITE_SPOTIFY_CLIENT_ID in your .env file.');
  }

  if (clientId.length !== 32) {
    console.warn('⚠️ Client ID length is unusual. Spotify Client IDs are typically 32 characters.');
  }

  // Log redirect URI for debugging (only in development)
  if (import.meta.env.DEV) {
    console.log('🔗 Using redirect URI:', REDIRECT_URI);
    console.log('💡 Make sure this EXACTLY matches your Spotify Dashboard redirect URI');
    console.log('🔑 Client ID:', clientId.substring(0, 8) + '...' + clientId.substring(clientId.length - 4));
    console.log('');
    console.log('📋 Spotify Dashboard Checklist:');
    console.log('   1. Go to: https://developer.spotify.com/dashboard');
    console.log('   2. Click your app → "Edit Settings"');
    console.log('   3. Under "Redirect URIs", you MUST have EXACTLY:');
    console.log('      ' + REDIRECT_URI);
    console.log('   4. Check for:');
    console.log('      - No trailing slash');
    console.log('      - Exact case (lowercase)');
    console.log('      - https:// (not http://)');
    console.log('      - 127.0.0.1 (NOT localhost - Spotify requirement)');
    console.log('      - Port :5173 included');
    console.log('   5. Click "Save"');
    console.log('');
  }

  const codeVerifier = generateRandomString(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Store verifier in sessionStorage for later use
  sessionStorage.setItem('spotify_code_verifier', codeVerifier);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  window.location.href = `${SPOTIFY_AUTH_BASE_URL}/authorize?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
  
  if (!codeVerifier) {
    throw new Error('Code verifier not found. Please try logging in again.');
  }

  const response = await fetch(`${SPOTIFY_AUTH_BASE_URL}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID.trim(),
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error_description || 'Failed to exchange code for token');
  }

  const data = await response.json();
  
  // Store tokens
  localStorage.setItem('spotify_access_token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
  }
  localStorage.setItem('spotify_token_expires_at', String(Date.now() + data.expires_in * 1000));
  
  // Clean up
  sessionStorage.removeItem('spotify_code_verifier');

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  };
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem('spotify_access_token');
}

/**
 * Check if token is expired
 */
function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem('spotify_token_expires_at');
  if (!expiresAt) return true;
  return Date.now() >= parseInt(expiresAt, 10);
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('spotify_refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available. Please log in again.');
  }

  const response = await fetch(`${SPOTIFY_AUTH_BASE_URL}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID.trim(),
    }),
  });

  if (!response.ok) {
    // Refresh token might be invalid, clear everything
    clearTokens();
    throw new Error('Failed to refresh token. Please log in again.');
  }

  const data = await response.json();
  
  localStorage.setItem('spotify_access_token', data.access_token);
  if (data.refresh_token) {
    localStorage.setItem('spotify_refresh_token', data.refresh_token);
  }
  localStorage.setItem('spotify_token_expires_at', String(Date.now() + data.expires_in * 1000));

  return data.access_token;
}

/**
 * Get valid access token (refresh if needed)
 */
export async function getValidAccessToken(): Promise<string> {
  let token = getAccessToken();
  
  if (!token || isTokenExpired()) {
    token = await refreshAccessToken();
  }
  
  return token;
}

/**
 * Clear all stored tokens
 */
export function clearTokens(): void {
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expires_at');
  sessionStorage.removeItem('spotify_code_verifier');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken() && !isTokenExpired();
}

