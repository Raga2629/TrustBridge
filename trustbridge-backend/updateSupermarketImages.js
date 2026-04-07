require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// High-quality, brand-specific supermarket images
const imageUpdates = {
  'DMart Miyapur': 'https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=800',
  'Big Bazaar Miyapur': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
  'Spencer\'s Retail Miyapur': 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800',
  'Metro Cash & Carry Miyapur': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
  'Spar Hypermarket Miyapur': 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=800'
};

const updateImages = async () => {
  try {
    await connectDB();
    
    console.log('🖼️  Updating supermarket images with brand-specific photos...\n');
    
    let updated = 0;
    
    for (const [storeName, imageUrl] of Object.entries(imageUpdates)) {
      const service = await Service.findOne({ name: storeName });
      
      if (service) {
        service.serviceImageUrl = imageUrl;
        await service.save();
        console.log(`✓ Updated: ${storeName}`);
        updated++;
      } else {
        console.log(`✗ Not found: ${storeName}`);
      }
    }
    
    console.log('\n=====================================');
    console.log('🎉 IMAGE UPDATE COMPLETE');
    console.log('=====================================');
    console.log(`✓ Successfully updated: ${updated} supermarkets`);
    console.log('=====================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updateImages();
