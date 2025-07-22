const Supplier = require('../models/supplierModel');
const mongoose = require('mongoose');

// Lấy tất cả nhà cung cấp
const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({});
    res.status(200).json({
      status: 'OK',
      metadata: null,
      data: suppliers,
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
const getSupplierById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'ERROR',
        metadata: null,
        message: 'ID không hợp lệ.',
      });
    }
    const supplier = await Supplier.findById(id);
    if (!supplier) {
      return res.status(404).json({
        status: 'ERROR',
        metadata: null,
        message: 'Không tìm thấy nhà cung cấp với ID đã cung cấp.',
      });
    }
    res.status(200).json({
      status: 'OK',
      metadata: null,
      data: supplier,
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
const getSupplierDatatable = async (req, res) => {
  try {
    const { page = 0, rows = 10, first = 0, sortField = '', sortOrder = 'desc', keyword = '' } = req.body;
    
    // Tạo query tìm kiếm
    const query = {};
    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { phone: { $regex: keyword, $options: 'i' } },
        { address: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Build sort object
    const sortObj = {};
    if (sortField && sortField !== 'undefined') {
      sortObj[sortField] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortObj['name'] = 1; // Default sort by name
    }

    const totalRecords = await Supplier.countDocuments(query);
    const suppliers = await Supplier.find(query)
      .sort(sortObj)
      .skip(first)
      .limit(Number(rows));
    const totalPages = Math.ceil(totalRecords / rows);
    res.status(200).json({
      status: 'OK',
      data: suppliers,
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
const createSupplier = async (req, res) => {
  try {
    const { name, contact, description, address, email, phone, website, logo } = req.body;
    const newSupplier = new Supplier({
      name,
      contact,
      description,
      address,
      email,
      phone,
      website,
      logo,
    });
    const savedSupplier = await newSupplier.save();
    res.status(201).json({
      status: 'OK',
      metadata: null,
      message: 'Thêm nhà cung cấp thành công.',
      data: savedSupplier,
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
const deleteSupplier = async (req, res) => {
  try {
    const { _id } = req.body;
    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        status: 'ERROR',
        metadata: null,
        message: 'ID không hợp lệ.',
      });
    }
    const deletedSupplier = await Supplier.findByIdAndDelete(_id);
    if (!deletedSupplier) {
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
const updateSupplier = async (req, res) => {
  try {
    const { _id, ...updatedData } = req.body;
    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ.',
      });
    }
    const supplierExists = await Supplier.findById(_id);
    if (!supplierExists) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhà cung cấp với ID đã cung cấp.',
      });
    }
    const updatedSupplier = await Supplier.findByIdAndUpdate(
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
      data: updatedSupplier,
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
  getAllSuppliers,
  getSupplierById,
  getSupplierDatatable,
  createSupplier,
  deleteSupplier,
  updateSupplier
}; 