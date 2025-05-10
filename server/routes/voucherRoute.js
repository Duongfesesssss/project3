const express = require('express');
const router = express.Router();
const Voucher = require('../models/voucherModel');

// Lấy danh sách voucher
router.get('/', async (req, res) => {
  try {
    const vouchers = await Voucher.find({});
    res.status(200).json({ status: 'OK', data: vouchers });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Lỗi khi lấy danh sách voucher.' });
  }
});

// Phân trang cho voucher
router.post('/datatable', async (req, res) => {
    try {
      const { page = 0, rows = 10 } = req.body; // Nhận số trang và số bản ghi mỗi trang từ request body
      const first = req.body.first || 0; // Vị trí bắt đầu (offset)
  
      // Tổng số bản ghi
      const totalRecords = await Voucher.countDocuments();
  
      // Lấy danh sách voucher với phân trang
      const voucherList = await Voucher.find({})
        .skip(first)
        .limit(Number(rows))
        .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo (mới nhất trước)
  
      // Tổng số trang
      const totalPages = Math.ceil(totalRecords / rows);
  
      res.status(200).json({
        success: true,
        data: voucherList,
        rows: Number(rows),
        first: first,
        page: page,
        totalRecords: totalRecords,
        totalPages: totalPages,
      });
    } catch (error) {
      console.error('Lỗi lấy thông tin datatable voucher:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi server. Không thể lấy thông tin voucher.',
      });
    }
  });
  
// Thêm voucher mới
router.post('/', async (req, res) => {
  try {
    const { code, discount, valid_from, valid_until, usage_limit } = req.body;

    const newVoucher = new Voucher({
      code,
      discount,
      valid_from,
      valid_until,
      usage_limit,
    });

    const saved = await newVoucher.save();
    res.status(201).json({ status: 'OK', message: 'Tạo voucher thành công.', data: saved });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ status: 'ERROR', message: 'Mã voucher đã tồn tại.' });
    }
    res.status(500).json({ status: 'ERROR', message: 'Lỗi khi tạo voucher.' });
  }
});

// Cập nhật voucher
router.put('/', async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;

    const updated = await Voucher.findByIdAndUpdate(_id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ status: 'ERROR', message: 'Voucher không tồn tại.' });
    }

    res.status(200).json({ status: 'OK', message: 'Cập nhật thành công.', data: updated });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Lỗi khi cập nhật voucher.' });
  }
});

// Xóa voucher
router.delete('/', async (req, res) => {
  try {
    const { _id } = req.body;

    const deleted = await Voucher.findByIdAndDelete(_id);

    if (!deleted) {
      return res.status(404).json({ status: 'ERROR', message: 'Không tìm thấy voucher.' });
    }

    res.status(200).json({ status: 'OK', message: 'Xóa voucher thành công.' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Lỗi khi xóa voucher.' });
  }
});

// Kiểm tra và áp dụng mã voucher (dùng ở client khi thanh toán)
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;

    const voucher = await Voucher.findOne({ code });

    if (!voucher) {
      return res.status(404).json({ status: 'ERROR', message: 'Voucher không tồn tại.' });
    }

    const now = new Date();
    if (now < voucher.valid_from || now > voucher.valid_until) {
      return res.status(400).json({ status: 'ERROR', message: 'Voucher đã hết hạn hoặc chưa bắt đầu.' });
    }

    if (voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({ status: 'ERROR', message: 'Voucher đã được sử dụng hết.' });
    }

    res.status(200).json({ status: 'OK', data: voucher });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: 'Lỗi khi kiểm tra voucher.' });
  }
});

module.exports = router;
