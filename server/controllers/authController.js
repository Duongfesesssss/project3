const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Tìm người dùng theo email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Người dùng không tồn tại', 404));
  }

  // Kiểm tra mật khẩu
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return next(new AppError('Sai mật khẩu', 401));
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
        role: user.role
      },
    },
  });
});

const register = asyncHandler(async (req, res, next) => {
  const { user_name, email, password, full_name, phone, address } = req.body;

  // Kiểm tra xem người dùng đã tồn tại chưa
  const existingUser = await User.findOne({ $or: [{ user_name }, { email }] });
  if (existingUser) {
    return next(new AppError('Tên người dùng hoặc email đã tồn tại', 400));
  }

  // Mã hóa mật khẩu
  const hashedPassword = await bcrypt.hash(password, 12);

  // Tạo người dùng mới
  const newUser = new User({
    user_name,
    email,
    password: hashedPassword,
    full_name: full_name || '',
    phone: phone || '',
    address: address || ''
  });

  await newUser.save();

  // Remove password from response
  const userResponse = newUser.toObject();
  delete userResponse.password;

  res.status(201).json({
    status: 'OK', 
    success: true, 
    message: 'Đăng ký thành công', 
    data: userResponse 
  });
});

const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Email không tồn tại', 404));
  }

  // Tạo token đặt lại mật khẩu
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpiry = Date.now() + 3600000; // Token hết hạn sau 1 giờ

  // Lưu token và thời gian hết hạn vào cơ sở dữ liệu
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpiry;
  await user.save();

  // Tạo liên kết đặt lại mật khẩu
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  // Gửi email chứa liên kết đặt lại mật khẩu
  try {
    const transporter = nodemailer.createTransporter({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_HOST,
        pass: process.env.PASSWORD_HOST,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_HOST,
      to: email,
      subject: 'Đặt lại mật khẩu',
      html: `
        <p>Chào ${user.user_name},</p>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấp vào liên kết bên dưới để đặt lại mật khẩu:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      status: 'OK', 
      success: true, 
      message: 'Đã gửi email đặt lại mật khẩu!' 
    });
  } catch (error) {
    // Reset token fields if email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    return next(new AppError('Lỗi khi gửi email. Vui lòng thử lại.', 500));
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = req.body;

  // Tìm người dùng với token hợp lệ
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, // Token chưa hết hạn
  });

  if (!user) {
    return next(new AppError('Token không hợp lệ hoặc đã hết hạn!', 400));
  }

  // Cập nhật mật khẩu mới
  const hashedPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedPassword;

  // Xóa token và thời gian hết hạn
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.status(200).json({ 
    status: 'OK', 
    success: true, 
    message: 'Đặt lại mật khẩu thành công!' 
  });
});

const logout = asyncHandler(async (req, res, next) => {
  // Nếu sử dụng Refresh Token trong cookie, xóa cookie
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({ 
    status: 'OK', 
    success: true, 
    message: 'Đăng xuất thành công!' 
  });
});

const user = asyncHandler(async (req, res, next) => {
  // User already attached to req by authenticate middleware
  res.status(200).json({ 
    status: 'OK', 
    success: true, 
    data: req.user 
  });
});

module.exports = { login, register, forgotPassword, resetPassword, logout, user };