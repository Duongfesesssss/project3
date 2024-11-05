const User = require('../models/userModel'); // Đảm bảo đường dẫn đúng đến model User
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Hàm đăng ký
const register = async (req, res) => {
    try {
        const userData = req.body;
        const existingUser = await User.findByEmail(userData.email);
        if (existingUser) {
            return res.status(400).send('User already exists.');
        }

        await User.create(userData);
        res.status(201).send('User registered successfully.');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Internal server error.');
    }
};

// Hàm đăng nhập
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).send('Invalid email or password.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid email or password.');
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal server error.');
    }
};

module.exports = { register, login };
