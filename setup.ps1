# Forum Platform — Local Setup Script (Windows, no Docker)
# Run from the C:\Dev\Forum directory: .\setup.ps1

Write-Host "`n=== Forum Platform Setup ===" -ForegroundColor Cyan

# 1. Check Node.js
try {
    $nodeVer = node --version
    Write-Host "✓ Node.js $nodeVer" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Install from https://nodejs.org (v18+)" -ForegroundColor Red
    exit 1
}

# 2. Check PostgreSQL
$pgFound = $false
try {
    $pgVer = psql --version 2>&1
    Write-Host "✓ PostgreSQL found: $pgVer" -ForegroundColor Green
    $pgFound = $true
} catch {
    Write-Host "⚠ psql not found in PATH." -ForegroundColor Yellow
    Write-Host "  Install PostgreSQL from https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    Write-Host "  Then re-run this script." -ForegroundColor Yellow
}

# 3. Install npm dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "npm install failed" -ForegroundColor Red; exit 1 }

# 4. Create the forum database if psql is available
if ($pgFound) {
    Write-Host "`nCreating database 'forum'..." -ForegroundColor Cyan
    $env:PGPASSWORD = "postgres"
    psql -U postgres -c "CREATE DATABASE forum;" 2>&1 | Out-Null
    Write-Host "✓ Database ready (may already exist — that's fine)" -ForegroundColor Green
}

# 5. Generate Prisma client
Write-Host "`nGenerating Prisma client..." -ForegroundColor Cyan
npm run db:generate
if ($LASTEXITCODE -ne 0) { Write-Host "Prisma generate failed" -ForegroundColor Red; exit 1 }

# 6. Run migrations
Write-Host "`nRunning database migrations..." -ForegroundColor Cyan
Set-Location packages\database
npx prisma migrate dev --name init 2>&1
Set-Location ..\..

# 7. Seed
Write-Host "`nSeeding database..." -ForegroundColor Cyan
npm run db:seed

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Default accounts:" -ForegroundColor Cyan
Write-Host "  Admin:     admin@forum.local    / Admin@12345"
Write-Host "  Moderator: moderator@forum.local / Mod@12345"
Write-Host "  Member:    member@forum.local    / Member@12345"
Write-Host ""
Write-Host "Start the app with:  npm run dev" -ForegroundColor Yellow
Write-Host "  API → http://localhost:4000"
Write-Host "  Web → http://localhost:3000"
Write-Host "  API docs → http://localhost:4000/api/docs"
Write-Host ""
Write-Host "Email: In dev mode, emails are printed to the API console." -ForegroundColor DarkGray
