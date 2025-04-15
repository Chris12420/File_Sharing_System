const mongoose = require('mongoose');

const PageView = mongoose.model('PageView', new mongoose.Schema({
  name: String,
  value: Number,
}));

const UserInteraction = mongoose.model('UserInteraction', new mongoose.Schema({
  action: String,
  count: Number,
}));

const FileTypeDistribution = mongoose.model('FileTypeDistribution', new mongoose.Schema({
  fileName: String,
  value: Number,
}));



module.exports = {
    PageView,
    UserInteraction,
    FileTypeDistribution,
  };