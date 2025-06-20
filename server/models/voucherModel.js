const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  discount: {
    type: Number,
    required: true
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