const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    user_name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    full_name: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    role: { type: String, default: 'customer' },
    avatar: { type: String, default: '' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  });
  
  // Middleware để cập nhật updated_at trước khi lưu
  userSchema.pre('save', function (next) {
    if (!this.isNew) {
      this.updated_at = Date.now();
    }
    next();
  });

const User = mongoose.model('User', userSchema);

module.exports = User;