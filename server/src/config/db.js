// Load environment variables specifically for database configuration
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') }); // Path relative to src/config -> server/.env

const config = {
  mongoURI: process.env.MONGODB_URI, // Correct key name and ensure it's loaded
  dbName: process.env.DB_NAME || 'fileShareDB' 
};

module.exports = config; 