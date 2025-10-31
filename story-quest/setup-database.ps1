# ============================================
# StoryQuest Database Setup Script (Windows)
# ============================================
# This script sets up your database in one command
# Run this in PowerShell from the storyquest directory

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║        StoryQuest Database Setup                            ║" -ForegroundColor Cyan
Write-Host "║        Setting up PostgreSQL database with Prisma           ║" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create .env.local file first." -ForegroundColor Yellow
    Write-Host "See WINDOWS_SETUP.md for instructions." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Check if DATABASE_URL is set
$envContent = Get-Content ".env.local" -Raw
if ($envContent -notmatch "DATABASE_URL=") {
    Write-Host "❌ ERROR: DATABASE_URL not found in .env.local!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please add DATABASE_URL to your .env.local file." -ForegroundColor Yellow
    Write-Host "See WINDOWS_SETUP.md for instructions." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host "✅ .env.local file found" -ForegroundColor Green
Write-Host ""

# Step 1: Run migrations
Write-Host "📦 Step 1/3: Running database migrations..." -ForegroundColor Cyan
Write-Host "(This creates all the database tables)" -ForegroundColor Gray
Write-Host ""

npx prisma migrate dev --name init

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Migration failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common fixes:" -ForegroundColor Yellow
    Write-Host "1. Check your DATABASE_URL in .env.local" -ForegroundColor Yellow
    Write-Host "2. Make sure it ends with ?sslmode=require" -ForegroundColor Yellow
    Write-Host "3. Check your internet connection" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "✅ Database tables created successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Seed database
Write-Host "📚 Step 2/3: Seeding database with story..." -ForegroundColor Cyan
Write-Host "(This loads 'Finding My Safe Place')" -ForegroundColor Gray
Write-Host ""

npx prisma db seed

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Seeding failed!" -ForegroundColor Red
    Write-Host "But your database tables are created." -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "✅ Story data loaded successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: Generate Prisma Client
Write-Host "🔧 Step 3/3: Generating Prisma Client..." -ForegroundColor Cyan
Write-Host ""

npx prisma generate

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "║        ✅ Database Setup Complete!                          ║" -ForegroundColor Green
Write-Host "║                                                              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your database is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the dev server:  npm run dev" -ForegroundColor White
Write-Host "2. Open browser:          http://localhost:3000" -ForegroundColor White
Write-Host "3. Sign up for an account" -ForegroundColor White
Write-Host "4. Add a child profile" -ForegroundColor White
Write-Host "5. Browse stories and read 'Finding My Safe Place'" -ForegroundColor White
Write-Host ""
Write-Host "Optional - View your database:" -ForegroundColor Cyan
Write-Host "  npx prisma studio" -ForegroundColor White
Write-Host ""
Write-Host "Enjoy StoryQuest! 💜" -ForegroundColor Magenta
Write-Host ""
