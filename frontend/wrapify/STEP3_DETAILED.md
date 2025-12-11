# Step 3: Start the Server Again - Detailed Instructions

## Overview
After stopping the old server, you need to start it again with the new configuration that binds to `127.0.0.1`.

## Step-by-Step Instructions

### Step 3.1: Open Terminal
1. Make sure you have a terminal/command prompt open
2. If you don't have one open:
   - **macOS**: Press `Cmd + Space`, type "Terminal", press Enter
   - **Windows**: Press `Win + R`, type "cmd", press Enter
   - **Linux**: Press `Ctrl + Alt + T`

### Step 3.2: Navigate to Project Directory
Type this command and press Enter:
```bash
cd /Users/brennenmeregillano/Desktop/Code/ADV_PROJECTS/frontend/wrapify
```

**What this does**: Changes your current directory to the wrapify project folder.

**Expected output**: Your terminal prompt should show you're in the wrapify directory.

### Step 3.3: Verify You're in the Right Place
Type this command to confirm:
```bash
pwd
```

**Expected output**: Should show `/Users/brennenmeregillano/Desktop/Code/ADV_PROJECTS/frontend/wrapify`

**Also verify the files exist**:
```bash
ls package.json vite.config.ts
```

**Expected output**: Should list both files without errors.

### Step 3.4: Start the Development Server
Type this command and press Enter:
```bash
npm run dev
```

**What this does**: Starts the Vite development server with HTTPS on `127.0.0.1:5173`.

### Step 3.5: Wait for Server to Start
You should see output like this:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   https://127.0.0.1:5173/
  ➜  Network: use --host to expose
```

**Important**: Look for `https://127.0.0.1:5173/` in the output. This confirms it's binding to the correct address.

### Step 3.6: Verify Server is Running
In a **new terminal window** (keep the server running in the first one), type:
```bash
lsof -i :5173
```

**Expected output**: Should show a `node` process listening on `127.0.0.1:5173`

**What to look for**:
- ✅ `127.0.0.1:5173` or `*:5173` in the output = Good!
- ❌ `localhost:5173` only = Server might still be on wrong address

### Step 3.7: Keep Terminal Open
**Important**: Don't close the terminal where `npm run dev` is running. The server needs to stay running.

- The terminal will show logs as you use the app
- To stop the server later, press `Ctrl+C` in that terminal

## Troubleshooting Step 3

### Problem: "command not found: npm"
**Solution**: Node.js/npm is not installed or not in PATH
- Install Node.js from https://nodejs.org/
- Or use a Node version manager (nvm, n)

### Problem: "Cannot find module"
**Solution**: Dependencies not installed
```bash
npm install
```
Then try `npm run dev` again.

### Problem: "Port 5173 is already in use"
**Solution**: Another process is using the port
1. Find what's using it:
   ```bash
   lsof -i :5173
   ```
2. Kill the process (replace PID with the number from step 1):
   ```bash
   kill -9 PID
   ```
3. Or use a different port by editing `vite.config.ts` and changing `port: 5173` to another number

### Problem: Server shows "localhost" instead of "127.0.0.1"
**Solution**: The config change didn't take effect
1. Stop the server (`Ctrl+C`)
2. Verify `vite.config.ts` has `host: '127.0.0.1'`
3. Restart: `npm run dev`

### Problem: "ERR_SSL" or certificate errors
**Solution**: This is normal for self-signed certificates
- You'll accept the certificate in your browser (Step 4)
- The server is working correctly if you see the HTTPS URL

## What Success Looks Like

✅ Terminal shows: `➜  Local:   https://127.0.0.1:5173/`  
✅ Server keeps running (doesn't exit)  
✅ No error messages about port conflicts  
✅ You can proceed to Step 4 (accessing the app in browser)

## Next Steps

Once you see the server running successfully:
1. **Step 4**: Open your browser and go to `https://127.0.0.1:5173`
2. **Step 5**: Accept the certificate warning
3. **Step 6**: Test Spotify login

---

## Quick Reference Commands

```bash
# Navigate to project
cd /Users/brennenmeregillano/Desktop/Code/ADV_PROJECTS/frontend/wrapify

# Start server
npm run dev

# In another terminal, check if running
lsof -i :5173

# Stop server (when done)
# Press Ctrl+C in the terminal where npm run dev is running
```

