# Build + commit + push. Edit $Remote before first use.
# GitHub push is HELD until you explicitly run this — never auto-pushed mid-iteration.
param(
  [string]$Message = "update",
  [string]$Remote = ""   # e.g. https://github.com/RLalithSeeker/read-to-think.git
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

Write-Host "==> Building..." -ForegroundColor Cyan
npm run build
if (-not $?) { Write-Error "Build failed — fix before pushing."; exit 1 }

if (-not (Test-Path ".git")) {
  git init
  git branch -M main
  if ($Remote) { git remote add origin $Remote }
}

git add -A
git commit -m $Message
if ($Remote -or (git remote)) { git push -u origin main }
Write-Host "==> Done." -ForegroundColor Green
