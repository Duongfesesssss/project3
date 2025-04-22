const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');

const login = async (req, res) => {
  try {
    const { user_name, password } = req.body;

    // Tìm người dùng theo user_name
    const user = await User.findOne({ user_name });
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Sai mật khẩu' });
    }

    // Tạo token
    const access_token = jwt.sign(
      { id: user._id, user_name: user.user_name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      status: 'OK', 
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        access_token,
        user: {
          id: user._id,
          user_name: user.user_name,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error('Lỗi trong quá trình đăng nhập:', error);
    res.status(500).json({ status: 'ERROR',success: false, message: 'Lỗi server' });
  }
};

const register = async (req, res) => {
  try {
    const { user_name, email, password } = req.body;

    // Kiểm tra xem người dùng đã tồn tại chưa
    const existingUser = await User.findOne({ $or: [{ user_name }, { email }] });
    if (existingUser) {
      return res.status(400).json({status: 'ERROR',success: false, message: 'Tên người dùng hoặc email đã tồn tại' });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const newUser = new User({
      user_name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({status: 'OK', success: true, message: 'Đăng ký thành công', user: newUser });
  } catch (error) {
    console.error('Lỗi trong quá trình đăng ký:', error);
    res.status(500).json({status: 'ERROR',success: false, message: 'Lỗi server' });
  }
};

module.exports = { login, register };