const mongoose = require('mongoose');

const supportThreadSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    current_mode: { type: String, enum: ['admin', 'ai'], default: 'admin' },
    last_message_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

supportThreadSchema.index({ user_id: 1 });
supportThreadSchema.index({ status: 1, last_message_at: -1 });

module.exports = mongoose.model('SupportThread', supportThreadSchema);
