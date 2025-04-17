const mongoose = require('mongoose');

const geographicalMetricsSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: false
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    country: {
        type: String,
        required: false,
        default: 'Unknown'
    },
    region: {
        type: String,
        required: false,
        default: 'Unknown'
    },
    city: {
        type: String,
        required: false,
        default: 'Unknown'
    },
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    deviceType: {
        type: String,
        required: false,
        default: 'desktop'
    },
    browser: {
        type: String,
        required: false,
        default: 'Unknown'
    },
    operatingSystem: {
        type: String,
        required: false,
        default: 'Unknown'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
geographicalMetricsSchema.index({ timestamp: -1 });
geographicalMetricsSchema.index({ country: 1 });
geographicalMetricsSchema.index({ city: 1 });
geographicalMetricsSchema.index({ browser: 1 });
geographicalMetricsSchema.index({ deviceType: 1 });

const GeographicalMetrics = mongoose.model('GeographicalMetrics', geographicalMetricsSchema);

module.exports = GeographicalMetrics; 