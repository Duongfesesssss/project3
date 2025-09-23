const express = require('express');
const router = express.Router();
const {
  createReview,
  getBookReviews,
  updateReview,
  deleteReview,
  canUserReview
} = require('../controllers/reviewController');
const { authenticateToken } = require('../middlewares/roleMiddleware');

// ========== PUBLIC ROUTES ==========
// Lấy reviews của một sách (không cần đăng nhập)
router.get('/book/:book_id', getBookReviews);

// ========== AUTHENTICATED ROUTES ==========
router.use(authenticateToken);

// Kiểm tra user có thể review sách không
router.get('/can-review/:book_id', canUserReview);

// Tạo review mới
router.post('/create', createReview);

// Cập nhật review
router.put('/:review_id', updateReview);

// Xóa review
router.delete('/:review_id', deleteReview);

module.exports = router;