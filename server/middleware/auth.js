const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Middleware kiểm tra xác thực
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Không tìm thấy token xác thực'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: 'ERROR',
        message: 'Người dùng không tồn tại'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'ERROR',
      message: 'Token không hợp lệ'
    });
  }
};

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      status: 'ERROR',
      message: 'Bạn không có quyền truy cập trang này'
    });
  }
};

// Middleware kiểm tra quyền quản lý user
const canManageUsers = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.permissions.includes('manage_users'))) {
    next();
  } else {
    return res.status(403).json({
      status: 'ERROR',
      message: 'Bạn không có quyền quản lý người dùng'
    });
  }
};

module.exports = {
  authenticate,
  isAdmin,
  canManageUsers
}; 