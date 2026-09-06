<#
.SYNOPSIS
    Render Backend Keep-Alive Query Delivery (PowerShell)
    Sends an automated HTTP query every 10 minutes to prevent Render free tier spin-down.

.EXAMPLE
    .\scripts\keep_alive.ps1
    .\scripts\keep_alive.ps1 -TargetUrl "https://your-backend.onrender.com"
    .\scripts\keep_alive.ps1 -TargetUrl "https://app1.onrender.com,https://app2.onrender.com" -IntervalMinutes 10
#>

param (
    [string]$TargetUrl = $env:RENDER_BACKEND_URL,
    [int]$IntervalMinutes = 10
)

$DefaultUrls = @(
    "https://pet-web-pocz.onrender.com",
    "https://food-website-lozv.onrender.com",
    "https://humlya-salt-product-web.onrender.com"
)

if (-not [string]::IsNullOrWhiteSpace($TargetUrl)) {
    $Urls = $TargetUrl -split ',' | ForEach-Object { $_.Trim() }
} else {
    $Urls = $DefaultUrls
}

$IntervalSeconds = $IntervalMinutes * 60

Write-Host ("=" * 65) -ForegroundColor Cyan
Write-Host "🚀 Render Backend Keep-Alive Daemon (PowerShell)" -ForegroundColor Cyan
Write-Host "🎯 Configured Targets ($($Urls.Count)):" -ForegroundColor White
for ($i = 0; $i -lt $Urls.Count; $i++) {
    Write-Host "   $($i + 1). $($Urls[$i])" -ForegroundColor White
}
Write-Host "⏱️  Frequency: Every $IntervalMinutes minutes ($IntervalSeconds seconds)" -ForegroundColor Yellow
Write-Host ("=" * 65) -ForegroundColor Cyan

while ($true) {
    $timeStr = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    Write-Host "`n--- Ping Delivery Run at $timeStr ---" -ForegroundColor Green

    foreach ($url in $Urls) {
        $timestamp = (Get-Date).ToString("HH:mm:ss")
        Write-Host "[$timestamp] Pinging $url ... " -NoNewline -ForegroundColor White
        
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        try {
            $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 25 -UseBasicParsing -UserAgent "RenderKeepAlivePS/1.0"
            $sw.Stop()
            Write-Host "✅ HTTP $($response.StatusCode) ($($sw.ElapsedMilliseconds)ms)" -ForegroundColor Green
        } catch {
            $sw.Stop()
            if ($_.Exception.Response) {
                $status = [int]$_.Exception.Response.StatusCode
                Write-Host "⚠️ HTTP $status in $($sw.ElapsedMilliseconds)ms (Backend is awake and responded)" -ForegroundColor Yellow
            } else {
                Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }

    Write-Host "Next ping delivery in $IntervalMinutes minutes..." -ForegroundColor DarkGray
    Start-Sleep -Seconds $IntervalSeconds
}
