# Fix Client Dependencies Script
Write-Host "=== Fixing Leave Management System Client ===" -ForegroundColor Cyan

Write-Host "`n[1/6] Stopping all Node processes..." -ForegroundColor Yellow
Get-Process node,npm -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "[2/6] Killing processes on port 5000..." -ForegroundColor Yellow
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    Get-Process -Id $port5000.OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
}
Start-Sleep -Seconds 2

Write-Host "[3/6] Removing corrupted node_modules..." -ForegroundColor Yellow
Set-Location "c:\Users\Manoranjini P\Desktop\Desktop\Exp-11\client"

# Try multiple times to delete
$retries = 3
for ($i = 1; $i -le $retries; $i++) {
    if (Test-Path node_modules) {
        Write-Host "  Attempt $i of $retries..." -ForegroundColor Gray
        Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
}

# Use robocopy as fallback for stubborn files
if (Test-Path node_modules) {
    Write-Host "  Using robocopy for stubborn files..." -ForegroundColor Gray
    $emptyDir = New-Item -ItemType Directory -Path "$env:TEMP\empty_$(Get-Random)" -Force
    robocopy $emptyDir.FullName node_modules /MIR /R:0 /W:0 | Out-Null
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Remove-Item -Recurse -Force $emptyDir -ErrorAction SilentlyContinue
}

Write-Host "[4/6] Removing package-lock.json..." -ForegroundColor Yellow
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue

Write-Host "[5/6] Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>$null | Out-Null

Write-Host "[6/6] Installing fresh dependencies (this may take 5-10 minutes)..." -ForegroundColor Green
npm install

Write-Host "`n=== DONE! ===" -ForegroundColor Green
Write-Host "Now run from the root folder:" -ForegroundColor Cyan
Write-Host "  cd .." -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
