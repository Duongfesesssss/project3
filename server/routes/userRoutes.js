const express = require('express');
const { register, login } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Route đăng ký
router.post('/register', register);

// Route đăng nhập
router.post('/login', login);

// Route yêu cầu xác thực cho người dùng
router.get('/profile', authenticate, (req, res) => {
    res.json({
        status: 'OK',
        success: true,
        message: `Welcome, user ${req.user.email}`,
        user: req.user
    });
});

// Route admin only
router.get('/admin', authenticate, authorize(['admin']), (req, res) => {
    res.json({
        status: 'OK',
        success: true,
        message: 'Welcome Admin!'
    });
});

module.exports = router;
    