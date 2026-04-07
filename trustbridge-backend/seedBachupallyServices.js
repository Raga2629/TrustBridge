require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Bachupally coordinates (approximate center)
const BACHUPALLY_CENTER = {
  lat: 17.5449,
  lng: 78.3931
};

// Helper function to generate nearby coordinates
const getNearbyCoords = (index, total) => {
  const offset = 0.01; // ~1km variation
  const angle = (index / total) * 2 * Math.PI;
  return {
    lng: BACHUPALLY_CENTER.lng + (Math.cos(angle) * offset * Math.random()),
    lat: BACHUPALLY_CENTER.lat + (Math.sin(angle) * offset * Math.random())
  };
};

const bachupallyServices = [
  // MEDICAL SERVICES (19 services)
  {
    name: 'Apollo Clinic Bachupally',
    category: 'Medical',
    subcategory: 'Multi-specialty Clinic',
    description: 'Multi-specialty clinic offering general medicine, diagnostics, and specialist consultations',
    address: 'Bachupally Main Road, Bachupally, Hyderabad',
    city: 'Hyderabad',
    area: 'Bachupally',
    contactPhone: '+91 40 1234 5678',
    priceRange: '₹300 - ₹1500',
    workingHours: '8:00 AM - 10:00 PM',
    location: { type: 'Point', coordinates: [78.3931, 17.5449] }
  },
  {
    name: 'Medicover Hospitals Bachupally',
    category: 'Medical',
    subcategory: 'Hospital',
    description: 'Multi-specialty hospital with emergency services, ICU, and advanced medical facilities',
    address: 'Miyapur Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 2345 6789',
    priceRange: '₹500 - ₹3000',
    workingHours: '24/7',
    location: { type: 'Point', coordinates: [78.3945, 17.5455] }
  },
  {
    name: 'Care Hospital Bachupally',
    category: 'Medical',
    subcategory: 'Hospital',
    description: 'Comprehensive healthcare facility with modern equipment and experienced doctors',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 3456 7890',
    priceRange: '₹600 - ₹4000',
    workingHours: '24/7',
    location: { type: 'Point', coordinates: [78.3920, 17.5460] }
  },
  {
    name: 'Dr. Reddy\'s Clinic',
    category: 'Medical',
    subcategory: 'General Physician',
    description: 'Family physician clinic for general health checkups and consultations',
    address: 'Bachupally Village, Hyderabad',
    contactPhone: '+91 40 4567 8901',
    priceRange: '₹200 - ₹800',
    workingHours: '9:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3915, 17.5445] }
  },
  {
    name: 'Sai Dental Care',
    category: 'Medical',
    subcategory: 'Dental Clinic',
    description: 'Complete dental care including root canal, braces, and cosmetic dentistry',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 5678 9012',
    priceRange: '₹300 - ₹2500',
    workingHours: '10:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3940, 17.5450] }
  },
  {
    name: 'Vision Eye Hospital',
    category: 'Medical',
    subcategory: 'Eye Care',
    description: 'Specialized eye care center with cataract surgery and laser treatment facilities',
    address: 'Miyapur Cross Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 6789 0123',
    priceRange: '₹400 - ₹5000',
    workingHours: '9:00 AM - 7:00 PM',
    location: { type: 'Point', coordinates: [78.3935, 17.5442] }
  },
  {
    name: 'Bachupally Diagnostic Center',
    category: 'Medical',
    subcategory: 'Diagnostics',
    description: 'Full-service diagnostic lab with blood tests, X-ray, ultrasound, and ECG',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 7890 1234',
    priceRange: '₹150 - ₹2000',
    workingHours: '7:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3925, 17.5448] }
  },
  {
    name: 'Pulse Pharmacy',
    category: 'Medical',
    subcategory: 'Pharmacy',
    description: 'Well-stocked pharmacy with prescription medicines and healthcare products',
    address: 'Bachupally Village, Hyderabad',
    contactPhone: '+91 40 8901 2345',
    priceRange: '₹50 - ₹1000',
    workingHours: '8:00 AM - 11:00 PM',
    location: { type: 'Point', coordinates: [78.3928, 17.5453] }
  },
  {
    name: 'Physio Plus Therapy Center',
    category: 'Medical',
    subcategory: 'Physiotherapy',
    description: 'Physiotherapy and rehabilitation center for sports injuries and chronic pain',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 9012 3456',
    priceRange: '₹300 - ₹1200',
    workingHours: '8:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3918, 17.5457] }
  },
  {
    name: 'Bachupally Pediatric Clinic',
    category: 'Medical',
    subcategory: 'Pediatrics',
    description: 'Specialized child healthcare with vaccinations and growth monitoring',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 0123 4567',
    priceRange: '₹250 - ₹1000',
    workingHours: '9:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3933, 17.5446] }
  },
  {
    name: 'Skin & Hair Clinic',
    category: 'Medical',
    subcategory: 'Dermatology',
    description: 'Dermatology clinic for skin treatments, hair fall, and cosmetic procedures',
    address: 'Miyapur Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 1234 5670',
    priceRange: '₹400 - ₹3000',
    workingHours: '10:00 AM - 7:00 PM',
    location: { type: 'Point', coordinates: [78.3942, 17.5451] }
  },
  {
    name: 'Ortho Care Hospital',
    category: 'Medical',
    subcategory: 'Orthopedics',
    description: 'Orthopedic hospital specializing in bone and joint treatments',
    address: 'Bachupally Village, Hyderabad',
    contactPhone: '+91 40 2345 6701',
    priceRange: '₹500 - ₹4000',
    workingHours: '9:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3922, 17.5444] }
  },
  {
    name: 'Wellness Homeopathy Clinic',
    category: 'Medical',
    subcategory: 'Homeopathy',
    description: 'Homeopathic treatment for chronic diseases and lifestyle disorders',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 3456 7012',
    priceRange: '₹200 - ₹800',
    workingHours: '10:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3938, 17.5458] }
  },
  {
    name: 'Ayur Life Ayurvedic Center',
    category: 'Medical',
    subcategory: 'Ayurveda',
    description: 'Traditional Ayurvedic treatments, panchakarma, and wellness therapies',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 4567 8023',
    priceRange: '₹300 - ₹2000',
    workingHours: '9:00 AM - 7:00 PM',
    location: { type: 'Point', coordinates: [78.3927, 17.5452] }
  },
  {
    name: 'Bachupally Veterinary Hospital',
    category: 'Medical',
    subcategory: 'Veterinary',
    description: 'Complete pet care with vaccinations, surgery, and emergency services',
    address: 'Miyapur Cross Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 5678 9034',
    priceRange: '₹200 - ₹3000',
    workingHours: '9:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3916, 17.5447] }
  },
  {
    name: 'Cardio Care Center',
    category: 'Medical',
    subcategory: 'Cardiology',
    description: 'Heart care center with ECG, echo, and cardiac consultations',
    address: 'Bachupally Village, Hyderabad',
    contactPhone: '+91 40 6789 0145',
    priceRange: '₹500 - ₹3500',
    workingHours: '8:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3930, 17.5456] }
  },
  {
    name: 'Women\'s Health Clinic',
    category: 'Medical',
    subcategory: 'Gynecology',
    description: 'Women\'s healthcare with gynecology, obstetrics, and maternity services',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 7890 1256',
    priceRange: '₹400 - ₹2500',
    workingHours: '9:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3924, 17.5443] }
  },
  {
    name: 'Mind Wellness Psychiatry',
    category: 'Medical',
    subcategory: 'Psychiatry',
    description: 'Mental health services including counseling and psychiatric treatment',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 8901 2367',
    priceRange: '₹600 - ₹2000',
    workingHours: '10:00 AM - 7:00 PM',
    location: { type: 'Point', coordinates: [78.3936, 17.5454] }
  },
  {
    name: 'Bachupally Blood Bank',
    category: 'Medical',
    subcategory: 'Blood Bank',
    description: 'Blood donation and storage facility with 24/7 emergency blood availability',
    address: 'Miyapur Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 9012 3478',
    priceRange: '₹500 - ₹1500',
    workingHours: '24/7',
    location: { type: 'Point', coordinates: [78.3919, 17.5459] }
  },

  // GROCERY SHOPS (7 services)
  {
    name: 'More Supermarket Bachupally',
    category: 'Grocery',
    subcategory: 'Supermarket',
    description: 'Large supermarket chain with fresh produce, groceries, and household items',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 1111 2222',
    priceRange: '₹50 - ₹5000',
    workingHours: '8:00 AM - 11:00 PM',
    location: { type: 'Point', coordinates: [78.3932, 17.5450] }
  },
  {
    name: 'Reliance Fresh',
    category: 'Grocery',
    subcategory: 'Supermarket',
    description: 'Fresh fruits, vegetables, dairy products, and daily essentials',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 2222 3333',
    priceRange: '₹30 - ₹3000',
    workingHours: '7:00 AM - 11:00 PM',
    location: { type: 'Point', coordinates: [78.3926, 17.5448] }
  },
  {
    name: 'Ratnadeep Supermarket',
    category: 'Grocery',
    subcategory: 'Supermarket',
    description: 'Local supermarket chain with competitive prices and quality products',
    address: 'Bachupally Village, Hyderabad',
    contactPhone: '+91 40 3333 4444',
    priceRange: '₹40 - ₹4000',
    workingHours: '8:00 AM - 10:00 PM',
    location: { type: 'Point', coordinates: [78.3939, 17.5453] }
  },
  {
    name: 'Sri Sai Kirana Store',
    category: 'Grocery',
    subcategory: 'Kirana Store',
    description: 'Traditional grocery store with all daily needs and home delivery',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 4444 5555',
    priceRange: '₹20 - ₹2000',
    workingHours: '6:00 AM - 10:00 PM',
    location: { type: 'Point', coordinates: [78.3921, 17.5446] }
  },
  {
    name: 'Bachupally Organic Store',
    category: 'Grocery',
    subcategory: 'Organic Store',
    description: 'Certified organic fruits, vegetables, and chemical-free groceries',
    address: 'Miyapur Cross Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 5555 6666',
    priceRange: '₹100 - ₹3000',
    workingHours: '8:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3934, 17.5451] }
  },
  {
    name: 'Fresh Basket Supermarket',
    category: 'Grocery',
    subcategory: 'Supermarket',
    description: 'Modern supermarket with fresh produce and imported goods',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 6666 7777',
    priceRange: '₹50 - ₹5000',
    workingHours: '7:30 AM - 10:30 PM',
    location: { type: 'Point', coordinates: [78.3917, 17.5455] }
  },
  {
    name: 'Bachupally Vegetable Market',
    category: 'Grocery',
    subcategory: 'Vegetable Market',
    description: 'Fresh vegetables and fruits directly from farmers at wholesale prices',
    address: 'Bachupally Village, Hyderabad',
    contactPhone: '+91 40 7777 8888',
    priceRange: '₹10 - ₹1000',
    workingHours: '5:00 AM - 2:00 PM',
    location: { type: 'Point', coordinates: [78.3929, 17.5457] }
  },

  // EDUCATION (8 services)
  {
    name: 'Delhi Public School Bachupally',
    category: 'Education',
    subcategory: 'CBSE School',
    description: 'Premier CBSE school with modern infrastructure and holistic education',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 1010 2020',
    priceRange: '₹50000 - ₹150000 per year',
    workingHours: '8:00 AM - 4:00 PM',
    location: { type: 'Point', coordinates: [78.3937, 17.5449] }
  },
  {
    name: 'Bachupally Public School',
    category: 'Education',
    subcategory: 'State Board School',
    description: 'Affordable quality education following state board curriculum',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 2020 3030',
    priceRange: '₹20000 - ₹60000 per year',
    workingHours: '8:30 AM - 3:30 PM',
    location: { type: 'Point', coordinates: [78.3923, 17.5452] }
  },
  {
    name: 'Little Angels Preschool',
    category: 'Education',
    subcategory: 'Preschool',
    description: 'Play-based learning preschool for children aged 2-5 years',
    address: 'Bachupally Village, Hyderabad',
    contactPhone: '+91 40 3030 4040',
    priceRange: '₹15000 - ₹40000 per year',
    workingHours: '9:00 AM - 1:00 PM',
    location: { type: 'Point', coordinates: [78.3941, 17.5447] }
  },
  {
    name: 'Narayana Junior College',
    category: 'Education',
    subcategory: 'Junior College',
    description: 'Intermediate education with focus on IIT-JEE and NEET preparation',
    address: 'Miyapur Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 4040 5050',
    priceRange: '₹60000 - ₹120000 per year',
    workingHours: '7:00 AM - 6:00 PM',
    location: { type: 'Point', coordinates: [78.3920, 17.5454] }
  },
  {
    name: 'FIITJEE Coaching Center',
    category: 'Education',
    subcategory: 'Coaching Institute',
    description: 'Premier coaching for IIT-JEE, NEET, and competitive exams',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 5050 6060',
    priceRange: '₹40000 - ₹100000 per year',
    workingHours: '6:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3935, 17.5456] }
  },
  {
    name: 'British English Academy',
    category: 'Education',
    subcategory: 'Language Institute',
    description: 'English language training with IELTS and spoken English courses',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 6060 7070',
    priceRange: '₹5000 - ₹30000',
    workingHours: '9:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3928, 17.5445] }
  },
  {
    name: 'Bachupally Computer Training Center',
    category: 'Education',
    subcategory: 'Computer Institute',
    description: 'Computer courses including programming, web development, and MS Office',
    address: 'Bachupally Village, Hyderabad',
    contactPhone: '+91 40 7070 8080',
    priceRange: '₹3000 - ₹25000',
    workingHours: '10:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3933, 17.5458] }
  },
  {
    name: 'Melody Music Academy',
    category: 'Education',
    subcategory: 'Music School',
    description: 'Music classes for keyboard, guitar, vocals, and classical instruments',
    address: 'Miyapur Cross Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 8080 9090',
    priceRange: '₹2000 - ₹10000 per month',
    workingHours: '4:00 PM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3918, 17.5450] }
  },

  // SHOPPING (5 services)
  {
    name: 'Bachupally Shopping Mall',
    category: 'Shopping',
    subcategory: 'Shopping Mall',
    description: 'Multi-brand shopping mall with fashion, electronics, and food court',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 1212 3434',
    priceRange: '₹200 - ₹50000',
    workingHours: '10:00 AM - 10:00 PM',
    location: { type: 'Point', coordinates: [78.3940, 17.5451] }
  },
  {
    name: 'Trends Fashion Store',
    category: 'Shopping',
    subcategory: 'Clothing Store',
    description: 'Latest fashion trends for men, women, and kids at affordable prices',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 3434 5656',
    priceRange: '₹300 - ₹5000',
    workingHours: '10:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3925, 17.5453] }
  },
  {
    name: 'Croma Electronics',
    category: 'Shopping',
    subcategory: 'Electronics Store',
    description: 'Wide range of electronics, home appliances, and gadgets',
    address: 'Bachupally Village, Hyderabad',
    contactPhone: '+91 40 5656 7878',
    priceRange: '₹500 - ₹100000',
    workingHours: '10:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3938, 17.5448] }
  },
  {
    name: 'Bachupally Book Store',
    category: 'Shopping',
    subcategory: 'Book Store',
    description: 'Books, stationery, and educational materials for all age groups',
    address: 'Miyapur Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 7878 9090',
    priceRange: '₹50 - ₹3000',
    workingHours: '9:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3922, 17.5446] }
  },
  {
    name: 'Joyalukkas Jewellers',
    category: 'Shopping',
    subcategory: 'Jewellery Store',
    description: 'Gold, diamond, and silver jewellery with certified quality',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 9090 1010',
    priceRange: '₹5000 - ₹500000',
    workingHours: '10:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3936, 17.5455] }
  },

  // HOME SERVICES (9 services)
  {
    name: 'Urban Company Home Services',
    category: 'HomeServices',
    subcategory: 'Multi-service',
    description: 'Professional home services including cleaning, repairs, and beauty',
    address: 'Bachupally, Hyderabad',
    contactPhone: '+91 40 1357 2468',
    priceRange: '₹200 - ₹5000',
    workingHours: '8:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3931, 17.5452] }
  },
  {
    name: 'Bachupally Plumbing Services',
    category: 'HomeServices',
    subcategory: 'Plumbing',
    description: 'Expert plumbing services for leaks, installations, and repairs',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 2468 1357',
    priceRange: '₹300 - ₹3000',
    workingHours: '7:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3924, 17.5449] }
  },
  {
    name: 'Quick Fix Electricians',
    category: 'HomeServices',
    subcategory: 'Electrical',
    description: 'Licensed electricians for wiring, repairs, and electrical installations',
    address: 'Bachupally Village, Hyderabad',
    contactPhone: '+91 40 3579 2468',
    priceRange: '₹250 - ₹4000',
    workingHours: '8:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3939, 17.5454] }
  },
  {
    name: 'AC Care Services',
    category: 'HomeServices',
    subcategory: 'AC Repair',
    description: 'Air conditioner installation, repair, and maintenance services',
    address: 'Miyapur Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 4680 1357',
    priceRange: '₹300 - ₹5000',
    workingHours: '8:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3919, 17.5447] }
  },
  {
    name: 'Sparkle Home Cleaning',
    category: 'HomeServices',
    subcategory: 'Cleaning',
    description: 'Professional home deep cleaning and regular maintenance services',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 5791 2468',
    priceRange: '₹500 - ₹3000',
    workingHours: '7:00 AM - 7:00 PM',
    location: { type: 'Point', coordinates: [78.3927, 17.5456] }
  },
  {
    name: 'Bachupally Pest Control',
    category: 'HomeServices',
    subcategory: 'Pest Control',
    description: 'Effective pest control solutions for cockroaches, termites, and rodents',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 6802 1357',
    priceRange: '₹800 - ₹5000',
    workingHours: '8:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3935, 17.5450] }
  },
  {
    name: 'Carpenter Pro Services',
    category: 'HomeServices',
    subcategory: 'Carpentry',
    description: 'Custom furniture, repairs, and carpentry work for homes and offices',
    address: 'Bachupally Village, Hyderabad',
    contactPhone: '+91 40 7913 2468',
    priceRange: '₹400 - ₹10000',
    workingHours: '8:00 AM - 7:00 PM',
    location: { type: 'Point', coordinates: [78.3921, 17.5443] }
  },
  {
    name: 'Paint Masters',
    category: 'HomeServices',
    subcategory: 'Painting',
    description: 'Professional painting services for interior and exterior walls',
    address: 'Miyapur Cross Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 8024 1357',
    priceRange: '₹5000 - ₹50000',
    workingHours: '8:00 AM - 6:00 PM',
    location: { type: 'Point', coordinates: [78.3933, 17.5458] }
  },
  {
    name: 'Bachupally Packers & Movers',
    category: 'HomeServices',
    subcategory: 'Packers & Movers',
    description: 'Reliable packing and moving services for household and office relocation',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 9135 2468',
    priceRange: '₹3000 - ₹30000',
    workingHours: '7:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3942, 17.5445] }
  },

  // TEMPLES (3 services)
  {
    name: 'Sri Venkateswara Swamy Temple',
    category: 'Temples',
    subcategory: 'Hindu Temple',
    description: 'Ancient temple dedicated to Lord Venkateswara with daily rituals and festivals',
    address: 'Bachupally Village, Hyderabad',
    contactPhone: '+91 40 1122 3344',
    priceRange: 'Free (Donations accepted)',
    workingHours: '6:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3930, 17.5451] }
  },
  {
    name: 'Hanuman Temple Bachupally',
    category: 'Temples',
    subcategory: 'Hindu Temple',
    description: 'Popular Hanuman temple with special prayers on Tuesdays and Saturdays',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 3344 5566',
    priceRange: 'Free (Donations accepted)',
    workingHours: '5:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3926, 17.5447] }
  },
  {
    name: 'Shiva Temple Bachupally',
    category: 'Temples',
    subcategory: 'Hindu Temple',
    description: 'Peaceful Shiva temple with beautiful architecture and serene atmosphere',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 5566 7788',
    priceRange: 'Free (Donations accepted)',
    workingHours: '6:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3937, 17.5453] }
  },

  // BEAUTY (3 services)
  {
    name: 'Lakme Salon Bachupally',
    category: 'Beauty',
    subcategory: 'Unisex Salon',
    description: 'Premium salon services including haircuts, styling, facials, and spa',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 2233 4455',
    priceRange: '₹300 - ₹5000',
    workingHours: '10:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3934, 17.5450] }
  },
  {
    name: 'Gents Salon & Spa',
    category: 'Beauty',
    subcategory: 'Men\'s Salon',
    description: 'Modern men\'s grooming with haircuts, beard styling, and massage',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 4455 6677',
    priceRange: '₹150 - ₹2000',
    workingHours: '9:00 AM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3928, 17.5448] }
  },
  {
    name: 'Blush Beauty Parlour',
    category: 'Beauty',
    subcategory: 'Ladies Parlour',
    description: 'Complete beauty services for women including bridal makeup and treatments',
    address: 'Bachupally Village, Hyderabad',
    contactPhone: '+91 40 6677 8899',
    priceRange: '₹400 - ₹8000',
    workingHours: '10:00 AM - 8:00 PM',
    location: { type: 'Point', coordinates: [78.3941, 17.5455] }
  },

  // FOOD (4 services)
  {
    name: 'Paradise Biryani',
    category: 'Food',
    subcategory: 'Restaurant',
    description: 'Famous Hyderabadi biryani and traditional Mughlai cuisine',
    address: 'Bachupally Main Road, Hyderabad',
    contactPhone: '+91 40 3355 6677',
    priceRange: '₹200 - ₹800',
    workingHours: '11:00 AM - 11:00 PM',
    location: { type: 'Point', coordinates: [78.3932, 17.5449] }
  },
  {
    name: 'Cafe Coffee Day',
    category: 'Food',
    subcategory: 'Cafe',
    description: 'Popular coffee chain with beverages, snacks, and comfortable seating',
    address: 'Nizampet Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 5577 8899',
    priceRange: '₹100 - ₹500',
    workingHours: '9:00 AM - 11:00 PM',
    location: { type: 'Point', coordinates: [78.3923, 17.5452] }
  },
  {
    name: 'Domino\'s Pizza Bachupally',
    category: 'Food',
    subcategory: 'Fast Food',
    description: 'Fresh pizzas, pasta, and sides with quick delivery service',
    address: 'Bachupally Village, Hyderabad',
    contactPhone: '+91 40 7799 0011',
    priceRange: '₹150 - ₹1000',
    workingHours: '11:00 AM - 11:00 PM',
    location: { type: 'Point', coordinates: [78.3938, 17.5446] }
  },
  {
    name: 'Bachupally Tiffin Center',
    category: 'Food',
    subcategory: 'Tiffin Center',
    description: 'South Indian breakfast items including idli, dosa, and vada',
    address: 'Miyapur Road, Bachupally, Hyderabad',
    contactPhone: '+91 40 9900 1122',
    priceRange: '₹30 - ₹200',
    workingHours: '6:00 AM - 11:00 AM, 4:00 PM - 9:00 PM',
    location: { type: 'Point', coordinates: [78.3920, 17.5454] }
  }
];

// Seed function
const seedServices = async () => {
  try {
    await connectDB();

    console.log('Starting bulk insert of Bachupally services...');
    console.log(`Total services to insert: ${bachupallyServices.length}`);

    let inserted = 0;
    let duplicates = 0;
    let errors = [];

    for (let i = 0; i < bachupallyServices.length; i++) {
      try {
        // Add city and area to each service
        const serviceWithLocation = {
          ...bachupallyServices[i],
          city: 'Hyderabad',
          area: 'Bachupally'
        };
        
        await Service.create(serviceWithLocation);
        inserted++;
        console.log(`✓ Inserted: ${bachupallyServices[i].name}`);
      } catch (error) {
        if (error.code === 11000) {
          duplicates++;
          console.log(`⊘ Duplicate skipped: ${bachupallyServices[i].name}`);
        } else {
          errors.push({
            name: bachupallyServices[i].name,
            error: error.message
          });
          console.log(`✗ Error: ${bachupallyServices[i].name} - ${error.message}`);
        }
      }
    }

    console.log('\n========== SEED SUMMARY ==========');
    console.log(`Total services: ${bachupallyServices.length}`);
    console.log(`Successfully inserted: ${inserted}`);
    console.log(`Duplicates skipped: ${duplicates}`);
    console.log(`Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\nError details:');
      errors.forEach(err => {
        console.log(`  - ${err.name}: ${err.error}`);
      });
    }

    console.log('==================================\n');
    console.log('Seeding completed!');
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run seed function
seedServices();
