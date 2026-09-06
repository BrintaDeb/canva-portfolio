"""
Render Backend Keep-Alive Service (Python)
Automatically sends an HTTP GET query to Render backend service(s) every 10 minutes
to prevent the free instance 15-minute idle spin-down.

Usage:
    python scripts/keep_alive.py
    python scripts/keep_alive.py https://your-backend.onrender.com
    python scripts/keep_alive.py https://app1.onrender.com https://app2.onrender.com
"""

import os
import sys
import time
from datetime import datetime
import urllib.request
import urllib.error

DEFAULT_URLS = [
    "https://pet-web-pocz.onrender.com",
    "https://food-website-lozv.onrender.com",
    "https://humlya-salt-product-web.onrender.com",
]

INTERVAL_MINUTES = int(os.getenv("PING_INTERVAL_MINUTES", "10"))
INTERVAL_SECONDS = INTERVAL_MINUTES * 60


def get_target_urls():
    cli_args = [arg for arg in sys.argv[1:] if arg.startswith("http")]
    if cli_args:
        return cli_args

    env_urls = os.getenv("RENDER_BACKEND_URL") or os.getenv("RENDER_BACKEND_URLS")
    if env_urls:
        return [u.strip() for u in env_urls.split(",") if u.strip()]

    return DEFAULT_URLS


def ping_url(url: str):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] Pinging {url} ... ", end="", flush=True)

    req = urllib.request.Request(
        url,
        headers={"User-Agent": "RenderKeepAlivePythonBot/1.0"}
    )

    start_time = time.time()
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            duration_ms = round((time.time() - start_time) * 1000, 1)
            print(f"✅ Success (HTTP {response.status}) in {duration_ms}ms")
    except urllib.error.HTTPError as e:
        duration_ms = round((time.time() - start_time) * 1000, 1)
        print(f"⚠️ HTTP {e.code} {e.reason} in {duration_ms}ms (Backend is awake and responding)")
    except urllib.error.URLError as e:
        print(f"❌ Connection error: {e.reason}")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")


def main():
    targets = get_target_urls()

    print("=" * 65)
    print("🚀 Render Backend Keep-Alive Daemon (Python)")
    print(f"🎯 Configured Targets ({len(targets)}):")
    for i, t in enumerate(targets, 1):
        print(f"   {i}. {t}")
    print(f"⏱️  Frequency: Every {INTERVAL_MINUTES} minutes ({INTERVAL_SECONDS}s)")
    print("=" * 65)

    while True:
        print(f"\n--- Keep-Alive Query Run ({datetime.now().strftime('%H:%M:%S')}) ---")
        for target in targets:
            ping_url(target)

        print(f"Waiting {INTERVAL_MINUTES} minutes for next cycle...")
        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
