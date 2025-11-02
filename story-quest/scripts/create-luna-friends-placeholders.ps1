# Create placeholder images for Luna Makes New Friends story

$imageDir = "public\images\stories\luna-friends"
New-Item -ItemType Directory -Force -Path $imageDir | Out-Null

$images = @(
  'luna-friends-cover.jpg',
  'scene-01-luna-nervous.jpg',
  'scene-02-asking.jpg',
  'scene-03-breathing.jpg',
  'scene-04-arrive-park.jpg',
  'scene-05-observing.jpg',
  'scene-06-wave.jpg',
  'scene-07-holly.jpg',
  'scene-08-compliment.jpg',
  'scene-09-introduction.jpg',
  'scene-10-kindness.jpg',
  'scene-11-quiet-together.jpg',
  'scene-12-patience.jpg',
  'scene-13-ready.jpg',
  'scene-14-learning.jpg',
  'scene-15-playing.jpg',
  'ending-01-sharing.jpg',
  'ending-02-confident.jpg',
  'ending-03-belonging.jpg',
  'ending-04-peaceful.jpg'
)

Write-Host "`nCreating placeholder images for Luna Makes New Friends..." -ForegroundColor Cyan
Write-Host "=========================================================`n" -ForegroundColor Cyan

foreach ($img in $images) {
  $title = $img -replace '\.jpg$','' -replace '-',' '
  $url = "https://placehold.co/1920x1080/E9D5FF/7C3AED/png?text=$([uri]::EscapeDataString($title))"
  $outFile = Join-Path $imageDir $img

  Write-Host "Downloading $img..." -ForegroundColor Yellow
  try {
    Invoke-WebRequest -Uri $url -OutFile $outFile -ErrorAction Stop
    Write-Host "  ✅ Created $img" -ForegroundColor Green
  } catch {
    Write-Host "  ❌ Failed to create $img" -ForegroundColor Red
  }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host "✅ Placeholder image creation complete!" -ForegroundColor Green
Write-Host "Created 20 images in $imageDir" -ForegroundColor Cyan
Write-Host "`nNext step: Run the seed script to add the story to database" -ForegroundColor Yellow
