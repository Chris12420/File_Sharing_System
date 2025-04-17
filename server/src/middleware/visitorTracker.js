const { GeoVisit } = require('../models/DataAnalytics');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

/**
 * Middleware to track visitors and collect geographic and device data
 */
const visitorTracker = (req, res, next) => {
  // Continue with the request immediately - don't block
  next();
  
  // Skip certain paths to avoid unnecessary tracking
  const skipPaths = [
    '/api/geo-metrics', 
    '/api/analytics/geo-metrics', 
    '/api/health', 
    '/favicon.ico',
    '/static/',
    '/assets/',
    '/images/',
    '/css/',
    '/js/'
  ];
  
  const path = req.path;
  
  // Skip API and static resources
  if (skipPaths.some(p => path.startsWith(p)) || req.method !== 'GET') {
    return;
  }
  
  // Process the tracking asynchronously (don't block the request)
  (async () => {
    try {
      // Extract IP address with priority order:
      // 1. X-Real-IP (often provided by Nginx)
      // 2. X-Forwarded-For (common for proxies)
      // 3. Socket remote address
      // 4. Request IP property
      let ip = req.headers['x-real-ip'] ||
               req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               req.ip;
      
      // Clean up and normalize IP address
      if (ip && ip.includes(',')) {
        // If multiple IPs in X-Forwarded-For, take the first one (client's real IP)
        ip = ip.split(',')[0].trim();
      }
      
      // Remove IPv6 prefix if present to get clean IPv4
      if (ip && ip.includes('::ffff:')) {
        ip = ip.replace('::ffff:', '');
      }
      
      // Additional cleanup for other IPv6 format variations
      if (ip && (ip === '::1' || ip.startsWith('fc00:') || ip.startsWith('fe80:'))) {
        console.log('Local IPv6 address detected, geo data may not be accurate');
      }
      
      console.log(`Tracking visitor: IP=${ip}, Path=${path}`);
      
      // Parse user agent
      const userAgent = req.headers['user-agent'] || '';
      const parser = new UAParser(userAgent);
      const parsedUA = parser.getResult();
      
      // Get geo information
      const geo = geoip.lookup(ip);
      
      // Create and save visitor data
      const visit = new GeoVisit({
        timestamp: new Date(),
        ipAddress: ip,
        country: geo ? geo.country : 'Unknown',
        region: geo ? geo.region : 'Unknown',
        city: geo ? geo.city : 'Unknown',
        coordinates: geo ? {
          latitude: geo.ll[0],
          longitude: geo.ll[1]
        } : null,
        browser: parsedUA.browser.name || 'Unknown',
        deviceType: parsedUA.device.type || 'desktop',
        operatingSystem: parsedUA.os.name || 'Unknown',
        page: path
      });
      
      await visit.save();
      console.log(`Visit recorded for ${geo ? geo.country : 'Unknown'}, ${geo ? geo.city : 'Unknown'}`);
      
    } catch (error) {
      console.error('Error tracking visitor:', error);
    }
  })();
};

module.exports = visitorTracker; 