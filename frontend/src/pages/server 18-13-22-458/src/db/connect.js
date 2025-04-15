const mongoose = require('mongoose');
const config = require('../config/db');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', config.mongoURI);
    
    const conn = await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,        // Deprecated, but good to keep for older versions
      useUnifiedTopology: true,   // Deprecated, but good to keep for older versions
      // Mongoose 6+ doesn't require the above options, but they don't harm.
      // dbName: config.dbName // Optional: Specify dbName here or in URI
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log('Database name:', conn.connection.name);
    console.log('Connection state:', conn.connection.readyState);
    
    // Add connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (error) {
    console.error('MongoDB connection error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB; 