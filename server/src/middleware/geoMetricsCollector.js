const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');
const GeographicalMetrics = require('../models/GeographicalMetrics');
const mongoose = require('mongoose');

/**
 * Middleware that collects geographical metrics from incoming requests
 * Excludes API calls to prevent recursion and certain paths like static resources
 */
const geoMetricsCollector = (req, res, next) => {
  // Continue with the request immediately - don't block
  next();
  
  // Skip certain paths to avoid recursion and unnecessary tracking
  const skipPaths = ['/api/health', '/favicon.ico'];
  // Skip specific API groups (like those called by the dashboard itself) and static resources
  const skipPathsPrefixes = [
    '/static/', 
    '/assets/', 
    '/images/', 
    '/css/', 
    '/js/', 
    '/api/geo-metrics/',  // Skip geo-metrics API calls
    '/api/analytics/'     // Skip analytics API calls
  ];
  
  // Skip specific API calls, static resources and non-GET requests
  // Use req.originalUrl for prefix check as req.path might be modified by routers
  const shouldSkip = 
    skipPaths.includes(req.originalUrl) ||
    skipPathsPrefixes.some(prefix => req.originalUrl.startsWith(prefix)) ||
    req.method !== 'GET'; // Only track GET requests
  
  if (shouldSkip) {
    return;
  }
  
  // Check if MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    console.warn('MongoDB not connected, skipping metrics collection');
    return;
  }
  
  // Process in the background without blocking
  (async () => {
    try {
      // Extract IP address (handle proxies)
      let ip = req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress || 
               req.ip;
      
      // Clean up IP (remove IPv6 prefix if present)
      if (ip && ip.includes(',')) {
        ip = ip.split(',')[0].trim();
      }
      if (ip && ip.includes('::ffff:')) {
        ip = ip.replace('::ffff:', '');
      }
      
      console.log(`Processing metrics for Original URL: ${req.originalUrl}, Path: ${req.path}, IP: ${ip}`);
      
      // Skip localhost and private IPs for geolocation in development
      // But don't skip in production as Render will provide real IPs
      if ((process.env.NODE_ENV !== 'production') && 
          (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1')) {
        console.log('Localhost detected in non-production env, using test IP');
        // Always use test IP for localhost if not in production
        ip = '8.8.8.8'; // Google DNS IP for testing
        console.log('Using test IP:', ip);
      }
      
      // Parse user agent
      const userAgent = req.headers['user-agent'] || '';
      const parser = new UAParser(userAgent);
      const parsedUA = parser.getResult();
      
      // Get geo information
      const geo = geoip.lookup(ip);
      
      if (!geo) {
        console.warn(`No geolocation data found for IP: ${ip}`);
      } else {
        console.log(`Geo lookup result for ${ip}: ${geo.country}, ${geo.city}`);
      }
      
      // Create metrics entry
      const metrics = new GeographicalMetrics({
        ip: ip,
        timestamp: new Date(),
        country: geo ? geo.country : 'Unknown',
        region: geo ? geo.region : 'Unknown',
        city: geo ? geo.city : 'Unknown',
        coordinates: geo ? {
          latitude: geo.ll[0],
          longitude: geo.ll[1]
        } : null,
        browser: parsedUA.browser.name || 'Unknown',
        deviceType: parsedUA.device.type || 'desktop',
        operatingSystem: parsedUA.os.name || 'Unknown'
      });
      
      const savedMetrics = await metrics.save();
      console.log(`Geo metrics saved successfully with ID: ${savedMetrics._id}`);
      console.log(`Details: Country=${savedMetrics.country}, Browser=${savedMetrics.browser}, Device=${savedMetrics.deviceType}`);
      
    } catch (error) {
      // Don't disrupt the application flow if metrics collection fails
      console.error('Error in geo-metrics collector middleware:', error);
      if (error.name === 'ValidationError') {
        console.error('Validation error details:', error.errors);
      }
    }
  })();
};

module.exports = geoMetricsCollector; 