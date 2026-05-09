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
