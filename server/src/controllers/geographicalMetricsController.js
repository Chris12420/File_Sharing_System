const GeographicalMetrics = require('../models/GeographicalMetrics');
const geoip = require('geoip-lite');
const UAParser = require('ua-parser-js');

/**
 * Get geographical metrics aggregated by country
 */
const getCountryMetrics = async (req, res) => {
  try {
    // Get metrics grouped by country
    const countryMetrics = await GeographicalMetrics.aggregate([
      { 
        $match: { 
          country: { $exists: true, $ne: null } 
        } 
      },
      { 
        $group: { 
          _id: "$country", 
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$deviceType" },
          regionCount: { $addToSet: "$region" }
        } 
      },
      { 
        $project: {
          country: "$_id", 
          visits: 1,
          uniqueVisitorCount: { $size: "$uniqueVisitors" },
          regionCount: { $size: "$regionCount" },
          _id: 0
        } 
      },
      { $sort: { visits: -1 } }
    ]);

    // Get total visits and unique visitors for percentages
    const totals = await GeographicalMetrics.aggregate([
      {
        $group: {
          _id: null,
          totalVisits: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$deviceType" }
        }
      },
      {
        $project: {
          totalVisits: 1,
          uniqueVisitorCount: { $size: "$uniqueVisitors" },
          _id: 0
        }
      }
    ]);

    const total = totals.length > 0 ? totals[0] : { totalVisits: 0, uniqueVisitorCount: 0 };

    // Add percentage data to each country
    const countriesWithPercentages = countryMetrics.map(country => ({
      ...country,
      visitPercentage: total.totalVisits ? ((country.visits / total.totalVisits) * 100).toFixed(1) : "0",
      visitorPercentage: total.uniqueVisitorCount ? ((country.uniqueVisitorCount / total.uniqueVisitorCount) * 100).toFixed(1) : "0"
    }));

    res.status(200).json({
      totalRecords: total.totalVisits,
      uniqueVisitors: total.uniqueVisitorCount,
      countries: countriesWithPercentages
    });
  } catch (error) {
    console.error('Error getting country metrics:', error);
    res.status(500).json({ message: 'Error retrieving country metrics' });
  }
};

/**
 * Get geographical metrics aggregated by city
 */
const getCityMetrics = async (req, res) => {
  try {
    // Get metrics grouped by city
    const cityMetrics = await GeographicalMetrics.aggregate([
      { 
        $match: { 
          city: { $exists: true, $ne: null } 
        } 
      },
      { 
        $group: { 
          _id: { city: "$city", region: "$region", country: "$country" }, 
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: "$deviceType" },
          coordinates: { $first: "$coordinates" }
        } 
      },
      { 
        $project: {
          city: "$_id.city", 
          region: "$_id.region",
          country: "$_id.country",
          coordinates: 1,
          visits: 1,
          uniqueVisitorCount: { $size: "$uniqueVisitors" },
          _id: 0
        } 
      },
      { $sort: { visits: -1 } },
      { $limit: 100 } // Limit to top 100 cities
    ]);

    // Get total number of cities
    const cityCount = await GeographicalMetrics.aggregate([
      { 
        $match: { 
          city: { $exists: true, $ne: null } 
        } 
      },
      {
        $group: {
          _id: { city: "$city", country: "$country" }
        }
      },
      {
        $count: "totalCities"
      }
    ]);

    const totalCities = cityCount.length > 0 ? cityCount[0].totalCities : 0;

    res.status(200).json({
      totalCities,
      cities: cityMetrics
    });
  } catch (error) {
    console.error('Error getting city metrics:', error);
    res.status(500).json({ message: 'Error retrieving city metrics' });
  }
};

/**
 * Get browser usage statistics
 */
const getBrowserStats = async (req, res) => {
  try {
    const browserStats = await GeographicalMetrics.aggregate([
      {
        $match: {
          browser: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: "$browser",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          browser: "$_id",
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const total = await GeographicalMetrics.countDocuments({
      browser: { $exists: true, $ne: null }
    });
    
    const browsersWithPercentages = browserStats.map(item => ({
      ...item,
      percentage: total ? ((item.count / total) * 100).toFixed(1) : "0"
    }));
    
    res.status(200).json({
      totalRecords: total,
      browsers: browsersWithPercentages
    });
  } catch (error) {
    console.error('Error getting browser statistics:', error);
    res.status(500).json({ message: 'Error retrieving browser statistics' });
  }
};

/**
 * Get device type statistics
 */
const getDeviceStats = async (req, res) => {
  try {
    const deviceStats = await GeographicalMetrics.aggregate([
      {
        $match: {
          deviceType: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: "$deviceType",
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          deviceType: "$_id",
          count: 1,
          _id: 0
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const total = await GeographicalMetrics.countDocuments({
      deviceType: { $exists: true, $ne: null }
    });
    
    const devicesWithPercentages = deviceStats.map(item => ({
      ...item,
      percentage: total ? ((item.count / total) * 100).toFixed(1) : "0"
    }));
    
    res.status(200).json({
      totalRecords: total,
      devices: devicesWithPercentages
    });
  } catch (error) {
    console.error('Error getting device statistics:', error);
    res.status(500).json({ message: 'Error retrieving device statistics' });
  }
};

/**
 * Store new geographical metrics data from request info
 */
const storeMetrics = async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Parse IP for geo information
    const geo = geoip.lookup(ip);
    
    // Parse user agent for browser and device info
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || 'Unknown';
    const os = parser.getOS().name || 'Unknown';
    const device = parser.getDevice().type || 'desktop';
    
    // Create geo metrics object
    const geoMetric = new GeographicalMetrics({
      ip: ip.replace(/^.*:/, ''), // Clean IPv6 prefix if present
      timestamp: new Date(),
      country: geo ? geo.country : 'Unknown',
      region: geo ? geo.region : 'Unknown',
      city: geo ? geo.city : 'Unknown',
      coordinates: geo ? {
        latitude: geo.ll[0],
        longitude: geo.ll[1]
      } : null,
      browser: browser,
      operatingSystem: os,
      deviceType: device
    });
    
    await geoMetric.save();
    
    res.status(201).json({
      success: true,
      message: 'Geo metrics recorded successfully'
    });
  } catch (error) {
    console.error('Error storing geographical metrics:', error);
    res.status(500).json({ message: 'Error storing geographical metrics' });
  }
};

/**
 * Get summary of all geo metrics data
 */
const getMetricsSummary = async (req, res) => {
  try {
    const totalVisits = await GeographicalMetrics.countDocuments();
    const uniqueCountries = await GeographicalMetrics.distinct('country');
    const uniqueCities = await GeographicalMetrics.distinct('city');
    
    res.status(200).json({
      totalVisits,
      uniqueCountries: uniqueCountries.length,
      uniqueCities: uniqueCities.length
    });
  } catch (error) {
    console.error('Error getting metrics summary:', error);
    res.status(500).json({ message: 'Error retrieving metrics summary' });
  }
};

module.exports = {
  getCountryMetrics,
  getCityMetrics,
  getBrowserStats,
  getDeviceStats,
  storeMetrics,
  getMetricsSummary
}; 