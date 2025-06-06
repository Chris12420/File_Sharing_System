// Load environment variables from server directory
const path = require('path');
// For production on Render, rely on environment variables set in the dashboard
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Keep for local dev if needed, but Render uses its own env vars

// Cron Job - Note: May not run reliably on Render free tier due to sleeping instances
const { scheduleDailyPageViewReset } = require('./cron/cronJobs.js');
scheduleDailyPageViewReset();

// Import necessary modules
const express = require('express');
const cors = require('cors');
const connectDB = require('./db/connect'); // Path is now correct
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Connect to Database
connectDB();

// Initialize the Express application
const app = express();

// --- Trust Proxy ---
// Necessary for secure cookies when behind a reverse proxy like Render's
// Trust the first proxy (Render's load balancer)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// --- CORS Configuration ---
// Define allowed origins
const allowedOrigins = [
  'https://file-sharing-system-3.onrender.com',
  'https://file-sharing-system-1-h36c.onrender.com',
  'https://file-sharing-system-phi.vercel.app', // Vercel main domain
  'https://file-sharing-system-git-main-chris-projects-afd41ab0.vercel.app', // Vercel preview domain 1
  'https://file-sharing-system-lj26933kt-chris-projects-afd41ab0.vercel.app', // Vercel preview domain 2
  'https://chris12420.github.io/File_Sharing_System', // GitHub Pages domain
  'http://localhost:3000' // Local development
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    // and requests from allowedOrigins
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) { // Use startsWith or regex for flexibility
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow sending cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// --- CORS Configuration End ---


// Middleware setup
// Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // If you handle form data

// Import and use the Geo Metrics Collector Middleware
const geoMetricsCollector = require('./middleware/geoMetricsCollector');
app.use(geoMetricsCollector); // Apply middleware globally

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
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (needs HTTPS)
    httpOnly: true, // Prevent client-side JS from accessing the cookie
    maxAge: 1000 * 60 * 60 * 24, // Cookie expiration time (e.g., 1 day)
    // Use 'none' for cross-site cookies (Vercel <-> Render) in production
    // Use 'lax' for local development or same-site scenarios
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Define a simple root route.
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the File Sharing System API!' });
});

// --- Add API routes here ---
const fileRoutes = require('./routes/fileRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes.js');
const groupRoutes = require('./routes/groupRoutes');
const settingRoutes = require('./routes/settingRoutes');
const geoMetricsRoutes = require('./routes/geoMetricsRoutes');

app.use('/api/analytics', analyticsRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/geo-metrics', geoMetricsRoutes);

// Define the port
const PORT = process.env.PORT || 5001; // Use environment variable or default to 5001

// Start the server
console.log(`Attempting to start server on port ${PORT}...`); // Added log
const server = app.listen(PORT, () => { // Assign to 'server' variable
  console.log(`Server successfully started and running on port ${PORT}`); // Modified log
});

// Add error handling for the server instance
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string'
    ? 'Pipe ' + PORT
    : 'Port ' + PORT;

  // Handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      console.error('Server startup failed with error:', error); // Log the full error
      throw error;
  }
});

module.exports = app; // Export the app for potential testing