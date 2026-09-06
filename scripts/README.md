# 🚀 Render Backend Keep-Alive Guide

Render's free tier spins down web services after **15 minutes of inactivity** (no incoming HTTP traffic). The next request after spin-down experiences a **cold start delay** (30–60+ seconds).

This directory contains automated solutions to query your Render backend every **10 minutes** so that it stays warm and never spins down.

---

## 🌟 Method 1: Cloud Uptime Monitor (Recommended - 100% Free & Zero Maintenance)

> **Why this is best:** It runs 24/7/365 in the cloud for free. It never depends on your personal laptop being turned on or on GitHub Actions queues.

### Using [Cron-job.org](https://cron-job.org) (Recommended)
1. Go to [https://cron-job.org](https://cron-job.org) and create a free account.
2. Click **Create Cronjob**.
3. Fill in:
   - **Title:** `Keep Render Alive`
   - **URL:** `https://your-backend.onrender.com` (or your `/health` endpoint)
   - **Schedule:** Select **Every 10 minutes** (or **Every 12 minutes**).
   - **Request Method:** `GET`
4. Click **Create**. It will automatically ping your backend 24/7.

### Using [UptimeRobot](https://uptimerobot.com)
1. Go to [https://uptimerobot.com](https://uptimerobot.com) and sign up for free.
2. Click **Add New Monitor**.
3. Set **Monitor Type** to `HTTP(s)`.
4. Enter your backend URL.
5. Set **Monitoring Interval** to `5 minutes` or `10 minutes`.
6. Click **Create Monitor**.

---

## ⚡ Method 2: GitHub Actions Workflow (Automatic & In-Repo)

A GitHub Actions workflow is included at [`.github/workflows/render-keep-alive.yml`](../.github/workflows/render-keep-alive.yml).

### How to use:
1. Push this repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: add render keep-alive automation"
   git push origin main
   ```
2. (Optional) In your GitHub repository:
   - Go to **Settings** > **Secrets and variables** > **Actions**.
   - Add a repository secret named `RENDER_BACKEND_URL` with your URL:
     `https://your-backend.onrender.com`
   - Or `RENDER_BACKEND_URLS` with comma-separated URLs:
     `https://app1.onrender.com,https://app2.onrender.com`
3. GitHub Actions will trigger every 10 minutes (`cron: '*/10 * * * *'`) and ping your service.

---

## 💻 Method 3: Run Keep-Alive Script Locally or on a Server

### Node.js
```bash
# Default targets
node scripts/keep_alive.js

# Custom URL(s)
node scripts/keep_alive.js https://your-backend.onrender.com
node scripts/keep_alive.js https://backend-1.onrender.com https://backend-2.onrender.com
```

### Python
```bash
# Default targets
python scripts/keep_alive.py

# Custom URL(s)
python scripts/keep_alive.py https://your-backend.onrender.com
```

### PowerShell (Windows)
```powershell
.\scripts\keep_alive.ps1 -TargetUrl "https://your-backend.onrender.com" -IntervalMinutes 10
```

---

## 🔧 Method 4: Drop-in Self-Ping Snippet (Directly inside Backend Code)

You can also embed a self-ping timer directly inside your backend source code. When your server boots up, it pings its own external URL every 10 minutes:

### Node.js (Express.js)
```javascript
const https = require('https');

const BACKEND_PUBLIC_URL = process.env.RENDER_EXTERNAL_URL || 'https://your-backend.onrender.com';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

setInterval(() => {
  https.get(BACKEND_PUBLIC_URL, (res) => {
    console.log(`[Keep-Alive] Pinged ${BACKEND_PUBLIC_URL}: Status ${res.statusCode}`);
  }).on('error', (err) => {
    console.error(`[Keep-Alive] Ping failed:`, err.message);
  });
}, PING_INTERVAL);
```

### Python (FastAPI / Starlette)
```python
import asyncio
import httpx

@app.on_event("startup")
async def start_keep_alive():
    backend_url = os.getenv("RENDER_EXTERNAL_URL", "https://your-backend.onrender.com")
    
    async def ping_loop():
        await asyncio.sleep(60) # Wait 1 min after startup
        async with httpx.AsyncClient() as client:
            while True:
                try:
                    res = await client.get(backend_url, timeout=20.0)
                    print(f"[Keep-Alive] Pinged self: Status {res.status_code}")
                except Exception as e:
                    print(f"[Keep-Alive] Error: {e}")
                await asyncio.sleep(600) # 10 minutes = 600s
                
    asyncio.create_task(ping_loop())
```

---

## ⚠️ Important: Render Free Tier 750 Hours Quota Limit

Render provides **750 free instance hours per account per month**.
- 1 month = 720 to 744 hours.
- **1 service** kept alive 24/7 uses ~730 hours. That fits **completely within** the 750 free hours!
- If you have **2 or more** services running 24/7 simultaneously, they will share the 750 hours and exhaust the quota before the month ends. If you have multiple services, only keep the primary service awake 24/7 or upgrade to a paid starter plan ($7/mo).
