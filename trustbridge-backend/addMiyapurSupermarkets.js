require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for adding Miyapur supermarkets...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// 5 popular supermarkets near Miyapur
const supermarkets = [
  {
    name: 'DMart Miyapur',
    category: 'Shopping',
    subcategory: 'Supermarket',
    description: 'Large hypermarket chain offering groceries, household items, apparel, and electronics at competitive prices',
    address: 'Miyapur Main Road, Near Metro Station, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2309 1234',
    contactEmail: 'dmart@miyapur.com',
    priceRange: '₹500 for groceries (approx)',
    workingHours: '8:00 AM - 10:00 PM',
    rating: 4.4,
    verified: true,
    location: { type: 'Point', coordinates: [78.3575, 17.4965] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800'
  },
  {
    name: 'Big Bazaar Miyapur',
    category: 'Shopping',
    subcategory: 'Hypermarket',
    description: 'Popular hypermarket chain with wide range of groceries, fashion, home essentials, and electronics',
    address: 'KPHB Main Road, Miyapur, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2309 5678',
    contactEmail: 'bigbazaar@miyapur.com',
    priceRange: '₹600 for shopping (approx)',
    workingHours: '9:00 AM - 10:00 PM',
    rating: 4.3,
    verified: true,
    location: { type: 'Point', coordinates: [78.3580, 17.4970] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800'
  },
  {
    name: 'Spencer\'s Retail Miyapur',
    category: 'Shopping',
    subcategory: 'Supermarket',
    description: 'Premium supermarket offering fresh produce, imported goods, bakery items, and household products',
    address: 'Miyapur X Roads, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2309 8901',
    contactEmail: 'spencers@miyapur.com',
    priceRange: '₹700 for groceries (approx)',
    workingHours: '8:00 AM - 11:00 PM',
    rating: 4.2,
    verified: true,
    location: { type: 'Point', coordinates: [78.3590, 17.4975] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800'
  },
  {
    name: 'Metro Cash & Carry Miyapur',
    category: 'Shopping',
    subcategory: 'Wholesale Store',
    description: 'Wholesale cash and carry store for bulk purchases, groceries, and business supplies',
    address: 'Miyapur Industrial Area, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2309 2345',
    contactEmail: 'metro@miyapur.com',
    priceRange: '₹1000 for bulk (approx)',
    workingHours: '7:00 AM - 9:00 PM',
    rating: 4.5,
    verified: true,
    location: { type: 'Point', coordinates: [78.3595, 17.4980] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=800'
  },
  {
    name: 'Spar Hypermarket Miyapur',
    category: 'Shopping',
    subcategory: 'Hypermarket',
    description: 'International hypermarket chain with fresh food, groceries, electronics, and lifestyle products',
    address: 'Miyapur Circle, Near Jyothi Theatre, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2309 6789',
    contactEmail: 'spar@miyapur.com',
    priceRange: '₹650 for shopping (approx)',
    workingHours: '9:00 AM - 10:30 PM',
    rating: 4.3,
    verified: true,
    location: { type: 'Point', coordinates: [78.3600, 17.4985] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=800'
  }
];

const addSupermarkets = async () => {
  try {
    await connectDB();
    
    console.log('🛒 Adding 5 supermarkets to Miyapur...\n');
    
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
    console.log('🎉 SUPERMARKETS ADDED');
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
