require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding Secunderabad services...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Secunderabad coordinates: 17.4399, 78.4983
const secunderabadServices = [
  // RESTAURANTS
  {
    name: 'Sangeeth Restaurant',
    category: 'Food',
    subcategory: 'Restaurant',
    description: 'Famous South Indian vegetarian restaurant serving authentic dosas, idlis, and traditional meals',
    address: 'SD Road, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2784 0213',
    contactEmail: 'sangeeth@secunderabad.com',
    priceRange: '₹300 for two (approx)',
    workingHours: '7:00 AM - 10:30 PM',
    rating: 4.3,
    verified: true,
    location: { type: 'Point', coordinates: [78.4983, 17.4399] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800'
  },
  {
    name: 'Satti Babu Biryani',
    category: 'Food',
    subcategory: 'Biryani Restaurant',
    description: 'Authentic Hyderabadi biryani with traditional dum cooking method, famous for mutton and chicken biryani',
    address: 'Rasoolpura, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2770 4567',
    contactEmail: 'sattibabu@secunderabad.com',
    priceRange: '₹450 for two (approx)',
    workingHours: '11:00 AM - 11:00 PM',
    rating: 4.5,
    verified: true,
    location: { type: 'Point', coordinates: [78.4990, 17.4410] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800'
  },
  {
    name: 'Prakasham Udupi Tiffins',
    category: 'Food',
    subcategory: 'Breakfast Restaurant',
    description: 'Traditional Udupi style breakfast items, famous for soft idlis, crispy dosas, and filter coffee',
    address: 'Marredpally, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2780 1234',
    contactEmail: 'prakasham@secunderabad.com',
    priceRange: '₹200 for two (approx)',
    workingHours: '6:30 AM - 11:00 AM, 4:00 PM - 9:00 PM',
    rating: 4.2,
    verified: true,
    location: { type: 'Point', coordinates: [78.5000, 17.4420] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800'
  },
  {
    name: 'Vivaha Bhojanambu',
    category: 'Food',
    subcategory: 'Traditional Restaurant',
    description: 'Traditional Telugu wedding-style meals served on banana leaf, unlimited authentic dishes',
    address: 'Trimulgherry, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2777 8901',
    contactEmail: 'vivaha@secunderabad.com',
    priceRange: '₹350 for two (approx)',
    workingHours: '11:30 AM - 3:30 PM, 7:00 PM - 10:30 PM',
    rating: 4.4,
    verified: true,
    location: { type: 'Point', coordinates: [78.4975, 17.4385] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800'
  },

  // GROCERY STORES
  {
    name: 'Narmada Enterprises',
    category: 'Grocery',
    subcategory: 'Supermarket',
    description: 'Complete grocery store with fresh vegetables, fruits, provisions, and household items',
    address: 'Tarnaka, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2701 2345',
    contactEmail: 'narmada@secunderabad.com',
    priceRange: 'Varies',
    workingHours: '7:00 AM - 10:00 PM',
    rating: 4.1,
    verified: true,
    location: { type: 'Point', coordinates: [78.5010, 17.4430] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800'
  },
  {
    name: 'Farmers Online',
    category: 'Grocery',
    subcategory: 'Organic Store',
    description: 'Fresh organic vegetables and fruits directly from farmers, pesticide-free produce',
    address: 'Sainikpuri, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2705 6789',
    contactEmail: 'farmers@secunderabad.com',
    priceRange: 'Varies',
    workingHours: '6:00 AM - 9:00 PM',
    rating: 4.3,
    verified: true,
    location: { type: 'Point', coordinates: [78.5020, 17.4450] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
  },
  {
    name: 'Sai Tirumala Medical & General Store',
    category: 'Grocery',
    subcategory: 'General Store',
    description: 'Medical supplies, groceries, and daily essentials under one roof',
    address: 'Alwal, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2706 3456',
    contactEmail: 'saitirumala@secunderabad.com',
    priceRange: 'Varies',
    workingHours: '7:00 AM - 11:00 PM',
    rating: 4.0,
    verified: true,
    location: { type: 'Point', coordinates: [78.4965, 17.4370] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=800'
  },
  {
    name: 'Sneha Fresh Chicken',
    category: 'Grocery',
    subcategory: 'Meat Shop',
    description: 'Fresh chicken, mutton, and fish, hygienically processed and delivered',
    address: 'Malkajgiri, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2770 9012',
    contactEmail: 'sneha@secunderabad.com',
    priceRange: 'Varies',
    workingHours: '6:00 AM - 9:00 PM',
    rating: 4.2,
    verified: true,
    location: { type: 'Point', coordinates: [78.5030, 17.4460] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800'
  },
  {
    name: 'Sri Tirumala Grand Bazar',
    category: 'Grocery',
    subcategory: 'Supermarket',
    description: 'Large supermarket with wide variety of groceries, household items, and personal care products',
    address: 'Karkhana, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2777 5678',
    contactEmail: 'grandbazar@secunderabad.com',
    priceRange: 'Varies',
    workingHours: '8:00 AM - 10:00 PM',
    rating: 4.1,
    verified: true,
    location: { type: 'Point', coordinates: [78.4955, 17.4360] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800'
  },
  {
    name: 'Laxmi Narashima Flour Mill',
    category: 'Grocery',
    subcategory: 'Flour Mill',
    description: 'Fresh ground flour, rice, pulses, and traditional grinding services',
    address: 'Bowenpally, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2708 4321',
    contactEmail: 'flourmill@secunderabad.com',
    priceRange: 'Varies',
    workingHours: '6:00 AM - 8:00 PM',
    rating: 4.0,
    verified: true,
    location: { type: 'Point', coordinates: [78.4945, 17.4350] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800'
  },

  // MEDICAL CLINICS
  {
    name: 'Dr Dinesh Sharma Dental Clinic',
    category: 'Medical',
    subcategory: 'Dental Clinic',
    description: 'Complete dental care including root canal, implants, braces, and cosmetic dentistry',
    address: 'Paradise Circle, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2784 5678',
    contactEmail: 'drdinesh@secunderabad.com',
    priceRange: '₹500 - ₹5000',
    workingHours: '9:00 AM - 1:00 PM, 5:00 PM - 9:00 PM',
    rating: 4.5,
    verified: true,
    location: { type: 'Point', coordinates: [78.4995, 17.4405] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800'
  },
  {
    name: 'Dr Gogineni Radha Krishna Clinic',
    category: 'Medical',
    subcategory: 'General Physician',
    description: 'General medicine, fever treatment, health checkups, and chronic disease management',
    address: 'Sitaphalmandi, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2780 9876',
    contactEmail: 'drgogineni@secunderabad.com',
    priceRange: '₹300 - ₹800',
    workingHours: '8:00 AM - 12:00 PM, 6:00 PM - 9:00 PM',
    rating: 4.3,
    verified: true,
    location: { type: 'Point', coordinates: [78.5005, 17.4415] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'
  },
  {
    name: 'Dr Pradeep Dental Clinic',
    category: 'Medical',
    subcategory: 'Dental Clinic',
    description: 'Advanced dental treatments, teeth whitening, aligners, and pediatric dentistry',
    address: 'Vikrampuri, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2771 2345',
    contactEmail: 'drpradeep@secunderabad.com',
    priceRange: '₹400 - ₹4500',
    workingHours: '10:00 AM - 2:00 PM, 5:30 PM - 8:30 PM',
    rating: 4.4,
    verified: true,
    location: { type: 'Point', coordinates: [78.5015, 17.4425] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800'
  },
  {
    name: 'Om Sai Dental Clinic',
    category: 'Medical',
    subcategory: 'Dental Clinic',
    description: 'Affordable dental care, extractions, fillings, and dentures',
    address: 'Chilkalguda, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2775 6789',
    contactEmail: 'omsai@secunderabad.com',
    priceRange: '₹300 - ₹3000',
    workingHours: '9:00 AM - 1:00 PM, 4:00 PM - 8:00 PM',
    rating: 4.1,
    verified: true,
    location: { type: 'Point', coordinates: [78.4985, 17.4395] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800'
  },
  {
    name: 'Radical Homeopathy',
    category: 'Medical',
    subcategory: 'Homeopathy Clinic',
    description: 'Classical homeopathy treatment for chronic diseases, skin problems, and allergies',
    address: 'Ameerpet, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2373 4567',
    contactEmail: 'radical@secunderabad.com',
    priceRange: '₹500 - ₹1500',
    workingHours: '10:00 AM - 1:00 PM, 5:00 PM - 8:00 PM',
    rating: 4.2,
    verified: true,
    location: { type: 'Point', coordinates: [78.4975, 17.4385] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800'
  },
  {
    name: 'Prana Women and Fertility Clinic',
    category: 'Medical',
    subcategory: 'Gynecology Clinic',
    description: 'Women\'s health, fertility treatments, pregnancy care, and gynecological consultations',
    address: 'Begumpet, Secunderabad, Hyderabad',
    city: 'Hyderabad',
    area: 'Secunderabad',
    contactPhone: '+91 40 2340 8901',
    contactEmail: 'prana@secunderabad.com',
    priceRange: '₹800 - ₹3000',
    workingHours: '9:00 AM - 5:00 PM',
    rating: 4.6,
    verified: true,
    location: { type: 'Point', coordinates: [78.4965, 17.4375] },
    serviceImageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800'
  }
];

const seedSecunderabad = async () => {
  try {
    await connectDB();

    console.log('🏥 Starting to seed Secunderabad services...');
    console.log(`Total services: ${secunderabadServices.length}`);
    console.log('=====================================\n');

    let inserted = 0;
    let duplicates = 0;

    for (const service of secunderabadServices) {
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
    console.log('🎉 SECUNDERABAD SEED SUMMARY');
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

seedSecunderabad();
