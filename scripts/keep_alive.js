/**
 * Render Backend Keep-Alive Service (Node.js)
 * Automatically queries Render backend services every 10 minutes
 * to keep free instances awake and avoid the 15-minute cold start timeout.
 *
 * Usage:
 *   node scripts/keep_alive.js
 *   node scripts/keep_alive.js https://your-backend.onrender.com
 *   node scripts/keep_alive.js https://app1.onrender.com https://app2.onrender.com
 *
 * Environment variables:
 *   RENDER_BACKEND_URL: Single URL or comma-separated list of URLs
 *   PING_INTERVAL_MINUTES: Defaults to 10
 */

import http from 'node:http';
import https from 'node:https';

const defaultUrls = [
  'https://pet-web-pocz.onrender.com',
  'https://food-website-lozv.onrender.com',
  'https://humlya-salt-product-web.onrender.com',
];

// Read targets from CLI args, env var, or defaults
function getTargetUrls() {
  const cliArgs = process.argv.slice(2).filter((arg) => arg.startsWith('http'));
  if (cliArgs.length > 0) return cliArgs;

  if (process.env.RENDER_BACKEND_URL) {
    return process.env.RENDER_BACKEND_URL.split(',').map((u) => u.trim());
  }

  return defaultUrls;
}

const targetUrls = getTargetUrls();
const intervalMinutes = parseInt(process.env.PING_INTERVAL_MINUTES || '10', 10);
const intervalMs = intervalMinutes * 60 * 1000;

function pingUrl(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    process.stdout.write(`[${timestamp}] Pinging ${url} ... `);

    try {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const req = client.get(
        url,
        {
          headers: { 'User-Agent': 'RenderKeepAliveNodeBot/1.0' },
          timeout: 25000,
        },
        (res) => {
          const duration = Date.now() - startTime;
          console.log(`✅ HTTP ${res.statusCode} (${duration}ms)`);
          res.resume(); // Consume stream to free socket
          resolve({ url, status: res.statusCode, duration, ok: true });
        }
      );

      req.on('timeout', () => {
        req.destroy();
        console.log(`⚠️ Timed out after 25s (server may be spinning up)`);
        resolve({ url, status: 'TIMEOUT', duration: 25000, ok: false });
      });

      req.on('error', (err) => {
        console.log(`❌ Error: ${err.message}`);
        resolve({ url, status: 'ERROR', error: err.message, ok: false });
      });
    } catch (e) {
      console.log(`❌ Invalid URL format: ${url}`);
      resolve({ url, status: 'INVALID', error: e.message, ok: false });
    }
  });
}

async function runPingCycle() {
  console.log(`\n--- Ping Delivery Run (${new Date().toLocaleTimeString()}) ---`);
  for (const url of targetUrls) {
    await pingUrl(url);
  }
  console.log(`Next automatic query in ${intervalMinutes} minutes.`);
}

console.log('='.repeat(65));
console.log('🚀 Render Backend Keep-Alive Daemon (Node.js)');
console.log(`🎯 Configured Targets (${targetUrls.length}):`);
targetUrls.forEach((url, i) => console.log(`   ${i + 1}. ${url}`));
console.log(`⏱️  Frequency: Every ${intervalMinutes} minutes (${intervalMs / 1000}s)`);
console.log('='.repeat(65));

// Run immediately on launch
runPingCycle();

// Schedule recurring execution every 10 minutes
setInterval(runPingCycle, intervalMs);
