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

// 5 shopping malls/supermarkets near Bachupally
const supermarkets = [
  {
    name: 'Ratnadeep Supermarket Bachupally',
    category: 'Shopping',
    subcategory: 'Supermarket',
    description: 'Popular supermarket chain offering fresh groceries, vegetables, household items, and daily essentials at competitive prices',
    address: 'Bachupally Main Road, Near Metro Station, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 2345 6789',
    contactEmail: 'ratnadeep@bachupally.com',
    priceRange: '₹500 for groceries (approx)',
    workingHours: '7:00 AM - 10:00 PM',
    rating: 4.3,
    verified: true,
    location: { type: 'Point', coordinates: [78.3931, 17.4975] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800'
  },
  {
    name: 'More Supermarket Bachupally',
    category: 'Shopping',
    subcategory: 'Hypermarket',
    description: 'Large hypermarket with wide range of groceries, fresh produce, electronics, and household products',
    address: 'Bachupally X Roads, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 2345 1234',
    contactEmail: 'more@bachupally.com',
    priceRange: '₹600 for shopping (approx)',
    workingHours: '8:00 AM - 10:00 PM',
    rating: 4.2,
    verified: true,
    location: { type: 'Point', coordinates: [78.3941, 17.4980] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800'
  },
  {
    name: 'DMart Bachupally',
    category: 'Shopping',
    subcategory: 'Supermarket',
    description: 'Popular discount supermarket chain with groceries, apparel, home essentials, and electronics at best prices',
    address: 'Bachupally Circle, Near JNTU, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 2345 9876',
    contactEmail: 'dmart@bachupally.com',
    priceRange: '₹550 for groceries (approx)',
    workingHours: '8:00 AM - 10:00 PM',
    rating: 4.4,
    verified: true,
    location: { type: 'Point', coordinates: [78.3951, 17.4985] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=800'
  },
  {
    name: 'Reliance Fresh Bachupally',
    category: 'Shopping',
    subcategory: 'Supermarket',
    description: 'Modern supermarket offering fresh vegetables, fruits, groceries, dairy products, and bakery items',
    address: 'Bachupally Phase 2, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 2345 5555',
    contactEmail: 'reliance@bachupally.com',
    priceRange: '₹450 for groceries (approx)',
    workingHours: '7:00 AM - 11:00 PM',
    rating: 4.1,
    verified: true,
    location: { type: 'Point', coordinates: [78.3961, 17.4990] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800'
  },
  {
    name: 'Big Bazaar Bachupally',
    category: 'Shopping',
    subcategory: 'Hypermarket',
    description: 'Large hypermarket with fashion, groceries, home furnishing, electronics, and general merchandise',
    address: 'Bachupally Shopping Complex, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 2345 7777',
    contactEmail: 'bigbazaar@bachupally.com',
    priceRange: '₹700 for shopping (approx)',
    workingHours: '9:00 AM - 10:00 PM',
    rating: 4.3,
    verified: true,
    location: { type: 'Point', coordinates: [78.3971, 17.4995] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=800'
  }
];

const addSupermarkets = async () => {
  try {
    await connectDB();
    
    console.log('🛒 Adding 5 supermarkets to Bachupally...\n');
    
    let added = 0;
    let duplicates = 0;
    
    for (const store of supermarkets) {
      try {
        await Service.create(store);
        console.log(`✓ Added: ${store.name}`);
        added++;
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⊘ Duplicate: ${store.name}`);
          duplicates++;
        } else {
          console.log(`✗ Error adding ${store.name}:`, error.message);
        }
      }
    }
    
    console.log('\n=====================================');
    console.log('🎉 BACHUPALLY SUPERMARKETS ADDED');
    console.log('=====================================');
    console.log(`✓ Successfully added: ${added}`);
    console.log(`⊘ Duplicates skipped: ${duplicates}`);
    console.log('=====================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addSupermarkets();
