const { Voucher, VoucherUsage } = require('../models/voucherModel');
const mongoose = require('mongoose');

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
    const voucher = new Voucher({
      ...req.body,
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
    res.status(400).json({
      status: 'ERROR',
      success: false,
      message: 'Lỗi khi tạo voucher'
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

    const voucher = await Voucher.findByIdAndUpdate(
      id,
      { 
        ...req.body,
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

    // Kiểm tra thời hạn
    const now = new Date();
    if (now < voucher.valid_from || now > voucher.valid_until) {
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
    // Kiểm tra thời hạn
    const now = new Date();
    if (now < voucher.valid_from || now > voucher.valid_until) {
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
    // Trả về thông tin giảm giá
    res.json({
      status: 'OK',
      success: true,
      message: 'Voucher hợp lệ',
      data: {
        discount: voucher.discount,
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
  getVouchers,
  createVoucher,
  updateVoucher,
  deleteVoucher,
  applyVoucher,
  getVoucherDatatable,
  validateVoucher
}; 