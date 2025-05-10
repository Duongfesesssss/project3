const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
  },
  valid_from: {
    type: Date,
    required: true,
  },
  valid_until: {
    type: Date,
    required: true,
  },
  usage_limit: {
    type: Number,
    required: true,
    min: 1,
  },
  used_count: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

const Voucher = mongoose.model('Voucher', voucherSchema);
module.exports = Voucher;
