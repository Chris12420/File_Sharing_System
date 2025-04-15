require('dotenv').config();

const config = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/file_sharing',
  dbName: process.env.DB_NAME || 'file_sharing',
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // Add more options as needed
  }
};

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

module.exports = config; 