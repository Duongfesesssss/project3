const express = require('express');
const { register, login } = require('../controllers/authController');
const { authenticateToken, adminOnly } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Route đăng ký
router.post('/register', register);

// Route đăng nhập
router.post('/login', login);

// Route yêu cầu xác thực cho người dùng
router.get('/profile', authenticateToken, (req, res) => {
    res.send(`Welcome, user ${req.user.email}`);
});

router.get('/admin', authenticateToken, adminOnly, (req, res) => {
    res.send('Welcome Admin!');
});

module.exports = router;
    