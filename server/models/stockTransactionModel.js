const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  type: {
    type: String,
    enum: ['stock_in', 'stock_out'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  created_by: {
    type: String, // Username hoặc ID user
    required: true
  },
  before_quantity: {
    type: Number,
    required: true
  },
  after_quantity: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Index để query nhanh hơn
stockTransactionSchema.index({ book_id: 1, createdAt: -1 });
stockTransactionSchema.index({ type: 1, createdAt: -1 });

const StockTransaction = mongoose.model('StockTransaction', stockTransactionSchema);

module.exports = StockTransaction;
