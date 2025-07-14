const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, logout, user, updateProfile, changePassword, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/roleMiddleware');

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

// ========== PROTECTED ROUTES (cần đăng nhập) ==========
router.use(authenticateToken); // Từ đây trở xuống cần đăng nhập

// Lấy thông tin profile người dùng hiện tại
router.get('/profile', getProfile);

// Cập nhật thông tin profile
router.put('/update-profile', updateProfile);

// Đổi mật khẩu
router.put('/change-password', changePassword);

module.exports = router;
