// Create placeholder images for the story
const fs = require('fs');
const path = require('path');
const https = require('https');

const imageDir = path.join(__dirname, '../public/images/stories/safe-place');

// Create directory if it doesn't exist
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

const images = [
  'safe-place-cover.jpg',
  'scene-01-luna-worried.jpg',
  'scene-02a-exploring.jpg',
  'scene-02b-quiet-corner.jpg',
  'scene-03-meet-caregiver.jpg',
  'scene-04-observe-safe.jpg',
  'scene-05-special-blanket.jpg',
  'scene-06-accept-blanket.jpg',
  'scene-07-ask-question.jpg',
  'scene-08a-share-worry.jpg',
  'scene-08b-listen-story.jpg',
  'scene-09-bedtime.jpg',
  'scene-10-feel-safe.jpg',
  'scene-11-morning.jpg',
  'scene-12-trust.jpg',
  'scene-13-brave.jpg',
  'ending-01-peaceful.jpg',
  'ending-02-trusting.jpg',
  'ending-03-connected.jpg',
  'ending-04-brave.jpg',
];

// Use placeholder images from a service
const placeholderBaseUrl = 'https://placehold.co/1920x1080/E9D5FF/7C3AED/png?text=';

let downloaded = 0;

images.forEach((imageName, index) => {
  const sceneTitle = imageName
    .replace('.jpg', '')
    .replace(/-/g, ' ')
    .replace(/scene \d+[ab]?/, 'Scene')
    .replace(/ending \d+/, 'Ending');

  const url = placeholderBaseUrl + encodeURIComponent(sceneTitle);
  const filePath = path.join(imageDir, imageName);

  https.get(url, (response) => {
    const fileStream = fs.createWriteStream(filePath);
    response.pipe(fileStream);

    fileStream.on('finish', () => {
      fileStream.close();
      downloaded++;
      console.log(`✅ Created placeholder: ${imageName} (${downloaded}/${images.length})`);

      if (downloaded === images.length) {
        console.log('\n🎉 All placeholder images created!');
        console.log('\nNext steps:');
        console.log('1. Generate real AI images using IMAGE_GENERATION_PROMPTS.md');
        console.log('2. Replace placeholders in public/images/stories/safe-place/');
        console.log('3. Run: npx tsx prisma/update-story-with-images.ts');
      }
    });
  }).on('error', (err) => {
    console.error(`❌ Error downloading ${imageName}:`, err.message);
  });
});

console.log(`\n📦 Creating ${images.length} placeholder images...`);
