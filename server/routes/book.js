const express = require('express');
const router = express.Router();
const { Book, BookGenres } = require('../models/bookModel');
const Supplier = require('../models/supplierModel');
const Publisher = require('../models/publisherModel');
const { 
  getAllBooks, 
  getAllGenres,
  createBook,
  updateStock,
  getOutOfStockBooks,
  getLowStockBooks,
  getStockStats
} = require('../controllers/bookController');

// ========== STOCK MANAGEMENT ROUTES ==========
// Thống kê kho hàng
router.get('/stock/stats', getStockStats);

// Sách hết hàng
router.get('/stock/out-of-stock', getOutOfStockBooks);

// Sách sắp hết hàng
router.get('/stock/low-stock', getLowStockBooks);

// Cập nhật stock (nhập/bán hàng)
router.patch('/:bookId/stock', updateStock);

// ========== EXISTING ROUTES ==========
// Lấy tất cả sách (updated với stock info)
router.get('/all', getAllBooks);

// lấy tất cả thể loại sách
router.get('/genres', getAllGenres);

// Lấy tất cả nhà cung cấp
router.get('/suppliers', async (req, res) => {
  if (!Supplier) {
    return res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Model Supplier chưa được định nghĩa.'
    });
  }
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
});

// Lấy tất cả sách (endpoint gốc)
router.get('/', getAllBooks);

// Lấy tất cả nhà xuất bản
router.get('/publishers', async (req, res) => {
  try {
    const publishers = await Publisher.find({});
    res.status(200).json({
      status: 'OK',
      metadata: null,
      data: publishers,
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách nhà xuất bản:', error);
    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể lấy danh sách nhà xuất bản.',
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
          from: 'genres',
          localField: 'genre_ids',
          foreignField: '_id',
          as: 'genres',
        },
      },
      {
        $lookup: {
          from: 'publishers',
          localField: 'publisher',
          foreignField: '_id',
          as: 'publisher',
        },
      },
      { $unwind: { path: '$publisher', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplier',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          author: 1,
          genres: 1,
          image_link: 1,
          publisher: 1,
          supplier: 1,
          published_date: 1,
          isbn: 1,
          price: 1,
          language: 1,
          pages: 1,
          stock_quantity: 1,
          sold_quantity: 1,
          stock_status: 1,
          genre_ids: 1,
          description: 1,
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
    const { title, author, genre_ids, image_link, publisher,
      published_date,
      isbn,
      price,
      language,
      pages,
      description,
      supplier
    } = req.body;

    const newBook = new Book({
      title,
      author,
      genre_ids,
      image_link,
      publisher,
      published_date,
      isbn,
      price,
      language,
      pages,
      genre_ids,
      description,
      supplier
    });

    const savedBook = await newBook.save();

    res.status(201).json({
      status: 'OK',
      metadata: null,
      message: 'Thêm sách thành công.',
      data: savedBook,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({
        status: 'ERROR',
        metadata: null,
        message: 'Slug hoặc ISBN đã tồn tại.',
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
    const { _id, image_link, ...updatedData } = req.body; // Nhận image_link từ request body

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
    const updatedBook = await Book.findByIdAndUpdate(
      _id,
      { ...updatedData, image_link }, // Cập nhật image_link
      {
        new: true, // Trả về bản ghi đã cập nhật
        runValidators: true, // Chạy các validator trong schema
      }
    );

    res.status(200).json({
      status: 'OK',
      metadata: null,
      data: updatedBook,
      message: 'Cập nhật sách thành công.',
    });
  } catch (error) {
    console.error('Lỗi cập nhật sách:', error);

    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể cập nhật sách.',
    });
  }
});

// Lấy thông tin sách theo slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    // Sử dụng aggregation giống như datatable
    const bookResult = await Book.aggregate([
      { $match: { slug: slug } },
      {
        $lookup: {
          from: 'genres',
          localField: 'genre_ids',
          foreignField: '_id',
          as: 'genres',
        },
      },
      {
        $lookup: {
          from: 'publishers',
          localField: 'publisher',
          foreignField: '_id',
          as: 'publisher',
        },
      },
      { $unwind: { path: '$publisher', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'suppliers',
          localField: 'supplier',
          foreignField: '_id',
          as: 'supplier',
        },
      },
      { $unwind: { path: '$supplier', preserveNullAndEmptyArrays: true } },
    ]);

    if (!bookResult || bookResult.length === 0) {
      return res.status(404).json({
        status: 'ERROR',
        metadata: null,
        message: 'Không tìm thấy sách với slug đã cung cấp.',
      });
    }

    const book = bookResult[0];

    res.status(200).json({
      status: 'OK',
      metadata: null,
      data: book,
    });
  } catch (error) {
    console.error('Lỗi lấy thông tin sách theo slug:', error);
    res.status(500).json({
      status: 'ERROR',
      metadata: null,
      message: 'Lỗi server. Không thể lấy thông tin sách.',
    });
  }
});



module.exports = router;
