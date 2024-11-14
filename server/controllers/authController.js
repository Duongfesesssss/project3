const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Hàm đăng ký
const register = async (req, res) => {
    try {
        const userData = req.body;
        // Kiểm tra nếu email đã tồn tại
        const existingUser = await User.findByEmail(userData.email);
        if (existingUser) {
            return res.status(400).send('Email này đã được đăng ký.');
        }

        // Tạo tài khoản người dùng mới
        await User.create(userData);
        res.status(201).send('Tài khoản đã được đăng ký thành công.');
    } catch (error) {
        console.error('Lỗi trong quá trình đăng ký:', error);
        res.status(500).send('Đã xảy ra lỗi từ server.');
    }
};

// Hàm đăng nhập
const login = async (req, res) => {
    try {
        const { user_name, password } = req.body;
        // Tìm người dùng qua username
        const user = await User.findByUsername(user_name);
        if (!user) {
            return res.status(400).send('Tài khoản không tồn tại.');
        }

        // So sánh mật khẩu người dùng nhập với mật khẩu đã băm trong DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Mật khẩu không đúng.');
        }

        // Tạo token JWT
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Lỗi trong quá trình đăng nhập:', error);
        res.status(500).send('Đã xảy ra lỗi từ server.');
    }
};

module.exports = { register, login };
