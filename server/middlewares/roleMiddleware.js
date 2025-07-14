const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware kiểm tra authentication
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: 'ERROR',
        success: false,
        message: 'Không có token, truy cập bị từ chối'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Lấy thông tin user từ database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        status: 'ERROR',
        success: false,
        message: 'Token không hợp lệ, người dùng không tồn tại'
      });
    }

    // Kiểm tra tài khoản có bị khóa không
    if (!user.is_active) {
      return res.status(403).json({
        status: 'ERROR',
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Lỗi authentication:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    return res.status(403).json({
      status: 'ERROR',
      success: false,
      message: 'Token không hợp lệ'
    });
  }
};

// Middleware kiểm tra quyền hạn
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'ERROR',
        success: false,
        message: 'Chưa xác thực người dùng'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'ERROR',
        success: false,
        message: 'Không có quyền truy cập chức năng này'
      });
    }

    next();
  };
};

// Middleware chỉ cho admin
const adminOnly = authorize('admin');

// Middleware cho admin và staff
const staffAndAdmin = authorize('admin', 'staff');

// Middleware cho tất cả user đã đăng nhập
const authenticatedOnly = authenticateToken;

module.exports = {
  authenticateToken,
  authorize,
  adminOnly,
  staffAndAdmin,
  authenticatedOnly
};
