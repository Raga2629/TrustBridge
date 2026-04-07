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

const checkServices = async () => {
  try {
    await connectDB();
    
    console.log('\n📊 SERVICES BY AREA\n');
    console.log('='.repeat(60));
    
    // Check Bachupally
    const bachupallyServices = await Service.find({ area: /bachupally/i }).select('name area category');
    console.log(`\n🏘️  BACHUPALLY: ${bachupallyServices.length} services`);
    bachupallyServices.slice(0, 5).forEach(s => {
      console.log(`   - ${s.name} (${s.category}) - Area: ${s.area}`);
    });
    if (bachupallyServices.length > 5) console.log(`   ... and ${bachupallyServices.length - 5} more`);
    
    // Check Secunderabad
    const secunderabadServices = await Service.find({ area: /secunderabad/i }).select('name area category');
    console.log(`\n🏘️  SECUNDERABAD: ${secunderabadServices.length} services`);
    secunderabadServices.slice(0, 5).forEach(s => {
      console.log(`   - ${s.name} (${s.category}) - Area: ${s.area}`);
    });
    if (secunderabadServices.length > 5) console.log(`   ... and ${secunderabadServices.length - 5} more`);
    
    // Check Miyapur
    const miyapurServices = await Service.find({ area: /miyapur/i }).select('name area category');
    console.log(`\n🏘️  MIYAPUR: ${miyapurServices.length} services`);
    miyapurServices.slice(0, 5).forEach(s => {
      console.log(`   - ${s.name} (${s.category}) - Area: ${s.area}`);
    });
    if (miyapurServices.length > 5) console.log(`   ... and ${miyapurServices.length - 5} more`);
    
    console.log('\n' + '='.repeat(60));
    console.log(`\n📈 TOTAL: ${bachupallyServices.length + secunderabadServices.length + miyapurServices.length} services across all areas\n`);
    
    // Show some specific Miyapur services
    if (miyapurServices.length > 0) {
      console.log('\n🔍 MIYAPUR SERVICES DETAIL:');
      miyapurServices.forEach(s => {
        console.log(`   ✓ ${s.name} - ${s.category} - ${s.area}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkServices();
