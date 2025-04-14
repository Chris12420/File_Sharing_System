// Load environment variables
require('dotenv').config();


const { scheduleDailyPageViewReset } = require('./cronJobs.js'); 
scheduleDailyPageViewReset();



// Import necessary modules
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connect'); // Import DB connection function
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Connect to Database
connectDB();

// Initialize the Express application
const app = express();

// Middleware setup
// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Session middleware setup
app.use(session({
  secret: process.env.SESSION_SECRET, // Use a strong secret from environment variables
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  store: MongoStore.create({ 
    mongoUrl: process.env.MONGODB_URI, // Use the correct environment variable name
    collectionName: 'sessions' // Optional: specify session collection name
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    httpOnly: true, // Prevent client-side JS from accessing the cookie
    maxAge: 1000 * 60 * 60 * 24, // Cookie expiration time (e.g., 1 day)
    sameSite: 'lax' // Allow cross-site requests
  }
}));

// Define a simple root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the File Sharing System API!' });
});

// --- Add API routes here ---
const fileRoutes = require('./routes/fileRoutes'); // Import the file routes
const userRoutes = require('./routes/userRoutes'); // Import the user routes
const authRoutes = require('./routes/authRoutes'); // Import the auth routes
const analyticsRoutes = require('./routes/analyticsRoutes.js'); // Import the analytics routes

app.use('/api/analytics', analyticsRoutes); // Mount the analytics routes under /api/analytics
app.use('/api/files', fileRoutes); // Mount the file routes under /api/files
app.use('/api/users', userRoutes); // Mount the user routes under /api/users
app.use('/api/auth', authRoutes); // Mount the auth routes under /api/auth

// Define the port
const PORT = process.env.PORT || 5001; // Use environment variable or default to 5001

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Export the app for potential testing 