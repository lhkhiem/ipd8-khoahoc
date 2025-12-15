# IPD8 Production Build Script for Deployment
# This script builds the production version and prepares files for VPS deployment
# Run from project root: npm run build:deploy

Write-Host "Building Production for Deployment" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Get script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Change to project root
Set-Location $ProjectRoot

# Check if we're in the project root
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Could not find package.json. Please check the script path." -ForegroundColor Red
    exit 1
}

Write-Host "Project root: $ProjectRoot" -ForegroundColor Gray
Write-Host ""

# Clean deploy directory (except script files)
Write-Host "Cleaning deploy directory..." -ForegroundColor Yellow
$DeployDir = Join-Path $ProjectRoot "deploy"
if (Test-Path $DeployDir) {
    Get-ChildItem -Path $DeployDir -Exclude "build-deploy.ps1","README.md",".gitignore","env.example" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Deploy directory cleaned (preserved script files)" -ForegroundColor Green
} else {
    New-Item -ItemType Directory -Path $DeployDir -Force | Out-Null
    Write-Host "Deploy directory created" -ForegroundColor Green
}

# Build Next.js production
Write-Host ""
Write-Host "Building Next.js production..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "Build successful" -ForegroundColor Green

# Copy essential files
Write-Host ""
Write-Host "Copying files to deploy directory..." -ForegroundColor Yellow

# Copy .next build output
if (Test-Path ".next") {
    Write-Host "  Copying .next/..." -ForegroundColor Gray
    Copy-Item -Path ".next" -Destination "$DeployDir\.next" -Recurse -Force
    Write-Host "  .next/ copied" -ForegroundColor Green
} else {
    Write-Host "  Warning: .next directory not found. Run 'npm run build' first!" -ForegroundColor Yellow
}

# Copy public directory
if (Test-Path "public") {
    Write-Host "  Copying public/..." -ForegroundColor Gray
    Copy-Item -Path "public" -Destination "$DeployDir\public" -Recurse -Force
    Write-Host "  public/ copied" -ForegroundColor Green
}

# Copy package.json
Write-Host "  Copying package.json..." -ForegroundColor Gray
Copy-Item -Path "package.json" -Destination "$DeployDir\package.json" -Force
Write-Host "  package.json copied" -ForegroundColor Green

# Copy package-lock.json if exists
if (Test-Path "package-lock.json") {
    Write-Host "  Copying package-lock.json..." -ForegroundColor Gray
    Copy-Item -Path "package-lock.json" -Destination "$DeployDir\package-lock.json" -Force
    Write-Host "  package-lock.json copied" -ForegroundColor Green
}

# Copy next.config.js
if (Test-Path "next.config.js") {
    Write-Host "  Copying next.config.js..." -ForegroundColor Gray
    Copy-Item -Path "next.config.js" -Destination "$DeployDir\next.config.js" -Force
    Write-Host "  next.config.js copied" -ForegroundColor Green
}

# Copy next-env.d.ts if exists
if (Test-Path "next-env.d.ts") {
    Write-Host "  Copying next-env.d.ts..." -ForegroundColor Gray
    Copy-Item -Path "next-env.d.ts" -Destination "$DeployDir\next-env.d.ts" -Force
    Write-Host "  next-env.d.ts copied" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps for VPS deployment:" -ForegroundColor Yellow
Write-Host "1. Upload the 'deploy' folder to your VPS" -ForegroundColor White
Write-Host "2. On VPS, run: cd deploy; npm install --production" -ForegroundColor White
Write-Host "3. Create .env.production file with your environment variables" -ForegroundColor White
Write-Host "4. Run: npm start" -ForegroundColor White
Write-Host ""
Write-Host "Security note: .env files are NOT included in deployment" -ForegroundColor Cyan
Write-Host "Make sure to create .env.production on your VPS" -ForegroundColor Cyan
