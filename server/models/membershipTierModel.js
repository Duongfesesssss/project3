const mongoose = require('mongoose');

const membershipTierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  min_points: {
    type: Number,
    default: 0,
    min: 0
  },
  min_lifetime_spend: {
    type: Number,
    default: 0,
    min: 0
  },
  discount_rate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  benefits: {
    type: [String],
    default: []
  },
  priority: {
    type: Number,
    required: true,
    default: 1
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

membershipTierSchema.index({ priority: 1 });

membershipTierSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const MembershipTier = mongoose.model('MembershipTier', membershipTierSchema);

module.exports = MembershipTier;


