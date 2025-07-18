const mongoose = require('mongoose');

// Order Schema
const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderCode: {
  type: Number,
  unique: true,
  required: true
},
  order_date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['cod', 'credit_card', 'bank_transfer'],
    required: true
  },
  total_amount: {
    type: Number,
    required: true
  },
  discount_amount: {
    type: Number,
    default: 0
  },
  shipping_address: {
    type: String,
    required: true
  },
  note: {
    type: String,
    default: ''
  },
  voucher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// OrderItem Schema
const orderItemSchema = new mongoose.Schema({
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Virtual populate cho items
orderSchema.virtual('items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'order_id'
});

// Đảm bảo virtuals được include trong JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// Tạo compound index cho order_id và book_id
orderItemSchema.index({ order_id: 1, book_id: 1 }, { unique: true });

// Export models
const Order = mongoose.model('Order', orderSchema);
const OrderItem = mongoose.model('OrderItem', orderItemSchema);

module.exports = {
  Order,
  OrderItem
}; 