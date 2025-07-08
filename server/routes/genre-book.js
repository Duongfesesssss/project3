const express = require('express');
const router = express.Router();
const { BookGenres } = require('../models/bookModel');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// Lấy tất cả thể loại (public)
router.get('/', async (req, res) => {
  try {
    const genres = await BookGenres.find({});
    res.status(200).json({
      status: 'OK',
      metadata: null,
      data: genres,
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách thể loại:', error);
    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể lấy danh sách thể loại.',
    });
  }
});

// Lấy thông tin thể loại theo ID
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

    const genre = await BookGenres.findOne({ _id: id });

    if (!genre) {
      return res.status(404).json({
        status: 'ERROR',
        metadata: null,
        message: 'Không tìm thấy thể loại với ID đã cung cấp.',
      });
    }

    res.status(200).json({
      status: 'OK',
      metadata: null,
      data: genre,
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin thể loại:', error);
    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể lấy thông tin thể loại.',
    });
  }
});

// Phân trang cho thể loại (admin only)
router.post('/datatable', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { page = 0, rows = 10 } = req.body;
    const first = req.body.first || 0;

    const totalRecords = await BookGenres.countDocuments();
    const genres = await BookGenres.find()
      .skip(first)
      .limit(Number(rows));

    const totalPages = Math.ceil(totalRecords / rows);

    res.status(200).json({
      success: true,
      data: genres,
      rows: Number(rows),
      first: first,
      page: page,
      totalRecords: totalRecords,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin datatable thể loại:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server. Không thể lấy thông tin thể loại.',
    });
  }
});

// Thêm thể loại mới (admin only)
router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Lấy thể loại có _id lớn nhất
    const lastGenre = await BookGenres.findOne().sort({ _id: -1 });
    const newId = lastGenre ? lastGenre._id + 1 : 1;

    const newGenre = new BookGenres({
      _id: newId,
      name,
      description,
    });

    const savedGenre = await newGenre.save();

    res.status(201).json({
      status: 'OK',
      metadata: null,
      message: 'Thêm thể loại thành công.',
      data: savedGenre,
    });
  } catch (error) {
    console.error('Lỗi thêm thể loại:', error);
    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể thêm thể loại.',
    });
  }
});

// Xóa thể loại theo ID (admin only)
router.delete('/', authenticate, authorize(['admin']), async (req, res) => {
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

    const deletedGenre = await BookGenres.findOneAndDelete({ _id: id });

    if (!deletedGenre) {
      return res.status(404).json({
        status: 'ERROR',
        metadata: null,
        message: 'Không tìm thấy thể loại với ID đã cung cấp.',
      });
    }

    res.status(200).json({
      status: 'OK',
      metadata: null,
      message: 'Xóa thể loại thành công.',
    });
  } catch (error) {
    console.error('Lỗi xóa thể loại:', error);
    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể xóa thể loại.',
    });
  }
});

// Cập nhật thông tin thể loại (admin only)
router.put('/', authenticate, authorize(['admin']), async (req, res) => {
  try {
    const { _id, ...updatedData } = req.body;
    const id = Number(_id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID không hợp lệ.',
      });
    }

    const genreExists = await BookGenres.findOne({ _id: id });
    if (!genreExists) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại với ID đã cung cấp.',
      });
    }

    const updatedGenre = await BookGenres.findOneAndUpdate(
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
      data: updatedGenre,
      message: 'Cập nhật thể loại thành công.',
    });
  } catch (error) {
    console.error('Lỗi cập nhật thể loại:', error);
    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể cập nhật thể loại.',
    });
  }
});

module.exports = router;
