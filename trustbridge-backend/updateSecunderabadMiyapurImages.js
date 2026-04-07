require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for updating images...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Unique images for each service
const imageUpdates = {
  // SECUNDERABAD SERVICES
  'Sangeeth Restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
  'Satti Babu Biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
  'Prakasham Udupi Tiffins': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800',
  'Vivaha Bhojanambu': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
  
  'Narmada Enterprises': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
  'Farmers Online': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800',
  'Sai Tirumala Medical & General Store': 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800',
  'Sneha Fresh Chicken': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800',
  'Sri Tirumala Grand Bazar': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800',
  'Laxmi Narashima Flour Mill': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800',
  
  'Dr Dinesh Sharma Dental Clinic': 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800',
  'Dr Gogineni Radha Krishna Clinic': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
  'Dr Pradeep Dental Clinic': 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800',
  'Om Sai Dental Clinic': 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800',
  'Radical Homeopathy': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800',
  'Prana Women and Fertility Clinic': 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800',
  
  // MIYAPUR SERVICES
  'Paradise Biryani Miyapur': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=800',
  'Udupi Grand Restaurant': 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=800',
  'Bawarchi Restaurant': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800',
  'Chutneys Restaurant': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800',
  
  'More Supermarket Miyapur': 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=800',
  'Reliance Fresh Miyapur': 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800',
  'Heritage Fresh Miyapur': 'https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=800',
  'Ratnadeep Supermarket Miyapur': 'https://images.unsplash.com/photo-1596791506264-8b6e246d1c6a?w=800',
  'Organic Basket Miyapur': 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=800',
  'Fresh Chicken Center Miyapur': 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=800',
  
  'Apollo Clinic Miyapur': 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800',
  'Dr Reddy Dental Care': 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800',
  'Care Hospital Miyapur': 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800',
  'Smile Dental Clinic': 'https://images.unsplash.com/photo-1609840114035-3c981407e31f?w=800',
  'Wellness Homeopathy Miyapur': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
  'Medicover Hospitals Miyapur': 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800'
};

const updateImages = async () => {
  try {
    await connectDB();
    
    console.log('🖼️  Starting image update for Secunderabad and Miyapur services...\n');
    
    let updated = 0;
    let notFound = 0;
    
    for (const [serviceName, imageUrl] of Object.entries(imageUpdates)) {
      const service = await Service.findOne({ name: serviceName });
      
      if (service) {
        service.serviceImageUrl = imageUrl;
        await service.save();
        console.log(`✓ Updated: ${serviceName}`);
        updated++;
      } else {
        console.log(`✗ Not found: ${serviceName}`);
        notFound++;
      }
    }
    
    console.log('\n=====================================');
    console.log('🎉 IMAGE UPDATE SUMMARY');
    console.log('=====================================');
    console.log(`✓ Successfully updated: ${updated}`);
    console.log(`✗ Not found: ${notFound}`);
    console.log('=====================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating images:', error);
    process.exit(1);
  }
};

updateImages();
