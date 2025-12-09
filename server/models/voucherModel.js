const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  discount: {
    type: Number,
    required: true
  },
  discount_type: {
    type: String,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  max_discount: {
    type: Number,
    default: null
  },
  valid_from: {
    type: Date,
    required: true
  },
  valid_until: {
    type: Date,
    required: true
  },
  usage_limit: {
    type: Number,
    required: true
  },
  used_count: {
    type: Number,
    default: 0
  },
  min_order_value: {
    type: Number,
    required: true
  },
  visibility: {
    type: String,
    enum: ['private', 'public'],
    default: 'private'
  },
  owner_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  source: {
    type: String,
    default: 'manual'
  },
  auto_generated: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  metadata: {
    type: Object,
    default: {}
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

const Voucher = mongoose.model('Voucher', voucherSchema);

const voucherUsageSchema = new mongoose.Schema({
  voucher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  used_at: {
    type: Date,
    default: Date.now
  }
});

const VoucherUsage = mongoose.model('VoucherUsage', voucherUsageSchema);

module.exports = { Voucher, VoucherUsage }; 