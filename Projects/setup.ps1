# IPD8 Frontend Setup Script for Windows PowerShell

Write-Host "🚀 IPD8 Frontend Setup" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✓ npm $npmVersion detected" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray

# Install dependencies
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create .env.local if it doesn't exist
if (-not (Test-Path ".env.local")) {
    Write-Host ""
    Write-Host "Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item ".env.local.example" ".env.local"
    Write-Host "✓ .env.local created. Please update with your configuration" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✓ .env.local already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update .env.local with your configuration" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Available commands:" -ForegroundColor Yellow
Write-Host "  npm run dev      - Start development server" -ForegroundColor White
Write-Host "  npm run build    - Build for production" -ForegroundColor White
Write-Host "  npm start        - Start production server" -ForegroundColor White
Write-Host "  npm run lint     - Run ESLint" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  README.md        - Project overview" -ForegroundColor White
Write-Host "  INSTALLATION.md  - Detailed setup guide" -ForegroundColor White
Write-Host "  PROJECT_STATUS.md - Current status & roadmap" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding! 💻" -ForegroundColor Cyan
