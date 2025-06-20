const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  // _id: { type: Number, required: true }, // Bỏ dòng này để MongoDB tự sinh ObjectId
  name: {
    type: String,
    required: true,
    trim: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active',
  },
  description: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  logo: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Tạo index cho tìm kiếm
supplierSchema.index({ name: 'text', description: 'text' });

const Supplier = mongoose.model('Supplier', supplierSchema);

module.exports = Supplier; 