const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if test user exists
    const existingUser = await User.findOne({ email: 'test@test.com' });
    
    if (existingUser) {
      console.log('Test user already exists!');
      console.log('Email: test@test.com');
      console.log('Password: test123');
      process.exit(0);
    }

    // Create test user
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const testUser = await User.create({
      name: 'Test User',
      email: 'test@test.com',
      password: hashedPassword,
      phone: '1234567890',
      role: 'USER',
      city: 'Hyderabad',
      isVerified: true
    });

    console.log('✅ Test user created successfully!');
    console.log('Email: test@test.com');
    console.log('Password: test123');
    console.log('Role: USER');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestUser();
