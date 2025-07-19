const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
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
  }],
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  payment_method: {
    type: String,
    enum: ['cod', 'bank_transfer', 'payos'],
    default: 'cod'
  },
  shipping_address: {
    type: String
  },
  total_amount: {
    type: Number,
    min: 0
  },
  voucher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Voucher',
    required: false
  },
  note: {
    type: String
  },
  orderCode: {
    type: Number,
    unique: true
  }
}, {
  timestamps: true
});

orderSchema.index({ user_id: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
