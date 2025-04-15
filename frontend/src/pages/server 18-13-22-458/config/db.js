require('dotenv').config(); // Ensure environment variables are loaded

const config = {
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fileShareDB',
  dbName: process.env.DB_NAME || 'fileShareDB' // You might derive this from the URI or keep it separate
};

module.exports = config; 