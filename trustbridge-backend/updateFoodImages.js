require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for updating food images...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Restaurant-specific images
const restaurantImages = {
  'Taqila - The Club & Lounge': 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80', // Elegant restaurant interior
  'The Golden Barrel Bar N Pub': 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800&q=80', // Bar with drinks
  'Peg Bro Lounge Bar and Kitchen': 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&q=80', // Modern lounge
  'BIGGUYS Wings and Burgers': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80', // Burger close-up
  'One Stop Cafe': 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80', // Cozy cafe
  'Spice Junction Restaurant': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80', // Indian thali
  'Bachupally Biryani House': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80', // Biryani dish
  'The Breakfast Club': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80', // Breakfast spread
  'Tandoor Nights': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80', // Tandoori chicken
  'Dosa Plaza': 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800&q=80', // Dosa
  'Chinese Wok': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80', // Chinese noodles
  'Pizza Hut Bachupally': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80', // Pizza
  'Subway Bachupally': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80', // Sandwich
  'Barbeque Nation': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80', // BBQ grill
  'Starbucks Coffee': 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80', // Coffee shop
  'KFC Bachupally': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80', // Fried chicken
  'The Dessert House': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80', // Desserts
  'Bachupally Food Court': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80' // Food court
};

// Update function
const updateFoodImages = async () => {
  try {
    await connectDB();

    console.log('🖼️  Starting to update food restaurant images...');
    console.log('=====================================\n');

    let updated = 0;
    let notFound = 0;
    let errors = [];

    for (const [restaurantName, imageUrl] of Object.entries(restaurantImages)) {
      try {
        const result = await Service.updateOne(
          { name: restaurantName, category: 'Food' },
          { $set: { serviceImageUrl: imageUrl } }
        );

        if (result.matchedCount > 0) {
          updated++;
          console.log(`✓ Updated: ${restaurantName}`);
        } else {
          notFound++;
          console.log(`⊘ Not found: ${restaurantName}`);
        }
      } catch (error) {
        errors.push({
          name: restaurantName,
          error: error.message
        });
        console.log(`✗ Error: ${restaurantName} - ${error.message}`);
      }
    }

    console.log('\n=====================================');
    console.log('🎉 UPDATE SUMMARY');
    console.log('=====================================');
    console.log(`Total restaurants: ${Object.keys(restaurantImages).length}`);
    console.log(`✓ Successfully updated: ${updated}`);
    console.log(`⊘ Not found: ${notFound}`);
    console.log(`✗ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Error details:');
      errors.forEach(err => {
        console.log(`  - ${err.name}: ${err.error}`);
      });
    }

    console.log('=====================================\n');
    console.log('✅ Food restaurant images updated!');
    console.log('🔄 Refresh your browser to see the new images');
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Update failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run update function
updateFoodImages();
