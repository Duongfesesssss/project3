const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Script tạo admin đầu tiên - chỉ chạy 1 lần
const createInitialAdmin = async () => {
  try {
    // Kiểm tra xem đã có admin chưa
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin đã tồn tại:', existingAdmin.user_name);
      return;
    }

    // Tạo admin đầu tiên
    const adminData = {
      user_name: 'admin',
      email: 'admin@bookstore.com',
      password: await bcrypt.hash('admin123', 10), // Đổi password này
      full_name: 'Administrator',
      role: 'admin',
      is_active: true
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Tạo admin thành công!');
    console.log('Username: admin');
    console.log('Email: admin@bookstore.com');
    console.log('Password: admin123');
    console.log('⚠️  Hãy đổi password sau khi đăng nhập!');
    
  } catch (error) {
    console.error('❌ Lỗi tạo admin:', error);
  }
};

module.exports = { createInitialAdmin };
