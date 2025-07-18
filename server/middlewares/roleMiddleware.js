const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware kiểm tra authentication
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader);
    
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    console.log('Token extracted:', token ? 'Token exists' : 'No token');

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        status: 'ERROR',
        success: false,
        message: 'Không có token, truy cập bị từ chối'
      });
    }

    // Verify token
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    
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
    
    // Xử lý lỗi token hết hạn
    if (error.name === 'TokenExpiredError') {
      return res.status(500).json({
        error: 500,
        message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
        data: null
      });
    }
    
    // Xử lý lỗi token không hợp lệ
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 401,
        message: 'Token không hợp lệ',
        data: null
      });
    }
    
    return res.status(403).json({
      error: 403,
      message: 'Token không hợp lệ',
      data: null
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
