require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding food restaurants...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Bachupally Food Restaurants
const bachupallyFoodRestaurants = [
  {
    name: 'Taqila - The Club & Lounge',
    category: 'Food',
    subcategory: 'Restaurant & Bar',
    description: 'Multicuisine restaurant and lounge with free reservation. 40% Off On Food & Soft Bev. To Claim: Book and Pay on the App + 25% off',
    address: 'Bachupally, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7850 1256',
    contactEmail: 'taqila@bachupally.com',
    priceRange: '₹1600 for two (approx)',
    workingHours: '12:00 PM - 11:00 PM',
    rating: 4.3,
    verified: true,
    location: { type: 'Point', coordinates: [78.3931, 17.5449] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'
  },
  {
    name: 'The Golden Barrel Bar N Pub',
    category: 'Food',
    subcategory: 'Bar & Pub',
    description: 'Multicuisine bar and pub with free reservation. 30% Off On Entire Bill. To Claim: Book and Pay on the App + 25% off',
    address: 'Bachupally, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7850 2345',
    contactEmail: 'goldenbarrel@bachupally.com',
    priceRange: '₹1000 for two (approx)',
    workingHours: '12:00 PM - 11:30 PM',
    rating: 3.2,
    verified: true,
    location: { type: 'Point', coordinates: [78.3925, 17.5452] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800'
  },
  {
    name: 'Peg Bro Lounge Bar and Kitchen',
    category: 'Food',
    subcategory: 'Lounge & Bar',
    description: 'Multicuisine lounge bar and kitchen with free reservation. 20% Off On Entire Bill. To Claim: Book and Pay on the App',
    address: 'Bachupally, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7850 3456',
    contactEmail: 'pegbro@bachupally.com',
    priceRange: '₹1500 for two (approx)',
    workingHours: '12:00 PM - 11:00 PM',
    rating: 4.4,
    verified: true,
    location: { type: 'Point', coordinates: [78.3938, 17.5446] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
  },
  {
    name: 'BIGGUYS Wings and Burgers',
    category: 'Food',
    subcategory: 'Fast Food',
    description: 'Multicuisine fast food restaurant specializing in wings and burgers. Free Drink Per Person. To Claim: Book on the app',
    address: 'Bachupally, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7850 4567',
    contactEmail: 'bigguys@bachupally.com',
    priceRange: '₹600 for two (approx)',
    workingHours: '11:00 AM - 11:00 PM',
    rating: 4.0,
    verified: true,
    location: { type: 'Point', coordinates: [78.3920, 17.5454] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800'
  },
  {
    name: 'One Stop Cafe',
    category: 'Food',
    subcategory: 'Cafe',
    description: 'Beverages and fast food cafe with comfortable seating and quick service',
    address: 'Bachupally, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7850 5678',
    contactEmail: 'onestopcafe@bachupally.com',
    priceRange: '₹350 for two (approx)',
    workingHours: '8:00 AM - 10:00 PM',
    rating: 4.0,
    verified: true,
    location: { type: 'Point', coordinates: [78.3933, 17.5458] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800'
  },
  {
    name: 'Spice Junction Restaurant',
    category: 'Food',
    subcategory: 'Indian Restaurant',
    description: 'Authentic Indian cuisine with North and South Indian specialties',
    address: 'Bachupally Main Road, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7850 6789',
    contactEmail: 'spicejunction@bachupally.com',
    priceRange: '₹800 for two (approx)',
    workingHours: '11:00 AM - 11:00 PM',
    rating: 4.1,
    verified: true,
    location: { type: 'Point', coordinates: [78.3927, 17.5450] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800'
  },
  {
    name: 'Bachupally Biryani House',
    category: 'Food',
    subcategory: 'Biryani Restaurant',
    description: 'Famous for authentic Hyderabadi biryani and traditional Mughlai dishes',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7850 7890',
    contactEmail: 'biryanihouse@bachupally.com',
    priceRange: '₹500 for two (approx)',
    workingHours: '11:00 AM - 11:00 PM',
    rating: 4.2,
    verified: true,
    location: { type: 'Point', coordinates: [78.3942, 17.5445] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800'
  },
  {
    name: 'The Breakfast Club',
    category: 'Food',
    subcategory: 'Breakfast Restaurant',
    description: 'All-day breakfast menu with continental and Indian breakfast options',
    address: 'Bachupally Village, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7850 8901',
    contactEmail: 'breakfastclub@bachupally.com',
    priceRange: '₹400 for two (approx)',
    workingHours: '7:00 AM - 4:00 PM',
    rating: 4.3,
    verified: true,
    location: { type: 'Point', coordinates: [78.3916, 17.5447] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800'
  },
  {
    name: 'Tandoor Nights',
    category: 'Food',
    subcategory: 'North Indian Restaurant',
    description: 'Tandoori specialties and North Indian cuisine with live grill counter',
    address: 'Miyapur Road, Bachupally, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7850 9012',
    contactEmail: 'tandoornights@bachupally.com',
    priceRange: '₹900 for two (approx)',
    workingHours: '12:00 PM - 11:00 PM',
    rating: 4.2,
    verified: true,
    location: { type: 'Point', coordinates: [78.3935, 17.5456] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800'
  },
  {
    name: 'Dosa Plaza',
    category: 'Food',
    subcategory: 'South Indian Restaurant',
    description: 'Wide variety of dosas, idlis, and South Indian delicacies',
    address: 'Bachupally Main Road, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7850 0123',
    contactEmail: 'dosaplaza@bachupally.com',
    priceRange: '₹300 for two (approx)',
    workingHours: '7:00 AM - 10:00 PM',
    rating: 4.0,
    verified: true,
    location: { type: 'Point', coordinates: [78.3922, 17.5443] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800'
  },
  {
    name: 'Chinese Wok',
    category: 'Food',
    subcategory: 'Chinese Restaurant',
    description: 'Authentic Chinese and Indo-Chinese cuisine with quick service',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7851 1234',
    contactEmail: 'chinesewok@bachupally.com',
    priceRange: '₹600 for two (approx)',
    workingHours: '11:30 AM - 11:00 PM',
    rating: 3.9,
    verified: true,
    location: { type: 'Point', coordinates: [78.3928, 17.5448] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800'
  },
  {
    name: 'Pizza Hut Bachupally',
    category: 'Food',
    subcategory: 'Pizza Restaurant',
    description: 'International pizza chain with variety of pizzas, pasta, and sides',
    address: 'Bachupally Village, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7851 2345',
    contactEmail: 'pizzahut@bachupally.com',
    priceRange: '₹700 for two (approx)',
    workingHours: '11:00 AM - 11:00 PM',
    rating: 4.1,
    verified: true,
    location: { type: 'Point', coordinates: [78.3941, 17.5455] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800'
  },
  {
    name: 'Subway Bachupally',
    category: 'Food',
    subcategory: 'Sandwich Shop',
    description: 'Fresh sandwiches, salads, and wraps made to order',
    address: 'Miyapur Cross Road, Bachupally, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7851 3456',
    contactEmail: 'subway@bachupally.com',
    priceRange: '₹400 for two (approx)',
    workingHours: '9:00 AM - 10:00 PM',
    rating: 4.0,
    verified: true,
    location: { type: 'Point', coordinates: [78.3918, 17.5450] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
  },
  {
    name: 'Barbeque Nation',
    category: 'Food',
    subcategory: 'Buffet Restaurant',
    description: 'Live grill buffet with unlimited starters and main course',
    address: 'Bachupally Main Road, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7851 4567',
    contactEmail: 'barbeque@bachupally.com',
    priceRange: '₹1400 for two (approx)',
    workingHours: '12:00 PM - 3:30 PM, 6:30 PM - 11:00 PM',
    rating: 4.3,
    verified: true,
    location: { type: 'Point', coordinates: [78.3940, 17.5451] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800'
  },
  {
    name: 'Starbucks Coffee',
    category: 'Food',
    subcategory: 'Coffee Shop',
    description: 'Premium coffee chain with specialty beverages and snacks',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7851 5678',
    contactEmail: 'starbucks@bachupally.com',
    priceRange: '₹500 for two (approx)',
    workingHours: '8:00 AM - 11:00 PM',
    rating: 4.4,
    verified: true,
    location: { type: 'Point', coordinates: [78.3925, 17.5453] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800'
  },
  {
    name: 'KFC Bachupally',
    category: 'Food',
    subcategory: 'Fast Food',
    description: 'Fried chicken, burgers, and sides from the famous international chain',
    address: 'Bachupally Village, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7851 6789',
    contactEmail: 'kfc@bachupally.com',
    priceRange: '₹600 for two (approx)',
    workingHours: '11:00 AM - 11:00 PM',
    rating: 4.0,
    verified: true,
    location: { type: 'Point', coordinates: [78.3938, 17.5446] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800'
  },
  {
    name: 'The Dessert House',
    category: 'Food',
    subcategory: 'Dessert Shop',
    description: 'Wide variety of desserts, ice creams, and sweet treats',
    address: 'Miyapur Road, Bachupally, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7851 7890',
    contactEmail: 'desserts@bachupally.com',
    priceRange: '₹300 for two (approx)',
    workingHours: '11:00 AM - 11:00 PM',
    rating: 4.2,
    verified: true,
    location: { type: 'Point', coordinates: [78.3920, 17.5454] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800'
  },
  {
    name: 'Bachupally Food Court',
    category: 'Food',
    subcategory: 'Food Court',
    description: 'Multiple food stalls offering variety of cuisines under one roof',
    address: 'Bachupally Main Road, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 7851 8901',
    contactEmail: 'foodcourt@bachupally.com',
    priceRange: '₹400 for two (approx)',
    workingHours: '10:00 AM - 10:00 PM',
    rating: 3.8,
    verified: true,
    location: { type: 'Point', coordinates: [78.3933, 17.5458] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
  }
];

// Seed function
const seedFoodRestaurants = async () => {
  try {
    await connectDB();

    console.log('🍽️  Starting to seed Bachupally Food Restaurants...');
    console.log(`Total restaurants to insert: ${bachupallyFoodRestaurants.length}`);
    console.log('=====================================\n');

    let inserted = 0;
    let duplicates = 0;
    let errors = [];

    for (let i = 0; i < bachupallyFoodRestaurants.length; i++) {
      try {
        await Service.create(bachupallyFoodRestaurants[i]);
        inserted++;
        console.log(`✓ ${inserted}. ${bachupallyFoodRestaurants[i].name} - ${bachupallyFoodRestaurants[i].subcategory}`);
      } catch (error) {
        if (error.code === 11000) {
          duplicates++;
          console.log(`⊘ Duplicate: ${bachupallyFoodRestaurants[i].name}`);
        } else {
          errors.push({
            name: bachupallyFoodRestaurants[i].name,
            error: error.message
          });
          console.log(`✗ Error: ${bachupallyFoodRestaurants[i].name} - ${error.message}`);
        }
      }
    }

    console.log('\n=====================================');
    console.log('🎉 SEED SUMMARY');
    console.log('=====================================');
    console.log(`Total restaurants: ${bachupallyFoodRestaurants.length}`);
    console.log(`✓ Successfully inserted: ${inserted}`);
    console.log(`⊘ Duplicates skipped: ${duplicates}`);
    console.log(`✗ Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Error details:');
      errors.forEach(err => {
        console.log(`  - ${err.name}: ${err.error}`);
      });
    }

    console.log('=====================================\n');
    console.log('✅ Food restaurants seeding completed!');
    console.log('🔍 You can now search for these restaurants in Bachupally area');
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run seed function
seedFoodRestaurants();
