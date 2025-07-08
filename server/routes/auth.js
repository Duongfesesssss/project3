const express = require('express');
const router = express.Router();
const { register, login, forgotPassword, resetPassword, logout, user } = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validation');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/authMiddleware');
const { refreshToken, revokeToken } = require('../middleware/tokenManager');

// Đăng ký
router.post('/register', authLimiter, validate(schemas.register), register);

// Đăng nhập
router.post('/login', authLimiter, validate(schemas.login), login);

// Quên mật khẩu
router.post('/forgot-password', passwordResetLimiter, validate(schemas.forgotPassword), forgotPassword);

// Đặt lại mật khẩu
router.post('/reset-password', passwordResetLimiter, validate(schemas.resetPassword), resetPassword);

// Làm mới token
router.post('/refresh-token', refreshToken);

// Thu hồi token
router.post('/revoke-token', revokeToken);

// Đăng xuất
router.post('/logout', authenticate, logout);

// Lấy thông tin người dùng
router.get('/user', authenticate, user);

module.exports = router;
