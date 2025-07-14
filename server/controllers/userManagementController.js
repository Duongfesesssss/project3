const User = require('../models/userModel');
const bcrypt = require('bcrypt');

// Lấy danh sách tất cả users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, is_active, search } = req.query;

    // Tạo filter
    const filter = {};
    if (role && ['customer', 'staff', 'admin'].includes(role)) {
      filter.role = role;
    }
    if (is_active !== undefined) {
      filter.is_active = is_active === 'true';
    }
    if (search) {
      filter.$or = [
        { user_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { full_name: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ created_at: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalUsers = await User.countDocuments(filter);

    res.status(200).json({
      status: 'OK',
      success: true,
      message: 'Lấy danh sách người dùng thành công',
      data: {
        users,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalUsers / limit),
          total_records: totalUsers,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách users:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi lấy danh sách người dùng'
    });
  }
};

// Tạo tài khoản user mới (Admin only)
const createUser = async (req, res) => {
  try {
    const { user_name, email, password, full_name, phone, address, role = 'customer' } = req.body;

    // Kiểm tra xem user đã tồn tại chưa
    const existingUser = await User.findOne({ 
      $or: [{ user_name }, { email }] 
    });
    
    if (existingUser) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Tên người dùng hoặc email đã tồn tại'
      });
    }

    // Validate role
    if (!['customer', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Role không hợp lệ'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      user_name,
      email,
      password: hashedPassword,
      full_name: full_name || '',
      phone: phone || '',
      address: address || '',
      role,
      is_active: true
    });

    await newUser.save();

    // Trả về thông tin user (không có password)
    const userInfo = {
      id: newUser._id,
      user_name: newUser.user_name,
      email: newUser.email,
      full_name: newUser.full_name,
      phone: newUser.phone,
      address: newUser.address,
      role: newUser.role,
      is_active: newUser.is_active,
      created_at: newUser.created_at
    };

    res.status(201).json({
      status: 'OK',
      success: true,
      message: `Tạo tài khoản ${role === 'staff' ? 'nhân viên' : 'người dùng'} thành công`,
      data: { user: userInfo }
    });
  } catch (error) {
    console.error('Lỗi tạo user:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi tạo tài khoản'
    });
  }
};

// Cập nhật thông tin user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name, phone, address, role, is_active } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho phép admin thay đổi role của chính mình
    if (user._id.toString() === req.user.id && role && role !== user.role) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Không thể thay đổi quyền của chính mình'
      });
    }

    // Cập nhật thông tin
    if (full_name !== undefined) user.full_name = full_name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (role !== undefined && ['customer', 'staff', 'admin'].includes(role)) {
      user.role = role;
    }
    if (is_active !== undefined) user.is_active = is_active;

    await user.save();

    const userInfo = {
      id: user._id,
      user_name: user.user_name,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      address: user.address,
      role: user.role,
      is_active: user.is_active,
      updated_at: user.updated_at
    };

    res.status(200).json({
      status: 'OK',
      success: true,
      message: 'Cập nhật thông tin người dùng thành công',
      data: { user: userInfo }
    });
  } catch (error) {
    console.error('Lỗi cập nhật user:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi cập nhật thông tin người dùng'
    });
  }
};

// Khóa/mở khóa tài khoản user (Admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho phép admin khóa chính mình
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Không thể khóa tài khoản của chính mình'
      });
    }

    // Toggle trạng thái
    user.is_active = !user.is_active;
    await user.save();

    const action = user.is_active ? 'mở khóa' : 'khóa';

    res.status(200).json({
      status: 'OK',
      success: true,
      message: `${action} tài khoản thành công`,
      data: {
        user_id: user._id,
        user_name: user.user_name,
        is_active: user.is_active
      }
    });
  } catch (error) {
    console.error('Lỗi toggle user status:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi thay đổi trạng thái tài khoản'
    });
  }
};

// Xóa user (Admin only) - Chỉ xóa customer
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Không cho phép xóa admin hoặc staff
    if (user.role === 'admin' || user.role === 'staff') {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Không thể xóa tài khoản admin hoặc staff'
      });
    }

    // Không cho phép admin xóa chính mình
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Không thể xóa tài khoản của chính mình'
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      status: 'OK',
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    console.error('Lỗi xóa user:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi xóa người dùng'
    });
  }
};

// Reset password cho user (Admin only)
const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Hash password mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      status: 'OK',
      success: true,
      message: 'Reset mật khẩu thành công'
    });
  } catch (error) {
    console.error('Lỗi reset password:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi reset mật khẩu'
    });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  createStaff: createUser, // Alias cho createUser
  updateUser,
  toggleUserStatus,
  deleteUser,
  resetUserPassword
};
