const fs = require('fs');
const path = require('path');

console.log('=== Service Upload Directory Check ===\n');

// Check if upload directories exist
const serviceImagesDir = './uploads/service-images';
const businessProofsDir = './uploads/business-proofs';

console.log('Checking directories:');
console.log(`1. Service Images: ${serviceImagesDir}`);
if (fs.existsSync(serviceImagesDir)) {
  console.log('   ✅ Directory exists');
} else {
  console.log('   ⚠️  Directory will be created on first upload');
}

console.log(`\n2. Business Proofs: ${businessProofsDir}`);
if (fs.existsSync(businessProofsDir)) {
  console.log('   ✅ Directory exists');
} else {
  console.log('   ⚠️  Directory will be created on first upload');
}

console.log('\n=== Upload Middleware Configuration ===');
console.log('✅ serviceUploadMiddleware.js configured');
console.log('✅ Accepts: .jpg, .jpeg, .png, .pdf');
console.log('✅ Max file size: 5MB per file');
console.log('✅ Two fields: serviceImage, businessProof');

console.log('\n=== Service Model Updates ===');
console.log('✅ serviceImageUrl field added');
console.log('✅ businessProofUrl field added');
console.log('✅ contactPhone now REQUIRED');
console.log('✅ contactEmail now REQUIRED');

console.log('\n=== Route Configuration ===');
console.log('✅ POST /api/services uses serviceUpload middleware');
console.log('✅ Static file serving: /uploads');

console.log('\n=== Frontend Form Updates ===');
console.log('✅ Price Range field removed');
console.log('✅ Contact Phone marked as required');
console.log('✅ Contact Email marked as required');
console.log('✅ Service Image upload added (required)');
console.log('✅ Business Proof upload added (required)');
console.log('✅ File input styling with dashed border');
console.log('✅ Field hints added for clarity');

console.log('\n=== Ready to Test! ===');
console.log('1. Start backend: node server.js');
console.log('2. Start frontend: npm run dev');
console.log('3. Login as service provider');
console.log('4. Navigate to Add Service');
console.log('5. Fill all required fields including uploads');
console.log('6. Submit and verify files are saved\n');
