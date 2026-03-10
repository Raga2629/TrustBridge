require('dotenv').config();
const mongoose = require('mongoose');
const Service = require('./models/Service');

const checkImages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const foodServices = await Service.find({ 
      category: 'Food',
      area: 'Bachupally'
    }).select('name serviceImageUrl').limit(5);

    console.log('First 5 Food Services in Bachupally:\n');
    foodServices.forEach((service, index) => {
      console.log(`${index + 1}. ${service.name}`);
      console.log(`   Image: ${service.serviceImageUrl}\n`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkImages();
