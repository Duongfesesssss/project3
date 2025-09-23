const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true // Đảm bảo người dùng đã mua sách
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  helpful_count: {
    type: Number,
    default: 0
  },
  verified_purchase: {
    type: Boolean,
    default: true // Luôn true vì phải mua mới được review
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
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

// Index để tối ưu query
reviewSchema.index({ book_id: 1, created_at: -1 });
reviewSchema.index({ user_id: 1, book_id: 1 }, { unique: true }); // Một user chỉ review một sách một lần

// Middleware để update updated_at
reviewSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Review', reviewSchema);