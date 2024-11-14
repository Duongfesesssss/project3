const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// Đăng ký
router.post('/register', register);

// Đăng nhập
router.post('/login', login);


module.exports = router;
