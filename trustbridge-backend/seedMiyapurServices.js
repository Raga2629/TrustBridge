require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding Miyapur services...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Miyapur coordinates: 17.4968, 78.3585
const miyapurServices = [
  // RESTAURANTS
  {
    name: 'Paradise Biryani Miyapur',
    category: 'Food',
    subcategory: 'Biryani Restaurant',
    description: 'Famous Paradise chain restaurant serving authentic Hyderabadi biryani and Mughlai cuisine',
    address: 'Miyapur Main Road, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2304 5678',
    contactEmail: 'paradise@miyapur.com',
    priceRange: '₹500 for two (approx)',
    workingHours: '11:00 AM - 11:00 PM',
    rating: 4.4,
    verified: true,
    location: { type: 'Point', coordinates: [78.3585, 17.4968] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800'
  },
  {
    name: 'Udupi Grand Restaurant',
    category: 'Food',
    subcategory: 'South Indian Restaurant',
    description: 'Authentic Udupi cuisine with variety of dosas, idlis, vadas, and traditional meals',
    address: 'KPHB Colony, Miyapur, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2304 1234',
    contactEmail: 'udupi@miyapur.com',
    priceRange: '₹300 for two (approx)',
    workingHours: '7:00 AM - 10:30 PM',
    rating: 4.2,
    verified: true,
    location: { type: 'Point', coordinates: [78.3595, 17.4978] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800'
  },
  {
    name: 'Bawarchi Restaurant',
    category: 'Food',
    subcategory: 'Multi-Cuisine Restaurant',
    description: 'Popular restaurant chain serving biryani, Chinese, and North Indian dishes',
    address: 'Miyapur X Roads, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2305 6789',
    contactEmail: 'bawarchi@miyapur.com',
    priceRange: '₹450 for two (approx)',
    workingHours: '11:30 AM - 11:00 PM',
    rating: 4.3,
    verified: true,
    location: { type: 'Point', coordinates: [78.3605, 17.4988] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
  },
  {
    name: 'Chutneys Restaurant',
    category: 'Food',
    subcategory: 'Breakfast Restaurant',
    description: 'Famous for breakfast items, wide variety of chutneys, and South Indian delicacies',
    address: 'Hafeezpet, Miyapur, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2306 2345',
    contactEmail: 'chutneys@miyapur.com',
    priceRange: '₹350 for two (approx)',
    workingHours: '7:00 AM - 11:00 PM',
    rating: 4.5,
    verified: true,
    location: { type: 'Point', coordinates: [78.3575, 17.4958] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800'
  },

  // GROCERY STORES
  {
    name: 'More Supermarket Miyapur',
    category: 'Grocery',
    subcategory: 'Supermarket',
    description: 'Large supermarket chain with fresh produce, groceries, and household essentials',
    address: 'Miyapur Main Road, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2304 7890',
    contactEmail: 'more@miyapur.com',
    priceRange: 'Varies',
    workingHours: '8:00 AM - 10:00 PM',
    rating: 4.1,
    verified: true,
    location: { type: 'Point', coordinates: [78.3615, 17.4998] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800'
  },
  {
    name: 'Reliance Fresh Miyapur',
    category: 'Grocery',
    subcategory: 'Supermarket',
    description: 'Fresh vegetables, fruits, dairy products, and daily essentials at competitive prices',
    address: 'KPHB Phase 1, Miyapur, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2305 3456',
    contactEmail: 'reliance@miyapur.com',
    priceRange: 'Varies',
    workingHours: '7:00 AM - 11:00 PM',
    rating: 4.0,
    verified: true,
    location: { type: 'Point', coordinates: [78.3625, 17.5008] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=800'
  },
  {
    name: 'Heritage Fresh Miyapur',
    category: 'Grocery',
    subcategory: 'Supermarket',
    description: 'Premium quality groceries, organic products, and imported food items',
    address: 'Miyapur Metro Station, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2306 4567',
    contactEmail: 'heritage@miyapur.com',
    priceRange: 'Varies',
    workingHours: '8:00 AM - 10:00 PM',
    rating: 4.2,
    verified: true,
    location: { type: 'Point', coordinates: [78.3565, 17.4948] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800'
  },
  {
    name: 'Ratnadeep Supermarket Miyapur',
    category: 'Grocery',
    subcategory: 'Supermarket',
    description: 'Local supermarket chain with wide range of groceries and household products',
    address: 'Allwyn Colony, Miyapur, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2307 5678',
    contactEmail: 'ratnadeep@miyapur.com',
    priceRange: 'Varies',
    workingHours: '7:00 AM - 10:00 PM',
    rating: 4.1,
    verified: true,
    location: { type: 'Point', coordinates: [78.3555, 17.4938] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800'
  },
  {
    name: 'Organic Basket Miyapur',
    category: 'Grocery',
    subcategory: 'Organic Store',
    description: 'Certified organic vegetables, fruits, and chemical-free groceries',
    address: 'Hafeezpet, Miyapur, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2308 6789',
    contactEmail: 'organic@miyapur.com',
    priceRange: 'Varies',
    workingHours: '6:00 AM - 9:00 PM',
    rating: 4.3,
    verified: true,
    location: { type: 'Point', coordinates: [78.3545, 17.4928] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
  },
  {
    name: 'Fresh Chicken Center Miyapur',
    category: 'Grocery',
    subcategory: 'Meat Shop',
    description: 'Fresh chicken, mutton, fish, and seafood with home delivery',
    address: 'Miyapur Main Road, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2309 7890',
    contactEmail: 'chicken@miyapur.com',
    priceRange: 'Varies',
    workingHours: '6:00 AM - 9:00 PM',
    rating: 4.0,
    verified: true,
    location: { type: 'Point', coordinates: [78.3635, 17.5018] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800'
  },

  // MEDICAL CLINICS
  {
    name: 'Apollo Clinic Miyapur',
    category: 'Medical',
    subcategory: 'Multi-Specialty Clinic',
    description: 'Multi-specialty clinic with general medicine, pediatrics, and diagnostic services',
    address: 'Miyapur Main Road, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2304 9012',
    contactEmail: 'apollo@miyapur.com',
    priceRange: '₹500 - ₹2000',
    workingHours: '8:00 AM - 10:00 PM',
    rating: 4.5,
    verified: true,
    location: { type: 'Point', coordinates: [78.3645, 17.5028] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'
  },
  {
    name: 'Dr Reddy Dental Care',
    category: 'Medical',
    subcategory: 'Dental Clinic',
    description: 'Advanced dental treatments, implants, braces, and cosmetic dentistry',
    address: 'KPHB Colony, Miyapur, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2305 0123',
    contactEmail: 'drreddy@miyapur.com',
    priceRange: '₹400 - ₹5000',
    workingHours: '9:00 AM - 9:00 PM',
    rating: 4.4,
    verified: true,
    location: { type: 'Point', coordinates: [78.3535, 17.4918] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800'
  },
  {
    name: 'Care Hospital Miyapur',
    category: 'Medical',
    subcategory: 'Hospital',
    description: '24/7 emergency services, inpatient care, and specialized treatments',
    address: 'Miyapur X Roads, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2306 1234',
    contactEmail: 'care@miyapur.com',
    priceRange: '₹800 - ₹5000',
    workingHours: 'Open 24 hours',
    rating: 4.6,
    verified: true,
    location: { type: 'Point', coordinates: [78.3655, 17.5038] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800'
  },
  {
    name: 'Smile Dental Clinic',
    category: 'Medical',
    subcategory: 'Dental Clinic',
    description: 'Affordable dental care, root canal, extractions, and teeth cleaning',
    address: 'Hafeezpet, Miyapur, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2307 2345',
    contactEmail: 'smile@miyapur.com',
    priceRange: '₹300 - ₹3500',
    workingHours: '10:00 AM - 8:00 PM',
    rating: 4.2,
    verified: true,
    location: { type: 'Point', coordinates: [78.3525, 17.4908] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800'
  },
  {
    name: 'Wellness Homeopathy Miyapur',
    category: 'Medical',
    subcategory: 'Homeopathy Clinic',
    description: 'Homeopathic treatment for chronic diseases, allergies, and lifestyle disorders',
    address: 'Allwyn Colony, Miyapur, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2308 3456',
    contactEmail: 'wellness@miyapur.com',
    priceRange: '₹400 - ₹1200',
    workingHours: '10:00 AM - 1:00 PM, 5:00 PM - 8:00 PM',
    rating: 4.1,
    verified: true,
    location: { type: 'Point', coordinates: [78.3515, 17.4898] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800'
  },
  {
    name: 'Medicover Hospitals Miyapur',
    category: 'Medical',
    subcategory: 'Hospital',
    description: 'Multi-specialty hospital with advanced diagnostics and treatment facilities',
    address: 'Miyapur Main Road, Hyderabad',
    city: 'Hyderabad',
    area: 'Miyapur',
    contactPhone: '+91 40 2309 4567',
    contactEmail: 'medicover@miyapur.com',
    priceRange: '₹700 - ₹4000',
    workingHours: 'Open 24 hours',
    rating: 4.5,
    verified: true,
    location: { type: 'Point', coordinates: [78.3665, 17.5048] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800'
  }
];

const seedMiyapur = async () => {
  try {
    await connectDB();

    console.log('🏥 Starting to seed Miyapur services...');
    console.log(`Total services: ${miyapurServices.length}`);
    console.log('=====================================\n');

    let inserted = 0;
    let duplicates = 0;

    for (const service of miyapurServices) {
      try {
        await Service.create(service);
        inserted++;
        console.log(`✓ ${inserted}. ${service.name} - ${service.category}`);
      } catch (error) {
        if (error.code === 11000) {
          duplicates++;
          console.log(`⊘ Duplicate: ${service.name}`);
        } else {
          console.log(`✗ Error: ${service.name} - ${error.message}`);
        }
      }
    }

    console.log('\n=====================================');
    console.log('🎉 MIYAPUR SEED SUMMARY');
    console.log('=====================================');
    console.log(`✓ Successfully inserted: ${inserted}`);
    console.log(`⊘ Duplicates skipped: ${duplicates}`);
    console.log('=====================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedMiyapur();
