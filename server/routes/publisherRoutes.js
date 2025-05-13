const express = require('express');
const router = express.Router();
const Publisher = require('../models/publisherModel');

// Lấy tất cả nhà cung cấp
router.get('/', async (req, res) => {
  try {
    const publishers = await Publisher.find({});
    res.status(200).json({
      status: 'OK',
      metadata: null,
      data: publishers,
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách nhà cung cấp:', error);
    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể lấy danh sách nhà cung cấp.',
    });
  }
});

// Lấy thông tin nhà cung cấp theo ID
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        status: 'ERROR',
        metadata: null,
        message: 'ID không hợp lệ.',
      });
    }

    const publisher = await Publisher.findOne({ _id: id });

    if (!publisher) {
      return res.status(404).json({
        status: 'ERROR',
        metadata: null,
        message: 'Không tìm thấy nhà cung cấp với ID đã cung cấp.',
      });
    }

    res.status(200).json({
      status: 'OK',
      metadata: null,
      data: publisher,
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin nhà cung cấp:', error);
    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể lấy thông tin nhà cung cấp.',
    });
  }
});

// Phân trang cho nhà cung cấp
router.post('/datatable', async (req, res) => {
  try {
    const { page = 0, rows = 10 } = req.body;
    const first = req.body.first || 0;

    const totalRecords = await Publisher.countDocuments();
    const publishers = await Publisher.find()
      .skip(first)
      .limit(Number(rows));

    const totalPages = Math.ceil(totalRecords / rows);

    res.status(200).json({
      success: true,
      data: publishers,
      rows: Number(rows),
      first: first,
      page: page,
      totalRecords: totalRecords,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin datatable nhà cung cấp:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server. Không thể lấy thông tin nhà cung cấp.',
    });
  }
});

// Thêm nhà cung cấp mới
router.post('/', async (req, res) => {
  try {
    const { name, contact, description, address, email, phone, website, logo } = req.body;
    
    // Lấy nhà cung cấp có _id lớn nhất
    const lastPublisher = await Publisher.findOne().sort({ _id: -1 });
    const newId = lastPublisher ? lastPublisher._id + 1 : 1;

    const newPublisher = new Publisher({
      _id: newId,
      name,
      contact,
      description,
      address,
      email,
      phone,
      website,
      logo,
    });

    const savedPublisher = await newPublisher.save();

    res.status(201).json({
      status: 'OK',
      metadata: null,
      message: 'Thêm nhà cung cấp thành công.',
      data: savedPublisher,
    });
  } catch (error) {
    console.error('Lỗi thêm nhà cung cấp:', error);
    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể thêm nhà cung cấp.',
    });
  }
});

// Xóa nhà cung cấp theo ID
router.delete('/', async (req, res) => {
  try {
    const { _id } = req.body;
    const id = Number(_id);

    if (isNaN(id)) {
      return res.status(400).json({
        status: 'ERROR',
        metadata: null,
        message: 'ID không hợp lệ.',
      });
    }

    const deletedPublisher = await Publisher.findOneAndDelete({ _id: id });

    if (!deletedPublisher) {
      return res.status(404).json({
        status: 'ERROR',
        metadata: null,
        message: 'Không tìm thấy nhà cung cấp với ID đã cung cấp.',
      });
    }

    res.status(200).json({
      status: 'OK',
      metadata: null,
      message: 'Xóa nhà cung cấp thành công.',
    });
  } catch (error) {
    console.error('Lỗi xóa nhà cung cấp:', error);
    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể xóa nhà cung cấp.',
    });
  }
});

// Cập nhật thông tin nhà cung cấp
router.put('/', async (req, res) => {
  try {
    const { _id, ...updatedData } = req.body;
    const id = Number(_id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ.',
      });
    }

    const publisherExists = await Publisher.findOne({ _id: id });
    if (!publisherExists) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp với ID đã cung cấp.',
      });
    }

    const updatedPublisher = await Publisher.findOneAndUpdate(
      { _id: id },
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: 'OK',
      metadata: null,
      data: updatedPublisher,
      message: 'Cập nhật nhà cung cấp thành công.',
    });
  } catch (error) {
    console.error('Lỗi cập nhật nhà cung cấp:', error);
    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể cập nhật nhà cung cấp.',
    });
  }
});

module.exports = router;