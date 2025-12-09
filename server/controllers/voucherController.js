const { Voucher, VoucherUsage } = require('../models/voucherModel');
const mongoose = require('mongoose');

// Helper ép số an toàn (trả null nếu không hợp lệ)
const toNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
};

// Helper map kiểu cho visibility/type: hỗ trợ 'public'/'private' hoặc 1/2
const normalizeVisibility = (value) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === 'public' || value === 'private') return value;
  if (value === 1 || value === '1') return 'public';
  if (value === 2 || value === '2') return 'private';
  return value;
};

const startOfDay = (value) => {
  if (!value) return null;
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (value) => {
  if (!value) return null;
  const d = new Date(value);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getPersonalVouchersForUser = async (userId) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  return Voucher.find({
    owner_user_id: userId,
    visibility: 'private',
    status: 'active',
    valid_from: { $lte: now },
    valid_until: { $gte: todayStart },
    $expr: { $lt: ['$used_count', '$usage_limit'] }
  }).sort({ valid_until: 1 });
};

const calculateVoucherDiscountAmount = (voucher, subtotal) => {
  if (!voucher || typeof subtotal !== 'number') {
    return 0;
  }

  if (voucher.discount_type === 'fixed') {
    return Math.max(0, Math.min(voucher.discount, subtotal));
  }

  const percentageDiscount = Math.floor((subtotal * voucher.discount) / 100);
  if (voucher.max_discount) {
    return Math.max(0, Math.min(percentageDiscount, voucher.max_discount));
  }

  return Math.max(0, percentageDiscount);
};

// Lấy danh sách voucher public đang hoạt động
const getPublicVouchers = async (req, res) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const publicVouchers = await Voucher.find({
      visibility: 'public',
      status: 'active',
      valid_from: { $lte: now },
      valid_until: { $gte: todayStart },
      $expr: { $lt: ['$used_count', '$usage_limit'] }
    }).sort({ valid_until: 1 });

    res.json({
      status: 'OK',
      success: true,
      data: publicVouchers
    });
  } catch (error) {
    console.error('Lỗi khi lấy voucher public:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Không thể lấy danh sách voucher công khai'
    });
  }
};

// Lấy voucher cá nhân của user
const getMyVouchers = async (req, res) => {
  try {
    const vouchers = await getPersonalVouchersForUser(req.user._id);
    res.json({
      status: 'OK',
      success: true,
      data: vouchers
    });
  } catch (error) {
    console.error('Lỗi khi lấy voucher cá nhân:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Không thể lấy danh sách voucher cá nhân'
    });
  }
};

// Lấy danh sách voucher với phân trang
const getVouchers = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-created_at' } = req.query;
    const vouchers = await Voucher.find()
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Voucher.countDocuments();
    
    res.json({
      status: 'OK',
      success: true,
      data: vouchers,
      totalRecords: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách voucher:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi lấy danh sách voucher'
    });
  }
};

// Tạo voucher mới
const createVoucher = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Hỗ trợ alias type -> visibility (UI có thể gửi type) và map số 1/2
    payload.visibility = normalizeVisibility(payload.visibility);
    if (!payload.visibility && payload.type) {
      payload.visibility = normalizeVisibility(payload.type);
    }

    // Ép kiểu ngày, mặc định trạng thái
    payload.valid_from = payload.valid_from ? startOfDay(payload.valid_from) : undefined;
    payload.valid_until = payload.valid_until ? endOfDay(payload.valid_until) : undefined;
    payload.discount_type = payload.discount_type || 'percentage';
    payload.status = payload.status || 'active';
    payload.used_count = 0;

    // Ép kiểu số cho các field số
    payload.discount = toNumber(payload.discount);
    payload.max_discount = toNumber(payload.max_discount);
    payload.usage_limit = toNumber(payload.usage_limit);
    payload.min_order_value = toNumber(payload.min_order_value);
    // Mặc định nếu null
    if (payload.usage_limit === null) payload.usage_limit = 1;
    if (payload.min_order_value === null) payload.min_order_value = 0;

    // Nếu là voucher công khai thì bỏ owner_user_id
    if (payload.visibility === 'public') {
      payload.owner_user_id = null;
    }

    // Kiểm tra dữ liệu bắt buộc
    const requiredFields = ['code', 'discount', 'valid_from', 'valid_until'];
    const missing = requiredFields.filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');
    if (missing.length > 0) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: `Thiếu trường bắt buộc: ${missing.join(', ')}`
      });
    }

    if (payload.usage_limit <= 0) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Giới hạn sử dụng phải lớn hơn 0'
      });
    }

    if (payload.discount === null) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Giảm giá phải là số hợp lệ'
      });
    }

    if (isNaN(new Date(payload.valid_from)) || isNaN(new Date(payload.valid_until))) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Ngày hiệu lực không hợp lệ'
      });
    }

    const voucher = new Voucher({
      ...payload,
      created_at: new Date(),
      updated_at: new Date()
    });
    const savedVoucher = await voucher.save();
    res.status(201).json({
      status: 'OK',
      success: true,
      message: 'Tạo voucher thành công',
      data: savedVoucher
    });
  } catch (error) {
    console.error('Lỗi khi tạo voucher:', error);
    // Trả thông tin lỗi rõ hơn (ví dụ trùng code)
    const message = error?.code === 11000 ? 'Mã voucher đã tồn tại, vui lòng chọn mã khác' : (error?.message || 'Lỗi khi tạo voucher');
    res.status(400).json({
      status: 'ERROR',
      success: false,
      message
    });
  }
};

// Cập nhật voucher
const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID voucher không hợp lệ'
      });
    }

    const payload = { ...req.body };

    // Hỗ trợ alias type -> visibility
    payload.visibility = normalizeVisibility(payload.visibility);
    if (!payload.visibility && payload.type) {
      payload.visibility = normalizeVisibility(payload.type);
    }

    // Voucher public không gắn owner
    if (payload.visibility === 'public') {
      payload.owner_user_id = null;
    }

    // Ép kiểu số cho các field số
    if (payload.discount !== undefined) payload.discount = toNumber(payload.discount);
    if (payload.max_discount !== undefined) payload.max_discount = toNumber(payload.max_discount);
    if (payload.usage_limit !== undefined) payload.usage_limit = toNumber(payload.usage_limit);
    if (payload.min_order_value !== undefined) payload.min_order_value = toNumber(payload.min_order_value);
    if (payload.valid_from) payload.valid_from = startOfDay(payload.valid_from);
    if (payload.valid_until) payload.valid_until = endOfDay(payload.valid_until);
    if (payload.usage_limit === null) payload.usage_limit = 1;
    if (payload.min_order_value === null) payload.min_order_value = 0;

    const voucher = await Voucher.findByIdAndUpdate(
      id,
      { 
        ...payload,
        updated_at: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!voucher) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Voucher không tồn tại'
      });
    }

    res.json({
      status: 'OK',
      success: true,
      message: 'Cập nhật voucher thành công',
      data: voucher
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật voucher:', error);
    res.status(400).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi khi cập nhật voucher'
    });
  }
};

// Xóa voucher
const deleteVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID voucher không hợp lệ'
      });
    }

    const voucher = await Voucher.findByIdAndDelete(id);
    if (!voucher) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Voucher không tồn tại'
      });
    }

    res.json({
      status: 'OK',
      success: true,
      message: 'Xóa voucher thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa voucher:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi xóa voucher'
    });
  }
};

// Kiểm tra và áp dụng voucher
const applyVoucher = async (req, res) => {
  try {
    const { code, order_id, user_id } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID người dùng không hợp lệ'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(order_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID đơn hàng không hợp lệ'
      });
    }
    
    // Tìm voucher
    const voucher = await Voucher.findOne({ code });
    if (!voucher) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Mã voucher không hợp lệ'
      });
    }

    if (voucher.status !== 'active') {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Voucher không còn hiệu lực'
      });
    }

    // Kiểm tra thời hạn
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    if ((voucher.valid_from && todayEnd < voucher.valid_from) || (voucher.valid_until && todayStart > voucher.valid_until)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Voucher đã hết hạn hoặc chưa có hiệu lực'
      });
    }

    // Kiểm tra số lần sử dụng
    if (voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Voucher đã hết lượt sử dụng'
      });
    }

    if (voucher.owner_user_id && voucher.owner_user_id.toString() !== user_id) {
      return res.status(403).json({
        status: 'ERROR',
        success: false,
        message: 'Voucher này không thuộc về bạn'
      });
    }

    // Kiểm tra xem user đã sử dụng voucher này chưa
    const existingUsage = await VoucherUsage.findOne({
      voucher_id: voucher._id,
      user_id: user_id
    });
    if (existingUsage) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Bạn đã sử dụng voucher này'
      });
    }

    // Tạo bản ghi sử dụng voucher
    const voucherUsage = new VoucherUsage({
      voucher_id: voucher._id,
      user_id: user_id,
      order_id: order_id,
      used_at: new Date()
    });
    await voucherUsage.save();

    // Cập nhật số lần sử dụng
    voucher.used_count += 1;
    if (voucher.used_count >= voucher.usage_limit) {
      voucher.status = 'inactive';
    }
    await voucher.save();

    res.json({
      status: 'OK',
      success: true,
      message: 'Áp dụng voucher thành công',
      data: {
        discount: voucher.discount,
        voucher: voucher
      }
    });
  } catch (error) {
    console.error('Lỗi khi áp dụng voucher:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi áp dụng voucher'
    });
  }
};

// Lấy dữ liệu cho datatable
const getVoucherDatatable = async (req, res) => {
  try {
    const { page = 0, rows = 10, first = 0, sortField = '', sortOrder = 'desc', keyword = '' } = req.body;
    
    // Tạo query tìm kiếm
    const query = {};
    if (keyword) {
      query.$or = [
        { code: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Lấy tổng số bản ghi
    const totalRecords = await Voucher.countDocuments(query);

    // Tạo sort object
    const sortObj = {};
    if (sortField) {
      sortObj[sortField] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortObj['createdAt'] = -1; // Default sort
    }

    // Lấy dữ liệu với phân trang
    const vouchers = await Voucher.find(query)
      .sort(sortObj)
      .limit(Number(rows))
      .skip(first);

    res.json({
      status: 'OK',
      data: vouchers,
      rows: Number(rows),
      first: first,
      page: page,
      totalRecords: totalRecords,
      totalPages: Math.ceil(totalRecords / rows)
    });
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu voucher datatable:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi lấy dữ liệu voucher datatable'
    });
  }
};

// Kiểm tra hợp lệ voucher (không cần order_id, chỉ kiểm tra code, user_id, subtotal)
const validateVoucher = async (req, res) => {
  try {
    const { code, user_id, subtotal } = req.body;
    if (!code || !user_id || subtotal === undefined) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Thiếu thông tin kiểm tra voucher'
      });
    }
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'ID người dùng không hợp lệ'
      });
    }
    // Tìm voucher
    const voucher = await Voucher.findOne({ code });
    if (!voucher) {
      return res.status(404).json({
        status: 'ERROR',
        success: false,
        message: 'Mã voucher không hợp lệ'
      });
    }

    if (voucher.status !== 'active') {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Voucher không còn hiệu lực'
      });
    }

    if (voucher.owner_user_id && voucher.owner_user_id.toString() !== user_id) {
      return res.status(403).json({
        status: 'ERROR',
        success: false,
        message: 'Voucher này không thuộc về bạn'
      });
    }
    // Kiểm tra thời hạn
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    if ((voucher.valid_from && todayEnd < voucher.valid_from) || (voucher.valid_until && todayStart > voucher.valid_until)) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Voucher đã hết hạn hoặc chưa có hiệu lực'
      });
    }
    // Kiểm tra số lần sử dụng
    if (voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Voucher đã hết lượt sử dụng'
      });
    }
    // Kiểm tra giá trị đơn hàng tối thiểu
    if (subtotal < voucher.min_order_value) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: `Đơn hàng tối thiểu ${voucher.min_order_value}đ để áp dụng voucher này`
      });
    }
    // Kiểm tra user đã dùng voucher này chưa (nếu muốn, có thể bỏ qua ở bước này)
    // const existingUsage = await VoucherUsage.findOne({ voucher_id: voucher._id, user_id });
    // if (existingUsage) {
    //   return res.status(400).json({
    //     status: 'ERROR',
    //     success: false,
    //     message: 'Bạn đã sử dụng voucher này'
    //   });
    // }
    const discountAmount = calculateVoucherDiscountAmount(voucher, subtotal);
    if (discountAmount <= 0) {
      return res.status(400).json({
        status: 'ERROR',
        success: false,
        message: 'Voucher chưa đáp ứng điều kiện giảm giá'
      });
    }

    // Trả về thông tin giảm giá
    res.json({
      status: 'OK',
      success: true,
      message: 'Voucher hợp lệ',
      data: {
        discount: voucher.discount,
        discountAmount,
        voucher: voucher
      }
    });
  } catch (error) {
    console.error('Lỗi khi kiểm tra voucher:', error);
    res.status(500).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi server khi kiểm tra voucher'
    });
  }
};

module.exports = {
  getPublicVouchers,
  getMyVouchers,
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  applyVoucher,
  getVoucherDatatable,
  validateVoucher
}; 