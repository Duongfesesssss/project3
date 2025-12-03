const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const login = async (req, res) => {
  try {
    console.log('---[LOGIN API]---');
    console.log('Thời điểm:', new Date().toISOString());
    console.log('req.body:', req.body);
    console.log('req.headers:', req.headers);
    const { email, password } = req.body;

    // Tìm người dùng theo email
    const user = await User.findOne({ email });
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
      { id: user._id, user_name: user.user_name, email: user.email, role: user.role },
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
          role: user.role,
          is_active: user.is_active,
        },
      },
    });
  } catch (error) {
    console.error('Lỗi trong quá trình đăng nhập:', error);
    res.status(500).json({ status: 'ERROR', success: false, message: 'Lỗi server' });
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


// Hàm quên mật khẩu
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const emailUser = process.env.EMAIL_USER || process.env.EMAIL_HOST;
    const emailPass = process.env.EMAIL_PASSWORD || process.env.PASSWORD_HOST;
    const resetBaseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    if (!emailUser || !emailPass) {
      return res.status(500).json({ 
        status: 'ERROR', 
        success: false, 
        message: 'Thiếu cấu hình email. Vui lòng liên hệ quản trị viên.' 
      });
    }

    // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 'ERROR', success: false, message: 'Email không tồn tại' });
    }

    // Tạo token đặt lại mật khẩu
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // Token hết hạn sau 1 giờ

    // Lưu token và thời gian hết hạn vào cơ sở dữ liệu
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Tạo liên kết đặt lại mật khẩu
    const resetLink = `${resetBaseUrl}/reset-password?token=${resetToken}`;

    // Gửi email chứa liên kết đặt lại mật khẩu
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
    const mailOptions = {
      from: emailUser,
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

    res.status(200).json({ status: 'OK', success: true, message: 'Đã gửi email đặt lại mật khẩu!' });
  } catch (error) {
    console.error('Lỗi trong quá trình quên mật khẩu:', error);
    res.status(500).json({ status: 'ERROR', success: false, message: 'Lỗi server. Không thể gửi email.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Tìm người dùng với token hợp lệ
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Token chưa hết hạn
    });

    if (!user) {
      return res.status(400).json({ status: 'ERROR', success: false, message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }

    // Cập nhật mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash mật khẩu mới
    user.password = hashedPassword;

    // Xóa token và thời gian hết hạn
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ status: 'OK', success: true, message: 'Đặt lại mật khẩu thành công!' });
  } catch (error) {
    console.error('Lỗi trong quá trình đặt lại mật khẩu:', error);
    res.status(500).json({ status: 'ERROR', success: false, message: 'Lỗi server. Không thể đặt lại mật khẩu.' });
  }
};

const logout = async (req, res) => {
  try {
    // Nếu sử dụng Refresh Token trong cookie, xóa cookie
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
    });

    res.status(200).json({ status: 'OK', success: true, message: 'Đăng xuất thành công!' });
  } catch (error) {
    console.error('Lỗi trong quá trình đăng xuất:', error);
    res.status(500).json({ status: 'ERROR', success: false, message: 'Lỗi server. Không thể đăng xuất.' });
  }
};

const user = async (req, res) => {
  try {
    // Lấy Access Token từ header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ status: 'ERROR', success: false, message: 'Không có token!' });
    }

    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Tìm người dùng trong cơ sở dữ liệu
    const user = await User.findById(decoded.id).select('-password'); // Không trả về mật khẩu
    if (!user) {
      return res.status(404).json({ status: 'ERROR', success: false, message: 'Người dùng không tồn tại!' });
    }

    res.status(200).json({ status: 'OK', success: true, user });
  } catch (error) {
    console.error('Lỗi trong quá trình lấy thông tin người dùng:', error);
    res.status(500).json({ status: 'ERROR', success: false, message: 'Lỗi server. Không thể lấy thông tin người dùng.' });
  }
};

// Lấy thông tin profile người dùng hiện tại
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        status: 'ERROR',
        message: 'Người dùng không tồn tại' 
      });
    }

    res.status(200).json({
      status: 'OK',
      message: 'Lấy thông tin profile thành công',
      data: {
        user_name: user.user_name,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone, // Dùng phone thay vì phone_number
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi lấy profile:', error);
    res.status(500).json({ 
      status: 'ERROR',
      message: 'Lỗi server khi lấy thông tin profile' 
    });
  }
};

// Cập nhật thông tin profile
const updateProfile = async (req, res) => {
  try {
    const { user_name, full_name, phone, address } = req.body; // Thêm user_name
    const userId = req.user._id;

    // Validate input
    if (!full_name) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Họ tên là bắt buộc'
      });
    }

    if (!user_name) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Tên đăng nhập là bắt buộc'
      });
    }

    // Kiểm tra xem user_name đã tồn tại chưa (trừ user hiện tại)
    const existingUser = await User.findOne({ 
      user_name: user_name.trim(),
      _id: { $ne: userId }
    });
    if (existingUser) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Tên đăng nhập đã tồn tại'
      });
    }

    // Cập nhật thông tin (bao gồm user_name)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        user_name: user_name.trim(),
        full_name: full_name.trim(),
        phone: phone?.trim() || '', // Dùng phone thay vì phone_number
        address: address?.trim() || ''
      },
      { new: true, select: '-password' }
    );

    res.status(200).json({
      status: 'OK',
      message: 'Cập nhật thông tin thành công',
      data: {
        user_name: updatedUser.user_name,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        phone: updatedUser.phone, // Trả về phone
        address: updatedUser.address
      }
    });
  } catch (error) {
    console.error('Lỗi cập nhật profile:', error);
    res.status(500).json({ 
      status: 'ERROR',
      message: 'Lỗi server khi cập nhật thông tin' 
    });
  }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Mật khẩu xác nhận không khớp'
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }

    // Tìm user và kiểm tra mật khẩu hiện tại
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        message: 'Người dùng không tồn tại'
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(current_password, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Kiểm tra mật khẩu mới không giống mật khẩu cũ
    const isSamePassword = await bcrypt.compare(new_password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Mật khẩu mới không được giống mật khẩu cũ'
      });
    }

    // Hash mật khẩu mới
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(new_password, saltRounds);

    // Cập nhật mật khẩu
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword
    });

    res.status(200).json({
      status: 'OK',
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({ 
      status: 'ERROR',
      message: 'Lỗi server khi đổi mật khẩu' 
    });
  }
};

module.exports = { login, register, forgotPassword, resetPassword, logout, user, getProfile, updateProfile, changePassword };
