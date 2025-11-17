const mongoose = require('mongoose');

const memberCardSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true
  },
  tier_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipTier'
  },
  points_balance: {
    type: Number,
    default: 0,
    min: 0
  },
  lifetime_points: {
    type: Number,
    default: 0,
    min: 0
  },
  lifetime_spend: {
    type: Number,
    default: 0,
    min: 0
  },
  last_tier_change: {
    type: Date
  },
  issued_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

memberCardSchema.index({ user_id: 1 });

memberCardSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const MemberCard = mongoose.model('MemberCard', memberCardSchema);

const memberPointHistorySchema = new mongoose.Schema({
  card_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MemberCard',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    enum: ['order', 'review', 'redeem', 'manual', 'adjust'],
    default: 'order'
  },
  type: {
    type: String,
    enum: ['earn', 'spend', 'adjust'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  reference_id: {
    type: mongoose.Schema.Types.Mixed
  },
  metadata: {
    type: Object,
    default: {}
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

memberPointHistorySchema.index({ user_id: 1, created_at: -1 });
memberPointHistorySchema.index({ source: 1, reference_id: 1 }, { unique: false });

const MemberPointHistory = mongoose.model('MemberPointHistory', memberPointHistorySchema);

module.exports = {
  MemberCard,
  MemberPointHistory
};

