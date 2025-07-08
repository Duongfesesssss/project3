const mongoose = require('mongoose');
const { createIndexes } = require('./config/dbIndexes');
require('dotenv').config();

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      dbName: 'BookStoreDB',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully!');
    
    // Create indexes for performance optimization
    await createIndexes();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = { connectToDB };
