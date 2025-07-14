const mongoose = require('mongoose');

const inventoryHistorySchema = new mongoose.Schema({
  book_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Book', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['IMPORT', 'EXPORT'], 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true 
  },
  unit_price: { 
    type: Number, 
    required: true 
  },
  total_amount: { 
    type: Number, 
    required: true 
  },
  supplier_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier',
    required: function() { return this.type === 'IMPORT'; }
  },
  order_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order',
    required: function() { return this.type === 'EXPORT'; }
  },
  user_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  notes: { 
    type: String, 
    default: '' 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'COMPLETED', 'CANCELLED'], 
    default: 'COMPLETED' 
  },
  stock_before: { 
    type: Number, 
    required: true 
  },
  stock_after: { 
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

// Index để tăng hiệu suất truy vấn
inventoryHistorySchema.index({ book_id: 1, created_at: -1 });
inventoryHistorySchema.index({ type: 1, created_at: -1 });
inventoryHistorySchema.index({ user_id: 1, created_at: -1 });

// Middleware để cập nhật updated_at
inventoryHistorySchema.pre('save', function (next) {
  if (!this.isNew) {
    this.updated_at = Date.now();
  }
  next();
});

const InventoryHistory = mongoose.model('InventoryHistory', inventoryHistorySchema);

module.exports = InventoryHistory;
