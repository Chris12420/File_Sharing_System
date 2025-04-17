const mongoose = require('mongoose');

const geolocationLogSchema = new mongoose.Schema({
  ip: { type: String },
  city: { type: String },
  region: { type: String }, // e.g., state or province
  country: { type: String }, // e.g., US, CA
  latitude: { type: Number },
  longitude: { type: Number },
  timestamp: { type: Date, default: Date.now }
});

// Optional: Index country and timestamp for faster querying
geolocationLogSchema.index({ country: 1 });
geolocationLogSchema.index({ timestamp: -1 });

const GeolocationLog = mongoose.model('GeolocationLog', geolocationLogSchema);

module.exports = GeolocationLog; 