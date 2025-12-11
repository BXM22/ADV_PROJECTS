// Quick validation script for .env file
// Run: node validate-env.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '.env');

console.log('🔍 Checking .env file configuration...\n');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('\n📝 Create a .env file with:');
  console.log('VITE_SPOTIFY_CLIENT_ID=your_client_id_here');
  console.log('VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));

const env = {};
lines.forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim();
  }
});

console.log('📋 Found environment variables:');
console.log('');

let hasErrors = false;

// Check Client ID
if (!env.VITE_SPOTIFY_CLIENT_ID) {
  console.error('❌ VITE_SPOTIFY_CLIENT_ID is missing!');
  hasErrors = true;
} else if (env.VITE_SPOTIFY_CLIENT_ID === 'your_client_id_here' || env.VITE_SPOTIFY_CLIENT_ID.length < 10) {
  console.error('❌ VITE_SPOTIFY_CLIENT_ID appears to be a placeholder or invalid');
  console.log('   Current value:', env.VITE_SPOTIFY_CLIENT_ID);
  hasErrors = true;
} else {
  console.log('✅ VITE_SPOTIFY_CLIENT_ID is set');
  console.log('   Value:', env.VITE_SPOTIFY_CLIENT_ID.substring(0, 10) + '...');
}

// Check Redirect URI
if (!env.VITE_SPOTIFY_REDIRECT_URI) {
  console.error('❌ VITE_SPOTIFY_REDIRECT_URI is missing!');
  hasErrors = true;
} else {
  const redirectUri = env.VITE_SPOTIFY_REDIRECT_URI;
  console.log('✅ VITE_SPOTIFY_REDIRECT_URI is set');
  console.log('   Value:', redirectUri);
  
  // Validate format
  if (!redirectUri.startsWith('http://') && !redirectUri.startsWith('https://')) {
    console.error('   ⚠️  Warning: Should start with http:// or https://');
    hasErrors = true;
  }
  
  if (redirectUri.includes('localhost') && redirectUri.startsWith('https://')) {
    console.error('   ⚠️  Warning: localhost should use http:// not https://');
    hasErrors = true;
  }
  
  if (!redirectUri.endsWith('/callback')) {
    console.error('   ⚠️  Warning: Should end with /callback');
    hasErrors = true;
  }
  
  if (redirectUri.includes('localhost') && !redirectUri.includes(':5173')) {
    console.warn('   ⚠️  Note: Make sure the port matches your dev server (usually 5173)');
  }
}

console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('\n❌ Configuration has errors. Please fix them above.');
  console.log('\n📝 Your .env file should look like:');
  console.log('VITE_SPOTIFY_CLIENT_ID=your_actual_client_id_from_spotify_dashboard');
  console.log('VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback');
  process.exit(1);
} else {
  console.log('\n✅ Environment variables look good!');
  console.log('\n💡 Next steps:');
  console.log('   1. Make sure the redirect URI in Spotify Dashboard matches exactly');
  console.log('   2. Restart your dev server: npm run dev');
  console.log('   3. Try logging in with Spotify');
}

