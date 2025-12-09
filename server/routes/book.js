const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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
const { authenticateToken, staffAndAdmin, adminOnly } = require('../middlewares/roleMiddleware');

// ========== PUBLIC ROUTES (không cần đăng nhập) ==========
// Lấy tất cả sách cho khách hàng
router.get('/all', getAllBooks);

// Lấy tất cả thể loại sách - PUBLIC cho trang tìm kiếm
router.get('/genres', getAllGenres);

// Lấy tất cả nhà cung cấp - PUBLIC cho trang tìm kiếm
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

// Lấy tất cả nhà xuất bản - PUBLIC cho trang tìm kiếm
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

// Phân trang cho sách - PUBLIC để dùng cho trang tìm kiếm
router.post('/datatable', async (req, res) => {
  try {
    const { 
      page = 0, 
      rows = 10, 
      first = 0, 
      sortField = '', 
      sortOrder = 'desc',
      keyword = '',
      genre_id = '',
      publisher_id = '',
      supplier_id = '',
      min_price = 0,
      max_price = 0
    } = req.body;

    // Build match conditions
    const matchConditions = {};
    
    // Keyword search
    if (keyword) {
      matchConditions.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { author: { $regex: keyword, $options: 'i' } },
        { isbn: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // Filter by genres (MultiSelect support)
    if (genre_id) {
      const parsedGenre = Number(genre_id);
      if (!Number.isNaN(parsedGenre)) {
        matchConditions.genre_ids = { $in: [parsedGenre] };
      }
    } else if (Array.isArray(req.body.genre_ids) && req.body.genre_ids.length > 0) {
      const parsedGenres = req.body.genre_ids
        .map((id) => Number(id))
        .filter((value) => !Number.isNaN(value));
      if (parsedGenres.length > 0) {
        matchConditions.genre_ids = { $in: parsedGenres };
      }
    }
    
    // Filter by publishers (MultiSelect support)
    if (publisher_id) {
      // Single select compatibility
      matchConditions.publisher = new mongoose.Types.ObjectId(publisher_id);
    } else if (req.body.publisher_ids && req.body.publisher_ids.length > 0) {
      // MultiSelect support
      matchConditions.publisher = { 
        $in: req.body.publisher_ids.map(id => new mongoose.Types.ObjectId(id)) 
      };
    }
    
    // Filter by suppliers (MultiSelect support)
    if (supplier_id) {
      // Single select compatibility
      matchConditions.supplier = new mongoose.Types.ObjectId(supplier_id);
    } else if (req.body.supplier_ids && req.body.supplier_ids.length > 0) {
      // MultiSelect support
      matchConditions.supplier = { 
        $in: req.body.supplier_ids.map(id => new mongoose.Types.ObjectId(id)) 
      };
    }
    
    // Filter by stock status (MultiSelect support)
    if (req.body.stock_status && req.body.stock_status.length > 0) {
      matchConditions.stock_status = { $in: req.body.stock_status };
    }
    
    // Price range filter
    if (min_price > 0 || max_price > 0) {
      matchConditions.price = {};
      if (min_price > 0) matchConditions.price.$gte = Number(min_price);
      if (max_price > 0) matchConditions.price.$lte = Number(max_price);
    }

    // Language filter
    if (req.body.language) {
      matchConditions.language = req.body.language;
    }

    // Build sort object
    const sortObj = {};
    if (sortField && sortField !== 'undefined') {
      sortObj[sortField] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortObj['createdAt'] = -1;
    }

    const totalRecords = await Book.countDocuments(matchConditions);
    const bookList = await Book.aggregate([
      { $match: matchConditions },
      { $sort: sortObj },
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
          slug: 1,
        },
      },
    ]);

    const totalPages = Math.ceil(totalRecords / rows);

    res.status(200).json({
      status: 'OK',
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
      status: 'ERROR',
      message: 'Lỗi server. Không thể lấy thông tin sách.',
    });
  }
});

// Lấy thông tin sách theo slug - PUBLIC
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
      // Thống kê đánh giá từ bảng reviews (chỉ review đã duyệt)
      {
        $lookup: {
          from: 'reviews',
          let: { bookId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$book_id', '$$bookId'] },
                    { $eq: ['$status', 'approved'] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                average_rating: { $avg: '$rating' },
                total_reviews: { $sum: 1 }
              }
            }
          ],
          as: 'reviewStats'
        }
      },
      // Thống kê số lượng bán dựa trên đơn đã thanh toán/đang giao/đã giao (loại bỏ hủy)
      {
        $lookup: {
          from: 'orders',
          let: { bookId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$status', ['paid', 'processing', 'shipped', 'delivered']] }
                  ]
                }
              }
            },
            { $unwind: '$items' },
            {
              $match: {
                $expr: { $eq: ['$items.book_id', '$$bookId'] }
              }
            },
            {
              $group: {
                _id: null,
                sold: { $sum: '$items.quantity' }
              }
            }
          ],
          as: 'orderStats'
        }
      },
      {
        $addFields: {
          average_rating: {
            $ifNull: [{ $arrayElemAt: ['$reviewStats.average_rating', 0] }, 0]
          },
          total_reviews: {
            $ifNull: [{ $arrayElemAt: ['$reviewStats.total_reviews', 0] }, 0]
          },
          sales_count: {
            $ifNull: [
              { $arrayElemAt: ['$orderStats.sold', 0] },
              { $ifNull: ['$sales_count', '$sold_quantity'] }
            ]
          },
          sold_quantity: {
            $ifNull: [
              { $arrayElemAt: ['$orderStats.sold', 0] },
              '$sold_quantity'
            ]
          }
        }
      },
      {
        $project: {
          reviewStats: 0,
          orderStats: 0
        }
      }
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

// ========== PROTECTED ROUTES (cần đăng nhập) ==========
router.use(authenticateToken); // Từ đây trở xuống cần đăng nhập

// ========== STAFF VÀ ADMIN: Quản lý nội dung sách ==========
router.get('/', staffAndAdmin, getAllBooks);
router.post('/create', staffAndAdmin, createBook);


// ========== STAFF VÀ ADMIN: Thống kê và quản lý kho ==========
router.get('/stock/stats', staffAndAdmin, getStockStats);
router.get('/stock/out-of-stock', staffAndAdmin, getOutOfStockBooks);
router.get('/stock/low-stock', staffAndAdmin, getLowStockBooks);

// ========== STAFF VÀ ADMIN: CRUD Operations ==========
router.post('/', staffAndAdmin, async (req, res) => {
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

// Cập nhật thông tin sách
router.put('/', staffAndAdmin, async (req, res) => {
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

// Xóa sách theo ID
router.delete('/', staffAndAdmin, async (req, res) => {
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

// ========== ADMIN ONLY ROUTES ==========
// ❌ STAFF KHÔNG ĐƯỢC: Cập nhật stock (chỉ admin)
router.patch('/:bookId/stock', adminOnly, updateStock);

module.exports = router;
