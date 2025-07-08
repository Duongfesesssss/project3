const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { isTokenBlacklisted } = require('./tokenManager');
require('dotenv').config();

// Middleware for authentication
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'ERROR',
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }

    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        status: 'ERROR',
        success: false,
        message: 'Token đã bị vô hiệu hóa'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        status: 'ERROR',
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'ERROR',
      success: false,
      message: 'Token không hợp lệ'
    });
  }
};

// Middleware for role-based authorization
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'ERROR',
        success: false,
        message: 'Bạn cần đăng nhập để truy cập'
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'ERROR',
        success: false,
        message: 'Bạn không có quyền truy cập trang này'
      });
    }
    
    next();
  };
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      status: 'ERROR',
      success: false,
      message: 'Bạn không có quyền truy cập trang này'
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  isAdmin
};