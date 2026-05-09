$ErrorActionPreference = 'Stop'
Set-Location "C:\Users\scott\Code\cmc"

Write-Host "[cmc-build] Building Astro site..."
npm run build

Write-Host "[cmc-build] Staging changes..."
git add -A

$status = git status --porcelain
if ($status) {
  Write-Host "[cmc-build] Committing..."
  git commit -m "chore: build site"
} else {
  Write-Host "[cmc-build] Nothing new to commit."
}

Write-Host "[cmc-build] Pushing to GitHub — triggers FTP deploy to dev.cmcenters.org..."
git push

Write-Host "[cmc-build] Done. GitHub Actions is deploying now."

$head = git rev-parse HEAD
$builtAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
$stateDir = "$env:APPDATA\.claude\polaris\last-build-heads"
if (-not (Test-Path $stateDir)) { New-Item -ItemType Directory -Path $stateDir -Force | Out-Null }
@{ head = $head; builtAt = $builtAt } | ConvertTo-Json -Compress | Set-Content -Encoding utf8 "$stateDir\cmc.json"
Write-Host "[cmc-build] Notified Polaris: HEAD $($head.Substring(0,7)) marked as built."
