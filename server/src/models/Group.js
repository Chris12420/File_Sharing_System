const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const groupSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  }]
  // Files belonging to the group will reference the group via a groupId field on the File model
}, {
  timestamps: true,
  collection: 'groups' // Explicitly set the collection name
});

// Ensure that a user is only listed once in the members array for a group
groupSchema.index({ _id: 1, 'members.user': 1 }, { unique: true }); 

const Group = mongoose.model('Group', groupSchema);

module.exports = Group; 