const express = require('express');
const router = express.Router();
const {
    stockIn,
    stockOut,
    getBookTransactionHistory,
    getAllRecentTransactions
} = require('../controllers/stockTransactionController');
const { authenticateToken, adminOnly, staffAndAdmin } = require('../middlewares/roleMiddleware');

// ========== STOCK TRANSACTION ROUTES ==========
// ✅ STAFF VÀ ADMIN ĐỀU ĐƯỢC TRUY CẬP

// Tất cả routes yêu cầu authentication
router.use(authenticateToken);

// Nhập hàng (Staff & Admin)
router.post('/:bookId/stock-in', staffAndAdmin, stockIn);

// Xuất hàng (Staff & Admin)
router.post('/:bookId/stock-out', staffAndAdmin, stockOut);

// Lấy lịch sử giao dịch của một cuốn sách (Staff & Admin)
router.get('/:bookId/history', staffAndAdmin, getBookTransactionHistory);

// Lấy tất cả giao dịch gần đây (Admin only - cho trang lịch sử kho)
router.get('/all', adminOnly, getAllRecentTransactions);

module.exports = router;
