const Publisher = require('../models/publisherModel');
const mongoose = require('mongoose');

// Lấy tất cả nhà cung cấp
const getAllPublishers = async (req, res) => {
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
};

// Lấy thông tin nhà cung cấp theo ID
const getPublisherById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'ERROR',
        metadata: null,
        message: 'ID không hợp lệ.',
      });
    }
    const publisher = await Publisher.findById(id);
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
};

// Phân trang cho nhà cung cấp
const getPublisherDatatable = async (req, res) => {
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
};

// Thêm nhà cung cấp mới
const createPublisher = async (req, res) => {
  try {
    const { name, contact, description, address, email, phone, website, logo } = req.body;
    const newPublisher = new Publisher({
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
};

// Xóa nhà cung cấp theo ID
const deletePublisher = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        status: 'ERROR',
        metadata: null,
        message: 'ID không hợp lệ.',
      });
    }
    const deletedPublisher = await Publisher.findByIdAndDelete(_id);
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
};

// Cập nhật thông tin nhà cung cấp
const updatePublisher = async (req, res) => {
  try {
    const { _id, ...updatedData } = req.body;
    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ.',
      });
    }
    const publisherExists = await Publisher.findById(_id);
    if (!publisherExists) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp với ID đã cung cấp.',
      });
    }
    const updatedPublisher = await Publisher.findByIdAndUpdate(
      _id,
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
};

module.exports = {
  getAllPublishers,
  getPublisherById,
  getPublisherDatatable,
  createPublisher,
  deletePublisher,
  updatePublisher
};