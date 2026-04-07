const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Service = require('./models/Service');

dotenv.config();

// Sample services data for Hyderabad
const services = [
  {
    name: 'Apollo Hospitals',
    category: 'medical',
    subcategory: 'Multi-specialty Hospital',
    description: 'Leading multi-specialty hospital with 24/7 emergency services, advanced diagnostics, and expert doctors.',
    address: 'Jubilee Hills, Road No. 72',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.4089, 17.4326] // [longitude, latitude]
    },
    priceRange: '₹₹₹',
    contactPhone: '+91-40-23607777',
    contactEmail: 'info@apollohospitals.com',
    workingHours: '24/7',
    verified: true
  },
  {
    name: 'Care Hospitals',
    category: 'medical',
    subcategory: 'Cardiology',
    description: 'Specialized cardiac care center with state-of-the-art facilities and experienced cardiologists.',
    address: 'Banjara Hills, Road No. 1',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.4367, 17.4239]
    },
    priceRange: '₹₹₹',
    contactPhone: '+91-40-61651234',
    contactEmail: 'care@carehospitals.com',
    workingHours: '24/7',
    verified: true
  },
  {
    name: 'Urban Company Home Services',
    category: 'home',
    subcategory: 'Cleaning',
    description: 'Professional home cleaning, plumbing, electrical, and repair services at your doorstep.',
    address: 'Gachibowli, DLF Cyber City',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.3489, 17.4435]
    },
    priceRange: '₹₹',
    contactPhone: '+91-80-46809000',
    contactEmail: 'support@urbancompany.com',
    workingHours: '8:00 AM - 10:00 PM',
    verified: true
  },
  {
    name: 'Sulekha Home Services',
    category: 'home',
    subcategory: 'Repairs',
    description: 'Trusted home repair and maintenance services including AC, refrigerator, and appliance repairs.',
    address: 'Madhapur, Hitech City',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.3912, 17.4485]
    },
    priceRange: '₹',
    contactPhone: '+91-40-44446666',
    contactEmail: 'help@sulekha.com',
    workingHours: '9:00 AM - 8:00 PM',
    verified: true
  },
  {
    name: 'FIITJEE Hyderabad',
    category: 'education',
    subcategory: 'Coaching Center',
    description: 'Premier coaching institute for IIT-JEE, NEET, and other competitive exams.',
    address: 'Narayanaguda, Near RTC X Roads',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.4867, 17.3964]
    },
    priceRange: '₹₹₹',
    contactPhone: '+91-40-27654321',
    contactEmail: 'hyderabad@fiitjee.com',
    workingHours: '8:00 AM - 8:00 PM',
    verified: true
  },
  {
    name: 'British Council Hyderabad',
    category: 'education',
    subcategory: 'Language Classes',
    description: 'English language courses, IELTS preparation, and international education counseling.',
    address: 'Secunderabad, Sarojini Devi Road',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.5014, 17.4399]
    },
    priceRange: '₹₹₹',
    contactPhone: '+91-40-44517200',
    contactEmail: 'info@britishcouncil.in',
    workingHours: '9:00 AM - 6:00 PM',
    verified: true
  },
  {
    name: 'NestAway Rentals',
    category: 'rentals',
    subcategory: 'PG & Hostels',
    description: 'Fully furnished PG accommodations with modern amenities, WiFi, and housekeeping.',
    address: 'Kondapur, Botanical Garden Road',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.3647, 17.4625]
    },
    priceRange: '₹₹',
    contactPhone: '+91-80-67683000',
    contactEmail: 'support@nestaway.com',
    workingHours: '10:00 AM - 7:00 PM',
    verified: true
  },
  {
    name: 'OYO Life Apartments',
    category: 'rentals',
    subcategory: 'Apartments',
    description: 'Affordable rental apartments with flexible lease options and modern facilities.',
    address: 'Kukatpally, KPHB Colony',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.3975, 17.4948]
    },
    priceRange: '₹₹',
    contactPhone: '+91-124-6201600',
    contactEmail: 'support@oyorooms.com',
    workingHours: '24/7',
    verified: true
  },
  {
    name: 'Lakme Salon',
    category: 'beauty',
    subcategory: 'Salon',
    description: 'Premium beauty salon offering hair styling, makeup, skincare, and spa services.',
    address: 'Banjara Hills, Road No. 12',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.4456, 17.4183]
    },
    priceRange: '₹₹₹',
    contactPhone: '+91-40-23559900',
    contactEmail: 'info@lakmesalon.in',
    workingHours: '10:00 AM - 9:00 PM',
    verified: true
  },
  {
    name: 'Naturals Unisex Salon',
    category: 'beauty',
    subcategory: 'Salon',
    description: 'Affordable unisex salon with hair care, skin care, and grooming services.',
    address: 'Ameerpet, SR Nagar',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.4482, 17.4399]
    },
    priceRange: '₹₹',
    contactPhone: '+91-40-23735500',
    contactEmail: 'care@naturalssalon.com',
    workingHours: '10:00 AM - 9:00 PM',
    verified: true
  },
  {
    name: 'Paradise Biryani',
    category: 'food',
    subcategory: 'Restaurant',
    description: 'Iconic Hyderabadi biryani restaurant serving authentic flavors since 1953.',
    address: 'Secunderabad, MG Road',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.5014, 17.4399]
    },
    priceRange: '₹₹',
    contactPhone: '+91-40-27803888',
    contactEmail: 'info@paradisebiryani.in',
    workingHours: '11:00 AM - 11:00 PM',
    verified: true
  },
  {
    name: 'Zomato Food Delivery',
    category: 'food',
    subcategory: 'Food Delivery',
    description: 'Online food ordering and delivery from thousands of restaurants across Hyderabad.',
    address: 'Gachibowli, Financial District',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.3489, 17.4435]
    },
    priceRange: '₹',
    contactPhone: '+91-80-61511111',
    contactEmail: 'support@zomato.com',
    workingHours: '24/7',
    verified: true
  },
  {
    name: 'Reliance Digital',
    category: 'shopping',
    subcategory: 'Electronics',
    description: 'One-stop shop for electronics, appliances, and gadgets with expert assistance.',
    address: 'Begumpet, Greenlands',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.4647, 17.4399]
    },
    priceRange: '₹₹₹',
    contactPhone: '+91-40-44446000',
    contactEmail: 'care@reliancedigital.in',
    workingHours: '10:00 AM - 10:00 PM',
    verified: true
  },
  {
    name: 'Big Bazaar',
    category: 'shopping',
    subcategory: 'Supermarket',
    description: 'Hypermarket offering groceries, clothing, electronics, and household items.',
    address: 'Miyapur, Hafeezpet',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.3647, 17.4948]
    },
    priceRange: '₹₹',
    contactPhone: '+91-40-66116611',
    contactEmail: 'customercare@bigbazaar.com',
    workingHours: '10:00 AM - 10:00 PM',
    verified: true
  },
  {
    name: 'Ola Cabs',
    category: 'transport',
    subcategory: 'Taxi Service',
    description: 'Reliable cab service with multiple vehicle options and affordable pricing.',
    address: 'Hitech City, Madhapur',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.3912, 17.4485]
    },
    priceRange: '₹₹',
    contactPhone: '+91-80-61766666',
    contactEmail: 'support@olacabs.com',
    workingHours: '24/7',
    verified: true
  },
  {
    name: 'Rapido Bike Taxi',
    category: 'transport',
    subcategory: 'Bike Taxi',
    description: 'Quick and affordable bike taxi service for daily commute in Hyderabad.',
    address: 'Gachibowli, DLF Cyber City',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.3489, 17.4435]
    },
    priceRange: '₹',
    contactPhone: '+91-80-46668888',
    contactEmail: 'support@rapido.bike',
    workingHours: '24/7',
    verified: true
  },
  {
    name: 'Birla Mandir',
    category: 'shopping',
    subcategory: 'Temple',
    description: 'Beautiful white marble temple dedicated to Lord Venkateshwara with panoramic city views.',
    address: 'Naubat Pahad, Khairtabad',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.4647, 17.4062]
    },
    priceRange: 'Free',
    contactPhone: '+91-40-23234294',
    workingHours: '7:00 AM - 12:00 PM, 3:00 PM - 9:00 PM',
    verified: true
  },
  {
    name: 'Chilkur Balaji Temple',
    category: 'shopping',
    subcategory: 'Temple',
    description: 'Ancient temple known as Visa Balaji, popular among devotees seeking blessings.',
    address: 'Chilkur Village, Moinabad Mandal',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.3489, 17.3167]
    },
    priceRange: 'Free',
    contactPhone: '+91-40-24193366',
    workingHours: '6:00 AM - 7:00 PM',
    verified: true
  },
  {
    name: 'HDFC Bank ATM',
    category: 'shopping',
    subcategory: 'Bank ATM',
    description: '24/7 ATM facility with cash withdrawal, balance inquiry, and mini statement services.',
    address: 'Jubilee Hills, Road No. 36',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.4089, 17.4326]
    },
    priceRange: 'Free',
    contactPhone: '1800-267-3456',
    workingHours: '24/7',
    verified: true
  },
  {
    name: 'SBI ATM',
    category: 'shopping',
    subcategory: 'Bank ATM',
    description: 'State Bank of India ATM with cash withdrawal and deposit facilities.',
    address: 'Secunderabad, Paradise Circle',
    city: 'Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.5014, 17.4399]
    },
    priceRange: 'Free',
    contactPhone: '1800-425-3800',
    workingHours: '24/7',
    verified: true
  }
];

const seedServices = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Clear existing services (optional - comment out if you want to keep existing)
    // await Service.deleteMany({});
    // console.log('Existing services cleared');

    // Insert services
    const createdServices = await Service.insertMany(services);
    console.log(`${createdServices.length} services seeded successfully`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
};

// Run seed function
seedServices();
