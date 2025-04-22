const express = require('express');
const router = express.Router();
const { Book, BookGenres } = require('../models/bookModel');

// Lấy tất cả sách
router.get('/', async (req, res) => {
  try {
    const bookList = await Book.find({});
    res.status(200).json({
      success: true,
      data: bookList,
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách sách:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server. Không thể lấy danh sách sách.',
    });
  }
});

router.get('/genres', async (req, res) => {
  try {
    const bookList = await BookGenres.find({});
    res.status(200).json({
      status: 'OK',
      metadata: null,
      data: bookList,
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách sách:', error);
    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể lấy danh sách thể loại sách.',
    });
  }
});

// Phân trang cho sách
router.post('/datatable', async (req, res) => {
  try {
    const { page = 0, rows = 10 } = req.body;
    const first = req.body.first || 0;

    const totalRecords = await Book.countDocuments();
    const bookList = await Book.aggregate([
      { $skip: first },
      { $limit: Number(rows) },
      {
        $lookup: {
          from: 'genres', // Tên collection của bảng genres
          localField: 'genre_ids', // Trường array trong bảng books
          foreignField: '_id', // Trường _id trong bảng genres
          as: 'genres', // Tên key mới chứa thông tin thể loại
        },
      },
    ]);

    const totalPages = Math.ceil(totalRecords / rows);

    res.status(200).json({
      success: true,
      data: bookList,
      rows: Number(rows),
      first: first,
      page: page,
      totalRecords: totalRecords,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin datatable sách:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server. Không thể lấy thông tin sách.',
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();

    res.status(201).json({
      status: 'OK',
      metadata: null,
      message: 'Thêm sách thành công.',
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        status: 'ERROR',
        metadata: null,
        message: 'ISBN đã tồn tại.',
      });
    } else {
      console.error('Lỗi thêm sách:', error);
      res.status(500).json({
        status: 'ERROR',
        metadata: null,
        message: 'Lỗi server. Không thể thêm sách.',
      });
    }
  }
});

// Xóa sách theo ID
router.delete('/', async (req, res) => {
  try {
    const { _id } = req.body;

    if (!_id) {
      return res.status(400).json({
        status: 'ERROR',
        metadata: null,
        message: 'Vui lòng cung cấp _id của sách cần xóa.',
      });
    }

    const deletedBook = await Book.findByIdAndDelete(_id);

    if (!deletedBook) {
      return res.status(404).json({
        status: 'ERROR',
        metadata: null,
        message: 'Không tìm thấy sách với _id đã cung cấp.',
      });
    }

    res.status(200).json({
      status: 'OK',
      metadata: null,
      message: 'Xóa sách thành công.',
    });
  } catch (error) {
    console.error('Lỗi xóa sách:', error);
    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể xóa sách.',
    });
  }
});

// Cập nhật thông tin sách
router.put('/', async (req, res) => {
  try {
    const { _id, ...updatedData } = req.body;

    // Kiểm tra nếu không có _id
    if (!_id) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp _id của sách cần cập nhật.',
      });
    }

    // Kiểm tra sách có tồn tại trước khi cập nhật
    const bookExists = await Book.findById(_id);
    if (!bookExists) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sách với ID đã cung cấp.',
      });
    }

    // Cập nhật sách
    const updatedBook = await Book.findByIdAndUpdate(_id, updatedData, {
      new: true, // Trả về bản ghi đã cập nhật
      runValidators: true, // Chạy các validator trong schema
    });

    res.status(200).json({
      status: 'OK',
      metadata: null,
      data: updatedBook,
      message: 'Cập nhật sách thành công.',
    });
  } catch (error) {
    console.error('Lỗi cập nhật sách:', error);

    // Trả về lỗi chi tiết hơn nếu có
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        status: 'ERROR',
        metadata: null,
        message: 'Dữ liệu không hợp lệ.',
        errors: error.errors,
      });
    }

    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể cập nhật sách.',
    });
  }
});

module.exports = router;
