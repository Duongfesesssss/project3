const express = require('express');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const argon2 = require('argon2');

// Đăng ký
router.post('/register', async (req, res) => {
    const { user_name, password, email, phone_number, full_name } = req.body;

    try {
        // Kiểm tra trùng lặp username và email
        const [userByEmail, userByUsername] = await Promise.all([
            User.findByEmail(email),
            User.findByUsername(user_name)
        ]);

        if (userByEmail) {
            return res.status(400).send('Email đã tồn tại trên hệ thống.');
        }

        if (userByUsername) {
            return res.status(400).send('Tài khoản đã tồn tại trên hệ thống.');
        }

        const hashedPassword = await argon2.hash(password);
        await User.create({ user_name, password: hashedPassword, email, phone_number, full_name });
        res.status(201).send('Tài khoản đã được tạo.');
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).send('Server error.');
    }
});


// Đăng nhập
router.post('/login', async (req, res) => {
    const { user_name, password } = req.body;

    try {
        const user = await User.findByUsername(user_name);
        if (!user) {
            return res.status(400).send('Tài khoản không tồn tại.');
        }
    ;

    const isMatch = await argon2.verify(user.password, password);
    console.log('Password match:', isMatch)
        if (!isMatch) {
            return res.status(400).send('Mật khẩu không đúng.');
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Server error.');
    }
});




// Kiểm tra trùng lặp username và email
router.get('/check-username-email', async (req, res) => {
    const { username, email } = req.query;

    try {
        const userByEmail = await User.findByEmail(email);
        const userByUsername = await User.findByUsername(username);

        res.json({
            emailExists: !!userByEmail,
            usernameExists: !!userByUsername
        });
    } catch (error) {
        console.error('Error checking username and email:', error);
        res.status(500).send('Server error.');
    }
});



// Đăng xuất (tùy chọn, không thực sự cần backend)
router.get('/logout', (req, res) => {
    // Client chỉ cần xóa token, không cần xử lý backend
    res.send('Logout successful.');
});


// Lấy thông tin người dùng
router.get('/user', async (req, res) => {
    const username = req.user;
    const user = await User.findByUsername(username)
    console.log(req);
    // try {
    //     const user = await User.findByUsername(username);
    //     if (!user) {
    //         return res.status(404).send('Người dùng không tồn tại.');
    //     }
    //     // Trả về thông tin người dùng (bỏ qua mật khẩu)
    //     res.json({
    //         user_name: user.user_name,
    //         email: user.email,
    //         phone_number: user.phone_number,
    //         full_name: user.full_name,
    //     });
    // } catch (error) {
    //     console.error('Error fetching user info:', error);
    //     res.status(500).send('Server error.');
    // }
});


module.exports = router;

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication operations
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Tạo tài khoản mới
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 example: 'DuongDao'
 *               password:
 *                 type: string
 *                 example: 'Abc123'
 *               email:
 *                 type: string
 *                 example: 'example@example.com'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/auth/user:
 *   post:
 *     tags: [Auth]
 *     summary: Đăng nhập
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 example: 'DuongDao'
 *               password:
 *                 type: string
 *                 example: 'Abc123'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid username or password
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     tags: [Auth]
 *     summary: Lấy thông tin người dùng
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_name:
 *                   type: string
 *                   example: 'DuongDao'
 *                 email:
 *                   type: string
 *                   example: 'example@example.com'
 *                 phone_number:
 *                   type: string
 *                   example: '0123456789'
 *                 full_name:
 *                   type: string
 *                   example: 'Nguyễn Văn A'
 *       404:
 *         description: Người dùng không tồn tại
 *       500:
 *         description: Server error
 */
