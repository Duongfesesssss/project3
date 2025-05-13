const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, logout, user } = require('../controllers/authController');
// Đăng ký
router.post('/register', register);

// Đăng nhập
router.post('/login', login);

// Quên mật khẩu
router.post('/forgot-password' , forgotPassword);

// Đặt lại mật khẩu
router.post('/reset-password', resetPassword);

// Đăng xuất
router.get('/logout', logout);

// Lấy thông tin người dùng
router.get('/user', user);

module.exports = router;
