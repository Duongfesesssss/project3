const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema(
  {
    thread_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportThread', required: true },
    sender_role: { type: String, enum: ['user', 'admin', 'ai'], required: true },
    sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    mode: { type: String, enum: ['admin', 'ai'], default: 'admin' },
  },
  { timestamps: true }
);

supportMessageSchema.index({ thread_id: 1, createdAt: 1 });

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
