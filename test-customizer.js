const fs = require('fs');
const path = require('path');

const homepagePath = 'C:\\Users\\lenovo\\Downloads\\alamak\\Homepage Mahasiswa.html';
const homepageContent = fs.readFileSync(homepagePath, 'utf-8');

console.log('=== TEST CUSTOMIZER ENGINE ON HOMEPAGE MAHASISWA.HTML ===');
console.log(`File size: ${homepageContent.length} bytes`);

// Verify DOM selectors exist in Homepage Mahasiswa.html
const hasBody = homepageContent.includes('<body');
const hasHeaderNavbar = homepageContent.includes('header-navbar');
const hasProfileCard = homepageContent.includes('profile-with-cover');
const hasCardTitle = homepageContent.includes('card-title');
const hasUserImage = homepageContent.includes('rounded-circle img-border');

console.log('DOM Element checks:');
console.log('- body tag:', hasBody ? '✅ FOUND' : '❌ NOT FOUND');
console.log('- header-navbar:', hasHeaderNavbar ? '✅ FOUND' : '❌ NOT FOUND');
console.log('- profile-with-cover:', hasProfileCard ? '✅ FOUND' : '❌ NOT FOUND');
console.log('- card-title (Hamka Muhammad):', hasCardTitle ? '✅ FOUND' : '❌ NOT FOUND');
console.log('- profile avatar div:', hasUserImage ? '✅ FOUND' : '❌ NOT FOUND');

if (hasBody && hasHeaderNavbar && hasProfileCard && hasCardTitle && hasUserImage) {
  console.log('\n✅ ALL CUSTOMIZER SELECTORS VERIFIED SUCCESSFULLY!');
} else {
  console.error('\n❌ SOME SELECTORS MISSING!');
}
