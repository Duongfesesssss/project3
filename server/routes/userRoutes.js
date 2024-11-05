const express = require('express');
const { register, login } = require('../controllers/authController');
const { authMiddleware, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

// Route đăng ký
router.post('/register', register);

// Route đăng nhập
router.post('/login', login);

// Route yêu cầu xác thực cho người dùng
router.get('/profile', authMiddleware, (req, res) => {
    res.send(`Welcome, user ${req.user.email}`);
});

// Route yêu cầu xác thực và phân quyền (chỉ cho admin)
router.get('/admin', authMiddleware, authorize(['admin']), (req, res) => {
    res.send('Welcome Admin!');
});

module.exports = router;
    