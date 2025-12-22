const { Book } = require('../models/bookModel');
const { detectTextAndWeb, buildQueryCandidates } = require('../services/visionService');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSearchRegex = (keyword) => new RegExp(escapeRegex(keyword), 'i');

const searchByCover = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'ERROR', message: 'Vui lòng tải lên một file ảnh bìa sách' });
    }

    const { buffer, mimetype, size } = req.file;
    if (!mimetype.startsWith('image/')) {
      return res.status(400).json({ status: 'ERROR', message: 'File không hợp lệ, chỉ chấp nhận ảnh' });
    }

    // Giới hạn dung lượng 5MB để tránh lạm dụng
    if (size > 5 * 1024 * 1024) {
      return res.status(413).json({ status: 'ERROR', message: 'Ảnh quá lớn, giới hạn 5MB' });
    }

    const { lineCandidates, webCandidates } = await detectTextAndWeb(buffer);
    const { primaryQuery, candidates } = buildQueryCandidates({ lineCandidates, webCandidates });

    if (!primaryQuery) {
      return res.status(422).json({ status: 'ERROR', message: 'Không trích xuất được text hoặc gợi ý từ ảnh' });
    }

    const queryRegex = buildSearchRegex(primaryQuery);
    const books = await Book.find({
      $or: [
        { title: queryRegex },
        { author: queryRegex },
        { description: queryRegex },
      ],
    })
      .limit(12)
      .lean();

    return res.json({
      status: 'OK',
      query: primaryQuery,
      candidates,
      count: books.length,
      results: books,
    });
  } catch (error) {
    console.error('Lỗi tìm kiếm sách bằng ảnh bìa:', error);
    return res.status(500).json({ status: 'ERROR', message: 'Không thể xử lý ảnh, vui lòng thử lại' });
  }
};

module.exports = {
  searchByCover,
};
