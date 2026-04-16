require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedUser = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Create a dummy user
    const dummyUser = new User({
      name: 'Test Setup User',
      phone: '1234567000',
      role: 'citizen',
      district: 'City Center',
      location: {
        type: 'Point',
        coordinates: [78.6569, 10.7905] // Dummy coordinates (Trichy, Tamil Nadu)
      }
    });

    await dummyUser.save();
    console.log('✅ Dummy user saved successfully! The "users" collection should now exist.');

  } catch (error) {
    // If the error is a duplicate key error for phone, it means the user already exists
    if (error.code === 11000) {
        console.log('✅ Dummy user already exists in the database. The "users" collection is active.');
    } else {
        console.error('❌ Failed to save user:', error.message);
    }
  } finally {
    // Disconnect so the script finishes
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seedUser();
